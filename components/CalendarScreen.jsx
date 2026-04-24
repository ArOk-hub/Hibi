// Shared hook: current time, refreshed every minute
function useNow() {
  const [now, setNow] = React.useState(() => new Date());
  React.useEffect(() => {
    // align first tick to the next minute, then tick every 60s
    let timeoutId, intervalId;
    const msToNextMinute = 60000 - (Date.now() % 60000);
    timeoutId = setTimeout(() => {
      setNow(new Date());
      intervalId = setInterval(() => setNow(new Date()), 60000);
    }, msToNextMinute);
    // also refresh when the tab regains visibility (was in background)
    const onVis = () => { if (!document.hidden) setNow(new Date()); };
    document.addEventListener('visibilitychange', onVis);
    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);
  return now;
}

// Calendar screen — month overview with task-count dots, selected-day list

function CalendarScreen({ tasks, onToggle, onDelete, onFlag, onOpen, dark, density }) {
  const [month, setMonth] = useState(new Date(TODAY.getFullYear(), TODAY.getMonth(), 1));
  const [selected, setSelected] = useState(new Date(TODAY));
  const [view, setView] = useState('month'); // month | week | day

  const text = dark ? '#F5F1E6' : '#2B2A26';
  const sub  = dark ? 'rgba(245,241,230,0.55)' : 'rgba(43,42,38,0.55)';
  const cardBg = dark ? '#24221E' : '#FFFDF7';
  const dim = dark ? 'rgba(245,241,230,0.25)' : 'rgba(43,42,38,0.25)';
  const accent = (typeof getComputedStyle !== 'undefined' && getComputedStyle(document.documentElement).getPropertyValue('--hibi-accent').trim()) || '#3A5A8A';

  // Build calendar grid (6 weeks)
  const firstDow = month.getDay();
  const daysInMonth = new Date(month.getFullYear(), month.getMonth()+1, 0).getDate();
  const cells = [];
  for (let i=0; i<42; i++){
    const d = new Date(month.getFullYear(), month.getMonth(), i - firstDow + 1);
    cells.push(d);
  }

  const goPrev = () => {
    if (view === 'day') {
      const d = new Date(selected); d.setDate(selected.getDate() - 1);
      setSelected(d);
      setMonth(new Date(d.getFullYear(), d.getMonth(), 1));
    } else if (view === 'week') {
      const d = new Date(selected); d.setDate(selected.getDate() - 7);
      setSelected(d);
      setMonth(new Date(d.getFullYear(), d.getMonth(), 1));
    } else {
      setMonth(new Date(month.getFullYear(), month.getMonth()-1, 1));
    }
  };
  const goNext = () => {
    if (view === 'day') {
      const d = new Date(selected); d.setDate(selected.getDate() + 1);
      setSelected(d);
      setMonth(new Date(d.getFullYear(), d.getMonth(), 1));
    } else if (view === 'week') {
      const d = new Date(selected); d.setDate(selected.getDate() + 7);
      setSelected(d);
      setMonth(new Date(d.getFullYear(), d.getMonth(), 1));
    } else {
      setMonth(new Date(month.getFullYear(), month.getMonth()+1, 1));
    }
  };

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
        <div style={{ fontSize:12, color: sub, letterSpacing:1, fontWeight:500, fontFamily:'var(--hibi-font-display)' }}>
          {view === 'day'
            ? `${MONTH_JP[selected.getMonth()]} · ${selected.getFullYear()}`
            : `${MONTH_JP[month.getMonth()]} · ${month.getFullYear()}`}
        </div>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:4 }}>
          <div style={{ fontSize:36, fontWeight:700, color:text, letterSpacing:-0.8, fontFamily:'var(--hibi-font-display)' }}>
            {view === 'day'
              ? `${selected.getMonth()+1}/${selected.getDate()}(${WEEK_JP[selected.getDay()]})`
              : view === 'week'
                ? (() => {
                    const s = new Date(selected); s.setDate(selected.getDate() - selected.getDay());
                    const e = new Date(s); e.setDate(s.getDate() + 6);
                    return `${s.getMonth()+1}/${s.getDate()}–${e.getMonth()+1}/${e.getDate()}`;
                  })()
                : `${month.getMonth()+1}月`}
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
                  background: isSel ? (dark?'rgba(58,90,138,0.22)':'rgba(58,90,138,0.10)') : 'transparent',
                }}>
                  <div style={{
                    width:28, height:28, display:'flex', alignItems:'center', justifyContent:'center',
                    color: color,
                    fontSize: 15, fontWeight: isToday?700:500, fontVariantNumeric:'tabular-nums',
                    position:'relative',
                  }}>
                    {d.getDate()}
                    {isToday && <span aria-hidden style={{
                      position:'absolute', bottom:-1, left:'50%', transform:'translateX(-50%)',
                      width:18, height:2, borderRadius:1, background:'#B84A3B',
                    }}/>}
                  </div>
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
                    {t.allDay ? '終日' : fmtTime(t.due)}
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
  const supported = typeof Notification !== 'undefined';
  const [perm, setPerm] = useState(supported ? Notification.permission : 'default');
  const enabled = perm === 'granted';

  // Detect standalone (iOS: notifications require Home-Screen-installed PWA on 16.4+)
  const isStandalone = (typeof window !== 'undefined') && (
    window.matchMedia?.('(display-mode: standalone)')?.matches ||
    window.navigator?.standalone === true
  );
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

  const request = async () => {
    if (!supported) { alert('この端末では通知に対応していません'); return; }
    const p = await Notification.requestPermission();
    setPerm(p);
    if (p === 'granted') sendTest();
  };
  const sendTest = async () => {
    try {
      const reg = navigator.serviceWorker && await navigator.serviceWorker.getRegistration();
      if (reg?.showNotification) {
        await reg.showNotification('Hibi 日々', {
          body: 'テスト通知です。リマインダー時刻にお知らせします。',
          icon: './icon-192.png', badge: './icon-192.png',
          tag: 'hibi-test', renotify: true,
        });
      } else {
        new Notification('Hibi 日々', { body: 'テスト通知です。' });
      }
    } catch(e) {
      alert('通知送信に失敗しました: ' + e.message);
    }
  };

  const needsInstall = isIOS && !isStandalone;

  return (
    <div style={{ margin:'24px 16px 0', padding:'16px', borderRadius:18,
      background: dark?'rgba(58,90,138,0.16)':'rgba(58,90,138,0.08)',
      border:`0.5px solid ${accent}33`,
      display:'flex', flexDirection:'column', gap:12,
    }}>
      <div style={{ display:'flex', alignItems:'center', gap:12 }}>
        <div style={{ width:38, height:38, borderRadius:19, background: accent, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff' }}>
          <Icon name="bell" size={18} color="#fff"/>
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:14, fontWeight:600, color:text }}>
            {enabled ? '通知はオンになっています' : 'iPhoneに通知を送る'}
          </div>
          <div style={{ fontSize:12, color:sub, marginTop:2 }}>
            {enabled
              ? 'リマインダー時刻にお知らせします'
              : (needsInstall
                ? 'ホーム画面に追加してから許可してください'
                : '期限とリマインダーをお知らせ')}
          </div>
        </div>
        <button onClick={enabled ? sendTest : request} disabled={!supported || (needsInstall && !enabled)} style={{
          border:'none',
          background: (!supported || (needsInstall && !enabled))
            ? (dark?'rgba(255,255,255,0.12)':'rgba(43,42,38,0.08)')
            : accent,
          color: (!supported || (needsInstall && !enabled)) ? sub : '#fff',
          padding:'8px 14px', borderRadius:100,
          fontSize:13, fontWeight:600,
          cursor: (!supported || (needsInstall && !enabled)) ? 'default' : 'pointer',
          whiteSpace:'nowrap',
        }}>{!supported ? '非対応' : (enabled ? 'テスト送信' : '許可')}</button>
      </div>
      {/* iOS install hint */}
      {needsInstall && (
        <div style={{
          fontSize:11, color:sub, lineHeight:'16px',
          padding:'8px 10px', borderRadius:8,
          background: dark?'rgba(255,255,255,0.04)':'rgba(43,42,38,0.04)',
        }}>
          iOS では通知を使うには、Safari の共有メニューから「ホーム画面に追加」してアプリとして起動する必要があります。
        </div>
      )}
      {/* Foreground-only caveat */}
      {enabled && (
        <div style={{
          fontSize:11, color:sub, lineHeight:'16px',
          padding:'8px 10px', borderRadius:8,
          background: dark?'rgba(255,255,255,0.04)':'rgba(43,42,38,0.04)',
        }}>
          ※ アプリが閉じている間は通知されない場合があります（ホーム画面に追加して起動しておくと届きやすくなります）。
        </div>
      )}
      {perm === 'denied' && (
        <div style={{
          fontSize:11, color:'#B84A3B', lineHeight:'16px',
          padding:'8px 10px', borderRadius:8,
          background: dark?'rgba(184,74,59,0.12)':'rgba(184,74,59,0.08)',
        }}>
          通知が拒否されています。設定 → Safari / このアプリ → 通知 を確認してください。
        </div>
      )}
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

// WEEK VIEW — 7 days × time axis (+ all-day band under headers)
function WeekView({ date, tasks, onOpen, dark }) {
  const now = useNow();
  const weekScrollRef = React.useRef(null);
  const text = dark ? '#F5F1E6' : '#2B2A26';
  const sub  = dark ? 'rgba(245,241,230,0.55)' : 'rgba(43,42,38,0.55)';
  const grid = dark ? 'rgba(255,255,255,0.06)' : 'rgba(43,42,38,0.06)';
  const cardBg = dark ? '#24221E' : '#FFFDF7';

  // week around `date`
  const start = new Date(date); start.setDate(date.getDate() - date.getDay());
  const days = Array.from({length:7}, (_,i) => { const d=new Date(start); d.setDate(start.getDate()+i); return d; });

  const hours = Array.from({length:24}, (_,i)=>i); // 0-23
  const HOUR_H = 44;

  // Split into all-day vs timed
  const allDayByDay = days.map(d => tasks.filter(t => t.allDay && sameDay(t.due, d)));
  const hasAnyAllDay = allDayByDay.some(a => a.length > 0);
  const ALLDAY_ROW_H = 20;
  const maxAllDay = Math.max(1, ...allDayByDay.map(a => a.length));
  const allDayBandH = hasAnyAllDay ? (maxAllDay * (ALLDAY_ROW_H + 2) + 6) : 0;

  React.useEffect(() => {
    if (!weekScrollRef.current) return;
    const inWeek = days.some(d => sameDay(d, now));
    const targetHour = inWeek ? Math.max(0, now.getHours() - 1) : 7;
    weekScrollRef.current.scrollTop = targetHour * HOUR_H;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date.getTime()]);

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
                fontSize:15, fontWeight:700, color:text, marginTop:2,
                width:28, height:24, margin:'2px auto 0', display:'flex', alignItems:'center', justifyContent:'center',
                position:'relative',
              }}>
                {d.getDate()}
                {isToday && <span aria-hidden style={{
                  position:'absolute', bottom:0, left:'50%', transform:'translateX(-50%)',
                  width:18, height:2, borderRadius:1, background:'#B84A3B',
                }}/>}
              </div>
            </div>
          );
        })}
      </div>

      {/* all-day band — right below date headers */}
      {hasAnyAllDay && (
        <div style={{
          display:'grid', gridTemplateColumns:'36px repeat(7,1fr)',
          borderBottom:`0.5px solid ${grid}`,
          background: dark?'rgba(255,255,255,0.02)':'rgba(43,42,38,0.02)',
        }}>
          <div style={{ fontSize:9, color:sub, fontWeight:600, padding:'6px 4px 0 0', textAlign:'right', letterSpacing:0.5 }}>終日</div>
          {days.map((d, di) => (
            <div key={di} style={{
              borderLeft:`0.5px solid ${grid}`,
              padding:'3px 2px', display:'flex', flexDirection:'column', gap:2,
              minHeight: allDayBandH,
            }}>
              {allDayByDay[di].map(t => {
                const list = LISTS.find(l=>l.id===t.list);
                return (
                  <div key={t.id} onClick={()=>onOpen?.(t)} style={{
                    background: list.color, color:'#fff',
                    borderRadius:4, padding:'2px 4px',
                    fontSize:9, fontWeight:600, lineHeight:'12px',
                    overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
                    cursor:'pointer', height: ALLDAY_ROW_H,
                    display:'flex', alignItems:'center',
                  }}>
                    {t.title}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {/* grid */}
      <div ref={weekScrollRef} style={{ maxHeight: 'calc(100vh - 320px)', overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
      <div style={{ position:'relative', display:'grid', gridTemplateColumns:'36px repeat(7,1fr)' }}>
        <div>
          {hours.map(h => (
            <div key={h} style={{ height:HOUR_H, fontSize:10, color:sub, padding:'0 4px 0 0', textAlign:'right', lineHeight:'12px' }}>{h}:00</div>
          ))}
        </div>
        {days.map((d,di) => (
          <div key={di} style={{ position:'relative', borderLeft:`0.5px solid ${grid}` }}>
            {hours.map(h => <div key={h} style={{ height:HOUR_H, borderBottom:`0.5px solid ${grid}` }}/>)}
            {tasks.filter(t => !t.allDay && sameDay(t.due, d)).map(t => {
              const list = LISTS.find(l=>l.id===t.list);
              const top = t.due.getHours() * HOUR_H + (t.due.getMinutes()/60)*HOUR_H;
              const durMin = t.end ? (t.end - t.due)/60000 : (t.dur || 30);
              const height = Math.max(22, (durMin/60)*HOUR_H);
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
                  {!t.evt && '○ '}{t.title}{t.repeat && t.repeat!=='none' ? ' ↻' : ''}
                </div>
              );
            })}
            {sameDay(d, now) && (() => {
              const mins = now.getHours()*60 + now.getMinutes();
              const top = (mins / 60) * HOUR_H;
              return (
                <div style={{ position:'absolute', left:0, right:0, top, height:1.5, background:'#B84A3B', zIndex:2 }}>
                  <div style={{ position:'absolute', left:-3, top:-3, width:7, height:7, borderRadius:4, background:'#B84A3B' }}/>
                </div>
              );
            })()}
          </div>
        ))}
      </div>
      </div>
    </div>
  );
}

// DAY VIEW — single-day timeline with all-day band + timed events
function DayView({ date, tasks, onOpen, dark }) {
  const now = useNow();
  const scrollRef = React.useRef(null);
  const text = dark ? '#F5F1E6' : '#2B2A26';
  const sub  = dark ? 'rgba(245,241,230,0.55)' : 'rgba(43,42,38,0.55)';
  const grid = dark ? 'rgba(255,255,255,0.06)' : 'rgba(43,42,38,0.06)';
  const cardBg = dark ? '#24221E' : '#FFFDF7';

  const hours = Array.from({length:24}, (_,i)=>i); // 0-23
  const HOUR_H = 56;

  const allDayTasks = tasks.filter(t => t.allDay);
  const timedTasks = tasks.filter(t => !t.allDay);

  // On mount (and when the selected date changes), scroll to a sensible hour:
  // current hour if viewing today, else 7am.
  React.useEffect(() => {
    if (!scrollRef.current) return;
    const targetHour = sameDay(date, now) ? Math.max(0, now.getHours() - 1) : 7;
    scrollRef.current.scrollTop = targetHour * HOUR_H;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date.getTime()]);

  return (
    <div style={{ margin:'12px 16px 0', background: cardBg, borderRadius:18, border:`0.5px solid ${grid}`, overflow:'hidden' }}>
      {/* All-day band — sits above the 0:00 timeline row */}
      {allDayTasks.length > 0 && (
        <div style={{
          display:'grid', gridTemplateColumns:'48px 1fr',
          borderBottom:`0.5px solid ${grid}`,
          background: dark?'rgba(255,255,255,0.02)':'rgba(43,42,38,0.02)',
        }}>
          <div style={{ fontSize:10, color:sub, fontWeight:700, padding:'10px 6px 0 0', textAlign:'right', letterSpacing:1 }}>終日</div>
          <div style={{ borderLeft:`0.5px solid ${grid}`, padding:'8px 8px', display:'flex', flexDirection:'column', gap:4 }}>
            {allDayTasks.map(t => {
              const list = LISTS.find(l=>l.id===t.list);
              return (
                <div key={t.id} onClick={()=>onOpen?.(t)} style={{
                  background: list.color, color:'#fff',
                  borderRadius:8, padding:'6px 10px',
                  fontSize:12, fontWeight:600, cursor:'pointer',
                  display:'flex', alignItems:'center', gap:6,
                }}>
                  <Icon name="calendar" size={11} color="#fff"/>
                  <span style={{ flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {t.title}{t.repeat && t.repeat!=='none' ? ' ↻' : ''}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div ref={scrollRef} style={{ maxHeight: 'calc(100vh - 280px)', overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}>
      <div style={{ position:'relative', display:'grid', gridTemplateColumns:'48px 1fr' }}>
        <div>
          {hours.map(h => (
            <div key={h} style={{ height:HOUR_H, fontSize:11, color:sub, padding:'0 6px 0 0', textAlign:'right', lineHeight:'14px', fontWeight:500 }}>{h}:00</div>
          ))}
        </div>
        <div style={{ position:'relative', borderLeft:`0.5px solid ${grid}` }}>
          {hours.map(h => <div key={h} style={{ height:HOUR_H, borderBottom:`0.5px solid ${grid}` }}/>)}
          {timedTasks.map(t => {
            const list = LISTS.find(l=>l.id===t.list);
            const top = t.due.getHours() * HOUR_H + (t.due.getMinutes()/60)*HOUR_H;
            const durMin = t.end ? (t.end - t.due)/60000 : (t.dur || 30);
            const height = Math.max(32, (durMin/60)*HOUR_H);
            const endLabel = t.end ? fmtTime(t.end) : null;
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
                  <span>{t.title}{t.repeat && t.repeat!=='none' ? ' ↻' : ''}</span>
                </div>
                <div style={{ fontSize:11, fontWeight:500, opacity:0.85 }}>
                  {fmtTime(t.due)}{endLabel ? `–${endLabel}` : ''} · {Math.round(durMin)}分
                </div>
              </div>
            );
          })}
          {sameDay(date, now) && (() => {
            const mins = now.getHours()*60 + now.getMinutes();
            const top = (mins / 60) * HOUR_H;
            return (
              <div style={{ position:'absolute', left:0, right:0, top, height:2, background:'#B84A3B', zIndex:3, transition:'top 400ms ease-out' }}>
                <div style={{ position:'absolute', left:-4, top:-4, width:10, height:10, borderRadius:5, background:'#B84A3B' }}/>
                <div style={{ position:'absolute', right:6, top:-18, fontSize:10, fontWeight:700, color:'#B84A3B', fontVariantNumeric:'tabular-nums' }}>
                  {String(now.getHours()).padStart(2,'0')}:{String(now.getMinutes()).padStart(2,'0')}
                </div>
              </div>
            );
          })()}
        </div>
      </div>
      </div>
    </div>
  );
}

window.CalendarScreen = CalendarScreen;
