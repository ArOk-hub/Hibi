// Top nav (large title + search) + bottom tab bar + FAB + Tweaks panel

// Japanese 24節気 (solar terms) — rough 2026 approximations, used decoratively
// to give the top sliver a seasonal feel.
const SEKKI_2026 = [
  { d: '2026-03-21', label: '春分' }, { d: '2026-04-05', label: '清明' },
  { d: '2026-04-20', label: '穀雨' }, { d: '2026-05-05', label: '立夏' },
  { d: '2026-05-21', label: '小満' }, { d: '2026-06-06', label: '芒種' },
  { d: '2026-06-21', label: '夏至' }, { d: '2026-07-07', label: '小暑' },
  { d: '2026-07-22', label: '大暑' }, { d: '2026-08-07', label: '立秋' },
  { d: '2026-08-23', label: '処暑' }, { d: '2026-09-07', label: '白露' },
  { d: '2026-09-23', label: '秋分' }, { d: '2026-10-08', label: '寒露' },
  { d: '2026-10-23', label: '霜降' }, { d: '2026-11-07', label: '立冬' },
  { d: '2026-11-22', label: '小雪' }, { d: '2026-12-07', label: '大雪' },
  { d: '2026-12-22', label: '冬至' },
];
function currentSekki(now = new Date()) {
  // find the latest entry whose date <= now
  const t = now.getTime();
  let cur = { label: '春分', d: '2026-03-21' };
  for (const s of SEKKI_2026) if (new Date(s.d).getTime() <= t) cur = s;
  return cur;
}

function TopBar({ title, subtitle, dark, onSearch, searchValue, setSearchValue }) {
  const text = dark ? '#F5F1E6' : '#2B2A26';
  const sub  = dark ? 'rgba(245,241,230,0.55)' : 'rgba(43,42,38,0.55)';
  const faint = dark ? 'rgba(245,241,230,0.35)' : 'rgba(43,42,38,0.40)';
  const divider = dark ? 'rgba(245,241,230,0.14)' : 'rgba(43,42,38,0.18)';
  const isFull = typeof document !== 'undefined' && document.body.classList.contains('hibi-fullscreen');
  const topPad = isFull ? 'calc(env(safe-area-inset-top, 0px) + 8px)' : '44px';
  const now = new Date();
  const weekdayK = ['日','月','火','水','木','金','土'][now.getDay()];
  const sekki = currentSekki(now);
  const dateStr = `${now.getFullYear()}.${String(now.getMonth()+1).padStart(2,'0')}.${String(now.getDate()).padStart(2,'0')}`;
  return (
    <div style={{
      position:'sticky', top:0, zIndex:20,
      background: dark ? 'rgba(28,26,23,0.6)' : 'rgba(250,247,240,0.6)',
      backdropFilter:'blur(20px) saturate(180%)',
      WebkitBackdropFilter:'blur(20px) saturate(180%)',
      padding:`${topPad} 22px 6px`,
    }}>
      {/* Sliver: [yyyy.mm.dd (曜)]  ·  [24節気]       kanji mark */}
      <div style={{
        display:'flex', alignItems:'baseline', justifyContent:'space-between',
        gap:12, fontSize:10.5, letterSpacing:2, color: faint,
        fontFamily:'var(--hibi-font-display)', fontWeight: 500,
      }}>
        <span style={{ display:'inline-flex', alignItems:'baseline', gap:8 }}>
          <span style={{ color: sub, fontVariantNumeric:'tabular-nums', letterSpacing: 1 }}>{dateStr}</span>
          <span style={{ opacity: 0.45 }}>·</span>
          <span>{weekdayK}曜日</span>
        </span>
        <span style={{ display:'inline-flex', alignItems:'center', gap:6 }}>
          <span style={{ color: sub }}>{sekki.label}</span>
          {/* tiny sun/ink stamp */}
          <span aria-hidden style={{
            display:'inline-block', width:6, height:6, borderRadius:3,
            background: '#B84A3B', opacity: 0.85,
          }}/>
        </span>
      </div>
      {/* hairline */}
      <div style={{ marginTop: 6, height: 0.5, background: divider, opacity: 0.6 }}/>
    </div>
  );
}

function TabBar({ tab, setTab, onAdd, dark, accent }) {
  const textC = dark ? '#F5F1E6' : '#2B2A26';
  const sub  = dark ? 'rgba(245,241,230,0.45)' : 'rgba(43,42,38,0.45)';
  const isFull = typeof document !== 'undefined' && document.body.classList.contains('hibi-fullscreen');
  const fabBottom = isFull ? 'calc(env(safe-area-inset-bottom, 0px) + 80px)' : 96;
  const tabBottomPad = isFull ? 'calc(env(safe-area-inset-bottom, 0px) + 10px)' : 26;
  const tabs = [
    { id:'today', label:'今日',       icon:'today' },
    { id:'cal',   label:'暦',           icon:'calendar' },
    { id:'lists', label:'リスト',       icon:'lists' },
    { id:'settings', label:'設定',   icon:'gear' },
  ];
  // prefer explicit prop (settings.accent); fall back to CSS var, then blue
  accent = accent
    || (typeof getComputedStyle !== 'undefined' && getComputedStyle(document.documentElement).getPropertyValue('--hibi-accent').trim())
    || '#3A5A8A';
  return (
    <>
      {/* FAB */}
      <button onClick={onAdd} style={{
        position:'absolute', right:18, bottom:fabBottom, zIndex:30,
        width:56, height:56, borderRadius:28, border:'none',
        background: accent, color:'#fff',
        boxShadow:`0 8px 24px ${accent}60, 0 2px 6px rgba(0,0,0,0.15)`,
        display:'flex', alignItems:'center', justifyContent:'center',
        cursor:'pointer', transition:'transform 140ms',
      }}
      onPointerDown={e=>e.currentTarget.style.transform='scale(0.92)'}
      onPointerUp={e=>e.currentTarget.style.transform='scale(1)'}
      onPointerLeave={e=>e.currentTarget.style.transform='scale(1)'}
      >
        <Icon name="plus" size={24} color="#fff" strokeWidth={2.4}/>
      </button>

      {/* Tab bar */}
      <div style={{
        position:'absolute', bottom:0, left:0, right:0, zIndex:20,
        background: dark ? 'rgba(28,26,23,0.82)' : 'rgba(250,247,240,0.82)',
        backdropFilter:'blur(20px) saturate(180%)',
        WebkitBackdropFilter:'blur(20px) saturate(180%)',
        borderTop:`0.5px solid ${dark?'rgba(255,255,255,0.08)':'rgba(43,42,38,0.08)'}`,
        padding:`8px 8px ${typeof tabBottomPad === 'number' ? tabBottomPad+'px' : tabBottomPad}`,
        display:'flex', justifyContent:'space-around',
      }}>
        {tabs.map(t => {
          const active = tab===t.id;
          return (
            <button key={t.id} onClick={()=>setTab(t.id)} style={{
              flex:1, border:'none', background:'transparent',
              display:'flex', flexDirection:'column', alignItems:'center', gap:3,
              padding:'6px 0 4px', cursor:'pointer', position:'relative',
              color: active ? accent : sub,
            }}>
              {active && <span aria-hidden style={{
                position:'absolute', top:-9, left:'50%', transform:'translateX(-50%)',
                width:24, height:2, borderRadius:1, background: accent,
              }}/>}
              <Icon name={t.icon} size={23} color={active ? accent : sub} strokeWidth={active?2.2:1.7}/>
              <span style={{ fontSize:10.5, fontWeight: active?700:500, letterSpacing:0.4, fontFamily:'var(--hibi-font-display)' }}>{t.label}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}

// Floating Tweaks panel
function TweaksPanel({ open, onClose, settings, setSettings }) {
  if (!open) return null;
  const row = (label, child) => (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 0', borderBottom:'0.5px solid rgba(255,255,255,0.08)' }}>
      <span style={{ fontSize:13, color:'rgba(255,255,255,0.8)', fontWeight:500 }}>{label}</span>
      {child}
    </div>
  );
  const segBtn = (active, label, onClick) => (
    <button onClick={onClick} style={{
      border:'none', padding:'6px 10px', borderRadius:8, fontSize:12, fontWeight:600, cursor:'pointer',
      background: active ? 'rgba(255,255,255,0.92)' : 'transparent',
      color: active ? '#1C1A17' : 'rgba(255,255,255,0.7)',
    }}>{label}</button>
  );
  const seg = (val, opts, key) => (
    <div style={{ display:'flex', padding:2, background:'rgba(255,255,255,0.1)', borderRadius:10, gap:2 }}>
      {opts.map(([v,l]) => segBtn(val===v, l, ()=>setSettings(s=>({...s,[key]:v}))))}
    </div>
  );
  const swatch = (hex) => (
    <button onClick={()=>setSettings(s=>({...s, accent:hex}))}
      style={{
        width:26, height:26, borderRadius:13, border: settings.accent===hex?'2px solid #fff':'2px solid transparent',
        background:hex, cursor:'pointer', boxShadow:'inset 0 0 0 1px rgba(0,0,0,0.1)',
      }}/>
  );
  return (
    <div style={{
      position:'fixed', right:16, bottom:16, width:280, zIndex:200,
      background:'rgba(28,26,23,0.94)', backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)',
      borderRadius:18, padding:'14px 16px',
      boxShadow:'0 12px 40px rgba(0,0,0,0.35), 0 0 0 0.5px rgba(255,255,255,0.1)',
      color:'#fff', fontFamily:'-apple-system, system-ui',
    }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
        <div style={{ fontSize:13, fontWeight:600, letterSpacing:1, opacity:0.8, fontFamily:'var(--hibi-font-display)' }}>調整 · Tweaks</div>
        <button onClick={onClose} style={{ border:'none', background:'none', color:'#fff', cursor:'pointer', opacity:0.6, padding:2 }}>
          <Icon name="x" size={16} color="#fff"/>
        </button>
      </div>
      {row('モード', seg(settings.dark, [[false,'ライト'],[true,'ダーク']], 'dark'))}
      {row('密度', seg(settings.density, [['compact','詰'],['comfy','標準'],['roomy','広々']], 'density'))}
      {row('書体', seg(settings.font, [['mincho','明朝'],['gothic','ゴシック']], 'font'))}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 0 2px' }}>
        <span style={{ fontSize:13, color:'rgba(255,255,255,0.8)', fontWeight:500 }}>アクセント</span>
        <div style={{ display:'flex', gap:6 }}>
          {['#3A5A8A','#B84A3B','#C29B4A','#6B7FA8','#9B6B8E'].map(swatch)}
        </div>
      </div>
    </div>
  );
}

window.TopBar = TopBar;
window.TabBar = TabBar;
window.TweaksPanel = TweaksPanel;
