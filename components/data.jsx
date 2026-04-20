// Sample data + helpers for Hibi
// Warm, Japanese-inspired todo app

const LISTS = [
  { id: 'work',     name: '仕事',       emoji: '💼', color: '#7A8D3F' },
  { id: 'private',  name: 'プライベート', emoji: '🍵', color: '#B84A3B' },
  { id: 'shop',     name: '買い物',     emoji: '🛒', color: '#C29B4A' },
  { id: 'health',   name: '健康',       emoji: '🌿', color: '#5E8C6A' },
  { id: 'study',    name: '学び',       emoji: '📚', color: '#6B7FA8' },
];

// Today is 2026-04-20 (Mon)
const TODAY = new Date(2026, 3, 20);

const T = (y,m,d,h=0,mi=0) => new Date(y,m,d,h,mi);

const INITIAL_TASKS = [
  { id: 't1',  title: '朝会の議事メモを送る',           list: 'work',    pri: 'high', done: true,  due: T(2026,3,20,9,30),  dur: 15 },
  { id: 't2',  title: 'Q2レビュー資料を仕上げる',       list: 'work',    pri: 'high', done: false, due: T(2026,3,20,11,0),  dur: 90, sub: [{t:'構成ドラフト',d:true},{t:'数値の差し替え',d:true},{t:'レビュー依頼',d:false}], note: '営業部の数字は田中さん待ち' },
  { id: 't3',  title: 'お昼:定食屋「七草」',             list: 'private', pri: 'low',  done: false, due: T(2026,3,20,12,30), dur: 45 },
  { id: 't4',  title: 'デザインレビュー(オンライン)',     list: 'work',    pri: 'mid',  done: false, due: T(2026,3,20,15,0),  dur: 60, evt: true },
  { id: 't5',  title: 'ヨガスタジオ 予約',                list: 'health',  pri: 'mid',  done: false, due: T(2026,3,20,18,30), dur: 60 },
  { id: 't6',  title: '牛乳・卵・バジル',                 list: 'shop',    pri: 'low',  done: false, due: T(2026,3,20,19,30), dur: 20 },
  { id: 't7',  title: '読書:「日々是好日」40pまで',       list: 'study',   pri: 'low',  done: false, due: T(2026,3,20,22,0),  dur: 30 },

  // Tomorrow & future
  { id: 't8',  title: '部門ミーティング',                list: 'work',    pri: 'mid',  done: false, due: T(2026,3,21,10,0),  dur: 60, evt: true },
  { id: 't9',  title: '歯医者の予約',                    list: 'health',  pri: 'high', done: false, due: T(2026,3,21,14,30), dur: 30, evt: true },
  { id: 't10', title: '母の誕生日プレゼント選び',         list: 'private', pri: 'high', done: false, due: T(2026,3,22,11,0),  dur: 120, flag: true },
  { id: 't11', title: '確定申告の書類確認',             list: 'work',    pri: 'mid',  done: false, due: T(2026,3,23,19,0),  dur: 45 },
  { id: 't12', title: '映画「三月のライオン」',          list: 'private', pri: 'low',  done: false, due: T(2026,3,25,19,30), dur: 120, evt: true },
  { id: 't13', title: '月末レポート提出',                list: 'work',    pri: 'high', done: false, due: T(2026,3,30,17,0),  dur: 60 },

  // Yesterday — one overdue undone, the rest done
  { id: 't14', title: '家賃の振込',                     list: 'private', pri: 'high', done: false, due: T(2026,3,19,18,0),  dur: 10, overdue: true },
  { id: 't15', title: 'ランニング 5km',                  list: 'health',  pri: 'mid',  done: true,  due: T(2026,3,19,7,0),   dur: 30 },
  { id: 't16', title: '見積書の返信',                   list: 'work',    pri: 'mid',  done: true,  due: T(2026,3,19,14,0),  dur: 20 },
];

// Streak / stats (hard-coded for demo)
const STATS = {
  streak: 12,
  weekDone: 23, weekTotal: 31,
  monthDone: 87, monthTotal: 112,
  byList: [
    { list: 'work',    done: 42 },
    { list: 'private', done: 18 },
    { list: 'shop',    done: 14 },
    { list: 'health',  done: 9 },
    { list: 'study',   done: 4 },
  ],
  // hourly productivity heatmap: 24 hours, 0–5 intensity
  heatmap: [0,0,0,0,0,0,1,3,4,5,5,3,2,4,5,4,3,2,4,3,2,1,0,0],
  // 7-day completion (Mon..Sun last week)
  week: [4,5,3,6,5,0,0],
};

// Japanese day labels
const WEEK_JP = ['日','月','火','水','木','金','土'];
const MONTH_JP = ['睦月','如月','弥生','卯月','皐月','水無月','文月','葉月','長月','神無月','霜月','師走'];

// Priority meta
const PRI = {
  high: { dot: '#B84A3B', label: '高' },
  mid:  { dot: '#C29B4A', label: '中' },
  low:  { dot: '#6B7FA8', label: '低' },
};

// Date helpers
const sameDay = (a,b) => a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate();
const fmtTime = (d) => `${d.getHours()}:${String(d.getMinutes()).padStart(2,'0')}`;
const fmtDate = (d) => `${d.getMonth()+1}月${d.getDate()}日`;
const fmtDateFull = (d) => `${d.getFullYear()}年${d.getMonth()+1}月${d.getDate()}日(${WEEK_JP[d.getDay()]})`;

Object.assign(window, {
  LISTS, TODAY, INITIAL_TASKS, STATS, WEEK_JP, MONTH_JP, PRI,
  sameDay, fmtTime, fmtDate, fmtDateFull,
});
