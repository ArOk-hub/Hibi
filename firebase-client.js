// Hibi 日々 — Firebase client glue
// Initializes Firebase, handles anonymous auth, FCM token registration,
// and two-way Firestore sync for tasks.
//
// Exposes a small API on window.HibiFirebase:
//   ready          Promise<void>   resolves once auth + messaging are set up
//   uid            string | null   current user id (anon)
//   syncTask(task)                 upsert a task into Firestore
//   removeTask(id)                 delete a task
//   getToken()     Promise<string> request permission + return FCM token
//   onTasks(cb)                    subscribe to remote task changes
//
// The service worker at firebase-messaging-sw.js handles background push.

(function() {
  const state = {
    app: null,
    auth: null,
    db: null,
    messaging: null,
    uid: null,
    token: null,
    readyResolve: null,
    subscribers: [],
  };

  const ready = new Promise(res => { state.readyResolve = res; });

  async function init() {
    // Wait for the Firebase compat SDKs (loaded via <script> tags)
    if (!window.firebase || !window.firebase.initializeApp) {
      console.warn('[Hibi] Firebase SDK not loaded yet');
      return;
    }
    const firebase = window.firebase;
    state.app = firebase.initializeApp(window.HIBI_FIREBASE_CONFIG);
    state.auth = firebase.auth();
    state.db = firebase.firestore();
    // Enable offline cache so edits made offline sync when back online.
    try { await state.db.enablePersistence({ synchronizeTabs: true }); }
    catch (e) { /* already enabled or multi-tab issue */ }

    // Anonymous sign-in so Firestore rules can scope by uid without a UI.
    state.auth.onAuthStateChanged(async (user) => {
      if (user) {
        state.uid = user.uid;
        subscribeTasks();
        state.readyResolve();
      } else {
        try { await state.auth.signInAnonymously(); }
        catch (e) { console.error('[Hibi] anon sign-in failed', e); state.readyResolve(); }
      }
    });

    if (firebase.messaging && firebase.messaging.isSupported()) {
      try {
        state.messaging = firebase.messaging();
        // Foreground messages — show a Notification manually.
        state.messaging.onMessage((payload) => {
          const { title, body } = payload?.notification || {};
          if (title && 'Notification' in window && Notification.permission === 'granted') {
            try {
              navigator.serviceWorker.getRegistration().then(reg => {
                (reg?.showNotification ? reg.showNotification(title, { body, icon: './icon-192.png', badge: './icon-192.png' })
                  : new Notification(title, { body }));
              });
            } catch(e) { /* noop */ }
          }
        });
      } catch (e) { console.warn('[Hibi] messaging init failed', e); }
    }
  }

  async function requestPermissionAndToken() {
    if (!state.messaging) return null;
    if (typeof Notification === 'undefined') return null;
    let perm = Notification.permission;
    if (perm !== 'granted') perm = await Notification.requestPermission();
    if (perm !== 'granted') return null;
    // Ensure the service worker is registered (main sw.js already registers itself;
    // Firebase needs its own SW too — firebase-messaging-sw.js).
    let swReg;
    try {
      swReg = await navigator.serviceWorker.register('./firebase-messaging-sw.js');
    } catch (e) {
      console.warn('[Hibi] firebase SW registration failed', e);
    }
    try {
      const token = await state.messaging.getToken({
        vapidKey: window.HIBI_VAPID_KEY,
        serviceWorkerRegistration: swReg,
      });
      state.token = token;
      if (token && state.uid) {
        // Store under the user doc so the Cloud Function can fan-out notifications.
        await state.db.collection('users').doc(state.uid).set({
          tokens: window.firebase.firestore.FieldValue.arrayUnion(token),
          lastSeen: window.firebase.firestore.FieldValue.serverTimestamp(),
        }, { merge: true });
      }
      return token;
    } catch (e) {
      console.warn('[Hibi] getToken failed', e);
      return null;
    }
  }

  // Convert a task object (with Date fields) → Firestore-safe document.
  function taskToDoc(task) {
    const doc = { ...task };
    if (task.due instanceof Date) doc.due = window.firebase.firestore.Timestamp.fromDate(task.due);
    if (task.end instanceof Date) doc.end = window.firebase.firestore.Timestamp.fromDate(task.end);
    // Drop any client-only fields we don't want stored:
    delete doc._dirty;
    return doc;
  }

  // Firestore doc → client-side task (revive Dates).
  function docToTask(doc) {
    const d = doc.data();
    return {
      ...d,
      id: doc.id,
      due: d.due?.toDate ? d.due.toDate() : (d.due ? new Date(d.due) : undefined),
      end: d.end?.toDate ? d.end.toDate() : (d.end ? new Date(d.end) : undefined),
    };
  }

  async function syncTask(task) {
    await ready;
    if (!state.uid || !task?.id) return;
    try {
      await state.db.collection('users').doc(state.uid)
        .collection('tasks').doc(task.id).set(taskToDoc(task), { merge: true });
    } catch (e) { console.warn('[Hibi] syncTask failed', e); }
  }
  async function removeTask(id) {
    await ready;
    if (!state.uid || !id) return;
    try {
      await state.db.collection('users').doc(state.uid)
        .collection('tasks').doc(id).delete();
    } catch (e) { console.warn('[Hibi] removeTask failed', e); }
  }

  function subscribeTasks() {
    if (!state.uid) return;
    state.db.collection('users').doc(state.uid).collection('tasks')
      .onSnapshot((snap) => {
        const tasks = snap.docs.map(docToTask);
        state.subscribers.forEach(cb => { try { cb(tasks); } catch(e) {} });
      }, (err) => console.warn('[Hibi] snapshot error', err));
  }
  function onTasks(cb) {
    state.subscribers.push(cb);
    return () => { state.subscribers = state.subscribers.filter(x => x !== cb); };
  }

  window.HibiFirebase = {
    ready,
    get uid() { return state.uid; },
    get token() { return state.token; },
    syncTask,
    removeTask,
    getToken: requestPermissionAndToken,
    onTasks,
  };

  // Kick off init once the DOM/SDK is ready.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
