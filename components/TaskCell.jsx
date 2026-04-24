// Task cell with real drag-to-reveal swipe actions
// Right swipe → complete (matcha green); Left swipe → delete (朱 red) + flag (amber)

var useState = React.useState;
var useRef = React.useRef;

const ACT_COMPLETE = { color: '#3A5A8A', icon: 'check', label: '完了' };
const ACT_DELETE   = { color: '#B84A3B', icon: 'trash', label: '削除' };
const ACT_FLAG     = { color: '#C29B4A', icon: 'flag',  label: 'フラグ' };

function TaskCell({ task, onToggle, onDelete, onFlag, onOpen, dark, density='comfy' }) {
  const [dx, setDx] = useState(0);
  const [committing, setCommitting] = useState(false);
  const startX = useRef(null);
  const moved = useRef(false);
  const rowH = density === 'compact' ? 52 : density === 'roomy' ? 78 : 64;

  const list = LISTS.find(l => l.id === task.list);
  const pri = PRI[task.pri];

  // drag handlers
  const onPointerDown = (e) => {
    if (committing) return;
    startX.current = e.clientX;
    moved.current = false;
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e) => {
    if (startX.current == null) return;
    const delta = e.clientX - startX.current;
    if (Math.abs(delta) > 4) moved.current = true;
    // constrain with rubber-banding
    const clamped = Math.max(-200, Math.min(200, delta));
    setDx(clamped);
  };
  const onPointerUp = () => {
    if (startX.current == null) return;
    startX.current = null;
    // thresholds
    if (dx > 120) {
      // complete
      setCommitting(true);
      setDx(360);
      setTimeout(() => { onToggle(task.id); setDx(0); setCommitting(false); }, 200);
    } else if (dx < -140) {
      // delete
      setCommitting(true);
      setDx(-360);
      setTimeout(() => { onDelete(task.id); setDx(0); setCommitting(false); }, 200);
    } else if (dx < -60) {
      // snap to reveal actions
      setDx(-148);
    } else {
      setDx(0);
    }
  };
  const onClick = (e) => {
    if (moved.current) { e.preventDefault(); e.stopPropagation(); return; }
    if (dx !== 0) { setDx(0); return; }
    onOpen?.(task);
  };

  // colors
  const text    = dark ? '#F5F1E6' : '#2B2A26';
  const sub     = dark ? 'rgba(245,241,230,0.55)' : 'rgba(43,42,38,0.52)';
  const bg      = dark ? '#24221E' : '#FFFDF7';
  const stroke  = dark ? 'rgba(255,255,255,0.06)' : 'rgba(43,42,38,0.06)';
  const doneColor = dark ? 'rgba(245,241,230,0.35)' : 'rgba(43,42,38,0.35)';

  // checkbox fill reveal based on drag
  const checkFill = Math.max(0, Math.min(1, dx/120));

  return (
    <div style={{ position: 'relative', height: rowH, overflow: 'hidden', borderRadius: 16 }}>
      {/* complete bg (left, revealed on right swipe) */}
      <div style={{
        position: 'absolute', inset: 0,
        background: ACT_COMPLETE.color,
        display: 'flex', alignItems: 'center', justifyContent: 'flex-start',
        paddingLeft: 24, color: '#fff',
        opacity: dx > 0 ? 1 : 0,
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, transform:`scale(${0.8+checkFill*0.4})` }}>
          <Icon name="check" size={26} color="#fff" strokeWidth={2.4}/>
          <span style={{ fontSize:15, fontWeight:600, letterSpacing:0.2 }}>{task.done ? '戻す' : '完了'}</span>
        </div>
      </div>
      {/* delete+flag bg (right, revealed on left swipe) */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'stretch', justifyContent: 'flex-end',
        opacity: dx < 0 ? 1 : 0,
      }}>
        <div
          onClick={(e)=>{ e.stopPropagation(); onFlag(task.id); setDx(0); }}
          style={{ width: 74, background: ACT_FLAG.color, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', flexDirection:'column', gap:2 }}>
          <Icon name="flag" size={20} color="#fff"/>
          <span style={{ fontSize:11, fontWeight:600 }}>フラグ</span>
        </div>
        <div
          onClick={(e)=>{ e.stopPropagation(); onDelete(task.id); }}
          style={{ width: 74, background: ACT_DELETE.color, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', flexDirection:'column', gap:2 }}>
          <Icon name="trash" size={20} color="#fff"/>
          <span style={{ fontSize:11, fontWeight:600 }}>削除</span>
        </div>
      </div>

      {/* the cell */}
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClick={onClick}
        style={{
          position: 'relative',
          height: rowH,
          background: bg,
          transform: `translateX(${dx}px)`,
          transition: startX.current == null ? 'transform 260ms cubic-bezier(.2,.8,.2,1)' : 'none',
          display: 'flex', alignItems: 'center',
          padding: '0 16px', gap: 12,
          borderBottom: `0.5px solid ${stroke}`,
          touchAction: 'pan-y',
          cursor: 'grab',
        }}>
        {/* priority stripe — left edge */}
        {task.pri !== 'none' && !task.done && (
          <span aria-hidden style={{
            position:'absolute', left:0, top: 8, bottom: 8,
            width: 3, borderRadius: '0 2px 2px 0',
            background: pri.dot,
          }}/>
        )}
        {/* checkbox */}
        <div
          onClick={(e)=>{ e.stopPropagation(); onToggle(task.id); }}
          style={{
            width: 26, height: 26, borderRadius: 13,
            border: `1.7px solid ${task.done ? '#3A5A8A' : (dark ? 'rgba(245,241,230,0.35)' : 'rgba(43,42,38,0.28)')}`,
            background: task.done ? '#3A5A8A' : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, transition: 'all 220ms cubic-bezier(.2,.8,.2,1)',
            transform: `scale(${task.done ? 1 : 0.98 + checkFill*0.06})`,
          }}>
          {task.done && <Icon name="check" size={16} color="#fff" strokeWidth={2.6}/>}
        </div>

        {/* title + meta */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: density==='compact'?14.5:15.5, fontWeight: 500, color: task.done ? doneColor : text,
            textDecoration: task.done ? 'line-through' : 'none',
            letterSpacing: 0.1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>{task.title}</div>
          {density !== 'compact' && (
            <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:3, fontSize:12, color: task.overdue && !task.done ? ACT_DELETE.color : sub }}>
              {task.due && <span>{task.allDay ? '終日' : fmtTime(task.due)}</span>}
              {list && <><span style={{ opacity:0.45 }}>·</span>
                <span style={{ display:'inline-flex', alignItems:'center', gap:5 }}>
                  <span style={{ width:5, height:5, borderRadius:3, background: list.color, display:'inline-block' }}/>
                  {list.name}
                </span>
              </>}
              {task.repeat && task.repeat !== 'none' && (
                <><span style={{ opacity:0.45 }}>·</span>
                  <Icon name="repeat" size={11} color="currentColor"/>
                </>
              )}
              {task.sub && task.sub.length > 0 && <><span style={{ opacity:0.45 }}>·</span><span>{task.sub.filter(s=>s.d).length}/{task.sub.length}</span></>}
              {task.flag && <span style={{ color: ACT_FLAG.color, marginLeft:'auto' }}>⚑</span>}
            </div>
          )}
        </div>

        {/* overdue hint (priority is now the left stripe) */}
        {task.overdue && !task.done ? (
          <span style={{
            fontSize: 10, fontWeight: 600, letterSpacing: 1, color: ACT_DELETE.color,
            padding: '2px 6px', borderRadius: 4, border: `0.5px solid ${ACT_DELETE.color}55`,
            flexShrink: 0, fontFamily: 'var(--hibi-font-display)',
          }}>期限切</span>
        ) : null}
      </div>
    </div>
  );
}

window.TaskCell = TaskCell;
