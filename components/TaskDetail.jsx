// Task detail sheet — shown when tapping a task cell
function TaskDetail({ task, onClose, onToggle, onEdit, onDelete, dark }) {
  if (!task) return null;
  const textC = dark ? '#F5F1E6' : '#2B2A26';
  const sub  = dark ? 'rgba(245,241,230,0.55)' : 'rgba(43,42,38,0.55)';
  const bg = dark ? '#1C1A17' : '#FAF7F0';
  const cardBg = dark ? '#24221E' : '#FFFDF7';
  const stroke = dark?'rgba(255,255,255,0.06)':'rgba(43,42,38,0.06)';
  const list = LISTS.find(l=>l.id===task.list);
  const pri = PRI[task.pri];
  const subs = task.sub || [];
  const subDone = subs.filter(s=>s.d).length;

  return (
    <div onClick={onClose} style={{ position:'absolute', inset:0, zIndex:100, background:'rgba(0,0,0,0.35)', display:'flex', alignItems:'flex-end', animation:'fade-in 180ms' }}>
      <div onClick={e=>e.stopPropagation()} style={{
        background:bg, width:'100%', maxHeight:'80%',
        borderRadius:'26px 26px 0 0', padding:'12px 0 28px', overflowY:'auto',
        animation:'slide-up 260ms cubic-bezier(.2,.8,.2,1)',
      }}>
        <div style={{ width:40, height:5, borderRadius:3, background: dark?'rgba(255,255,255,0.2)':'rgba(43,42,38,0.2)', margin:'0 auto 16px' }}/>
        <div style={{ padding:'0 20px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
            <div onClick={()=>onToggle(task.id)} style={{
              width:30, height:30, borderRadius:15,
              border:`2px solid ${task.done?'#3A5A8A':sub}`, background: task.done?'#3A5A8A':'transparent',
              display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer',
            }}>
              {task.done && <Icon name="check" size={18} color="#fff" strokeWidth={2.6}/>}
            </div>
            <div style={{ fontSize:22, fontWeight:700, color:textC, lineHeight:'28px', flex:1 }}>{task.title}</div>
          </div>

          <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:14 }}>
            <Chip label={
              task.allDay
                ? `${fmtDate(task.due)} · 終日`
                : `${fmtDate(task.due)} ${fmtTime(task.due)}${task.end ? `–${fmtTime(task.end)}` : ''}`
            } c="#B84A3B"/>
            <Chip label={`優先度 ${pri.label}`} c={pri.dot}/>
            {task.repeat && task.repeat !== 'none' && (
              <Chip label={`↻ ${repeatBadgeLabel(task.repeat, task.repeatDays)}`} c="#6B7FA8"/>
            )}
            {list.image ? (
              <div style={{
                display:'inline-flex', alignItems:'center', gap:6,
                padding:'4px 10px 4px 4px', borderRadius:100, fontSize:12, fontWeight:600,
                background: list.color+'1A', color: list.color, border:`0.5px solid ${list.color}33`,
              }}>
                <span style={{ width:18, height:18, borderRadius:6, overflow:'hidden' }}>
                  <img src={list.image} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}/>
                </span>
                {list.name}
              </div>
            ) : (
              <Chip label={`${list.emoji} ${list.name}`} c={list.color}/>
            )}
            {task.evt && <Chip label="カレンダー予定" c="#6B7FA8"/>}
            {task.overdue && !task.done && <Chip label="期限切れ" c="#B84A3B"/>}
          </div>

          {subs.length > 0 && (
            <div style={{ background:cardBg, borderRadius:16, padding:'14px 16px', border:`0.5px solid ${stroke}`, marginBottom:10 }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:sub, fontWeight:600, textTransform:'uppercase', letterSpacing:1, marginBottom:10 }}>
                <span>サブタスク</span><span>{subDone}/{subs.length}</span>
              </div>
              <div style={{ height:4, borderRadius:2, background: dark?'rgba(255,255,255,0.06)':'rgba(43,42,38,0.06)', overflow:'hidden', marginBottom:12 }}>
                <div style={{ width: `${(subDone/subs.length)*100}%`, height:'100%', background:'#3A5A8A' }}/>
              </div>
              {subs.map((s,i)=>(
                <div key={i} style={{ display:'flex', alignItems:'center', gap:10, padding:'6px 0' }}>
                  <div style={{
                    width:20, height:20, borderRadius:10,
                    border:`1.5px solid ${s.d?'#3A5A8A':sub}`, background:s.d?'#3A5A8A':'transparent',
                    display:'flex', alignItems:'center', justifyContent:'center',
                  }}>
                    {s.d && <Icon name="check" size={12} color="#fff" strokeWidth={2.6}/>}
                  </div>
                  <div style={{ fontSize:14, color: s.d?sub:textC, textDecoration: s.d?'line-through':'none' }}>{s.t}</div>
                </div>
              ))}
            </div>
          )}

          {task.note && (
            <div style={{ background:cardBg, borderRadius:16, padding:'14px 16px', border:`0.5px solid ${stroke}`, marginBottom:10 }}>
              <div style={{ fontSize:12, color:sub, fontWeight:600, textTransform:'uppercase', letterSpacing:1, marginBottom:6 }}>メモ</div>
              <div style={{ fontSize:14, color:textC, lineHeight:'20px' }}>{task.note}</div>
            </div>
          )}

          <div style={{ display:'flex', gap:8, marginTop:14 }}>
            <button onClick={()=>onToggle(task.id)} style={{
              flex:1, padding:'12px', borderRadius:14, border:'none',
              background:'#3A5A8A', color:'#fff', fontSize:15, fontWeight:600, cursor:'pointer',
            }}>{task.done?'未完了に戻す':'完了にする'}</button>
            {onEdit && (
              <button onClick={()=>onEdit(task)} style={{
                padding:'12px 18px', borderRadius:14, border:'none',
                background: dark?'rgba(255,255,255,0.08)':'rgba(43,42,38,0.06)',
                color:textC, fontSize:15, fontWeight:600, cursor:'pointer',
                display:'flex', alignItems:'center', gap:6,
              }}>
                <Icon name="pencil" size={14} color={textC}/>
                編集
              </button>
            )}
            {onDelete && (
              <button onClick={()=>{ if(confirm('このタスクを削除しますか?')) { onDelete(task.id); onClose(); } }} style={{
                padding:'12px 14px', borderRadius:14, border:'none',
                background: dark?'rgba(184,74,59,0.14)':'rgba(184,74,59,0.08)',
                color:'#B84A3B', fontSize:15, fontWeight:600, cursor:'pointer',
                display:'flex', alignItems:'center',
              }}>
                <Icon name="trash" size={14} color="#B84A3B"/>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

window.TaskDetail = TaskDetail;
