// Top nav (large title + search) + bottom tab bar + FAB + Tweaks panel

function TopBar({ title, subtitle, dark, onSearch, searchValue, setSearchValue }) {
  const text = dark ? '#F5F1E6' : '#2B2A26';
  const sub  = dark ? 'rgba(245,241,230,0.55)' : 'rgba(43,42,38,0.55)';
  const isFull = typeof document !== 'undefined' && document.body.classList.contains('hibi-fullscreen');
  const topPad = isFull ? 'calc(env(safe-area-inset-top, 0px) + 8px)' : '44px';
  return (
    <div style={{
      position:'sticky', top:0, zIndex:20,
      background: dark ? 'rgba(28,26,23,0.6)' : 'rgba(250,247,240,0.6)',
      backdropFilter:'blur(20px) saturate(180%)',
      WebkitBackdropFilter:'blur(20px) saturate(180%)',
      padding:`${topPad} 0 0`,
    }}/>
  );
}

function TabBar({ tab, setTab, onAdd, dark }) {
  const textC = dark ? '#F5F1E6' : '#2B2A26';
  const sub  = dark ? 'rgba(245,241,230,0.45)' : 'rgba(43,42,38,0.45)';
  const isFull = typeof document !== 'undefined' && document.body.classList.contains('hibi-fullscreen');
  const fabBottom = isFull ? 'calc(env(safe-area-inset-bottom, 0px) + 80px)' : 96;
  const tabBottomPad = isFull ? 'calc(env(safe-area-inset-bottom, 0px) + 10px)' : 26;
  const tabs = [
    { id:'today', label:'今日', icon:'today' },
    { id:'cal',   label:'カレンダー', icon:'calendar' },
    { id:'lists', label:'リスト', icon:'lists' },
  ];
  const accent = '#3A5A8A';
  return (
    <>
      {/* FAB */}
      <button onClick={onAdd} style={{
        position:'absolute', right:18, bottom:fabBottom, zIndex:30,
        width:56, height:56, borderRadius:28, border:'none',
        background: accent, color:'#fff',
        boxShadow:'0 8px 24px rgba(122,141,63,0.45), 0 2px 6px rgba(0,0,0,0.15)',
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
        {tabs.map(t => (
          <button key={t.id} onClick={()=>setTab(t.id)} style={{
            flex:1, border:'none', background:'transparent',
            display:'flex', flexDirection:'column', alignItems:'center', gap:2,
            padding:'6px 0', cursor:'pointer',
            color: tab===t.id ? accent : sub,
          }}>
            <Icon name={t.icon} size={24} color={tab===t.id ? accent : sub} strokeWidth={tab===t.id?2:1.6}/>
            <span style={{ fontSize:10, fontWeight:600, letterSpacing:0.5 }}>{t.label}</span>
          </button>
        ))}
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
        <div style={{ fontSize:12, fontWeight:700, letterSpacing:2, textTransform:'uppercase', opacity:0.7 }}>Tweaks</div>
        <button onClick={onClose} style={{ border:'none', background:'none', color:'#fff', cursor:'pointer', opacity:0.6, padding:2 }}>
          <Icon name="x" size={16} color="#fff"/>
        </button>
      </div>
      {row('モード', seg(settings.dark, [[false,'ライト'],[true,'ダーク']], 'dark'))}
      {row('密度', seg(settings.density, [['compact','詰'],['comfy','標準'],['roomy','広々']], 'density'))}
      {row('フォント', seg(settings.font, [['gothic','ゴシック'],['mincho','明朝']], 'font'))}
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
