// Minimal SF-Symbols-inspired icon set, drawn as SVG strokes
// Original art, not Apple's symbols.

const Icon = ({ name, size = 22, color = 'currentColor', strokeWidth = 1.7 }) => {
  const sw = strokeWidth;
  const paths = {
    today: <>
      <rect x="3.5" y="5" width="17" height="15" rx="3.5" fill="none" stroke={color} strokeWidth={sw}/>
      <path d="M3.5 9h17" stroke={color} strokeWidth={sw}/>
      <path d="M8 3.5v3M16 3.5v3" stroke={color} strokeWidth={sw} strokeLinecap="round"/>
      <circle cx="12" cy="14.5" r="2" fill={color}/>
    </>,
    calendar: <>
      <rect x="3.5" y="5" width="17" height="15" rx="3.5" fill="none" stroke={color} strokeWidth={sw}/>
      <path d="M3.5 9h17" stroke={color} strokeWidth={sw}/>
      <path d="M8 3.5v3M16 3.5v3" stroke={color} strokeWidth={sw} strokeLinecap="round"/>
    </>,
    lists: <>
      <circle cx="5" cy="7" r="1.5" fill={color}/>
      <circle cx="5" cy="12" r="1.5" fill={color}/>
      <circle cx="5" cy="17" r="1.5" fill={color}/>
      <path d="M9 7h11M9 12h11M9 17h8" stroke={color} strokeWidth={sw} strokeLinecap="round"/>
    </>,
    stats: <>
      <path d="M4 20V10M10 20V5M16 20v-7M20 20v-4" stroke={color} strokeWidth={sw+0.3} strokeLinecap="round"/>
    </>,
    plus: <>
      <path d="M12 5v14M5 12h14" stroke={color} strokeWidth={sw+0.5} strokeLinecap="round"/>
    </>,
    check: <>
      <path d="M5 12l4 4 10-10" stroke={color} strokeWidth={sw+0.5} strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </>,
    trash: <>
      <path d="M4 7h16M9 7V5a1.5 1.5 0 011.5-1.5h3A1.5 1.5 0 0115 5v2" stroke={color} strokeWidth={sw} strokeLinecap="round" fill="none"/>
      <path d="M6 7l1 12a2 2 0 002 2h6a2 2 0 002-2l1-12" stroke={color} strokeWidth={sw} strokeLinecap="round" fill="none"/>
    </>,
    flag: <>
      <path d="M5 3v18M5 4h11l-2 4 2 4H5" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/>
    </>,
    search: <>
      <circle cx="10.5" cy="10.5" r="6" fill="none" stroke={color} strokeWidth={sw}/>
      <path d="M15 15l5 5" stroke={color} strokeWidth={sw} strokeLinecap="round"/>
    </>,
    chev: <>
      <path d="M9 5l7 7-7 7" fill="none" stroke={color} strokeWidth={sw+0.3} strokeLinecap="round" strokeLinejoin="round"/>
    </>,
    chevL: <>
      <path d="M15 5l-7 7 7 7" fill="none" stroke={color} strokeWidth={sw+0.3} strokeLinecap="round" strokeLinejoin="round"/>
    </>,
    chevD: <>
      <path d="M5 9l7 7 7-7" fill="none" stroke={color} strokeWidth={sw+0.3} strokeLinecap="round" strokeLinejoin="round"/>
    </>,
    bell: <>
      <path d="M6 16V11a6 6 0 0112 0v5l1.5 2h-15L6 16z" fill="none" stroke={color} strokeWidth={sw} strokeLinejoin="round"/>
      <path d="M10 20a2 2 0 004 0" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round"/>
    </>,
    repeat: <>
      <path d="M4 12a8 8 0 0114-5l2 2M20 12a8 8 0 01-14 5l-2-2" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round"/>
      <path d="M18 3v4h-4M6 21v-4h4" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/>
    </>,
    filter: <>
      <path d="M4 6h16M7 12h10M10 18h4" stroke={color} strokeWidth={sw+0.3} strokeLinecap="round"/>
    </>,
    sparkle: <>
      <path d="M12 4v6M12 14v6M4 12h6M14 12h6" stroke={color} strokeWidth={sw} strokeLinecap="round"/>
      <path d="M7 7l3 3M14 14l3 3M17 7l-3 3M10 14l-3 3" stroke={color} strokeWidth={sw-0.3} strokeLinecap="round" opacity="0.5"/>
    </>,
    focus: <>
      <circle cx="12" cy="12" r="8" fill="none" stroke={color} strokeWidth={sw}/>
      <circle cx="12" cy="12" r="3" fill={color}/>
    </>,
    flame: <>
      <path d="M12 3c1 3 4 5 4 9a4 4 0 01-8 0c0-2 1-3 1-5 1 1 2 1 3-4z" fill={color}/>
    </>,
    gear: <>
      <circle cx="12" cy="12" r="3" fill="none" stroke={color} strokeWidth={sw}/>
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" stroke={color} strokeWidth={sw} strokeLinecap="round"/>
    </>,
    bars: <>
      <path d="M4 8h16M4 12h16M4 16h10" stroke={color} strokeWidth={sw+0.3} strokeLinecap="round"/>
    </>,
    link: <>
      <path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round"/>
      <path d="M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round"/>
    </>,
    x: <>
      <path d="M6 6l12 12M18 6L6 18" stroke={color} strokeWidth={sw+0.5} strokeLinecap="round"/>
    </>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      {paths[name]}
    </svg>
  );
};

window.Icon = Icon;
