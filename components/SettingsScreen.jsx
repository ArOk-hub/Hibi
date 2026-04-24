// Settings screen — runtime Tweaks, permanent home.
// 設定タブ: Tweaks と同じ項目をここで常時変更できる。

function SettingsScreen({ settings, updateSettings, dark }) {
  const text    = dark ? '#F5F1E6' : '#2B2A26';
  const sub     = dark ? 'rgba(245,241,230,0.55)' : 'rgba(43,42,38,0.55)';
  const faint   = dark ? 'rgba(245,241,230,0.38)' : 'rgba(43,42,38,0.38)';
  const cardBg  = dark ? '#24221E' : '#FFFDF7';
  const stroke  = dark ? 'rgba(255,255,255,0.06)' : 'rgba(43,42,38,0.06)';
  const hairline= dark ? 'rgba(255,255,255,0.06)' : 'rgba(43,42,38,0.06)';
  const set = (k) => (v) => updateSettings(s => ({ ...s, [k]: v }));

  return (
    <div style={{ padding:'0 0 120px' }}>
      {/* Hero */}
      <div style={{ padding:'8px 22px 18px' }}>
        <div style={{ fontSize:12, color: sub, letterSpacing:1, fontWeight:500, fontFamily:'var(--hibi-font-display)' }}>
          好みに合わせて
        </div>
        <div style={{ fontSize:44, fontWeight:700, color:text, letterSpacing:-1, marginTop:4, fontFamily:'var(--hibi-font-display)' }}>
          設定
        </div>
      </div>

      {/* 外観 */}
      <Section title="外観" sub={sub} group={dark ? 'dark' : 'light'}>
        <Row label="モード" dark={dark} hairline={hairline}>
          <Seg value={settings.dark} onChange={set('dark')} dark={dark}
            options={[[false,'ライト'],[true,'ダーク']]}/>
        </Row>
        <Row label="書体" dark={dark} hairline={hairline} last>
          <Seg value={settings.font} onChange={set('font')} dark={dark}
            options={[['mincho','明朝'],['gothic','ゴシック']]}/>
        </Row>
      </Section>

      {/* アクセント */}
      <Section title="アクセントカラー" sub={sub} subtitle="チェック・進捗・FAB の色">
        <div style={{ background: cardBg, border:`0.5px solid ${stroke}`, borderRadius:18, padding:'18px 18px 16px' }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:12 }}>
            {ACCENTS.map(a => (
              <AccentSwatch key={a.hex} a={a} active={settings.accent===a.hex}
                onClick={()=>set('accent')(a.hex)} dark={dark}/>
            ))}
          </div>
        </div>
      </Section>

      {/* 密度 */}
      <Section title="表示密度" sub={sub} subtitle="リストの行の高さ">
        <div style={{ background: cardBg, border:`0.5px solid ${stroke}`, borderRadius:18, padding:'14px 18px' }}>
          <DensityChooser value={settings.density} onChange={set('density')} dark={dark}/>
        </div>
      </Section>

      {/* バージョン */}
      <div style={{ textAlign:'center', padding:'26px 0 0', color: faint, fontSize:11, letterSpacing:1, fontFamily:'var(--hibi-font-display)' }}>
        Hibi 日々 · v0.9
      </div>
    </div>
  );
}

// ─── building blocks ─────────────────────────────────────────────────

function Section({ title, subtitle, sub, children, group }) {
  return (
    <div style={{ marginTop:18 }}>
      <div style={{ padding:'0 24px 8px' }}>
        <div style={{ fontSize:12, color:sub, letterSpacing:1, fontWeight:500, fontFamily:'var(--hibi-font-display)' }}>
          {title}
        </div>
        {subtitle && <div style={{ fontSize:11, color:sub, opacity:0.7, marginTop:2 }}>{subtitle}</div>}
      </div>
      <div style={{ margin:'0 16px' }}>
        {group ? (
          <div style={{
            background: group === 'dark' ? '#24221E' : '#FFFDF7',
            border: `0.5px solid ${group === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(43,42,38,0.06)'}`,
            borderRadius: 18, overflow: 'hidden',
          }}>
            {children}
          </div>
        ) : children}
      </div>
    </div>
  );
}

function Row({ label, children, dark, hairline, last }) {
  return (
    <div style={{
      display:'flex', alignItems:'center', justifyContent:'space-between',
      padding:'14px 18px',
      borderBottom: last ? 'none' : `0.5px solid ${hairline}`,
    }}>
      <span style={{ fontSize:15, fontWeight:500, fontFamily:'var(--hibi-font-display)' }}>{label}</span>
      {children}
    </div>
  );
}

// Segmented control, themed
function Seg({ value, onChange, options, dark }) {
  return (
    <div style={{
      display:'inline-flex', padding:3, gap:3,
      background: dark?'rgba(255,255,255,0.06)':'rgba(43,42,38,0.06)', borderRadius:10,
    }}>
      {options.map(([v,l]) => {
        const active = value === v;
        return (
          <button key={String(v)} onClick={()=>onChange(v)} style={{
            border:'none', padding:'7px 14px', borderRadius:8,
            fontSize:13, fontWeight: active?700:500, cursor:'pointer',
            background: active ? (dark?'#3A3631':'#fff') : 'transparent',
            color: active ? (dark?'#F5F1E6':'#2B2A26') : (dark?'rgba(245,241,230,0.55)':'rgba(43,42,38,0.55)'),
            boxShadow: active ? '0 1px 3px rgba(0,0,0,0.10)' : 'none',
            fontFamily:'var(--hibi-font-display)',
            letterSpacing: 0.4, minWidth: 58,
          }}>{l}</button>
        );
      })}
    </div>
  );
}

// Accent palette — named after 和の伝統色 for character
const ACCENTS = [
  { hex:'#3A5A8A', name:'藍',     kana:'あい' },      // indigo
  { hex:'#6B7FA8', name:'縹',     kana:'はなだ' },    // soft blue (user's current)
  { hex:'#B84A3B', name:'朱',     kana:'しゅ' },      // vermilion
  { hex:'#C29B4A', name:'山吹',   kana:'やまぶき' },  // mustard gold
  { hex:'#7A8D3F', name:'若草',   kana:'わかくさ' },  // young grass
  { hex:'#9B6B8E', name:'藤',     kana:'ふじ' },      // wisteria
  { hex:'#2F4F3E', name:'松葉',   kana:'まつば' },    // pine needle
  { hex:'#8B4A5C', name:'紅',     kana:'べに' },      // crimson
  { hex:'#4A5B6B', name:'鉄紺',   kana:'てつこん' },  // dark navy
  { hex:'#7E6B4A', name:'鶯茶',   kana:'うぐいす' },  // olive brown
];

function AccentSwatch({ a, active, onClick, dark }) {
  const labelColor = dark ? 'rgba(245,241,230,0.75)' : 'rgba(43,42,38,0.75)';
  return (
    <button onClick={onClick} style={{
      border:'none', background:'transparent', padding:0, cursor:'pointer',
      display:'flex', flexDirection:'column', alignItems:'center', gap:6,
    }}>
      <span style={{
        width:40, height:40, borderRadius:20, background: a.hex,
        boxShadow: active ? `0 0 0 2px ${dark?'#24221E':'#FFFDF7'}, 0 0 0 4px ${a.hex}` : 'inset 0 0 0 0.5px rgba(0,0,0,0.12)',
        transition:'box-shadow 180ms',
        position:'relative',
      }}>
        {active && (
          <svg width="40" height="40" viewBox="0 0 40 40" style={{ position:'absolute', inset:0 }}>
            <path d="M13 20 L18 25 L28 15" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
          </svg>
        )}
      </span>
      <span style={{
        fontSize:12, fontFamily:'var(--hibi-font-display)', fontWeight: active?700:500,
        color: active ? (dark?'#F5F1E6':'#2B2A26') : labelColor, letterSpacing:1,
      }}>{a.name}</span>
    </button>
  );
}

function DensityChooser({ value, onChange, dark }) {
  const opts = [
    { id:'compact', label:'詰', sub:'コンパクト', rows: 2 },
    { id:'comfy',   label:'標準', sub:'バランス', rows: 3 },
    { id:'roomy',   label:'広々', sub:'ゆとり',   rows: 4 },
  ];
  return (
    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10 }}>
      {opts.map(o => {
        const active = value === o.id;
        const border = active
          ? `1.5px solid ${dark?'#F5F1E6':'#2B2A26'}`
          : `1px solid ${dark?'rgba(255,255,255,0.08)':'rgba(43,42,38,0.08)'}`;
        return (
          <button key={o.id} onClick={()=>onChange(o.id)} style={{
            border, background:'transparent', borderRadius:14, padding:'12px 10px',
            display:'flex', flexDirection:'column', alignItems:'center', gap:8, cursor:'pointer',
            fontFamily:'var(--hibi-font-display)',
          }}>
            {/* preview stack of rows */}
            <div style={{ width:'100%', display:'flex', flexDirection:'column', gap: o.rows===2?3:(o.rows===3?2:1), padding:'2px 4px' }}>
              {Array.from({length:o.rows}).map((_,i) => (
                <div key={i} style={{
                  height: o.rows===2?9:(o.rows===3?6:4),
                  background: dark?'rgba(245,241,230,0.18)':'rgba(43,42,38,0.14)',
                  borderRadius: 2,
                }}/>
              ))}
            </div>
            <div style={{
              fontSize:13, fontWeight: active?700:500,
              color: active ? (dark?'#F5F1E6':'#2B2A26') : (dark?'rgba(245,241,230,0.65)':'rgba(43,42,38,0.65)'),
            }}>{o.sub}</div>
          </button>
        );
      })}
    </div>
  );
}

// Wrap `Row`s in a card container: Section auto-wraps children that look like a
// contiguous set of Rows. Keep it simple — patch Section to wrap non-card kids.
const _OrigSection = Section;
// (Section above already renders children directly inside a 16px-margin div.
//  Rows render their own bg so they form a visible card on any surface. To
//  make Rows group into a single rounded container, we wrap them here.)
function wrapRows(children, dark) {
  const stroke = dark?'rgba(255,255,255,0.06)':'rgba(43,42,38,0.06)';
  return (
    <div style={{ background: dark?'#24221E':'#FFFDF7', border:`0.5px solid ${stroke}`, borderRadius:18, overflow:'hidden' }}>
      {children}
    </div>
  );
}

window.SettingsScreen = SettingsScreen;
