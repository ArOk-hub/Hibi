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
        <div style={{ fontSize:12, color: sub, letterSpacing: 2, textTransform:'uppercase', fontWeight:600 }}>
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
        <div style={{ marginTop: 14, height: 6, borderRadius: 3, background: dark ? 'rgba(255,255,255,0.08)' : 'rgba(43,42,38,0.08)', overflow:'hidden' }}>
          <div style={{ width: `${pct}%`, height:'100%', background:'linear-gradient(90deg,#3A5A8A,#7A9BC4)', transition:'width 400ms' }}/>
        </div>
      </div>

      {/* Timeline */}
      {Object.entries(groups).map(([label, items]) => items.length > 0 && (
        <div key={label} style={{ marginTop: 10 }}>
          <div style={{
            padding: '10px 24px 8px',
            fontSize: 12, letterSpacing: 2, fontWeight: 600,
            color: sub, textTransform:'uppercase',
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
        <div style={{ textAlign:'center', padding:'80px 20px', color: sub }}>
          <div style={{ fontSize: 48, marginBottom: 10 }}>🍵</div>
          <div style={{ fontSize: 15, fontWeight:500, color: text }}>今日はすべて完了しました</div>
          <div style={{ fontSize: 13, marginTop: 4 }}>よい一日でしたね</div>
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
