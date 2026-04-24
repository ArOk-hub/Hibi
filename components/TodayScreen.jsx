// Today screen — integrated timeline of tasks + events, big date header

function TodayScreen({ tasks, onToggle, onDelete, onFlag, onOpen, dark, focus, density }) {
  const today = tasks.filter(t => sameDay(t.due, TODAY));
  const doneCount = today.filter(t => t.done).length;
  const total = today.length;
  const pct = total ? Math.round(doneCount/total*100) : 0;

  const display = focus ? today.filter(t => !t.done) : today;
  // sort by time
  display.sort((a,b) => a.due - b.due);

  const text = dark ? '#F5F1E6' : '#2B2A26';
  const sub  = dark ? 'rgba(245,241,230,0.55)' : 'rgba(43,42,38,0.55)';
  const cardBg = dark ? '#24221E' : '#FFFDF7';
  const headerBg = dark ? '#1C1A17' : '#F5F0E3';

  // Timeline grouping: morning/afternoon/evening
  const groups = {
    '朝': display.filter(t => t.due.getHours() < 12),
    '午後': display.filter(t => t.due.getHours() >= 12 && t.due.getHours() < 18),
    '夜': display.filter(t => t.due.getHours() >= 18),
  };

  return (
    <div style={{ padding: '0 0 120px' }}>
      {/* Hero header */}
      <div style={{
        padding: '8px 22px 18px',
      }}>
        <div style={{ fontSize:12, color: sub, letterSpacing: 1, fontWeight:500, fontFamily:'var(--hibi-font-display)' }}>
          {fmtDateFull(TODAY)}
        </div>
        <div style={{ display:'flex', alignItems:'baseline', gap: 10, marginTop: 6 }}>
          <div style={{ fontSize:44, fontWeight:700, color: text, letterSpacing: -1, fontFamily:'var(--hibi-font-display)' }}>
            今日
          </div>
          <div style={{ fontSize: 17, color: sub, fontWeight:500 }}>
            {doneCount}/{total} 完了
          </div>
        </div>
        {/* progress bar */}
        <div style={{ marginTop: 14, height: 4, borderRadius: 2, background: dark ? 'rgba(255,255,255,0.08)' : 'rgba(43,42,38,0.08)', overflow:'hidden' }}>
          <div style={{ width: `${pct}%`, height:'100%', background:'#3A5A8A', transition:'width 400ms cubic-bezier(.2,.8,.2,1)' }}/>
        </div>
      </div>

      {/* Timeline */}
      {Object.entries(groups).map(([label, items]) => items.length > 0 && (
        <div key={label} style={{ marginTop: 10 }}>
          <div style={{
            padding: '10px 24px 8px',
            fontSize: 12, letterSpacing: 1, fontWeight: 500,
            color: sub,
            fontFamily:'var(--hibi-font-display)',
          }}>{label}</div>
          <div style={{
            margin: '0 16px', borderRadius: 18, overflow: 'hidden',
            background: cardBg,
            border: `0.5px solid ${dark?'rgba(255,255,255,0.06)':'rgba(43,42,38,0.06)'}`,
          }}>
            {items.map((t, i) => (
              <TimelineRow key={t.id} task={t} onToggle={onToggle} onDelete={onDelete} onFlag={onFlag} onOpen={onOpen} dark={dark} last={i===items.length-1} density={density}/>
            ))}
          </div>
        </div>
      ))}

      {display.length === 0 && (
        <div style={{ textAlign:'center', padding:'72px 20px 40px', color: sub }}>
          <svg width="96" height="96" viewBox="0 0 96 96" style={{ marginBottom: 14, opacity: 0.9 }}>
            {/* Rising-sun inspired: circle + two rays, washi-soft */}
            <circle cx="48" cy="52" r="22" fill="none" stroke={dark?'rgba(245,241,230,0.28)':'rgba(184,74,59,0.45)'} strokeWidth="1.5"/>
            <circle cx="48" cy="52" r="9" fill={dark?'rgba(245,241,230,0.18)':'rgba(184,74,59,0.28)'}/>
            <path d="M14 78 L82 78" stroke={dark?'rgba(245,241,230,0.18)':'rgba(43,42,38,0.18)'} strokeWidth="1" strokeLinecap="round"/>
            <path d="M22 84 L74 84" stroke={dark?'rgba(245,241,230,0.10)':'rgba(43,42,38,0.10)'} strokeWidth="1" strokeLinecap="round"/>
            {/* tiny check floating */}
            <path d="M40 52 L46 58 L58 46" fill="none" stroke={dark?'rgba(245,241,230,0.55)':'#3A5A8A'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <div style={{ fontSize: 17, fontWeight:600, color: text, fontFamily:'var(--hibi-font-display)', letterSpacing: 1 }}>今日はもう空っぽです</div>
          <div style={{ fontSize: 13, marginTop: 6, letterSpacing: 0.5 }}>お疲れさまでした。</div>
        </div>
      )}
    </div>
  );
}

// A timeline row shows time on the left
function TimelineRow({ task, onToggle, onDelete, onFlag, onOpen, dark, last, density }) {
  const sub = dark ? 'rgba(245,241,230,0.55)' : 'rgba(43,42,38,0.55)';
  return (
    <div style={{ display:'flex', alignItems:'stretch' }}>
      <div style={{
        width: 54, padding: '14px 0 0 14px', flexShrink: 0,
        fontSize: 12, color: sub, fontVariantNumeric:'tabular-nums', fontWeight:500,
      }}>{task.allDay ? '終日' : fmtTime(task.due)}</div>
      <div style={{ flex:1, borderLeft: `0.5px solid ${dark?'rgba(255,255,255,0.08)':'rgba(43,42,38,0.08)'}` }}>
        <TaskCell task={task} onToggle={onToggle} onDelete={onDelete} onFlag={onFlag} onOpen={onOpen} dark={dark} density={density}/>
      </div>
    </div>
  );
}

window.TodayScreen = TodayScreen;
