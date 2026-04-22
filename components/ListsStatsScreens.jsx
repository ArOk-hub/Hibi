// Lists & Stats screens

function ListsScreen({ tasks, onOpen, onToggle, onDelete, onFlag, dark, density, onOpenCategoryManager }) {
  const text = dark ? '#F5F1E6' : '#2B2A26';
  const sub  = dark ? 'rgba(245,241,230,0.55)' : 'rgba(43,42,38,0.55)';
  const cardBg = dark ? '#24221E' : '#FFFDF7';
  const [filter, setFilter] = useState('all');
  const [openList, setOpenList] = useState(null); // list id when drilled in

  const filters = [
    { id:'all',       label:'すべて', count: tasks.length },
    { id:'today',     label:'今日',   count: tasks.filter(t=>sameDay(t.due,TODAY)).length },
    { id:'sched',     label:'予定',   count: tasks.filter(t=>t.due>TODAY && !t.done).length },
    { id:'flag',      label:'フラグ', count: tasks.filter(t=>t.flag).length },
    { id:'done',      label:'完了',   count: tasks.filter(t=>t.done).length },
  ];

  // Drill-in view: show filtered tasks for selected category
  if (openList) {
    const l = LISTS.find(x => x.id === openList);
    const listTasks = tasks.filter(t => t.list === openList).sort((a,b) => a.due - b.due);
    const open = listTasks.filter(t => !t.done);
    const done = listTasks.filter(t => t.done);
    const stroke = dark?'rgba(255,255,255,0.06)':'rgba(43,42,38,0.06)';
    if (!l) { setTimeout(()=>setOpenList(null), 0); return null; }
    return (
      <div style={{ padding:'0 0 120px', animation:'fade-in 220ms' }}>
        <div style={{ padding:'8px 16px 18px', display:'flex', alignItems:'center', gap:10 }}>
          <button onClick={()=>setOpenList(null)} style={{
            border:'none', background: dark?'rgba(255,255,255,0.08)':'rgba(43,42,38,0.06)',
            width:34, height:34, borderRadius:17, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer',
          }}>
            <Icon name="chevL" size={18} color={text}/>
          </button>
          <CategoryIcon l={l} size={36}/>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:12, color:sub, letterSpacing:2, textTransform:'uppercase', fontWeight:600 }}>カテゴリ</div>
            <div style={{ display:'flex', alignItems:'baseline', gap:8, marginTop:2 }}>
              <div style={{ fontSize:28, fontWeight:700, color:text, letterSpacing:-0.8, fontFamily:'var(--hibi-font-display)' }}>
                {l.name}
              </div>
              <div style={{ fontSize:14, color:sub, fontWeight:500 }}>{open.length}件</div>
            </div>
          </div>
          <div style={{ width:10, height:10, borderRadius:5, background: l.color }}/>
        </div>

        {open.length > 0 && (
          <div style={{ margin:'0 16px', borderRadius:18, overflow:'hidden', background: cardBg, border:`0.5px solid ${stroke}` }}>
            {open.map(t => (
              <TaskCell key={t.id} task={t} onToggle={onToggle} onDelete={onDelete} onFlag={onFlag} onOpen={onOpen} dark={dark} density={density}/>
            ))}
          </div>
        )}

        {done.length > 0 && (
          <>
            <div style={{ padding:'18px 24px 8px', fontSize:12, color:sub, letterSpacing:2, textTransform:'uppercase', fontWeight:600 }}>
              完了済み · {done.length}
            </div>
            <div style={{ margin:'0 16px', borderRadius:18, overflow:'hidden', background: cardBg, border:`0.5px solid ${stroke}` }}>
              {done.map(t => (
                <TaskCell key={t.id} task={t} onToggle={onToggle} onDelete={onDelete} onFlag={onFlag} onOpen={onOpen} dark={dark} density={density}/>
              ))}
            </div>
          </>
        )}

        {listTasks.length === 0 && (
          <div style={{ margin:'0 16px', padding:'40px 20px', background:cardBg, borderRadius:18, textAlign:'center', color:sub, fontSize:13 }}>
            このカテゴリのタスクはありません
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ padding: '0 0 120px' }}>
      <div style={{ padding:'8px 22px 18px' }}>
        <div style={{ fontSize:12, color: sub, letterSpacing: 2, textTransform:'uppercase', fontWeight:600 }}>
          マイリスト
        </div>
        <div style={{ fontSize:44, fontWeight:700, color:text, letterSpacing:-1, marginTop:4, fontFamily:'var(--hibi-font-display)' }}>
          リスト
        </div>
      </div>

      {/* Smart filters grid */}
      <div style={{ padding:'0 16px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
        {filters.slice(0,4).map(f => {
          const ic = { all:'bars', today:'today', sched:'calendar', flag:'flag' }[f.id];
          const c = { all:'#6B7FA8', today:'#3A5A8A', sched:'#B84A3B', flag:'#C29B4A' }[f.id];
          return (
            <div key={f.id} onClick={()=>setFilter(f.id)} style={{
              background: cardBg, borderRadius: 14, padding: '12px 14px',
              border: `0.5px solid ${filter===f.id ? c : (dark?'rgba(255,255,255,0.06)':'rgba(43,42,38,0.06)')}`,
              cursor:'pointer',
            }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div style={{ width:32, height:32, borderRadius:16, background:c, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Icon name={ic} size={18} color="#fff"/>
                </div>
                <div style={{ fontSize:26, fontWeight:700, color:text, fontVariantNumeric:'tabular-nums' }}>{f.count}</div>
              </div>
              <div style={{ fontSize:14, color:sub, marginTop:6, fontWeight:500 }}>{f.label}</div>
            </div>
          );
        })}
      </div>

      {/* My Lists */}
      <div style={{ marginTop:20 }}>
        <div style={{ padding:'0 24px 8px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ fontSize:12, color:sub, letterSpacing:2, textTransform:'uppercase', fontWeight:600 }}>
            カテゴリ
          </div>
          <button onClick={onOpenCategoryManager} style={{
            border:'none', background:'transparent', color:'#3A5A8A',
            fontSize:13, fontWeight:700, cursor:'pointer', padding:'2px 6px',
          }}>編集</button>
        </div>
        <div style={{ margin:'0 16px', borderRadius:18, overflow:'hidden', background:cardBg,
          border:`0.5px solid ${dark?'rgba(255,255,255,0.06)':'rgba(43,42,38,0.06)'}` }}>
          {LISTS.map((l,i) => {
            const count = tasks.filter(t => t.list===l.id && !t.done).length;
            return (
              <div key={l.id} onClick={()=>setOpenList(l.id)} style={{
                display:'flex', alignItems:'center', gap:12, padding:'14px 16px', cursor:'pointer',
                borderBottom: i<LISTS.length-1 ? `0.5px solid ${dark?'rgba(255,255,255,0.06)':'rgba(43,42,38,0.06)'}` : 'none',
              }}>
                <CategoryIcon l={l} size={32}/>
                <div style={{ flex:1, fontSize:15, fontWeight:500, color:text }}>{l.name}</div>
                <div style={{ fontSize:14, color:sub, fontVariantNumeric:'tabular-nums' }}>{count}</div>
                <Icon name="chev" size={14} color={sub}/>
              </div>
            );
          })}
          {LISTS.length === 0 && (
            <div style={{ padding:'28px 14px', textAlign:'center', fontSize:13, color:sub }}>
              「編集」からカテゴリを追加
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatsScreen({ tasks, dark }) {
  const text = dark ? '#F5F1E6' : '#2B2A26';
  const sub  = dark ? 'rgba(245,241,230,0.55)' : 'rgba(43,42,38,0.55)';
  const cardBg = dark ? '#24221E' : '#FFFDF7';
  const accent = '#3A5A8A';
  const stroke = dark?'rgba(255,255,255,0.06)':'rgba(43,42,38,0.06)';

  const weekPct = Math.round(STATS.weekDone/STATS.weekTotal*100);
  const monthPct = Math.round(STATS.monthDone/STATS.monthTotal*100);

  return (
    <div style={{ padding:'0 0 120px' }}>
      <div style={{ padding:'8px 22px 18px' }}>
        <div style={{ fontSize:12, color:sub, letterSpacing:2, textTransform:'uppercase', fontWeight:600 }}>
          あなたの4月
        </div>
        <div style={{ fontSize:44, fontWeight:700, color:text, letterSpacing:-1, marginTop:4, fontFamily:'var(--hibi-font-display)' }}>
          統計
        </div>
      </div>

      {/* Streak hero */}
      <div style={{ margin:'0 16px', padding:'20px', borderRadius:22, background: `linear-gradient(135deg, ${accent}, #7A9BC4)`, color:'#fff', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', right:-10, top:-10, fontSize:120, opacity:0.15 }}>🔥</div>
        <div style={{ fontSize:12, fontWeight:600, letterSpacing:2, textTransform:'uppercase', opacity:0.85 }}>連続達成</div>
        <div style={{ display:'flex', alignItems:'baseline', gap:6, marginTop:6 }}>
          <div style={{ fontSize:56, fontWeight:800, letterSpacing:-2, fontFamily:'var(--hibi-font-display)' }}>{STATS.streak}</div>
          <div style={{ fontSize:18, fontWeight:600 }}>日</div>
        </div>
        <div style={{ fontSize:13, opacity:0.88, marginTop:4 }}>毎日の積み重ねが、日々をつくる。</div>
      </div>

      {/* Completion rings */}
      <div style={{ margin:'14px 16px 0', display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
        <RingCard label="今週" pct={weekPct} num={STATS.weekDone} total={STATS.weekTotal} color={accent} dark={dark}/>
        <RingCard label="今月" pct={monthPct} num={STATS.monthDone} total={STATS.monthTotal} color="#B84A3B" dark={dark}/>
      </div>

      {/* Weekly bars */}
      <div style={{ margin:'14px 16px 0', padding:'18px', borderRadius:22, background:cardBg, border:`0.5px solid ${stroke}` }}>
        <div style={{ fontSize:13, fontWeight:600, color:sub, letterSpacing:1, textTransform:'uppercase' }}>先週の完了</div>
        <div style={{ display:'flex', alignItems:'flex-end', gap:6, height:80, marginTop:14 }}>
          {STATS.week.map((v,i) => {
            const max = Math.max(...STATS.week, 1);
            const h = (v/max)*68;
            const isWeekend = i===5 || i===6;
            return (
              <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
                <div style={{ width:'100%', height:h, borderRadius:6, background: isWeekend ? '#6B7FA8' : accent, opacity: v===0 ? 0.2 : 1, transition:'all 300ms' }}/>
                <div style={{ fontSize:11, color: isWeekend?(i===6?'#B84A3B':'#6B7FA8'):sub, fontWeight:600 }}>{WEEK_JP[(i+1)%7]}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* By category */}
      <div style={{ margin:'14px 16px 0', padding:'18px', borderRadius:22, background:cardBg, border:`0.5px solid ${stroke}` }}>
        <div style={{ fontSize:13, fontWeight:600, color:sub, letterSpacing:1, textTransform:'uppercase', marginBottom:12 }}>カテゴリ別</div>
        {STATS.byList.map(row => {
          const l = LISTS.find(x=>x.id===row.list);
          const max = Math.max(...STATS.byList.map(r=>r.done));
          return (
            <div key={row.list} style={{ marginBottom: 10 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:13 }}>
                <span style={{ color:text, fontWeight:500 }}>{l.emoji} {l.name}</span>
                <span style={{ color:sub, fontVariantNumeric:'tabular-nums' }}>{row.done}</span>
              </div>
              <div style={{ height:6, borderRadius:3, background: dark?'rgba(255,255,255,0.06)':'rgba(43,42,38,0.06)', marginTop:4, overflow:'hidden' }}>
                <div style={{ width: `${(row.done/max)*100}%`, height:'100%', background: l.color, transition:'width 400ms' }}/>
              </div>
            </div>
          );
        })}
      </div>

      {/* Heatmap */}
      <div style={{ margin:'14px 16px 0', padding:'18px', borderRadius:22, background:cardBg, border:`0.5px solid ${stroke}` }}>
        <div style={{ fontSize:13, fontWeight:600, color:sub, letterSpacing:1, textTransform:'uppercase' }}>時間帯別の生産性</div>
        <div style={{ fontSize:11, color:sub, marginTop:2 }}>集中しやすい時間が見えます</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(24,1fr)', gap:2, marginTop:14 }}>
          {STATS.heatmap.map((v,i) => (
            <div key={i} style={{
              aspectRatio:'1', borderRadius:3,
              background: v===0 ? (dark?'rgba(255,255,255,0.05)':'rgba(43,42,38,0.05)') : `rgba(122,141,63,${0.2 + v*0.16})`,
            }}/>
          ))}
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, color:sub, marginTop:4 }}>
          <span>0</span><span>6</span><span>12</span><span>18</span><span>24</span>
        </div>
      </div>
    </div>
  );
}

function RingCard({ label, pct, num, total, color, dark }) {
  const text = dark ? '#F5F1E6' : '#2B2A26';
  const sub  = dark ? 'rgba(245,241,230,0.55)' : 'rgba(43,42,38,0.55)';
  const cardBg = dark ? '#24221E' : '#FFFDF7';
  const stroke = dark?'rgba(255,255,255,0.06)':'rgba(43,42,38,0.06)';
  const circ = 2*Math.PI*30;
  const offset = circ * (1 - pct/100);
  return (
    <div style={{ padding:'16px', borderRadius:22, background:cardBg, border:`0.5px solid ${stroke}`, display:'flex', alignItems:'center', gap:12 }}>
      <div style={{ position:'relative', width:72, height:72 }}>
        <svg width="72" height="72" viewBox="0 0 72 72">
          <circle cx="36" cy="36" r="30" fill="none" stroke={dark?'rgba(255,255,255,0.08)':'rgba(43,42,38,0.08)'} strokeWidth="6"/>
          <circle cx="36" cy="36" r="30" fill="none" stroke={color} strokeWidth="6"
            strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" transform="rotate(-90 36 36)"
            style={{ transition:'stroke-dashoffset 600ms' }}/>
        </svg>
        <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:17, fontWeight:700, color:text, fontVariantNumeric:'tabular-nums' }}>{pct}%</div>
      </div>
      <div>
        <div style={{ fontSize:12, color:sub, fontWeight:600, letterSpacing:1, textTransform:'uppercase' }}>{label}</div>
        <div style={{ fontSize:17, fontWeight:700, color:text, marginTop:2 }}>{num}/{total}</div>
        <div style={{ fontSize:11, color:sub }}>タスク完了</div>
      </div>
    </div>
  );
}

window.ListsScreen = ListsScreen;
window.StatsScreen = StatsScreen;
