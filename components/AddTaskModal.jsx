// Add-task modal with natural-language input preview + date/priority/list pickers

function AddTaskModal({ open, onClose, onAdd, dark }) {
  const [text, setText] = useState('');
  const [parsed, setParsed] = useState({});
  const [showDate, setShowDate] = useState(false);
  const [date, setDate] = useState(new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate(), 14, 0));
  const [pri, setPri] = useState('mid');
  const [listId, setListId] = useState('work');
  const [remind, setRemind] = useState('15min');
  const [repeat, setRepeat] = useState('none');

  const textC = dark ? '#F5F1E6' : '#2B2A26';
  const sub  = dark ? 'rgba(245,241,230,0.55)' : 'rgba(43,42,38,0.55)';
  const bg = dark ? '#1C1A17' : '#FAF7F0';
  const cardBg = dark ? '#24221E' : '#FFFDF7';
  const stroke = dark?'rgba(255,255,255,0.06)':'rgba(43,42,38,0.06)';
  const accent = '#7A8D3F';

  // NLP parser — simple demo
  useEffect(() => {
    const p = {};
    let clean = text;
    // !高/!中/!低
    const m1 = clean.match(/!(高|中|低|high|mid|low)/);
    if (m1) { p.pri = {'高':'high','中':'mid','低':'low','high':'high','mid':'mid','low':'low'}[m1[1]]; clean = clean.replace(m1[0],''); }
    // #tag → category
    const m2 = clean.match(/#(\S+)/);
    if (m2) {
      const lm = LISTS.find(l => l.name.includes(m2[1]) || m2[1].includes(l.name));
      if (lm) p.list = lm.id;
      clean = clean.replace(m2[0],'');
    }
    // 時刻: HH時 / HH:MM / 午後X時
    const m3 = clean.match(/(\d{1,2})[時:](\d{0,2})/);
    if (m3) { p.hour = +m3[1]; p.min = m3[2] ? +m3[2] : 0; clean = clean.replace(m3[0],''); }
    // 日付: 今日/明日/明後日 + MM月DD日
    if (/今日/.test(clean)) { p.day = 0; clean = clean.replace(/今日/,''); }
    else if (/明日/.test(clean)) { p.day = 1; clean = clean.replace(/明日/,''); }
    else if (/明後日/.test(clean)) { p.day = 2; clean = clean.replace(/明後日/,''); }
    const m4 = clean.match(/(\d{1,2})月(\d{1,2})日/);
    if (m4) { p.mo = +m4[1]-1; p.dt = +m4[2]; clean = clean.replace(m4[0],''); }
    p.title = clean.trim();
    setParsed(p);
    if (p.pri) setPri(p.pri);
    if (p.list) setListId(p.list);
  }, [text]);

  const handleAdd = () => {
    if (!parsed.title) return;
    const due = new Date(TODAY);
    if (parsed.day !== undefined) due.setDate(due.getDate() + parsed.day);
    if (parsed.mo !== undefined) { due.setMonth(parsed.mo); due.setDate(parsed.dt); }
    if (parsed.hour !== undefined) { due.setHours(parsed.hour); due.setMinutes(parsed.min||0); }
    else { due.setHours(date.getHours()); due.setMinutes(date.getMinutes()); }
    onAdd({
      id: 't_'+Date.now(),
      title: parsed.title,
      list: parsed.list || listId,
      pri: parsed.pri || pri,
      done: false, due,
      dur: 30,
    });
    setText(''); setParsed({}); onClose();
  };

  if (!open) return null;
  return (
    <div style={{
      position:'absolute', inset:0, zIndex: 100,
      background:'rgba(0,0,0,0.35)',
      animation:'fade-in 180ms',
      display:'flex', alignItems:'flex-end',
    }} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{
        background: bg, width:'100%', maxHeight:'86%',
        borderRadius:'26px 26px 0 0', padding:'12px 0 28px',
        animation:'slide-up 260ms cubic-bezier(.2,.8,.2,1)',
        display:'flex', flexDirection:'column',
      }}>
        {/* grabber */}
        <div style={{ width:40, height:5, borderRadius:3, background: dark?'rgba(255,255,255,0.2)':'rgba(43,42,38,0.2)', margin:'0 auto 8px' }}/>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'6px 20px 14px' }}>
          <button onClick={onClose} style={{ border:'none', background:'none', color: sub, fontSize:15, cursor:'pointer', padding:0 }}>キャンセル</button>
          <div style={{ fontSize:15, fontWeight:600, color: textC }}>新しいタスク</div>
          <button onClick={handleAdd} disabled={!parsed.title} style={{
            border:'none', background: parsed.title ? accent : (dark?'rgba(255,255,255,0.08)':'rgba(43,42,38,0.08)'),
            color: parsed.title ? '#fff' : sub, fontSize:14, fontWeight:600,
            padding:'6px 14px', borderRadius:100, cursor: parsed.title?'pointer':'default',
          }}>追加</button>
        </div>

        {/* NLP input */}
        <div style={{ padding:'0 20px' }}>
          <div style={{ background: cardBg, borderRadius:18, padding:'14px 16px', border:`0.5px solid ${stroke}` }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
              <Icon name="sparkle" size={14} color={accent}/>
              <span style={{ fontSize:11, color:accent, fontWeight:700, letterSpacing:1, textTransform:'uppercase' }}>自然言語入力</span>
            </div>
            <textarea
              autoFocus
              value={text}
              onChange={e=>setText(e.target.value)}
              placeholder="例:明日15時 会議資料作成 !高 #仕事"
              rows={2}
              style={{
                width:'100%', border:'none', outline:'none', resize:'none',
                fontSize:16, fontFamily:'inherit', color:textC, background:'transparent',
                lineHeight:'22px',
              }}
            />
            {/* parsed chips */}
            {(parsed.title || parsed.hour !== undefined || parsed.pri || parsed.list || parsed.day !== undefined) && (
              <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginTop:8, paddingTop:10, borderTop:`0.5px solid ${stroke}` }}>
                {parsed.title && <Chip label={parsed.title} c={textC} bg={dark?'rgba(255,255,255,0.06)':'rgba(43,42,38,0.06)'}/>}
                {parsed.day !== undefined && <Chip label={['今日','明日','明後日'][parsed.day]} c="#6B7FA8"/>}
                {parsed.hour !== undefined && <Chip label={`${parsed.hour}:${String(parsed.min||0).padStart(2,'0')}`} c="#6B7FA8"/>}
                {parsed.pri && <Chip label={`優先度:${PRI[parsed.pri].label}`} c={PRI[parsed.pri].dot}/>}
                {parsed.list && <Chip label={LISTS.find(l=>l.id===parsed.list).name} c={LISTS.find(l=>l.id===parsed.list).color}/>}
              </div>
            )}
          </div>
        </div>

        {/* Detail cards */}
        <div style={{ padding:'14px 20px 0', display:'flex', flexDirection:'column', gap:8 }}>
          <OptionRow dark={dark} icon="calendar" iconBg="#B84A3B" label="期限" value={`${date.getMonth()+1}/${date.getDate()} ${fmtTime(date)}`} onClick={()=>setShowDate(!showDate)}/>
          {showDate && <InlineDatePicker date={date} setDate={setDate} dark={dark}/>}
          <OptionRow dark={dark} icon="bell" iconBg="#C29B4A" label="リマインダー" value={
            {none:'なし','5min':'5分前','15min':'15分前','1h':'1時間前','1d':'1日前'}[remind]
          } onClick={()=>setRemind({none:'5min','5min':'15min','15min':'1h','1h':'1d','1d':'none'}[remind])}/>
          <OptionRow dark={dark} icon="repeat" iconBg="#6B7FA8" label="繰り返し" value={
            {none:'なし', daily:'毎日', weekday:'平日のみ', weekly:'毎週', monthly:'毎月'}[repeat]
          } onClick={()=>setRepeat({none:'daily', daily:'weekday', weekday:'weekly', weekly:'monthly', monthly:'none'}[repeat])}/>

          {/* Priority */}
          <div style={{ background:cardBg, borderRadius:14, padding:'12px 14px', border:`0.5px solid ${stroke}` }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
              <div style={{ width:28, height:28, borderRadius:8, background:'#7A8D3F', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Icon name="flag" size={14} color="#fff"/>
              </div>
              <div style={{ fontSize:14, fontWeight:500, color:textC }}>優先度</div>
            </div>
            <div style={{ display:'flex', gap:6 }}>
              {['high','mid','low'].map(k => (
                <button key={k} onClick={()=>setPri(k)} style={{
                  flex:1, border:'none', borderRadius:10, padding:'10px',
                  background: pri===k ? PRI[k].dot+'22' : (dark?'rgba(255,255,255,0.04)':'rgba(43,42,38,0.04)'),
                  color: pri===k ? PRI[k].dot : sub,
                  fontWeight:600, fontSize:13, cursor:'pointer',
                  border: pri===k ? `0.5px solid ${PRI[k].dot}55` : `0.5px solid transparent`,
                  display:'flex', alignItems:'center', justifyContent:'center', gap:6,
                }}>
                  <div style={{ width:8, height:8, borderRadius:4, background: PRI[k].dot }}/>
                  {PRI[k].label}
                </button>
              ))}
            </div>
          </div>

          {/* List */}
          <div style={{ background:cardBg, borderRadius:14, padding:'12px 14px', border:`0.5px solid ${stroke}` }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
              <div style={{ width:28, height:28, borderRadius:8, background:'#B84A3B', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <Icon name="lists" size={14} color="#fff"/>
              </div>
              <div style={{ fontSize:14, fontWeight:500, color:textC }}>リスト</div>
            </div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
              {LISTS.map(l => (
                <button key={l.id} onClick={()=>setListId(l.id)} style={{
                  border: listId===l.id ? `0.5px solid ${l.color}55` : `0.5px solid transparent`,
                  borderRadius:100, padding:'6px 12px', cursor:'pointer', fontSize:13, fontWeight:500,
                  background: listId===l.id ? l.color+'22' : (dark?'rgba(255,255,255,0.04)':'rgba(43,42,38,0.04)'),
                  color: listId===l.id ? l.color : textC,
                  display:'flex', alignItems:'center', gap:5,
                }}>
                  <span>{l.emoji}</span> {l.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const Chip = ({ label, c, bg }) => (
  <div style={{
    padding:'4px 10px', borderRadius:100, fontSize:12, fontWeight:600,
    background: bg || c+'1A', color: c,
    border: bg ? 'none' : `0.5px solid ${c}33`,
  }}>{label}</div>
);

function OptionRow({ dark, icon, iconBg, label, value, onClick }) {
  const textC = dark ? '#F5F1E6' : '#2B2A26';
  const sub  = dark ? 'rgba(245,241,230,0.55)' : 'rgba(43,42,38,0.55)';
  const cardBg = dark ? '#24221E' : '#FFFDF7';
  const stroke = dark?'rgba(255,255,255,0.06)':'rgba(43,42,38,0.06)';
  return (
    <button onClick={onClick} style={{
      background:cardBg, borderRadius:14, padding:'10px 14px', border:`0.5px solid ${stroke}`,
      display:'flex', alignItems:'center', gap:10, cursor:'pointer', width:'100%',
    }}>
      <div style={{ width:28, height:28, borderRadius:8, background:iconBg, display:'flex', alignItems:'center', justifyContent:'center' }}>
        <Icon name={icon} size={14} color="#fff"/>
      </div>
      <div style={{ flex:1, textAlign:'left', fontSize:14, fontWeight:500, color:textC }}>{label}</div>
      <div style={{ fontSize:13, color:sub }}>{value}</div>
      <Icon name="chev" size={12} color={sub}/>
    </button>
  );
}

function InlineDatePicker({ date, setDate, dark }) {
  const textC = dark ? '#F5F1E6' : '#2B2A26';
  const sub  = dark ? 'rgba(245,241,230,0.55)' : 'rgba(43,42,38,0.55)';
  const cardBg = dark ? '#24221E' : '#FFFDF7';
  const stroke = dark?'rgba(255,255,255,0.06)':'rgba(43,42,38,0.06)';

  // Simple wheel-like pickers for hour/min, and date quick chips
  const quick = [
    { label:'今日', d:0 }, { label:'明日', d:1 }, { label:'来週月曜', d:7 }, { label:'週末', d:5 },
  ];

  return (
    <div style={{ background:cardBg, borderRadius:14, padding:'14px', border:`0.5px solid ${stroke}`, display:'flex', flexDirection:'column', gap:10 }}>
      <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
        {quick.map(q => (
          <button key={q.label} onClick={()=>{ const d = new Date(TODAY); d.setDate(d.getDate()+q.d); d.setHours(date.getHours(),date.getMinutes()); setDate(d); }} style={{
            padding:'6px 12px', borderRadius:100, fontSize:12, fontWeight:600, cursor:'pointer',
            background: dark?'rgba(255,255,255,0.06)':'rgba(43,42,38,0.06)', color: textC, border:'none',
          }}>{q.label}</button>
        ))}
      </div>
      <div style={{ display:'flex', gap:12, alignItems:'center', justifyContent:'center', padding:'6px 0', background: dark?'rgba(0,0,0,0.2)':'rgba(0,0,0,0.03)', borderRadius:10 }}>
        <WheelCol value={date.getHours()} setValue={v=>{ const d=new Date(date); d.setHours(v); setDate(d); }} min={0} max={23} textC={textC} sub={sub}/>
        <div style={{ fontSize:22, fontWeight:700, color:sub }}>:</div>
        <WheelCol value={date.getMinutes()} setValue={v=>{ const d=new Date(date); d.setMinutes(v); setDate(d); }} min={0} max={55} step={5} textC={textC} sub={sub}/>
      </div>
    </div>
  );
}

function WheelCol({ value, setValue, min, max, step=1, textC, sub }) {
  const up = () => { let v = value + step; if (v>max) v = min; setValue(v); };
  const dn = () => { let v = value - step; if (v<min) v = max; setValue(v); };
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
      <button onClick={up} style={{ border:'none', background:'none', cursor:'pointer', opacity:0.5, padding:2 }}>
        <Icon name="chevD" size={14} color={sub} strokeWidth={2}/>
      </button>
      <div style={{ fontSize:32, fontWeight:700, color:textC, fontVariantNumeric:'tabular-nums', letterSpacing:-1, fontFamily:'var(--hibi-font-display)' }}>
        {String(value).padStart(2,'0')}
      </div>
      <button onClick={dn} style={{ border:'none', background:'none', cursor:'pointer', opacity:0.5, padding:2, transform:'rotate(180deg)' }}>
        <Icon name="chevD" size={14} color={sub} strokeWidth={2}/>
      </button>
    </div>
  );
}

window.AddTaskModal = AddTaskModal;
