import React from 'react';
import { Agent } from '../types';
import { Gem, Laptop, Sparkles, Compass } from 'lucide-react';

interface AgentRoomSceneProps {
  agent: Agent;
  zoomScale?: number;
  isWorking?: boolean;
  className?: string;
  onViewIn3D?: () => void;
  show3DButton?: boolean;
}

// Room metadata and specialized themes per agent
interface RoomTheme {
  roomName: string;
  floorText: string;
  floorColor: string;
  floorPatternColor: string;
  wallColor: string;
  accentWallColor: string;
  deskColor: string;
  chairColor: string;
  windowSkyline: 'city' | 'garden' | 'night' | 'quantum';
  specialItemLabel: string;
}

const ROOM_THEMES: Record<string, RoomTheme> = {
  agent_alex: {
    roomName: 'Executive CEO Suite',
    floorText: 'Lantai 2 (Mezzanine Executive)',
    floorColor: '#3F2E1E',
    floorPatternColor: '#2C1F14',
    wallColor: '#1E293B',
    accentWallColor: '#0F172A',
    deskColor: '#451A03',
    chairColor: '#1E3A8A',
    windowSkyline: 'city',
    specialItemLabel: 'Rak Buku Mahoni & Plakat Kepemimpinan'
  },
  agent_maya: {
    roomName: 'Quantum AI & Intelligence Lab',
    floorText: 'Lantai 2 (AI Research Mezzanine)',
    floorColor: '#0F172A',
    floorPatternColor: '#1E293B',
    wallColor: '#0B1329',
    accentWallColor: '#10B981',
    deskColor: '#334155',
    chairColor: '#047857',
    windowSkyline: 'quantum',
    specialItemLabel: 'Chamber Quantum Core & Display Hologram'
  },
  agent_david: {
    roomName: 'Tech & Engineering Hub',
    floorText: 'Lantai 1 (Workstation Barat)',
    floorColor: '#78350F',
    floorPatternColor: '#5C2809',
    wallColor: '#18181B',
    accentWallColor: '#4F46E5',
    deskColor: '#1E293B',
    chairColor: '#4338CA',
    windowSkyline: 'garden',
    specialItemLabel: 'Dual Curved Display & Server Rack RGB'
  },
  agent_elena: {
    roomName: 'UI/UX & Creative Media Studio',
    floorText: 'Lantai 1 (Workstation Timur)',
    floorColor: '#92400E',
    floorPatternColor: '#713208',
    wallColor: '#2D1B36',
    accentWallColor: '#DB2777',
    deskColor: '#3F2E1E',
    chairColor: '#BE185D',
    windowSkyline: 'garden',
    specialItemLabel: 'Pen Tablet, Moodboard Desain & Lampu Estetik'
  },
  agent_kenji: {
    roomName: 'QA & Compliance Inspection Hub',
    floorText: 'Lantai 1 (Workstation Barat)',
    floorColor: '#44403C',
    floorPatternColor: '#292524',
    wallColor: '#1C1917',
    accentWallColor: '#10B981',
    deskColor: '#292524',
    chairColor: '#059669',
    windowSkyline: 'garden',
    specialItemLabel: 'Security Wall Monitor & Checklist Grade A+'
  },
  agent_sarah: {
    roomName: 'Growth & Viral Marketing Wing',
    floorText: 'Lantai 1 (Workstation Timur)',
    floorColor: '#854D0E',
    floorPatternColor: '#653B08',
    wallColor: '#261517',
    accentWallColor: '#DC2626',
    deskColor: '#334155',
    chairColor: '#B91C1C',
    windowSkyline: 'garden',
    specialItemLabel: 'Funnel Analytics Board & Megaphone Brand'
  },
  agent_marcus: {
    roomName: 'Finance, ROI & Investment Wing',
    floorText: 'Lantai 1 (Workstation Timur)',
    floorColor: '#525252',
    floorPatternColor: '#383838',
    wallColor: '#181C20',
    accentWallColor: '#D97706',
    deskColor: '#1E293B',
    chairColor: '#B45309',
    windowSkyline: 'garden',
    specialItemLabel: 'Ticker Tape Finansial & Kalkulator Cashflow'
  },
  agent_liam: {
    roomName: 'Cloud Infrastructure & DevOps Center',
    floorText: 'Lantai 1 (Workstation Barat)',
    floorColor: '#334155',
    floorPatternColor: '#1E293B',
    wallColor: '#090D16',
    accentWallColor: '#0891B2',
    deskColor: '#0F172A',
    chairColor: '#0E7490',
    windowSkyline: 'garden',
    specialItemLabel: 'Terminal CI/CD & Firewall Network Switch'
  },
  agent_nadia: {
    roomName: 'Product Strategy & PRD Pod',
    floorText: 'Lantai 1 (Workstation Timur)',
    floorColor: '#78350F',
    floorPatternColor: '#5C2809',
    wallColor: '#231B15',
    accentWallColor: '#CA8A04',
    deskColor: '#334155',
    chairColor: '#A16207',
    windowSkyline: 'garden',
    specialItemLabel: 'Kanban Sticky Notes Board & User Journey Map'
  },
  agent_priya: {
    roomName: 'Legal, NDA & Governance Office',
    floorText: 'Lantai 1 (Workstation Barat)',
    floorColor: '#4A3222',
    floorPatternColor: '#332114',
    wallColor: '#181926',
    accentWallColor: '#6366F1',
    deskColor: '#2E1E13',
    chairColor: '#4F46E5',
    windowSkyline: 'garden',
    specialItemLabel: 'Lemari Kitab Regulasi UU PDP & Timbangan Hukum'
  }
};

export const AgentRoomScene: React.FC<AgentRoomSceneProps> = ({
  agent,
  zoomScale = 1.0,
  isWorking = true,
  className = '',
  onViewIn3D,
  show3DButton = true
}) => {
  const theme: RoomTheme = ROOM_THEMES[agent.id] || {
    roomName: `${agent.role} Hub`,
    floorText: 'Lantai 1 (Kantor Virtual)',
    floorColor: '#573D26',
    floorPatternColor: '#3D2A1A',
    wallColor: '#1E293B',
    accentWallColor: agent.color,
    deskColor: '#334155',
    chairColor: agent.color,
    windowSkyline: 'garden',
    specialItemLabel: 'Workstation Komputer & Kursi Ergonomis'
  };

  const activeWorking = isWorking || agent.status === 'working';

  return (
    <div className={`relative w-full rounded-2xl overflow-hidden border border-slate-700/80 bg-slate-950 shadow-2xl select-none ${className}`}>
      
      {/* Top Overlay Badge with Room Identity */}
      <div className="absolute top-2.5 left-2.5 right-2.5 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-950/85 backdrop-blur-md border border-slate-700/80 text-[11px] text-white shadow-lg">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-extrabold text-white">{theme.roomName}</span>
          <span className="text-slate-400 font-normal hidden sm:inline">• {theme.floorText}</span>
        </div>

        {show3DButton && onViewIn3D && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onViewIn3D();
            }}
            className="pointer-events-auto flex items-center gap-1 px-2.5 py-1 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-[10px] font-bold shadow-md shadow-blue-500/30 transition-all cursor-pointer"
            title="Arahkan kamera 3D gedung langsung ke ruangan dan meja kerja agen ini"
          >
            <Compass className="h-3 w-3" />
            <span>🎥 Sorot di Gedung 3D</span>
          </button>
        )}
      </div>

      {/* Responsive Viewport that scales with zoomScale */}
      <div className="w-full h-56 sm:h-64 md:h-72 flex items-center justify-center overflow-hidden relative bg-slate-950">
        
        {/* The Scalable Virtual Office Room SVG Arena */}
        <div 
          className="w-full h-full flex items-center justify-center transition-transform duration-300 origin-center"
          style={{ transform: `scale(${zoomScale})` }}
        >
          <svg
            viewBox="0 0 400 240"
            className="w-full h-full max-w-[480px] filter drop-shadow-xl overflow-visible"
          >
            <defs>
              {/* Floor Parquet Linear Gradient */}
              <linearGradient id={`floor-grad-${agent.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={theme.floorColor} />
                <stop offset="100%" stopColor={theme.floorPatternColor} />
              </linearGradient>

              {/* Room Back Wall Gradient */}
              <linearGradient id={`wall-grad-${agent.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={theme.wallColor} />
                <stop offset="100%" stopColor="#0B0F19" />
              </linearGradient>

              {/* Accent Side Wall Gradient */}
              <linearGradient id={`side-wall-${agent.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={theme.accentWallColor} stopOpacity="0.85" />
                <stop offset="100%" stopColor="#0F172A" stopOpacity="0.95" />
              </linearGradient>

              {/* Window Outside Atmosphere */}
              <linearGradient id={`sky-grad-${agent.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                {theme.windowSkyline === 'city' ? (
                  <>
                    <stop offset="0%" stopColor="#38BDF8" />
                    <stop offset="60%" stopColor="#818CF8" />
                    <stop offset="100%" stopColor="#F472B6" />
                  </>
                ) : theme.windowSkyline === 'quantum' ? (
                  <>
                    <stop offset="0%" stopColor="#065F46" />
                    <stop offset="50%" stopColor="#047857" />
                    <stop offset="100%" stopColor="#064E3B" />
                  </>
                ) : (
                  <>
                    <stop offset="0%" stopColor="#60A5FA" />
                    <stop offset="60%" stopColor="#93C5FD" />
                    <stop offset="100%" stopColor="#34D399" />
                  </>
                )}
              </linearGradient>

              {/* Monitor Display Glow */}
              <linearGradient id={`screen-grad-${agent.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#0F172A" />
                <stop offset="100%" stopColor="#020617" />
              </linearGradient>

              {/* Desk Wood Texture Gradient */}
              <linearGradient id={`desk-top-${agent.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={theme.deskColor} />
                <stop offset="100%" stopColor="#0F172A" />
              </linearGradient>
            </defs>

            {/* ======================================================== */}
            {/* 1. ARCHITECTURE: BACK WALL & CORNER PERSPECTIVE */}
            {/* ======================================================== */}
            
            {/* Back Wall (Main) */}
            <polygon points="0,0 400,0 400,140 0,140" fill={`url(#wall-grad-${agent.id})`} />

            {/* Left Wall Strip (Isometric Depth) */}
            <polygon points="0,0 60,0 60,140 0,140" fill="#090D16" opacity="0.6" />
            <line x1="60" y1="0" x2="60" y2="140" stroke="#334155" strokeWidth="1.5" />

            {/* Baseboard along bottom of wall */}
            <rect x="0" y="136" width="400" height="4" fill="#334155" />
            <line x1="0" y1="136" x2="400" y2="136" stroke="#475569" strokeWidth="1" />

            {/* Ceiling Cove Light Strip */}
            <line x1="0" y1="2" x2="400" y2="2" stroke={theme.accentWallColor} strokeWidth="2.5" opacity="0.8" />

            {/* ======================================================== */}
            {/* 2. OFFICE WINDOW (SHOWS SKYLINE OR GARDEN OUTSIDE) */}
            {/* ======================================================== */}
            <g transform="translate(240, 20)">
              {/* Window Frame */}
              <rect x="0" y="0" width="130" height="90" rx="4" fill="#0F172A" stroke="#475569" strokeWidth="3" />
              
              {/* Window Glass Pane */}
              <rect x="3" y="3" width="124" height="84" rx="2" fill={`url(#sky-grad-${agent.id})`} />
              
              {/* Window Outside Silhouette Details */}
              {theme.windowSkyline === 'city' ? (
                // City Skyscrapers
                <g fill="#1E293B" opacity="0.55">
                  <rect x="10" y="35" width="20" height="52" />
                  <rect x="34" y="20" width="28" height="67" />
                  <rect x="66" y="40" width="22" height="47" />
                  <rect x="92" y="28" width="24" height="59" />
                  {/* Building Windows twinkle */}
                  <rect x="40" y="30" width="3" height="4" fill="#FEF08A" opacity="0.8" />
                  <rect x="48" y="30" width="3" height="4" fill="#FEF08A" opacity="0.8" />
                  <rect x="40" y="42" width="3" height="4" fill="#FEF08A" opacity="0.8" />
                </g>
              ) : theme.windowSkyline === 'quantum' ? (
                // Quantum Lab Matrix Lines
                <g stroke="#34D399" opacity="0.4" strokeWidth="1">
                  <circle cx="62" cy="45" r="28" fill="none" strokeDasharray="3,3" />
                  <circle cx="62" cy="45" r="14" fill="none" />
                  <line x1="10" y1="45" x2="114" y2="45" />
                  <line x1="62" y1="10" x2="62" y2="80" />
                </g>
              ) : (
                // Outdoor Green Garden Trees & Cloud
                <g>
                  {/* Soft clouds */}
                  <ellipse cx="40" cy="22" rx="16" ry="7" fill="#FFFFFF" opacity="0.6" />
                  <ellipse cx="90" cy="26" rx="20" ry="8" fill="#FFFFFF" opacity="0.6" />
                  {/* Garden Trees */}
                  <circle cx="25" cy="70" r="18" fill="#059669" />
                  <circle cx="55" cy="65" r="22" fill="#10B981" />
                  <circle cx="95" cy="68" r="20" fill="#047857" />
                  <rect x="0" y="75" width="124" height="12" fill="#065F46" />
                </g>
              )}

              {/* Window Glass Mullions (Dividers) */}
              <line x1="65" y1="3" x2="65" y2="87" stroke="#1E293B" strokeWidth="2.5" />
              <line x1="3" y1="45" x2="127" y2="45" stroke="#1E293B" strokeWidth="2.5" />
              {/* Window reflection glare diagonal */}
              <line x1="10" y1="10" x2="50" y2="80" stroke="#FFFFFF" strokeWidth="2" opacity="0.25" strokeLinecap="round" />
            </g>

            {/* ======================================================== */}
            {/* 3. WALL DECORATIONS (LOGO, ART, OR DIPLOMA) */}
            {/* ======================================================== */}
            <g transform="translate(80, 24)">
              {/* Office Wall Certificate / Framed Dashboard */}
              <rect x="0" y="0" width="70" height="45" rx="3" fill="#1E293B" stroke="#64748B" strokeWidth="2" />
              <rect x="3" y="3" width="64" height="39" rx="1" fill="#0F172A" />
              {/* Decorative mini chart / certificate content */}
              <rect x="8" y="10" width="22" height="4" fill={agent.color} rx="1" />
              <line x1="8" y1="20" x2="55" y2="20" stroke="#475569" strokeWidth="2" />
              <line x1="8" y1="26" x2="45" y2="26" stroke="#475569" strokeWidth="2" />
              <line x1="8" y1="32" x2="50" y2="32" stroke="#475569" strokeWidth="2" />
              <circle cx="52" cy="12" r="4" fill="#F59E0B" />
            </g>

            {/* Office Wall Acoustic Slat Panels */}
            <g opacity="0.35" stroke="#000000" strokeWidth="1.2">
              {[165, 175, 185, 195, 205, 215].map((sx) => (
                <line key={sx} x1={sx} y1="20" x2={sx} y2="136" stroke="#475569" strokeWidth="2" />
              ))}
            </g>

            {/* ======================================================== */}
            {/* 4. ROOM FLOOR TILES / PARQUET PLANKS */}
            {/* ======================================================== */}
            <polygon points="0,140 400,140 400,240 0,240" fill={`url(#floor-grad-${agent.id})`} />

            {/* Parquet Planks Texture Lines */}
            <g stroke="#000000" opacity="0.3" strokeWidth="1">
              <line x1="0" y1="160" x2="400" y2="160" />
              <line x1="0" y1="185" x2="400" y2="185" />
              <line x1="0" y1="210" x2="400" y2="210" />
              {/* Planks seams */}
              <line x1="60" y1="140" x2="60" y2="160" />
              <line x1="180" y1="140" x2="180" y2="160" />
              <line x1="310" y1="140" x2="310" y2="160" />
              <line x1="120" y1="160" x2="120" y2="185" />
              <line x1="250" y1="160" x2="250" y2="185" />
              <line x1="380" y1="160" x2="380" y2="185" />
              <line x1="70" y1="185" x2="70" y2="210" />
              <line x1="200" y1="185" x2="200" y2="210" />
              <line x1="330" y1="185" x2="330" y2="210" />
            </g>

            {/* Cozy Office Rug under desk */}
            <ellipse cx="200" cy="205" rx="140" ry="24" fill="#0F172A" opacity="0.65" />
            <ellipse cx="200" cy="205" rx="135" ry="21" fill={agent.color} opacity="0.18" />

            {/* ======================================================== */}
            {/* 5. BACKGROUND ROOM FURNITURE (SHELVES, SERVER, PLANT) */}
            {/* ======================================================== */}
            
            {/* Left Corner Tall Bookshelf or Server Rack */}
            <g transform="translate(15, 60)">
              {/* Cabinet Body */}
              <rect x="0" y="0" width="46" height="95" rx="2" fill="#0F172A" stroke="#334155" strokeWidth="2" />
              {/* Shelves */}
              <line x1="0" y1="25" x2="46" y2="25" stroke="#334155" strokeWidth="2" />
              <line x1="0" y1="50" x2="46" y2="50" stroke="#334155" strokeWidth="2" />
              <line x1="0" y1="72" x2="46" y2="72" stroke="#334155" strokeWidth="2" />
              
              {/* Books on shelf 1 */}
              <rect x="6" y="8" width="5" height="17" fill="#2563EB" />
              <rect x="12" y="5" width="7" height="20" fill="#EF4444" />
              <rect x="20" y="9" width="6" height="16" fill="#F59E0B" />
              <rect x="27" y="6" width="8" height="19" fill="#10B981" />
              <rect x="36" y="11" width="5" height="14" fill="#8B5CF6" />

              {/* Shelf 2: Server blinking LEDs or Tech manuals */}
              <rect x="6" y="32" width="34" height="12" rx="2" fill="#1E293B" />
              <circle cx="12" cy="38" r="1.5" fill="#38BDF8">
                <animate attributeName="opacity" values="1;0.2;1" dur="1.2s" repeatCount="indefinite" />
              </circle>
              <circle cx="18" cy="38" r="1.5" fill="#34D399">
                <animate attributeName="opacity" values="0.3;1;0.3" dur="0.8s" repeatCount="indefinite" />
              </circle>
              <circle cx="24" cy="38" r="1.5" fill="#FBBF24">
                <animate attributeName="opacity" values="1;0.4;1" dur="1.5s" repeatCount="indefinite" />
              </circle>

              {/* Shelf 3: Storage boxes or trophies */}
              <rect x="6" y="55" width="16" height="14" rx="2" fill="#475569" />
              <rect x="24" y="55" width="16" height="14" rx="2" fill="#475569" />
            </g>

            {/* Right Corner: Fiddle Leaf Fig Plant in Ceramic Pot */}
            <g transform="translate(355, 120)">
              {/* White Ceramic Pot */}
              <polygon points="0,20 28,20 23,55 5,55" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />
              <ellipse cx="14" cy="20" rx="14" ry="4" fill="#64748B" />
              {/* Plant Stems & Lush Leaves */}
              <path d="M14 20 Q12 0 6 -15" stroke="#15803D" strokeWidth="3" fill="none" />
              <path d="M14 15 Q22 0 28 -12" stroke="#15803D" strokeWidth="3" fill="none" />
              <path d="M14 8 Q14 -10 16 -28" stroke="#15803D" strokeWidth="3" fill="none" />
              {/* Big Broad Leaves */}
              <ellipse cx="4" cy="-18" rx="10" ry="6" fill="#16A34A" transform="rotate(-25 4 -18)" />
              <ellipse cx="30" cy="-15" rx="11" ry="7" fill="#22C55E" transform="rotate(30 30 -15)" />
              <ellipse cx="16" cy="-30" rx="12" ry="7" fill="#15803D" transform="rotate(5 16 -30)" />
              <ellipse cx="14" cy="-5" rx="9" ry="5" fill="#16A34A" transform="rotate(-40 14 -5)" />
            </g>

            {/* ======================================================== */}
            {/* 6. ERGONOMIC EXECUTIVE OFFICE CHAIR (BEHIND AGENT) */}
            {/* ======================================================== */}
            <g transform="translate(180, 105)">
              {/* Chair High Backrest */}
              <rect x="0" y="0" width="40" height="55" rx="8" fill={theme.chairColor} stroke="#0F172A" strokeWidth="2.5" />
              {/* Headrest Cushion */}
              <rect x="5" y="-14" width="30" height="15" rx="5" fill="#0F172A" stroke={theme.chairColor} strokeWidth="1.5" />
              {/* Mesh Texture Lines */}
              <line x1="8" y1="12" x2="32" y2="12" stroke="#0F172A" strokeWidth="2" opacity="0.5" />
              <line x1="8" y1="24" x2="32" y2="24" stroke="#0F172A" strokeWidth="2" opacity="0.5" />
              <line x1="8" y1="36" x2="32" y2="36" stroke="#0F172A" strokeWidth="2" opacity="0.5" />
            </g>

            {/* ======================================================== */}
            {/* 7. AGENT SITTING & TYPING AT WORKSTATION */}
            {/* ======================================================== */}
            <g transform="translate(168, 70)">
              {/* Plumbob Sims Crystal Floating & Glowing above Head */}
              <g transform="translate(32, -8)">
                <polygon points="0,-16 6,-8 0,0 -6,-8" fill="#10B981" stroke="#34D399" strokeWidth="1">
                  <animate attributeName="transform" type="translate" values="0,-8;0,-12;0,-8" dur="2s" repeatCount="indefinite" />
                </polygon>
                <polygon points="0,-16 6,-8 0,0" fill="#34D399" opacity="0.75" />
                {/* Plumbob Glow Sparkle */}
                <circle cx="0" cy="-8" r="8" fill="#10B981" opacity="0.25">
                  <animate attributeName="r" values="6;10;6" dur="2s" repeatCount="indefinite" />
                </circle>
              </g>

              {/* Agent Head, Torso & Accessories */}
              <g>
                {/* Head Ambient Glow */}
                <circle cx="32" cy="28" r="22" fill={agent.color} opacity="0.25" />

                {/* Torso & Suit */}
                <path d="M18 56 L22 38 L42 38 L46 56 Z" fill={agent.color} stroke="#0F172A" strokeWidth="1.5" />
                {/* Shirt Collar */}
                <polygon points="28,38 32,46 36,38" fill="#FFFFFF" />
                {/* Neck */}
                <rect x="29" y="32" width="6" height="7" rx="2" fill="#FBBF24" />
                {/* Head */}
                <ellipse cx="32" cy="25" rx="11" ry="12" fill="#FBBF24" />

                {/* Animated Eyes (Blinks Naturally) */}
                <ellipse cx="28" cy="25" rx="1.6" ry="1.6" fill="#1E293B">
                  <animate attributeName="ry" values="1.6;1.6;0.1;1.6" keyTimes="0;0.9;0.95;1" dur="3.5s" repeatCount="indefinite" />
                </ellipse>
                <ellipse cx="36" cy="25" rx="1.6" ry="1.6" fill="#1E293B">
                  <animate attributeName="ry" values="1.6;1.6;0.1;1.6" keyTimes="0;0.9;0.95;1" dur="3.5s" repeatCount="indefinite" />
                </ellipse>
                {/* Smile */}
                <path d="M29 30 Q32 32.5 35 30" fill="none" stroke="#B45309" strokeWidth="1.2" strokeLinecap="round" />

                {/* Signature Hair & Gear per Agent */}
                {agent.avatar3d === 'engineer' ? (
                  // David Kim: Spiky hair & violet tech headset
                  <g>
                    <path d="M20 22 C18 12, 26 8, 32 8 C38 8, 44 12, 44 22 Z" fill="#0F172A" />
                    <path d="M24 8 L27 4 L30 7 L33 3 L37 8" stroke="#0F172A" strokeWidth="2.2" strokeLinecap="round" />
                    {/* Headset band & earcup */}
                    <path d="M21 23 C21 12, 43 12, 43 23" fill="none" stroke="#8B5CF6" strokeWidth="2.4" />
                    <rect x="18" y="21" width="3.5" height="7" rx="1.5" fill="#A78BFA" />
                    <rect x="42.5" y="21" width="3.5" height="7" rx="1.5" fill="#A78BFA" />
                    <circle cx="19.5" cy="24.5" r="1" fill="#38BDF8">
                      <animate attributeName="opacity" values="1;0.2;1" dur="1s" repeatCount="indefinite" />
                    </circle>
                    <path d="M20 27 L24 30 L28 30" fill="none" stroke="#8B5CF6" strokeWidth="1.4" strokeLinecap="round" />
                  </g>
                ) : agent.avatar3d === 'lead' ? (
                  // Alex Morgan: Executive hair & glasses
                  <g>
                    <path d="M21 23 C18 10, 44 6, 43 23 Z" fill="#1E293B" />
                    <rect x="24" y="23" width="6.5" height="4.5" rx="1" fill="none" stroke="#38BDF8" strokeWidth="1.4" />
                    <rect x="33.5" y="23" width="6.5" height="4.5" rx="1" fill="none" stroke="#38BDF8" strokeWidth="1.4" />
                    <line x1="30.5" y1="25" x2="33.5" y2="25" stroke="#38BDF8" strokeWidth="1.4" />
                  </g>
                ) : agent.avatar3d === 'researcher' ? (
                  // Dr. Maya Chen: Ponytail & green specs
                  <g>
                    <ellipse cx="32" cy="17" rx="12" ry="8" fill="#3B1C32" />
                    <path d="M20 23 C18 9, 44 9, 44 23 Z" fill="#3B1C32" />
                    <circle cx="27" cy="25" r="3.4" fill="none" stroke="#10B981" strokeWidth="1.4" />
                    <circle cx="37" cy="25" r="3.4" fill="none" stroke="#10B981" strokeWidth="1.4" />
                    <line x1="30.4" y1="25" x2="33.6" y2="25" stroke="#10B981" strokeWidth="1.4" />
                  </g>
                ) : (
                  // Standard stylized hair
                  <path d="M20 23 C19 12, 45 12, 44 23 Z" fill="#1E293B" />
                )}
              </g>

              {/* Animated Floating Thought Sparkles while Working */}
              {activeWorking && (
                <g>
                  <text x="5" y="10" fontSize="11" fill="#FBBF24" className="animate-bounce">⚡</text>
                  <text x="48" y="8" fontSize="11" fill="#60A5FA">💡</text>
                  <text x="28" y="-12" fontSize="9" fill="#34D399">✨</text>
                </g>
              )}
            </g>

            {/* ======================================================== */}
            {/* 8. WORKSTATION DESK WITH DUAL MONITORS & ACCESSORIES */}
            {/* ======================================================== */}
            
            {/* Desk Surface (Wide Curved Isometric Desk) */}
            <g transform="translate(85, 125)">
              {/* Desk Legs / Metal Base Frame */}
              <rect x="18" y="24" width="6" height="50" fill="#1E293B" rx="1" />
              <rect x="206" y="24" width="6" height="50" fill="#1E293B" rx="1" />
              <rect x="20" y="70" width="190" height="3" fill="#0F172A" />

              {/* Desktop Top Slab (Thick wooden desk) */}
              <polygon points="10,22 220,22 214,28 16,28" fill="#0F172A" />
              <rect x="10" y="20" width="210" height="6" rx="2" fill={`url(#desk-top-${agent.id})`} stroke="#475569" strokeWidth="1.2" />

              {/* PC Tower on Floor (Right side under desk) */}
              <g transform="translate(182, 34)">
                <rect x="0" y="0" width="18" height="36" rx="2" fill="#020617" stroke="#334155" strokeWidth="1.5" />
                {/* Glowing RGB Fan Ring */}
                <circle cx="9" cy="12" r="5" fill="none" stroke={theme.accentWallColor} strokeWidth="1.8">
                  <animate attributeName="stroke" values={`${theme.accentWallColor};#38BDF8;${theme.accentWallColor}`} dur="3s" repeatCount="indefinite" />
                </circle>
                <circle cx="9" cy="25" r="5" fill="none" stroke={theme.accentWallColor} strokeWidth="1.8" />
              </g>

              {/* MAIN MONITOR (CENTER - DUAL SETUP) */}
              <g transform="translate(75, -28)">
                {/* Monitor Stand & Base */}
                <rect x="36" y="38" width="8" height="12" fill="#1E293B" />
                <rect x="30" y="48" width="20" height="3" rx="1" fill="#334155" />

                {/* Main Curved Bezel */}
                <rect x="0" y="0" width="80" height="40" rx="3" fill="#0F172A" stroke="#475569" strokeWidth="1.8" />
                {/* Glowing Screen Surface */}
                <rect x="2" y="2" width="76" height="36" rx="1" fill={`url(#screen-grad-${agent.id})`} />
                
                {/* Live Code / Data Lines on Main Screen */}
                <g opacity="0.95">
                  <rect x="6" y="6" width="30" height="2.5" rx="1" fill={agent.color} />
                  <rect x="6" y="11" width="55" height="2" rx="0.5" fill="#38BDF8">
                    <animate attributeName="width" values="55;35;58;55" dur="2s" repeatCount="indefinite" />
                  </rect>
                  <rect x="12" y="15" width="45" height="2" rx="0.5" fill="#34D399">
                    <animate attributeName="width" values="45;52;40;45" dur="1.7s" repeatCount="indefinite" />
                  </rect>
                  <rect x="12" y="19" width="38" height="2" rx="0.5" fill="#A78BFA" />
                  <rect x="12" y="23" width="48" height="2" rx="0.5" fill="#FBBF24">
                    <animate attributeName="width" values="48;30;50;48" dur="2.4s" repeatCount="indefinite" />
                  </rect>
                  <rect x="6" y="27" width="24" height="2" rx="0.5" fill="#38BDF8" />
                  {/* Blinking Terminal Cursor */}
                  <rect x="32" y="27" width="3" height="2.5" fill="#FFFFFF">
                    <animate attributeName="opacity" values="1;0;1" dur="0.8s" repeatCount="indefinite" />
                  </rect>
                </g>

                {/* Soft Ambient Light Glow Reflection from Screen */}
                <ellipse cx="40" cy="46" rx="42" ry="12" fill={agent.color} opacity="0.2">
                  <animate attributeName="opacity" values="0.15;0.3;0.15" dur="1.6s" repeatCount="indefinite" />
                </ellipse>
              </g>

              {/* SECONDARY MONITOR (LEFT - ANGLE PORTRAIT / CODE INSPECTOR) */}
              <g transform="translate(18, -22)">
                <rect x="16" y="32" width="6" height="14" fill="#1E293B" />
                <rect x="12" y="44" width="14" height="3" rx="1" fill="#334155" />
                <rect x="0" y="0" width="38" height="34" rx="2" fill="#0F172A" stroke="#475569" strokeWidth="1.5" />
                <rect x="2" y="2" width="34" height="30" rx="1" fill="#020617" />
                {/* Secondary Graphs / Metrics */}
                <rect x="5" y="6" width="16" height="2" fill="#34D399" />
                <rect x="5" y="11" width="26" height="8" rx="1" fill="#1E293B" />
                <polyline points="7,17 12,13 18,15 24,12 28,14" fill="none" stroke="#38BDF8" strokeWidth="1.2" />
                <rect x="5" y="22" width="22" height="2" fill="#F472B6" />
                <rect x="5" y="26" width="18" height="2" fill="#94A3B8" />
              </g>

              {/* Mechanical Keyboard with RGB Underglow */}
              <g transform="translate(90, 15)">
                <rect x="0" y="0" width="50" height="7" rx="1.5" fill="#0F172A" stroke="#334155" strokeWidth="1" />
                <line x1="2" y1="7" x2="48" y2="7" stroke={theme.accentWallColor} strokeWidth="1.5" opacity="0.8" />
                {/* Keys grid texture */}
                <rect x="3" y="1.5" width="44" height="3.5" rx="0.5" fill="#1E293B" />
              </g>

              {/* Ergonomic Wireless Mouse & Mousepad */}
              <g transform="translate(148, 14)">
                <rect x="0" y="0" width="18" height="9" rx="2" fill="#1E293B" opacity="0.8" />
                <rect x="5" y="2" width="7" height="5" rx="2" fill="#0F172A" stroke="#475569" strokeWidth="0.8" />
              </g>

              {/* Ceramic Coffee Mug (Steaming Hot) */}
              <g transform="translate(68, 12)">
                <rect x="0" y="0" width="8" height="9" rx="1.5" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="0.8" />
                <path d="M8 2 C11 2, 11 7, 8 7" stroke="#CBD5E1" strokeWidth="1" fill="none" />
                {/* Rising Steam Swirl */}
                <path d="M3 -1 Q1 -5 3 -9" stroke="#E2E8F0" strokeWidth="1" fill="none" opacity="0.6">
                  <animate attributeName="d" values="M3 -1 Q1 -5 3 -9;M3 -1 Q5 -5 3 -9;M3 -1 Q1 -5 3 -9" dur="2s" repeatCount="indefinite" />
                </path>
              </g>

              {/* Desk Succulent Plant in Geometric Pot */}
              <g transform="translate(168, 8)">
                <polygon points="0,7 10,7 8,13 2,13" fill="#D97706" />
                <circle cx="5" cy="4" r="4" fill="#10B981" />
                <circle cx="5" cy="2" r="3" fill="#34D399" />
              </g>

              {/* Agent's Hands typing actively on Keyboard */}
              <g transform="translate(100, 16)">
                {/* Left Hand tapping */}
                <ellipse cx="8" cy="2" rx="3.5" ry="2.2" fill="#FBBF24">
                  <animate attributeName="cy" values="2;0.5;2" dur="0.25s" repeatCount="indefinite" />
                </ellipse>
                {/* Right Hand tapping */}
                <ellipse cx="28" cy="2" rx="3.5" ry="2.2" fill="#FBBF24">
                  <animate attributeName="cy" values="0.5;2;0.5" dur="0.28s" repeatCount="indefinite" />
                </ellipse>
              </g>
            </g>

          </svg>
        </div>

        {/* Bottom Floating Info Pill */}
        <div className="absolute bottom-2 inset-x-2 z-20 flex items-center justify-between text-[10px] text-slate-400 px-2 pointer-events-none">
          <span className="flex items-center gap-1 font-mono text-emerald-400 font-bold bg-slate-900/80 px-2 py-0.5 rounded-full border border-emerald-500/30">
            <Laptop className="h-3 w-3 animate-pulse" />
            <span>Workstation Aktif • {agent.name.split(' ')[0]}</span>
          </span>
          <span className="hidden sm:inline bg-slate-900/80 px-2 py-0.5 rounded-full border border-slate-700/60">
            {theme.specialItemLabel}
          </span>
        </div>

      </div>

    </div>
  );
};
