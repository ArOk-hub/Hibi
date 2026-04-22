// Sample data + helpers for Hibi
// Warm, Japanese-inspired todo app

// Default categories (can be customized by user, persisted to localStorage)
const DEFAULT_LISTS = [
  { id: 'work',     name: '仕事',       emoji: '💼', color: '#3A5A8A' },
  { id: 'private',  name: 'プライベート', emoji: '🍵', color: '#B84A3B' },
  { id: 'shop',     name: '買い物',     emoji: '🛒', color: '#C29B4A' },
  { id: 'health',   name: '健康',       emoji: '🌿', color: '#5E8C6A' },
  { id: 'study',    name: '学び',       emoji: '📚', color: '#6B7FA8' },
];
// `LISTS` is the live array — App mutates window.LISTS when user edits categories.
let LISTS = DEFAULT_LISTS;

// Palette of colors available when creating/editing a category
const LIST_COLOR_PALETTE = [
  '#3A5A8A', '#B84A3B', '#C29B4A', '#5E8C6A',
  '#6B7FA8', '#8F6A9B', '#3A3631', '#C97B5E',
];
// Emoji suggestions for category icons
const LIST_EMOJI_PALETTE = [
  '💼','🍵','🛒','🌿','📚','🏠','👪','💪',
  '🎨','✈️','🔧','🍽️','⚽','🎮','🎵','🌸',
  '☕','📖','✍️','💰','📦','🐶','🐱','⭐',
];

// Today = actual current date (midnight local time)
const TODAY = (() => { const d = new Date(); d.setHours(0,0,0,0); return d; })();

const T = (y,m,d,h=0,mi=0) => new Date(y,m,d,h,mi);

const INITIAL_TASKS = [];

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
  LISTS, DEFAULT_LISTS, LIST_COLOR_PALETTE, LIST_EMOJI_PALETTE,
  TODAY, INITIAL_TASKS, STATS, WEEK_JP, MONTH_JP, PRI,
  sameDay, fmtTime, fmtDate, fmtDateFull,
});
