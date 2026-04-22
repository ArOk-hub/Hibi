// Category (list) manager — add / edit / delete categories with emoji or image icon

var useState = React.useState;
var useRef = React.useRef;
var useEffect = React.useEffect;

function CategoryManager({ open, onClose, lists, setLists, tasks, setTasks, dark }) {
  const text = dark ? '#F5F1E6' : '#2B2A26';
  const sub  = dark ? 'rgba(245,241,230,0.55)' : 'rgba(43,42,38,0.55)';
  const cardBg = dark ? '#24221E' : '#FFFDF7';
  const sheetBg = dark ? '#1A1815' : '#FAF7F0';
  const stroke = dark ? 'rgba(255,255,255,0.08)' : 'rgba(43,42,38,0.08)';

  const [mode, setMode] = useState('list'); // 'list' | 'edit'
  const [editing, setEditing] = useState(null); // the list obj being edited, or null for new
  const [confirmDel, setConfirmDel] = useState(null); // id being confirmed for delete

  if (!open) return null;

  const startAdd = () => {
    setEditing({
      id: 'cat_' + Date.now(),
      name: '',
      emoji: '📌',
      image: null,
      color: LIST_COLOR_PALETTE[0],
      isNew: true,
    });
    setMode('edit');
  };
  const startEdit = (l) => {
    setEditing({ ...l, isNew: false });
    setMode('edit');
  };
  const saveEditing = () => {
    if (!editing.name.trim()) return;
    const { isNew, ...clean } = editing;
    if (isNew) {
      setLists([...lists, clean]);
    } else {
      setLists(lists.map(x => x.id === clean.id ? clean : x));
    }
    setMode('list');
    setEditing(null);
  };
  const cancelEditing = () => {
    setMode('list');
    setEditing(null);
  };
  const confirmDelete = (id) => {
    const count = tasks.filter(t => t.list === id).length;
    setConfirmDel({ id, count });
  };
  const doDelete = () => {
    const id = confirmDel.id;
    setTasks(tasks.filter(t => t.list !== id));
    setLists(lists.filter(l => l.id !== id));
    setConfirmDel(null);
  };

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:200, background:'rgba(0,0,0,0.35)',
      display:'flex', alignItems:'flex-end', justifyContent:'center',
      animation:'fade-in 200ms',
    }} onClick={onClose}>
      <div onClick={(e)=>e.stopPropagation()} style={{
        width:'100%', maxWidth:500, maxHeight:'92vh', background:sheetBg,
        borderTopLeftRadius:22, borderTopRightRadius:22, overflow:'hidden',
        display:'flex', flexDirection:'column',
        animation:'slide-up 260ms cubic-bezier(0.2,0.9,0.3,1)',
      }}>
        {/* grab handle */}
        <div style={{ display:'flex', justifyContent:'center', padding:'8px 0 0' }}>
          <div style={{ width:36, height:4, borderRadius:2, background: dark?'rgba(255,255,255,0.18)':'rgba(43,42,38,0.18)' }}/>
        </div>

        {/* Header */}
        <div style={{ padding:'10px 20px 14px', display:'flex', alignItems:'center', gap:12 }}>
          {mode === 'edit' ? (
            <button onClick={cancelEditing} style={{
              border:'none', background:'transparent', color:sub, fontSize:15, fontWeight:500, cursor:'pointer', padding:0,
            }}>キャンセル</button>
          ) : (
            <button onClick={onClose} style={{
              border:'none', background:'transparent', color:sub, fontSize:15, fontWeight:500, cursor:'pointer', padding:0,
            }}>閉じる</button>
          )}
          <div style={{ flex:1, textAlign:'center', fontSize:16, fontWeight:700, color:text }}>
            {mode === 'edit' ? (editing?.isNew ? 'カテゴリを追加' : 'カテゴリを編集') : 'カテゴリ管理'}
          </div>
          {mode === 'edit' ? (
            <button onClick={saveEditing} disabled={!editing?.name.trim()} style={{
              border:'none', background:'transparent',
              color: editing?.name.trim() ? '#3A5A8A' : sub,
              fontSize:15, fontWeight:700, cursor: editing?.name.trim() ? 'pointer' : 'default', padding:0,
            }}>保存</button>
          ) : (
            <div style={{ width:40 }}/>
          )}
        </div>

        {/* Body */}
        <div style={{ flex:1, overflowY:'auto', WebkitOverflowScrolling:'touch', padding:'0 0 40px' }}>
          {mode === 'list' && (
            <CategoryList
              lists={lists} tasks={tasks}
              onAdd={startAdd}
              onEdit={startEdit}
              onDelete={confirmDelete}
              dark={dark} cardBg={cardBg} stroke={stroke} text={text} sub={sub}
            />
          )}
          {mode === 'edit' && editing && (
            <CategoryEditor
              value={editing} onChange={setEditing}
              dark={dark} cardBg={cardBg} stroke={stroke} text={text} sub={sub}
            />
          )}
        </div>
      </div>

      {/* delete confirm */}
      {confirmDel && (
        <div onClick={()=>setConfirmDel(null)} style={{
          position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:300,
          display:'flex', alignItems:'center', justifyContent:'center', padding:24,
          animation:'fade-in 140ms',
        }}>
          <div onClick={(e)=>e.stopPropagation()} style={{
            width:'100%', maxWidth:320, background:cardBg, borderRadius:16, padding:20,
            animation:'fade-in 180ms',
          }}>
            <div style={{ fontSize:16, fontWeight:700, color:text, marginBottom:8, textAlign:'center' }}>
              カテゴリを削除
            </div>
            <div style={{ fontSize:13, color:sub, lineHeight:1.6, textAlign:'center', marginBottom:18 }}>
              {confirmDel.count > 0
                ? `このカテゴリと${confirmDel.count}件のタスクがすべて削除されます。この操作は取り消せません。`
                : `このカテゴリを削除します。`}
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={()=>setConfirmDel(null)} style={{
                flex:1, height:42, borderRadius:10, border:`0.5px solid ${stroke}`,
                background:'transparent', color:text, fontSize:14, fontWeight:600, cursor:'pointer',
              }}>キャンセル</button>
              <button onClick={doDelete} style={{
                flex:1, height:42, borderRadius:10, border:'none',
                background:'#B84A3B', color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer',
              }}>削除する</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// LIST OF CATEGORIES
function CategoryList({ lists, tasks, onAdd, onEdit, onDelete, dark, cardBg, stroke, text, sub }) {
  return (
    <div style={{ padding:'0 16px' }}>
      <div style={{ fontSize:11, color:sub, letterSpacing:2, textTransform:'uppercase', fontWeight:600, padding:'4px 8px 10px' }}>
        あなたのカテゴリ
      </div>
      <div style={{ borderRadius:14, overflow:'hidden', background:cardBg, border:`0.5px solid ${stroke}` }}>
        {lists.map((l, i) => {
          const count = tasks.filter(t => t.list === l.id).length;
          return (
            <div key={l.id} style={{
              display:'flex', alignItems:'center', gap:12, padding:'12px 14px',
              borderBottom: i<lists.length-1 ? `0.5px solid ${stroke}` : 'none',
            }}>
              <CategoryIcon l={l} size={36}/>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:15, fontWeight:600, color:text }}>{l.name}</div>
                <div style={{ fontSize:12, color:sub, marginTop:1 }}>{count}件のタスク</div>
              </div>
              <button onClick={()=>onEdit(l)} style={{
                border:'none', background: dark?'rgba(255,255,255,0.06)':'rgba(43,42,38,0.05)',
                padding:'7px 12px', borderRadius:8, fontSize:12, fontWeight:600, color:text, cursor:'pointer',
              }}>編集</button>
              <button onClick={()=>onDelete(l.id)} style={{
                border:'none', background:'transparent', padding:6, cursor:'pointer',
                display:'flex', alignItems:'center', justifyContent:'center',
              }} aria-label="削除">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M5 7h14M10 7V5a1 1 0 011-1h2a1 1 0 011 1v2M6 7l1 13a1 1 0 001 1h8a1 1 0 001-1l1-13" stroke="#B84A3B" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
          );
        })}
        {lists.length === 0 && (
          <div style={{ padding:'28px 14px', textAlign:'center', fontSize:13, color:sub }}>
            カテゴリがありません
          </div>
        )}
      </div>

      <button onClick={onAdd} style={{
        marginTop:14, width:'100%', padding:'14px 16px', borderRadius:14,
        border:`1px dashed ${dark?'rgba(245,241,230,0.25)':'rgba(43,42,38,0.22)'}`,
        background:'transparent', color:text, fontSize:14, fontWeight:600, cursor:'pointer',
        display:'flex', alignItems:'center', justifyContent:'center', gap:8,
      }}>
        <span style={{ fontSize:18, lineHeight:1 }}>+</span>
        新しいカテゴリを追加
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// CATEGORY ICON — renders either image or emoji in a rounded square
function CategoryIcon({ l, size=40 }) {
  const radius = Math.round(size * 0.28);
  if (l.image) {
    return (
      <div style={{
        width:size, height:size, borderRadius:radius, overflow:'hidden', flexShrink:0,
        background: l.color+'22',
      }}>
        <img src={l.image} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}/>
      </div>
    );
  }
  return (
    <div style={{
      width:size, height:size, borderRadius:radius, background: l.color+'22', color:l.color,
      display:'flex', alignItems:'center', justifyContent:'center', fontSize: Math.round(size*0.5),
      flexShrink:0,
    }}>{l.emoji}</div>
  );
}

// ─────────────────────────────────────────────────────────
// EDITOR — name / icon / color
function CategoryEditor({ value, onChange, dark, cardBg, stroke, text, sub }) {
  const [iconMode, setIconMode] = useState(value.image ? 'image' : 'emoji');

  const update = (patch) => onChange({ ...value, ...patch });

  return (
    <div style={{ padding:'0 16px' }}>
      {/* Preview */}
      <div style={{ display:'flex', justifyContent:'center', padding:'12px 0 18px' }}>
        <CategoryIcon l={value} size={80}/>
      </div>

      {/* Name */}
      <div style={{ fontSize:11, color:sub, letterSpacing:2, textTransform:'uppercase', fontWeight:600, padding:'0 8px 8px' }}>名前</div>
      <input
        type="text"
        value={value.name}
        onChange={(e)=>update({ name: e.target.value })}
        placeholder="例: 旅行の準備"
        style={{
          width:'100%', boxSizing:'border-box', background:cardBg, border:`0.5px solid ${stroke}`,
          borderRadius:12, padding:'12px 14px', fontSize:15, color:text, outline:'none',
          fontFamily:'inherit',
        }}
      />

      {/* Icon mode switch */}
      <div style={{ fontSize:11, color:sub, letterSpacing:2, textTransform:'uppercase', fontWeight:600, padding:'18px 8px 8px' }}>アイコン</div>
      <div style={{ display:'flex', padding:3, gap:3, background: dark?'rgba(255,255,255,0.06)':'rgba(43,42,38,0.06)', borderRadius:10, marginBottom:10 }}>
        {[['emoji','絵文字'],['image','画像']].map(([k,l])=>(
          <button key={k} onClick={()=>setIconMode(k)} style={{
            flex:1, height:32, borderRadius:8, border:'none',
            background: iconMode===k ? (dark?'#3A3631':'#fff') : 'transparent',
            fontSize:13, fontWeight:600, color: iconMode===k ? text : sub,
            boxShadow: iconMode===k ? '0 1px 3px rgba(0,0,0,0.08)' : 'none', cursor:'pointer',
          }}>{l}</button>
        ))}
      </div>

      {iconMode === 'emoji' && (
        <EmojiPicker value={value.emoji} onPick={(e)=>update({ emoji: e, image: null })} dark={dark} text={text}/>
      )}
      {iconMode === 'image' && (
        <ImagePickerCropper value={value.image} onPick={(img)=>update({ image: img })} dark={dark} cardBg={cardBg} stroke={stroke} text={text} sub={sub}/>
      )}

      {/* Color palette */}
      <div style={{ fontSize:11, color:sub, letterSpacing:2, textTransform:'uppercase', fontWeight:600, padding:'18px 8px 8px' }}>色</div>
      <div style={{ display:'flex', flexWrap:'wrap', gap:10, padding:'0 4px' }}>
        {LIST_COLOR_PALETTE.map(c => (
          <button key={c} onClick={()=>update({ color: c })} style={{
            width:36, height:36, borderRadius:18, border:'none', cursor:'pointer',
            background:c,
            boxShadow: value.color===c ? `0 0 0 3px ${dark?'#15130F':'#FAF7F0'}, 0 0 0 5px ${c}` : 'none',
            transition:'box-shadow 160ms',
          }} aria-label={c}/>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// EMOJI PICKER
function EmojiPicker({ value, onPick, dark, text }) {
  return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(8, 1fr)', gap:6 }}>
      {LIST_EMOJI_PALETTE.map(e => (
        <button key={e} onClick={()=>onPick(e)} style={{
          aspectRatio:'1', border:'none', borderRadius:10, cursor:'pointer',
          background: value===e ? (dark?'rgba(245,241,230,0.12)':'rgba(43,42,38,0.08)') : 'transparent',
          fontSize:22, display:'flex', alignItems:'center', justifyContent:'center',
        }}>{e}</button>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// IMAGE PICKER + CROPPER — 1:1 aspect, pan + zoom, outputs dataURL
function ImagePickerCropper({ value, onPick, dark, cardBg, stroke, text, sub }) {
  const fileRef = useRef(null);
  const [raw, setRaw] = useState(null); // object URL of the uploaded image before crop
  const [img, setImg] = useState(null); // HTMLImageElement once loaded

  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x:0, y:0 });

  const CROP_SIZE = 240;

  const onFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    setRaw(url);
    const im = new Image();
    im.onload = () => {
      setImg(im);
      // fit so shorter side matches CROP_SIZE
      const s = CROP_SIZE / Math.min(im.width, im.height);
      setScale(s);
      setOffset({ x:0, y:0 });
    };
    im.src = url;
  };

  // drag handling
  const dragRef = useRef(null);
  const onPointerDown = (e) => {
    e.preventDefault();
    const startX = e.clientX, startY = e.clientY;
    const o = offset;
    const move = (ev) => {
      setOffset({ x: o.x + (ev.clientX - startX), y: o.y + (ev.clientY - startY) });
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  // when scale/offset change, do nothing live — we export on "トリミングして使う"
  const doCrop = () => {
    if (!img) return;
    const canvas = document.createElement('canvas');
    canvas.width = 240; canvas.height = 240;
    const ctx = canvas.getContext('2d');
    // The preview is CROP_SIZE × CROP_SIZE, image is drawn at scale s with offset.
    // Map preview coords → canvas coords (1:1 since canvas is CROP_SIZE).
    const drawW = img.width * scale;
    const drawH = img.height * scale;
    const cx = CROP_SIZE/2 + offset.x;
    const cy = CROP_SIZE/2 + offset.y;
    ctx.fillStyle = '#fff';
    ctx.fillRect(0,0,240,240);
    ctx.drawImage(img, cx - drawW/2, cy - drawH/2, drawW, drawH);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    onPick(dataUrl);
    setRaw(null); setImg(null);
  };

  const removeImage = () => { onPick(null); setRaw(null); setImg(null); };

  return (
    <div>
      {!raw && !value && (
        <button onClick={()=>fileRef.current?.click()} style={{
          width:'100%', padding:'28px 16px', borderRadius:14,
          border:`1px dashed ${dark?'rgba(245,241,230,0.25)':'rgba(43,42,38,0.22)'}`,
          background:'transparent', color:text, fontSize:14, fontWeight:600, cursor:'pointer',
          display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:6,
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M12 5v14M5 12h14" stroke={text} strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          画像をアップロード
          <span style={{ fontSize:11, color:sub, fontWeight:500 }}>タップで選択 · 1:1 にトリミング</span>
        </button>
      )}

      {!raw && value && (
        <div style={{
          padding:16, borderRadius:14, background:cardBg, border:`0.5px solid ${stroke}`,
          display:'flex', alignItems:'center', gap:14,
        }}>
          <div style={{ width:56, height:56, borderRadius:14, overflow:'hidden', flexShrink:0 }}>
            <img src={value} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}/>
          </div>
          <div style={{ flex:1, fontSize:13, color:sub }}>現在の画像</div>
          <button onClick={()=>fileRef.current?.click()} style={{
            border:'none', background: dark?'rgba(255,255,255,0.06)':'rgba(43,42,38,0.05)',
            padding:'8px 12px', borderRadius:8, fontSize:12, fontWeight:600, color:text, cursor:'pointer',
          }}>変更</button>
          <button onClick={removeImage} style={{
            border:'none', background:'transparent', color:'#B84A3B', fontSize:12, fontWeight:600, cursor:'pointer', padding:'8px 4px',
          }}>削除</button>
        </div>
      )}

      {raw && img && (
        <div>
          <div style={{
            width:CROP_SIZE, height:CROP_SIZE, margin:'0 auto', borderRadius:16, overflow:'hidden',
            background:'#000', position:'relative', touchAction:'none', cursor:'grab',
          }} ref={dragRef} onPointerDown={onPointerDown}>
            <img src={raw} alt=""
              draggable={false}
              style={{
                position:'absolute', left:'50%', top:'50%', userSelect:'none',
                width: img.width * scale, height: img.height * scale,
                transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px))`,
                pointerEvents:'none',
              }}/>
            {/* corner markers */}
            <div style={{ position:'absolute', inset:8, border:'1px solid rgba(255,255,255,0.7)', borderRadius:12, pointerEvents:'none' }}/>
          </div>

          <div style={{ padding:'14px 8px 4px' }}>
            <div style={{ fontSize:11, color:sub, fontWeight:600, marginBottom:6 }}>拡大</div>
            <input type="range" min={0.3} max={4} step={0.01}
              value={scale}
              onChange={(e)=>setScale(parseFloat(e.target.value))}
              style={{ width:'100%' }}/>
          </div>

          <div style={{ display:'flex', gap:8, marginTop:10 }}>
            <button onClick={()=>{ setRaw(null); setImg(null); }} style={{
              flex:1, height:42, borderRadius:10, border:`0.5px solid ${stroke}`,
              background:'transparent', color:text, fontSize:14, fontWeight:600, cursor:'pointer',
            }}>やり直す</button>
            <button onClick={doCrop} style={{
              flex:1, height:42, borderRadius:10, border:'none',
              background:'#3A5A8A', color:'#fff', fontSize:14, fontWeight:700, cursor:'pointer',
            }}>この範囲で決定</button>
          </div>
        </div>
      )}

      <input ref={fileRef} type="file" accept="image/*" onChange={onFile} style={{ display:'none' }}/>
    </div>
  );
}

window.CategoryManager = CategoryManager;
window.CategoryIcon = CategoryIcon;
