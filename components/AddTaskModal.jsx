// Add-task modal with natural-language input preview + date/priority/list pickers

const REMIND_OPTIONS = [
  { id:'none',  label:'なし' },
  { id:'atdue', label:'期限時刻' },
  { id:'5min',  label:'5分前' },
  { id:'15min', label:'15分前' },
  { id:'30min', label:'30分前' },
  { id:'1h',    label:'1時間前' },
  { id:'2h',    label:'2時間前' },
  { id:'1d',    label:'1日前' },
  { id:'2d',    label:'2日前' },
  { id:'1w',    label:'1週間前' },
];

const WEEKDAY_CHARS = ['日','月','火','水','木','金','土'];

// Human-readable summary for a repeat setting
function repeatSummary(repeat, days) {
  if (repeat === 'none') return 'なし';
  if (repeat === 'daily') return '毎日';
  if (repeat === 'weekday') return '平日のみ';
  if (repeat === 'weekend') return '土日のみ';
  if (repeat === 'weekly') return '毎週';
  if (repeat === 'monthly') return '毎月';
  if (repeat === 'yearly') return '毎年';
  if (repeat === 'custom') {
    if (!days || days.length === 0) return '曜日を選択';
    const sorted = [...days].sort();
    return sorted.map(d => WEEKDAY_CHARS[d]).join('・');
  }
  return 'なし';
}

// Short badge label for calendars / task cells
function repeatBadgeLabel(repeat, days) {
  if (repeat === 'none') return '';
  if (repeat === 'daily') return '毎日';
  if (repeat === 'weekday') return '平日';
  if (repeat === 'weekend') return '土日';
  if (repeat === 'weekly') return '毎週';
  if (repeat === 'monthly') return '毎月';
  if (repeat === 'yearly') return '毎年';
  if (repeat === 'custom' && days?.length) {
    return days.slice().sort().map(d=>WEEKDAY_CHARS[d]).join('');
  }
  return '';
}

function AddTaskModal({ open, onClose, onAdd, onUpdate, editTask, dark }) {
  const isEdit = !!editTask;
  const [text, setText] = useState('');
  const [parsed, setParsed] = useState({});
  const [showDate, setShowDate] = useState(false);
  // Start time defaults to today 14:00, end defaults to start + 1h
  const [startDate, setStartDate] = useState(new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate(), 14, 0));
  const [endDate, setEndDate] = useState(new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate(), 15, 0));
  const [allDay, setAllDay] = useState(false);
  const [pri, setPri] = useState('mid');
  const [listId, setListId] = useState('work');
  const [remind, setRemind] = useState('15min');
  const [repeat, setRepeat] = useState('none'); // 'none' | 'daily' | 'weekday' | 'weekend' | 'weekly' | 'monthly' | 'yearly' | 'custom'
  const [repeatDays, setRepeatDays] = useState([]); // for 'custom': array of 0–6 (Sun..Sat)
  const [remindOpen, setRemindOpen] = useState(false);
  const [repeatOpen, setRepeatOpen] = useState(false);

  // When opening in edit mode, hydrate state from the task.
  // When opening fresh (add), reset to sensible defaults.
  useEffect(() => {
    if (!open) return;
    if (editTask) {
      setText(editTask.title || '');
      // parsed gets filled by the useEffect below when text changes; ensure .title is set
      // so the "add/save" button is enabled right away.
      setParsed({ title: editTask.title || '' });
      const s = editTask.due ? new Date(editTask.due) : new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate(), 14, 0);
      const e = editTask.end
        ? new Date(editTask.end)
        : (editTask.dur ? new Date(s.getTime() + editTask.dur*60000) : new Date(s.getTime() + 60*60*1000));
      setStartDate(s);
      setEndDate(e);
      setAllDay(!!editTask.allDay);
      setPri(editTask.pri || 'mid');
      setListId(editTask.list || 'work');
      setRemind(editTask.remind || '15min');
      setRepeat(editTask.repeat || 'none');
      setRepeatDays(editTask.repeatDays ? [...editTask.repeatDays] : []);
      setShowDate(false);
      setRemindOpen(false);
      setRepeatOpen(false);
    } else {
      // fresh add
      setText('');
      setParsed({});
      setStartDate(new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate(), 14, 0));
      setEndDate(new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate(), 15, 0));
      setAllDay(false);
      setPri('mid');
      setListId('work');
      setRemind('15min');
      setRepeat('none');
      setRepeatDays([]);
      setShowDate(false);
      setRemindOpen(false);
      setRepeatOpen(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editTask?.id]);

  const textC = dark ? '#F5F1E6' : '#2B2A26';
  const sub  = dark ? 'rgba(245,241,230,0.55)' : 'rgba(43,42,38,0.55)';
  const bg = dark ? '#1C1A17' : '#FAF7F0';
  const cardBg = dark ? '#24221E' : '#FFFDF7';
  const stroke = dark?'rgba(255,255,255,0.06)':'rgba(43,42,38,0.06)';
  const accent = (typeof getComputedStyle !== 'undefined' && getComputedStyle(document.documentElement).getPropertyValue('--hibi-accent').trim()) || '#3A5A8A';

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
    // Start with the day from startDate (NOT from TODAY) — NLP overrides can tweak it.
    const due = new Date(startDate);
    due.setSeconds(0, 0);
    if (parsed.day !== undefined) {
      const base = new Date(TODAY);
      base.setDate(base.getDate() + parsed.day);
      due.setFullYear(base.getFullYear(), base.getMonth(), base.getDate());
    }
    if (parsed.mo !== undefined) { due.setMonth(parsed.mo); due.setDate(parsed.dt); }
    if (parsed.hour !== undefined) { due.setHours(parsed.hour); due.setMinutes(parsed.min||0); }
    else { due.setHours(startDate.getHours()); due.setMinutes(startDate.getMinutes()); }
    // Compute end on the SAME day as due, using endDate's H:M. If end ≤ start, push +1h.
    let end;
    if (allDay) {
      end = new Date(due); end.setHours(23,59,0,0);
      due.setHours(0,0,0,0);
    } else {
      end = new Date(due);
      end.setHours(endDate.getHours(), endDate.getMinutes(), 0, 0);
      if (end <= due) end = new Date(due.getTime() + 60*60*1000);
    }
    const durMin = Math.max(5, Math.round((end - due) / 60000));
    const payload = {
      title: parsed.title,
      list: parsed.list || listId,
      pri: parsed.pri || pri,
      due, end, allDay,
      dur: durMin,
      remind,
      repeat,
      repeatDays: repeat === 'custom' ? [...repeatDays] : [],
    };
    if (isEdit) {
      // preserve id + done + any other fields (sub, note, evt, flag...)
      onUpdate?.({ ...editTask, ...payload });
    } else {
      onAdd({ id: 't_'+Date.now(), done: false, ...payload });
    }
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
        borderRadius:'26px 26px 0 0', padding:'12px 0 0',
        animation:'slide-up 260ms cubic-bezier(.2,.8,.2,1)',
        display:'flex', flexDirection:'column',
        overflow:'hidden',
      }}>
        {/* grabber */}
        <div style={{ width:40, height:5, borderRadius:3, background: dark?'rgba(255,255,255,0.2)':'rgba(43,42,38,0.2)', margin:'0 auto 8px' }}/>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'6px 20px 14px' }}>
          <button onClick={onClose} style={{ border:'none', background:'none', color: sub, fontSize:15, cursor:'pointer', padding:0 }}>キャンセル</button>
          <div style={{ fontSize:15, fontWeight:600, color: textC }}>{isEdit ? 'タスクを編集' : '新しいタスク'}</div>
          <button onClick={handleAdd} disabled={!parsed.title} style={{
            border:'none', background: parsed.title ? accent : (dark?'rgba(255,255,255,0.08)':'rgba(43,42,38,0.08)'),
            color: parsed.title ? '#fff' : sub, fontSize:14, fontWeight:600,
            padding:'6px 14px', borderRadius:100, cursor: parsed.title?'pointer':'default',
          }}>{isEdit ? '保存' : '追加'}</button>
        </div>

        {/* scrollable body */}
        <div style={{ flex:1, minHeight:0, overflowY:'auto', WebkitOverflowScrolling:'touch', paddingBottom:28 }}>
        {/* NLP input */}
        <div style={{ padding:'0 20px' }}>
          <div style={{ background: cardBg, borderRadius:18, padding:'14px 16px', border:`0.5px solid ${stroke}` }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
              <Icon name="sparkle" size={14} color={accent}/>
              <span style={{ fontSize:11, color:accent, fontWeight:700, letterSpacing:1 }}>自然言語入力</span>
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
          <OptionRow dark={dark} icon="calendar" iconBg="#B84A3B" label="日程" value={
            allDay
              ? `${startDate.getMonth()+1}/${startDate.getDate()} · 終日`
              : `${startDate.getMonth()+1}/${startDate.getDate()} ${fmtTime(startDate)}–${fmtTime(endDate)}`
          } onClick={()=>setShowDate(!showDate)}/>
          {showDate && <InlineDatePicker
            startDate={startDate} setStartDate={setStartDate}
            endDate={endDate} setEndDate={setEndDate}
            allDay={allDay} setAllDay={setAllDay}
            dark={dark} accent={accent}/>}
          <OptionRow dark={dark} icon="bell" iconBg="#C29B4A" label="リマインダー" value={
            REMIND_OPTIONS.find(o=>o.id===remind).label
          } onClick={()=>{ setRemindOpen(v=>!v); setRepeatOpen(false); setShowDate(false); }} chevOpen={remindOpen}/>
          {remindOpen && (
            <PickerSheet dark={dark}>
              {REMIND_OPTIONS.map(o => (
                <PickerRow key={o.id}
                  label={o.label}
                  selected={remind===o.id}
                  onClick={()=>{ setRemind(o.id); setRemindOpen(false); }}
                  dark={dark}
                />
              ))}
            </PickerSheet>
          )}
          <OptionRow dark={dark} icon="repeat" iconBg="#6B7FA8" label="繰り返し"
            value={repeatSummary(repeat, repeatDays)}
            onClick={()=>{ setRepeatOpen(v=>!v); setRemindOpen(false); setShowDate(false); }}
            chevOpen={repeatOpen}/>
          {repeatOpen && (
            <RepeatPicker
              repeat={repeat} setRepeat={setRepeat}
              days={repeatDays} setDays={setRepeatDays}
              dark={dark}
            />
          )}

          {/* Priority */}
          <div style={{ background:cardBg, borderRadius:14, padding:'12px 14px', border:`0.5px solid ${stroke}` }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
              <div style={{ width:28, height:28, borderRadius:8, background:'#3A5A8A', display:'flex', alignItems:'center', justifyContent:'center' }}>
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
                  borderRadius:100, padding:'6px 12px 6px 6px', cursor:'pointer', fontSize:13, fontWeight:500,
                  background: listId===l.id ? l.color+'22' : (dark?'rgba(255,255,255,0.04)':'rgba(43,42,38,0.04)'),
                  color: listId===l.id ? l.color : textC,
                  display:'flex', alignItems:'center', gap:6,
                }}>
                  {l.image ? (
                    <span style={{ width:22, height:22, borderRadius:7, overflow:'hidden', display:'inline-block', flexShrink:0 }}>
                      <img src={l.image} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}/>
                    </span>
                  ) : (
                    <span style={{ fontSize:14, lineHeight:1 }}>{l.emoji}</span>
                  )}
                  {l.name}
                </button>
              ))}
            </div>
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

function OptionRow({ dark, icon, iconBg, label, value, onClick, chevOpen }) {
  const textC = dark ? '#F5F1E6' : '#2B2A26';
  const sub  = dark ? 'rgba(245,241,230,0.55)' : 'rgba(43,42,38,0.55)';
  const cardBg = dark ? '#24221E' : '#FFFDF7';
  const stroke = dark?'rgba(255,255,255,0.06)':'rgba(43,42,38,0.06)';
  // Ink/paper icon chip — iconBg acts only as a subtle accent dot
  const iconTint = dark ? 'rgba(245,241,230,0.08)' : 'rgba(43,42,38,0.06)';
  const iconColor = dark ? 'rgba(245,241,230,0.85)' : '#2B2A26';
  return (
    <button onClick={onClick} style={{
      background:cardBg, borderRadius:14, padding:'10px 14px', border:`0.5px solid ${stroke}`,
      display:'flex', alignItems:'center', gap:10, cursor:'pointer', width:'100%',
    }}>
      <div style={{
        position:'relative', width:28, height:28, borderRadius:8, background: iconTint,
        display:'flex', alignItems:'center', justifyContent:'center',
      }}>
        <Icon name={icon} size={14} color={iconColor}/>
        {/* accent pin bottom-right — carries the semantic color without shouting */}
        {iconBg && (
          <span aria-hidden style={{
            position:'absolute', right:-1, bottom:-1, width:6, height:6, borderRadius:3,
            background: iconBg, boxShadow: `0 0 0 1.5px ${cardBg}`,
          }}/>
        )}
      </div>
      <div style={{ flex:1, textAlign:'left', fontSize:14, fontWeight:500, color:textC }}>{label}</div>
      <div style={{ fontSize:13, color:sub, maxWidth:170, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{value}</div>
      <div style={{ transition:'transform 220ms', transform: chevOpen===undefined ? 'none' : (chevOpen ? 'rotate(90deg)' : 'none') }}>
        <Icon name="chev" size={12} color={sub}/>
      </div>
    </button>
  );
}

// Generic pulldown sheet
function PickerSheet({ dark, children }) {
  const cardBg = dark ? '#24221E' : '#FFFDF7';
  const stroke = dark?'rgba(255,255,255,0.06)':'rgba(43,42,38,0.06)';
  return (
    <div style={{
      background:cardBg, borderRadius:14, border:`0.5px solid ${stroke}`, overflow:'hidden',
      animation:'fade-in 180ms',
    }}>
      {children}
    </div>
  );
}

function PickerRow({ label, selected, onClick, dark }) {
  const textC = dark ? '#F5F1E6' : '#2B2A26';
  const sub  = dark ? 'rgba(245,241,230,0.55)' : 'rgba(43,42,38,0.55)';
  return (
    <button onClick={onClick} style={{
      width:'100%', padding:'11px 14px', border:'none', background:'transparent', cursor:'pointer',
      display:'flex', alignItems:'center', gap:10, color:textC,
      fontSize:14, fontWeight: selected ? 700 : 500, fontFamily:'inherit',
      textAlign:'left',
    }}>
      <div style={{ flex:1 }}>{label}</div>
      {selected && (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M4 12l5 5L20 6" stroke="#3A5A8A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )}
    </button>
  );
}

// Repeat picker with weekday multi-select for 'custom'
function RepeatPicker({ repeat, setRepeat, days, setDays, dark }) {
  const cardBg = dark ? '#24221E' : '#FFFDF7';
  const stroke = dark?'rgba(255,255,255,0.06)':'rgba(43,42,38,0.06)';
  const textC = dark ? '#F5F1E6' : '#2B2A26';
  const sub  = dark ? 'rgba(245,241,230,0.55)' : 'rgba(43,42,38,0.55)';
  const accent = '#6B7FA8';

  const options = [
    { id:'none', label:'なし' },
    { id:'daily', label:'毎日' },
    { id:'weekday', label:'平日のみ' },
    { id:'weekend', label:'土日のみ' },
    { id:'weekly', label:'毎週' },
    { id:'monthly', label:'毎月' },
    { id:'yearly', label:'毎年' },
    { id:'custom', label:'曜日を指定' },
  ];

  const toggleDay = (d) => {
    if (days.includes(d)) setDays(days.filter(x => x!==d));
    else setDays([...days, d]);
  };

  return (
    <div style={{
      background:cardBg, borderRadius:14, border:`0.5px solid ${stroke}`, overflow:'hidden',
      animation:'fade-in 180ms', display:'flex', flexDirection:'column',
    }}>
      {options.map((o, i) => (
        <PickerRow key={o.id}
          label={o.label}
          selected={repeat===o.id}
          onClick={()=>setRepeat(o.id)}
          dark={dark}
        />
      ))}
      {repeat === 'custom' && (
        <div style={{ padding:'10px 12px 14px', borderTop:`0.5px solid ${stroke}` }}>
          <div style={{ fontSize:11, color:sub, fontWeight:600, letterSpacing:1, marginBottom:8, padding:'0 2px' }}>繰り返す曜日</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:6 }}>
            {WEEKDAY_CHARS.map((w, i) => {
              const on = days.includes(i);
              const isRed = i===0, isBlue = i===6;
              const baseColor = isRed ? '#B84A3B' : (isBlue ? '#6B7FA8' : textC);
              return (
                <button key={i} onClick={()=>toggleDay(i)} style={{
                  aspectRatio:'1', borderRadius:10, border:'none', cursor:'pointer',
                  background: on ? accent : (dark?'rgba(255,255,255,0.06)':'rgba(43,42,38,0.05)'),
                  color: on ? '#fff' : baseColor,
                  fontSize:14, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center',
                  transition:'background 160ms, color 160ms',
                }}>{w}</button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

window.REMIND_OPTIONS = REMIND_OPTIONS;
window.repeatSummary = repeatSummary;
window.repeatBadgeLabel = repeatBadgeLabel;
window.WEEKDAY_CHARS = WEEKDAY_CHARS;

function InlineDatePicker({ startDate, setStartDate, endDate, setEndDate, allDay, setAllDay, dark, accent }) {
  const textC = dark ? '#F5F1E6' : '#2B2A26';
  const sub  = dark ? 'rgba(245,241,230,0.55)' : 'rgba(43,42,38,0.55)';
  const cardBg = dark ? '#24221E' : '#FFFDF7';
  const stroke = dark?'rgba(255,255,255,0.06)':'rgba(43,42,38,0.06)';

  // Change the DATE part (Y/M/D) of startDate; keep its H:M.
  // Also bring endDate onto the same new day, preserving endDate's H:M.
  const setDay = (newDay) => {
    const s = new Date(newDay);
    s.setHours(startDate.getHours(), startDate.getMinutes(), 0, 0);
    setStartDate(s);
    const e = new Date(newDay);
    e.setHours(endDate.getHours(), endDate.getMinutes(), 0, 0);
    if (e <= s) e.setTime(s.getTime() + 60*60*1000);
    setEndDate(e);
  };

  // Update start H:M; if end <= new start, push end to start + 1h.
  const setStartTime = (h, m) => {
    const s = new Date(startDate);
    if (h !== undefined) s.setHours(h);
    if (m !== undefined) s.setMinutes(m);
    setStartDate(s);
    if (endDate <= s) {
      const e = new Date(s.getTime() + 60*60*1000);
      setEndDate(e);
    }
  };
  // Update end H:M on the same calendar day as start.
  const setEndTime = (h, m) => {
    const e = new Date(startDate);
    e.setHours(endDate.getHours(), endDate.getMinutes(), 0, 0);
    if (h !== undefined) e.setHours(h);
    if (m !== undefined) e.setMinutes(m);
    setEndDate(e);
  };

  const quick = [
    { label:'今日', d:0 }, { label:'明日', d:1 }, { label:'来週月曜', d:7 }, { label:'週末', d:5 },
  ];

  return (
    <div style={{ background:cardBg, borderRadius:14, padding:'14px', border:`0.5px solid ${stroke}`, display:'flex', flexDirection:'column', gap:12 }}>
      {/* Quick date chips */}
      <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
        {quick.map(q => (
          <button key={q.label} onClick={()=>{ const d = new Date(TODAY); d.setDate(d.getDate()+q.d); setDay(d); }} style={{
            padding:'6px 12px', borderRadius:100, fontSize:12, fontWeight:600, cursor:'pointer',
            background: dark?'rgba(255,255,255,0.06)':'rgba(43,42,38,0.06)', color: textC, border:'none',
          }}>{q.label}</button>
        ))}
        <div style={{ flex:1 }}/>
        <div style={{ fontSize:12, color:sub, fontWeight:600, alignSelf:'center' }}>
          {`${startDate.getMonth()+1}/${startDate.getDate()}(${WEEK_JP[startDate.getDay()]})`}
        </div>
      </div>

      {/* Mini month calendar */}
      <MiniMonthPicker selected={startDate} onPick={setDay} dark={dark} accent={accent}/>

      {/* All-day toggle */}
      <div style={{
        display:'flex', alignItems:'center', gap:10,
        padding:'10px 12px', borderRadius:10,
        background: dark?'rgba(255,255,255,0.04)':'rgba(43,42,38,0.03)',
      }}>
        <Icon name="calendar" size={14} color={sub}/>
        <div style={{ flex:1, fontSize:14, fontWeight:600, color:textC }}>終日</div>
        <Switch on={allDay} setOn={setAllDay} accent={accent} dark={dark}/>
      </div>

      {!allDay && (
        <>
          {/* Start time */}
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:44, fontSize:12, fontWeight:700, color:sub, letterSpacing:1 }}>開始</div>
            <div style={{ flex:1, display:'flex', gap:10, alignItems:'center', justifyContent:'center', padding:'6px 0', background: dark?'rgba(0,0,0,0.2)':'rgba(0,0,0,0.03)', borderRadius:10 }}>
              <WheelCol value={startDate.getHours()} setValue={v=>setStartTime(v, undefined)} min={0} max={23} textC={textC} sub={sub}/>
              <div style={{ fontSize:22, fontWeight:700, color:sub }}>:</div>
              <WheelCol value={startDate.getMinutes()} setValue={v=>setStartTime(undefined, v)} min={0} max={55} step={5} textC={textC} sub={sub}/>
            </div>
          </div>
          {/* End time */}
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:44, fontSize:12, fontWeight:700, color:sub, letterSpacing:1 }}>終了</div>
            <div style={{ flex:1, display:'flex', gap:10, alignItems:'center', justifyContent:'center', padding:'6px 0', background: dark?'rgba(0,0,0,0.2)':'rgba(0,0,0,0.03)', borderRadius:10 }}>
              <WheelCol value={endDate.getHours()} setValue={v=>setEndTime(v, undefined)} min={0} max={23} textC={textC} sub={sub}/>
              <div style={{ fontSize:22, fontWeight:700, color:sub }}>:</div>
              <WheelCol value={endDate.getMinutes()} setValue={v=>setEndTime(undefined, v)} min={0} max={55} step={5} textC={textC} sub={sub}/>
            </div>
          </div>
          {/* Duration hint */}
          {(() => {
            const diff = Math.max(0, Math.round((endDate - startDate)/60000));
            const h = Math.floor(diff/60), m = diff%60;
            const durLabel = diff <= 0 ? '— ' : (h ? `${h}時間${m?`${m}分`:''}` : `${m}分`);
            return (
              <div style={{ fontSize:11, color:sub, textAlign:'center', fontWeight:500 }}>
                所要時間 {durLabel}
              </div>
            );
          })()}
        </>
      )}
    </div>
  );
}

// Simple iOS-style toggle
function Switch({ on, setOn, accent, dark }) {
  return (
    <div onClick={()=>setOn(!on)} style={{
      width:42, height:25, borderRadius:13, padding:2, cursor:'pointer',
      background: on ? accent : (dark?'rgba(255,255,255,0.14)':'rgba(43,42,38,0.18)'),
      transition:'background 180ms', position:'relative',
    }}>
      <div style={{
        width:21, height:21, borderRadius:12, background:'#fff',
        transform: on ? 'translateX(17px)' : 'translateX(0)',
        transition:'transform 220ms cubic-bezier(.2,.8,.2,1)',
        boxShadow:'0 1px 3px rgba(0,0,0,0.2)',
      }}/>
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

// Mini month-grid date picker (shown inside the 日程 card)
function MiniMonthPicker({ selected, onPick, dark, accent }) {
  const [month, setMonth] = React.useState(new Date(selected.getFullYear(), selected.getMonth(), 1));
  // Re-center when `selected` moves to a different month (e.g. via quick chips)
  React.useEffect(() => {
    if (selected.getFullYear() !== month.getFullYear() || selected.getMonth() !== month.getMonth()) {
      setMonth(new Date(selected.getFullYear(), selected.getMonth(), 1));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected.getTime()]);

  const textC = dark ? '#F5F1E6' : '#2B2A26';
  const sub  = dark ? 'rgba(245,241,230,0.55)' : 'rgba(43,42,38,0.55)';
  const dim  = dark ? 'rgba(245,241,230,0.28)' : 'rgba(43,42,38,0.28)';
  const stroke = dark?'rgba(255,255,255,0.06)':'rgba(43,42,38,0.06)';

  const firstDow = month.getDay();
  const cells = Array.from({length:42}, (_,i) => {
    const d = new Date(month.getFullYear(), month.getMonth(), i - firstDow + 1);
    return d;
  });
  // trim trailing full empty weeks
  const lastDate = new Date(month.getFullYear(), month.getMonth()+1, 0).getDate();
  const rowsNeeded = Math.ceil((firstDow + lastDate) / 7);
  const visibleCells = cells.slice(0, rowsNeeded * 7);

  const prev = () => setMonth(new Date(month.getFullYear(), month.getMonth()-1, 1));
  const next = () => setMonth(new Date(month.getFullYear(), month.getMonth()+1, 1));

  return (
    <div style={{
      border:`0.5px solid ${stroke}`, borderRadius:12, padding:'10px 10px 8px',
      background: dark?'rgba(255,255,255,0.02)':'rgba(43,42,38,0.015)',
    }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 4px 6px' }}>
        <button onClick={prev} style={navBtnMini(dark)} aria-label="前月"><Icon name="chevL" size={14} color={textC}/></button>
        <div style={{ fontSize:13, fontWeight:700, color:textC, fontFamily:'var(--hibi-font-display)' }}>
          {month.getFullYear()}年 {month.getMonth()+1}月
        </div>
        <button onClick={next} style={navBtnMini(dark)} aria-label="翌月"><Icon name="chev" size={14} color={textC}/></button>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', padding:'2px 0' }}>
        {WEEK_JP.map((w,i) => (
          <div key={i} style={{
            textAlign:'center', fontSize:10, fontWeight:700, padding:'2px 0',
            color: i===0?'#B84A3B':(i===6?'#6B7FA8':sub), letterSpacing:0.5,
          }}>{w}</div>
        ))}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:2 }}>
        {visibleCells.map((d, i) => {
          const inMonth = d.getMonth() === month.getMonth();
          const isToday = sameDay(d, TODAY);
          const isSel = sameDay(d, selected);
          const dow = d.getDay();
          const color = !inMonth ? dim : (dow===0?'#B84A3B':(dow===6?'#6B7FA8':textC));
          return (
            <button key={i} onClick={()=>onPick(new Date(d))} style={{
              border:'none', cursor:'pointer', padding:0,
              aspectRatio:'1', borderRadius:8,
              background: isSel ? accent : 'transparent',
              display:'flex', alignItems:'center', justifyContent:'center',
              position:'relative',
            }}>
              <span style={{
                fontSize:13,
                fontWeight: isSel || isToday ? 700 : 500,
                color: isSel ? '#fff' : color,
                fontVariantNumeric:'tabular-nums',
              }}>{d.getDate()}</span>
              {isToday && !isSel && (
                <span style={{
                  position:'absolute', bottom:4, left:'50%', transform:'translateX(-50%)',
                  width:3, height:3, borderRadius:2, background: accent,
                }}/>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function navBtnMini(dark) {
  return {
    width:26, height:26, borderRadius:13, border:'none', cursor:'pointer',
    background: dark?'rgba(255,255,255,0.06)':'rgba(43,42,38,0.05)',
    display:'flex', alignItems:'center', justifyContent:'center',
  };
}
