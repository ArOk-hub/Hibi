// Hibi 日々 — Cloud Functions
// Runs every minute: scans all users' tasks, and for any task whose reminder
// fire-time has just passed (within the last 2 min) and hasn't been fired yet,
// sends an FCM push to all registered tokens for that user.
//
// Firestore layout (written by the client):
//   users/{uid}                 { tokens: [fcmToken, ...], lastSeen: Timestamp }
//   users/{uid}/tasks/{taskId}  { title, done, due: Timestamp, remind, allDay, ... }
//
// We track fired reminders by writing a `firedRemind` field on the task doc
// with the key `${remind}:${dueMs}` so we never double-send.

const { onSchedule } = require('firebase-functions/v2/scheduler');
const { logger } = require('firebase-functions/v2');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();
const messaging = admin.messaging();

// Offsets in minutes between the reminder fire time and the task's due time.
// Mirrors the client-side constants in index.html.
const OFFSETS_MIN = {
  atdue: 0, '5min': 5, '15min': 15, '30min': 30,
  '1h': 60, '2h': 120, '1d': 1440, '2d': 2880, '1w': 10080,
};

exports.sendReminders = onSchedule(
  {
    schedule: 'every 1 minutes',
    timeZone: 'Asia/Tokyo',
    region: 'asia-northeast1',
    memory: '256MiB',
  },
  async () => {
    const now = Date.now();
    const windowEnd = now;                  // fire-time must be <= now
    const windowStart = now - 2 * 60_000;   // ... and >= 2 min ago (safety margin)

    // Scan all users (small-scale MVP — if you grow past a few hundred users,
    // replace with a collection-group query on tasks filtered by `nextRemindAt`).
    const usersSnap = await db.collection('users').get();
    let sent = 0, scanned = 0, skipped = 0;

    for (const userDoc of usersSnap.docs) {
      const uid = userDoc.id;
      const { tokens = [] } = userDoc.data() || {};
      if (!Array.isArray(tokens) || tokens.length === 0) continue;

      const tasksSnap = await userDoc.ref.collection('tasks')
        .where('done', '==', false)
        .get();

      for (const taskDoc of tasksSnap.docs) {
        scanned++;
        const t = taskDoc.data();
        if (!t || !t.remind || t.remind === 'none') { skipped++; continue; }
        if (!t.due) { skipped++; continue; }
        const offMin = OFFSETS_MIN[t.remind];
        if (offMin === undefined) { skipped++; continue; }

        const dueMs = t.due.toDate ? t.due.toDate().getTime() : new Date(t.due).getTime();
        const fireAt = dueMs - offMin * 60_000;
        if (fireAt < windowStart || fireAt > windowEnd) { skipped++; continue; }

        const firedKey = `${t.remind}:${dueMs}`;
        if (t.firedRemind === firedKey) { skipped++; continue; }

        // Compose body: "HH:MM · タイトル" or "終日 · タイトル"
        const dueDate = new Date(dueMs);
        const hh = String(dueDate.getHours()).padStart(2, '0');
        const mm = String(dueDate.getMinutes()).padStart(2, '0');
        const when = t.allDay ? '終日' : `${hh}:${mm}`;
        const body = `${when} · ${t.title || '(無題)'}`;

        const message = {
          notification: { title: 'Hibi 日々', body },
          data: { taskId: taskDoc.id, remind: t.remind },
          tokens,
        };

        try {
          const resp = await messaging.sendEachForMulticast(message);
          sent += resp.successCount;

          // Prune dead tokens so we don't keep retrying them.
          const dead = [];
          resp.responses.forEach((r, i) => {
            if (!r.success) {
              const code = r.error?.code || '';
              if (code.includes('registration-token-not-registered')
                  || code.includes('invalid-registration-token')
                  || code.includes('invalid-argument')) {
                dead.push(tokens[i]);
              }
            }
          });
          if (dead.length) {
            await userDoc.ref.update({
              tokens: admin.firestore.FieldValue.arrayRemove(...dead),
            });
          }

          await taskDoc.ref.update({ firedRemind: firedKey });
        } catch (err) {
          logger.error('send failed', { uid, taskId: taskDoc.id, err: err.message });
        }
      }
    }
    logger.info('reminders tick', { scanned, sent, skipped, users: usersSnap.size });
  }
);
