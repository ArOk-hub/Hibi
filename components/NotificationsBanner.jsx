// Subtle banner prompting the user to enable cloud notifications.
// Auto-hides when Notification.permission === 'granted' AND we have a token,
// or when the user dismisses it.

function NotificationsBanner({ dark }) {
  const [visible, setVisible] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [ok, setOk] = React.useState(false);

  React.useEffect(() => {
    if (typeof Notification === 'undefined') return;
    const dismissed = localStorage.getItem('hibi-notif-banner-dismissed') === '1';
    if (dismissed) return;
    // Show only if not yet granted, or granted-but-no-FCM-token-yet.
    const check = () => {
      const perm = Notification.permission;
      if (perm === 'denied') { setVisible(false); return; }
      if (perm !== 'granted') { setVisible(true); return; }
      // Already granted — check whether we've stored a token this session.
      setVisible(!window.HibiFirebase?.token);
    };
    check();
    const iv = setInterval(check, 2000);
    return () => clearInterval(iv);
  }, []);

  if (!visible) return null;

  const enable = async () => {
    setBusy(true);
    try {
      const token = await window.HibiFirebase?.getToken();
      if (token) {
        setOk(true);
        setTimeout(() => setVisible(false), 1500);
      } else {
        // Permission denied — hide the banner; they can re-enable via OS settings.
        localStorage.setItem('hibi-notif-banner-dismissed', '1');
        setVisible(false);
      }
    } finally { setBusy(false); }
  };
  const dismiss = () => {
    localStorage.setItem('hibi-notif-banner-dismissed', '1');
    setVisible(false);
  };

  const bg = dark ? 'rgba(107, 127, 168, 0.18)' : 'rgba(58, 90, 138, 0.08)';
  const border = dark ? 'rgba(107, 127, 168, 0.35)' : 'rgba(58, 90, 138, 0.2)';
  const text = dark ? '#F5F1E6' : '#2B2A26';
  const accent = (typeof getComputedStyle !== 'undefined' && getComputedStyle(document.documentElement).getPropertyValue('--hibi-accent').trim()) || '#3A5A8A';

  return (
    <div style={{
      margin: '8px 16px 0',
      padding: '12px 14px',
      background: bg,
      border: `0.5px solid ${border}`,
      borderRadius: 12,
      display: 'flex', alignItems: 'center', gap: 10,
      animation: 'fade-in 300ms ease',
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 16, flexShrink: 0,
        background: dark ? 'rgba(107, 127, 168, 0.3)' : 'rgba(58, 90, 138, 0.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon name={ok ? 'check' : 'bell'} size={16} color={accent} strokeWidth={2}/>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: text, lineHeight: 1.3 }}>
          {ok ? '通知を有効化しました' : 'リマインド通知を受け取る'}
        </div>
        <div style={{ fontSize: 11, color: dark ? 'rgba(245,241,230,0.6)' : 'rgba(43,42,38,0.6)', marginTop: 2 }}>
          {ok ? 'アプリを閉じていても届きます' : 'アプリを閉じていても時刻に届きます'}
        </div>
      </div>
      {!ok && (
        <>
          <button onClick={enable} disabled={busy} style={{
            border: 'none', background: accent, color: '#fff',
            padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
            cursor: busy ? 'default' : 'pointer', opacity: busy ? 0.6 : 1,
            fontFamily: 'inherit', whiteSpace: 'nowrap',
          }}>
            {busy ? '…' : '有効化'}
          </button>
          <button onClick={dismiss} aria-label="閉じる" style={{
            border: 'none', background: 'transparent', cursor: 'pointer',
            padding: 4, opacity: 0.5,
          }}>
            <Icon name="x" size={16} color={text}/>
          </button>
        </>
      )}
    </div>
  );
}

window.NotificationsBanner = NotificationsBanner;
