// Calendar screen — month overview with task-count dots, selected-day list

function CalendarScreen({ tasks, onToggle, onDelete, onFlag, onOpen, dark, density }) {
  const [month, setMonth] = useState(new Date(TODAY.getFullYear(), TODAY.getMonth(), 1));
  const [selected, setSelected] = useState(new Date(TODAY));
  const [view, setView] = useState('month'); // month | week | day

  const text = dark ? '#F5F1E6' : '#2B2A26';
  const sub  = dark ? 'rgba(245,241,230,0.55)' : 'rgba(43,42,38,0.55)';
  const cardBg = dark ? '#24221E' : '#FFFDF7';
  const dim = dark ? 'rgba(245,241,230,0.25)' : 'rgba(43,42,38,0.25)';
  const accent = '#7A8D3F';

  // Build calendar grid (6 weeks)
  const firstDow = month.getDay();
  const daysInMonth = new Date(month.getFullYear(), month.getMonth()+1, 0).getDate();
  const cells = [];
  for (let i=0; i<42; i++){
    const d = new Date(month.getFullYear(), month.getMonth(), i - firstDow + 1);
    cells.push(d);
  }

  const goPrev = () => setMonth(new Date(month.getFullYear(), month.getMonth()-1, 1));
  const goNext = () => setMonth(new Date(month.getFullYear(), month.getMonth()+1, 1));

  // tasks by date (YYYY-MM-DD)
  const taskByDay = {};
  tasks.forEach(t => {
    const k = `${t.due.getFullYear()}-${t.due.getMonth()}-${t.due.getDate()}`;
    (taskByDay[k] ||= []).push(t);
  });
  const keyOf = (d) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

  const selectedTasks = (taskByDay[keyOf(selected)] || []).sort((a,b)=>a.due-b.due);

  return (
    <div style={{ padding: '0 0 120px' }}>
      {/* Header */}
      <div style={{ padding:'8px 22px 4px' }}>
        <div style={{ fontSize:12, color: sub, letterSpacing:2, textTransform:'uppercase', fontWeight:600 }}>
          {MONTH_JP[month.getMonth()]} · {month.getFullYear()}
        </div>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:4 }}>
          <div style={{ fontSize:36, fontWeight:700, color:text, letterSpacing:-0.8, fontFamily:'var(--hibi-font-display)' }}>
            {month.getMonth()+1}月
          </div>
          <div style={{ display:'flex', gap:6 }}>
            <button onClick={goPrev} style={navBtn(dark)}><Icon name="chevL" size={18} color={text}/></button>
            <button onClick={()=>{setMonth(new Date(TODAY.getFullYear(), TODAY.getMonth(), 1)); setSelected(new Date(TODAY));}}
              style={{...navBtn(dark), width:'auto', padding:'0 14px', fontSize:13, fontWeight:600, color:accent}}>今日</button>
            <button onClick={goNext} style={navBtn(dark)}><Icon name="chev" size={18} color={text}/></button>
          </div>
        </div>

        {/* view switch */}
        <div style={{
          marginTop: 12, display:'flex', padding:3, gap:3,
          background: dark?'rgba(255,255,255,0.06)':'rgba(43,42,38,0.06)', borderRadius:10,
        }}>
          {[['month','月'],['week','週'],['day','日']].map(([k,l]) => (
            <button key={k} onClick={()=>setView(k)} style={{
              flex:1, height:30, borderRadius:8, border:'none', background: view===k ? (dark?'#3A3631':'#fff') : 'transparent',
              fontSize:13, fontWeight:600, color: view===k ? text : sub,
              boxShadow: view===k ? '0 1px 3px rgba(0,0,0,0.08)' : 'none', cursor:'pointer',
            }}>{l}表示</button>
          ))}
        </div>
      </div>

      {view === 'month' && (
        <>
          {/* Week headers */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', padding:'14px 10px 6px' }}>
            {WEEK_JP.map((w,i) => (
              <div key={i} style={{ textAlign:'center', fontSize:11, fontWeight:600, color: i===0?'#B84A3B':(i===6?'#6B7FA8':sub), letterSpacing:1 }}>{w}</div>
            ))}
          </div>
          {/* Grid */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', padding:'0 10px', rowGap:2 }}>
            {cells.map((d, i) => {
              const inMonth = d.getMonth() === month.getMonth();
              const isToday = sameDay(d, TODAY);
              const isSel = sameDay(d, selected);
              const dayTasks = taskByDay[keyOf(d)] || [];
              const dow = d.getDay();
              const color = !inMonth ? dim : (dow===0?'#B84A3B':(dow===6?'#6B7FA8':text));
              return (
                <div key={i} onClick={()=>setSelected(new Date(d))} style={{
                  aspectRatio:'0.9', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'flex-start',
                  paddingTop: 6, cursor:'pointer', borderRadius: 10, position:'relative',
                  background: isSel ? (dark?'rgba(122,141,63,0.22)':'rgba(122,141,63,0.14)') : 'transparent',
                }}>
                  <div style={{
                    width:26, height:26, borderRadius:13, display:'flex', alignItems:'center', justifyContent:'center',
                    background: isToday ? accent : 'transparent',
                    color: isToday ? '#fff' : color,
                    fontSize: 14, fontWeight: isToday?700:500, fontVariantNumeric:'tabular-nums',
                  }}>{d.getDate()}</div>
                  {/* dots */}
                  <div style={{ display:'flex', gap:2, marginTop:3, minHeight:5 }}>
                    {dayTasks.slice(0,3).map((t,j) => {
                      const l = LISTS.find(x=>x.id===t.list);
                      return <div key={j} style={{ width:4, height:4, borderRadius:2, background: l.color, opacity: t.done?0.35:1 }}/>;
                    })}
                    {dayTasks.length>3 && <div style={{ width:4, height:4, borderRadius:2, background: sub, opacity:0.7 }}/>}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {view === 'week' && <WeekView date={selected} tasks={tasks} onOpen={onOpen} dark={dark}/>}
      {view === 'day' && <DayView date={selected} tasks={selectedTasks} onToggle={onToggle} onOpen={onOpen} dark={dark}/>}

      {/* Selected day section (month view) */}
      {view === 'month' && (
        <div style={{ marginTop: 20 }}>
          <div style={{ padding:'2px 24px 8px', display:'flex', alignItems:'baseline', justifyContent:'space-between' }}>
            <div style={{ fontSize:17, fontWeight:700, color:text, fontFamily:'var(--hibi-font-display)' }}>
              {fmtDateFull(selected)}
            </div>
            <div style={{ fontSize:12, color:sub }}>{selectedTasks.length}件</div>
          </div>
          {selectedTasks.length === 0 ? (
            <div style={{ margin:'0 16px', padding:'28px 20px', background:cardBg, borderRadius:18, textAlign:'center', color:sub, fontSize:13 }}>
              予定はありません
            </div>
          ) : (
            <div style={{ margin:'0 16px', borderRadius:18, overflow:'hidden', background:cardBg,
              border:`0.5px solid ${dark?'rgba(255,255,255,0.06)':'rgba(43,42,38,0.06)'}` }}>
              {selectedTasks.map((t,i) => (
                <div key={t.id} style={{ display:'flex', alignItems:'stretch' }}>
                  <div style={{ width:54, padding:'14px 0 0 14px', flexShrink:0, fontSize:12, color:sub, fontVariantNumeric:'tabular-nums', fontWeight:500 }}>
                    {fmtTime(t.due)}
                  </div>
                  <div style={{ flex:1, borderLeft:`0.5px solid ${dark?'rgba(255,255,255,0.08)':'rgba(43,42,38,0.08)'}` }}>
                    <TaskCell task={t} onToggle={onToggle} onDelete={onDelete} onFlag={onFlag} onOpen={onOpen} dark={dark} density={density}/>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* iPhone notifications opt-in (Web Notifications API) */}
      {view === 'month' && (
        <NotificationsCTA dark={dark} accent={accent}/>
      )}
    </div>
  );
}

function NotificationsCTA({ dark, accent }) {
  const text = dark ? '#F5F1E6' : '#2B2A26';
  const sub  = dark ? 'rgba(245,241,230,0.55)' : 'rgba(43,42,38,0.55)';
  const [perm, setPerm] = useState(typeof Notification !== 'undefined' ? Notification.permission : 'default');
  const enabled = perm === 'granted';

  const request = async () => {
    if (typeof Notification === 'undefined') { alert('この端末では通知に対応していません'); return; }
    const p = await Notification.requestPermission();
    setPerm(p);
    if (p === 'granted') {
      try {
        new Notification('Hibi 日々', {
          body: '通知をオンにしました。リマインダー時刻にお知らせします。',
          icon: undefined,
        });
      } catch(e) {}
    }
  };

  return (
    <div style={{ margin:'24px 16px 0', padding:'16px', borderRadius:18,
      background: dark?'rgba(122,141,63,0.14)':'rgba(122,141,63,0.08)',
      border:`0.5px solid ${accent}33`,
      display:'flex', alignItems:'center', gap:12,
    }}>
      <div style={{ width:38, height:38, borderRadius:19, background: accent, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff' }}>
        <Icon name="bell" size={18} color="#fff"/>
      </div>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:14, fontWeight:600, color:text }}>
          {enabled ? '通知はオンになっています' : 'iPhoneに通知を送る'}
        </div>
        <div style={{ fontSize:12, color:sub, marginTop:2 }}>
          {enabled ? 'リマインダー時刻にお知らせします' : '期限とリマインダーをお知らせ'}
        </div>
      </div>
      <button onClick={request} disabled={enabled} style={{
        border:'none',
        background: enabled ? (dark?'rgba(255,255,255,0.12)':'rgba(43,42,38,0.08)') : accent,
        color: enabled ? sub : '#fff',
        padding:'8px 14px', borderRadius:100,
        fontSize:13, fontWeight:600, cursor: enabled?'default':'pointer',
      }}>{enabled ? 'オン' : '許可'}</button>
    </div>
  );
}

function navBtn(dark) {
  return {
    width:32, height:32, borderRadius:16, border:'none', cursor:'pointer',
    background: dark?'rgba(255,255,255,0.08)':'rgba(43,42,38,0.06)',
    display:'flex', alignItems:'center', justifyContent:'center',
  };
}

// WEEK VIEW — 7 days × time axis
function WeekView({ date, tasks, onOpen, dark }) {
  const text = dark ? '#F5F1E6' : '#2B2A26';
  const sub  = dark ? 'rgba(245,241,230,0.55)' : 'rgba(43,42,38,0.55)';
  const grid = dark ? 'rgba(255,255,255,0.06)' : 'rgba(43,42,38,0.06)';
  const cardBg = dark ? '#24221E' : '#FFFDF7';

  // week around `date`
  const start = new Date(date); start.setDate(date.getDate() - date.getDay());
  const days = Array.from({length:7}, (_,i) => { const d=new Date(start); d.setDate(start.getDate()+i); return d; });

  const hours = Array.from({length:14}, (_,i)=>i+7); // 7-20
  const HOUR_H = 44;

  return (
    <div style={{ margin:'12px 12px 0', background: cardBg, borderRadius:18, border:`0.5px solid ${grid}`, overflow:'hidden' }}>
      {/* day headers */}
      <div style={{ display:'grid', gridTemplateColumns:'36px repeat(7,1fr)', borderBottom:`0.5px solid ${grid}` }}>
        <div/>
        {days.map((d,i) => {
          const isToday = sameDay(d, TODAY);
          return (
            <div key={i} style={{ padding:'8px 0', textAlign:'center', borderLeft:`0.5px solid ${grid}` }}>
              <div style={{ fontSize:10, color:sub, fontWeight:600 }}>{WEEK_JP[d.getDay()]}</div>
              <div style={{
                fontSize:15, fontWeight:700, color: isToday?'#fff':text, marginTop:2,
                width:24, height:24, borderRadius:12, margin:'2px auto 0', display:'flex', alignItems:'center', justifyContent:'center',
                background: isToday ? '#7A8D3F' : 'transparent',
              }}>{d.getDate()}</div>
            </div>
          );
        })}
      </div>
      {/* grid */}
      <div style={{ position:'relative', display:'grid', gridTemplateColumns:'36px repeat(7,1fr)' }}>
        <div>
          {hours.map(h => (
            <div key={h} style={{ height:HOUR_H, fontSize:10, color:sub, padding:'0 4px 0 0', textAlign:'right', lineHeight:'12px' }}>{h}:00</div>
          ))}
        </div>
        {days.map((d,di) => (
          <div key={di} style={{ position:'relative', borderLeft:`0.5px solid ${grid}` }}>
            {hours.map(h => <div key={h} style={{ height:HOUR_H, borderBottom:`0.5px solid ${grid}` }}/>)}
            {tasks.filter(t => sameDay(t.due, d) && t.due.getHours()>=7 && t.due.getHours()<21).map(t => {
              const list = LISTS.find(l=>l.id===t.list);
              const top = (t.due.getHours() - 7) * HOUR_H + (t.due.getMinutes()/60)*HOUR_H;
              const height = Math.max(22, (t.dur/60)*HOUR_H);
              return (
                <div key={t.id} onClick={()=>onOpen?.(t)} style={{
                  position:'absolute', top, left:2, right:2, height,
                  borderRadius:6,
                  background: t.evt ? list.color : 'transparent',
                  border: t.evt ? 'none' : `1.5px dashed ${list.color}`,
                  color: t.evt ? '#fff' : list.color,
                  padding:'3px 4px', fontSize:9, fontWeight:600, overflow:'hidden', lineHeight:'11px',
                  cursor:'pointer',
                }}>
                  {!t.evt && '○ '}{t.title}
                </div>
              );
            })}
            {sameDay(d, TODAY) && (
              <div style={{ position:'absolute', left:0, right:0, top: (TODAY.getHours()-7)*HOUR_H, height:1.5, background:'#B84A3B', zIndex:2 }}>
                <div style={{ position:'absolute', left:-3, top:-3, width:7, height:7, borderRadius:4, background:'#B84A3B' }}/>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// DAY VIEW — single-day timeline with events + tasks
function DayView({ date, tasks, onOpen, dark }) {
  const text = dark ? '#F5F1E6' : '#2B2A26';
  const sub  = dark ? 'rgba(245,241,230,0.55)' : 'rgba(43,42,38,0.55)';
  const grid = dark ? 'rgba(255,255,255,0.06)' : 'rgba(43,42,38,0.06)';
  const cardBg = dark ? '#24221E' : '#FFFDF7';

  const hours = Array.from({length:16}, (_,i)=>i+6); // 6-21
  const HOUR_H = 56;

  return (
    <div style={{ margin:'12px 16px 0', background: cardBg, borderRadius:18, border:`0.5px solid ${grid}`, overflow:'hidden' }}>
      <div style={{ position:'relative', display:'grid', gridTemplateColumns:'48px 1fr' }}>
        <div>
          {hours.map(h => (
            <div key={h} style={{ height:HOUR_H, fontSize:11, color:sub, padding:'0 6px 0 0', textAlign:'right', lineHeight:'14px', fontWeight:500 }}>{h}:00</div>
          ))}
        </div>
        <div style={{ position:'relative', borderLeft:`0.5px solid ${grid}` }}>
          {hours.map(h => <div key={h} style={{ height:HOUR_H, borderBottom:`0.5px solid ${grid}` }}/>)}
          {tasks.filter(t => t.due.getHours()>=6 && t.due.getHours()<22).map(t => {
            const list = LISTS.find(l=>l.id===t.list);
            const top = (t.due.getHours() - 6) * HOUR_H + (t.due.getMinutes()/60)*HOUR_H;
            const height = Math.max(32, (t.dur/60)*HOUR_H);
            return (
              <div key={t.id} onClick={()=>onOpen?.(t)} style={{
                position:'absolute', top, left:8, right:8, height,
                borderRadius:10,
                background: t.evt ? list.color : (dark?'rgba(255,255,255,0.04)':list.color+'18'),
                border: t.evt ? 'none' : `1px solid ${list.color}66`,
                color: t.evt ? '#fff' : text,
                padding:'8px 12px', fontSize:13, fontWeight:600, overflow:'hidden',
                cursor:'pointer', display:'flex', flexDirection:'column', gap:2,
              }}>
                <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                  {!t.evt && <div style={{ width:12, height:12, borderRadius:6, border:`1.5px solid ${t.evt?'#fff':list.color}` }}/>}
                  <span>{t.title}</span>
                </div>
                <div style={{ fontSize:11, fontWeight:500, opacity:0.85 }}>{fmtTime(t.due)} · {t.dur}分</div>
              </div>
            );
          })}
          {sameDay(date, TODAY) && (
            <div style={{ position:'absolute', left:0, right:0, top: (TODAY.getHours()-6)*HOUR_H, height:2, background:'#B84A3B', zIndex:3 }}>
              <div style={{ position:'absolute', left:-4, top:-4, width:10, height:10, borderRadius:5, background:'#B84A3B' }}/>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

window.CalendarScreen = CalendarScreen;
