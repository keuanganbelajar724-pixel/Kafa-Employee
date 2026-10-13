import React from 'react';
import { Agent } from '../types';

interface AgentAvatar3DProps {
  agent: Agent;
  size?: 'sm' | 'md' | 'lg' | 'desk' | 'xl' | '2xl' | 'hero';
  isWorking?: boolean;
  agentIndex?: number;
  zoomScale?: number;
  className?: string;
}

export const AgentAvatar3D: React.FC<AgentAvatar3DProps> = ({ 
  agent, 
  size = 'md',
  isWorking = false,
  agentIndex = 0,
  zoomScale = 1,
  className = ''
}) => {
  const activeWorking = isWorking || agent.status === 'working' || agent.status === 'collaborating';

  // Float animation class based on agent to prevent robotic synchronization
  const floatClasses = [
    'animate-float-1',
    'animate-float-2',
    'animate-float-3',
    'animate-float-4',
    'animate-float-5'
  ];
  const floatAnimClass = floatClasses[agentIndex % floatClasses.length] || 'animate-float-1';

  // Specific accessories & styling per avatar type
  const renderCharacterFeatures = () => {
    switch (agent.avatar3d) {
      case 'lead': // Alex Morgan (Blazer, smart glasses, leadership posture)
        return (
          <g>
            {/* Hair with subtle highlight */}
            <path d="M22 28 C18 16, 42 12, 42 28 C42 22, 38 18, 30 18 C24 18, 22 22, 22 28 Z" fill="#1E293B" />
            <path d="M26 19 C30 17, 36 17, 38 21" stroke="#475569" strokeWidth="1" fill="none" />
            {/* Smart Glasses */}
            <rect x="25" y="27" width="6" height="4" rx="1" fill="none" stroke="#38BDF8" strokeWidth="1.2" />
            <rect x="33" y="27" width="6" height="4" rx="1" fill="none" stroke="#38BDF8" strokeWidth="1.2" />
            <line x1="31" y1="29" x2="33" y2="29" stroke="#38BDF8" strokeWidth="1.2" />
            {/* Glasses reflection twinkle */}
            <line x1="26" y1="28" x2="28" y2="30" stroke="#FFFFFF" strokeWidth="0.8" opacity="0.8" />
            {/* Tie / Suit Lapel */}
            <path d="M28 42 L32 51 L36 42 Z" fill="#2563EB" />
          </g>
        );
      case 'researcher': // Dr. Maya Chen (Glasses/goggles, ponytail, lab badge)
        return (
          <g>
            {/* Ponytail & Hair */}
            <path d="M20 28 C18 14, 44 14, 44 28 C46 32, 48 38, 48 42 C45 40, 44 36, 44 32" fill="#3B1C32" />
            <ellipse cx="32" cy="20" rx="11" ry="8" fill="#3B1C32" />
            {/* Hair highlight */}
            <path d="M24 17 C28 15, 34 15, 38 18" stroke="#701A75" strokeWidth="1.2" fill="none" />
            {/* Circular specs */}
            <circle cx="28" cy="29" r="3.2" fill="none" stroke="#10B981" strokeWidth="1.2" />
            <circle cx="36" cy="29" r="3.2" fill="none" stroke="#10B981" strokeWidth="1.2" />
            <line x1="31.2" y1="29" x2="32.8" y2="29" stroke="#10B981" strokeWidth="1.2" />
            {/* Lens Glint */}
            <circle cx="27" cy="28" r="0.8" fill="#FFFFFF" opacity="0.9" />
            {/* Emerald badge */}
            <circle cx="37" cy="46" r="2" fill="#10B981" />
          </g>
        );
      case 'engineer': // David Kim (Tech headset, modern hoodie)
        return (
          <g>
            {/* Spiky Dark Hair */}
            <path d="M21 27 C20 18, 26 15, 32 15 C38 15, 43 18, 43 27 Z" fill="#0F172A" />
            <path d="M25 16 L27 12 L30 15 L33 11 L37 15" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" />
            {/* Headset band & ear cups */}
            <path d="M22 28 C22 18, 42 18, 42 28" fill="none" stroke="#8B5CF6" strokeWidth="2" />
            <rect x="20" y="27" width="3" height="6" rx="1.5" fill="#A78BFA" />
            <rect x="41" y="27" width="3" height="6" rx="1.5" fill="#A78BFA" />
            {/* Glowing headset LED */}
            <circle cx="21.5" cy="30" r="0.8" fill="#38BDF8">
              <animate attributeName="opacity" values="1;0.3;1" dur="1s" repeatCount="indefinite" />
            </circle>
            {/* Mic boom */}
            <path d="M22 32 L26 36 L29 36" fill="none" stroke="#A78BFA" strokeWidth="1.2" strokeLinecap="round" />
            <circle cx="29" cy="36" r="1.2" fill="#8B5CF6" />
          </g>
        );
      case 'writer': // Elena Rostova (Stylized chic hair, earrings, necklace)
        return (
          <g>
            {/* Flowing auburn hair */}
            <path d="M20 28 C19 16, 45 16, 44 28 C45 36, 42 44, 40 46 C38 38, 42 30, 36 24 C28 24, 23 30, 22 46" fill="#78350F" />
            {/* Hair curls */}
            <path d="M22 36 Q20 40 23 44" stroke="#92400E" strokeWidth="1.5" fill="none" />
            <path d="M42 36 Q44 40 41 44" stroke="#92400E" strokeWidth="1.5" fill="none" />
            {/* Gold earrings */}
            <circle cx="22" cy="32" r="1.5" fill="#F59E0B">
              <animate attributeName="fill" values="#F59E0B;#FCD34D;#F59E0B" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx="42" cy="32" r="1.5" fill="#F59E0B">
              <animate attributeName="fill" values="#F59E0B;#FCD34D;#F59E0B" dur="2s" repeatCount="indefinite" />
            </circle>
            {/* Chic necklace */}
            <path d="M28 43 Q32 46 36 43" fill="none" stroke="#F59E0B" strokeWidth="1.2" />
          </g>
        );
      case 'marketer': // Sarah Jenkins (Red styled hair, growth badge, headset mic)
        return (
          <g>
            <path d="M20 27 C18 15, 44 14, 44 27 C42 21, 37 17, 32 17 C25 17, 22 22, 20 27 Z" fill="#991B1B" />
            <path d="M22 26 C20 32, 21 38, 23 42" stroke="#EF4444" strokeWidth="2" fill="none" strokeLinecap="round" />
            {/* Megaphone / Growth Arrow Pin */}
            <polygon points="26,45 32,42 32,48" fill="#EF4444" />
            <rect x="32" y="44" width="3" height="2" fill="#FCA5A5" />
            {/* Sparkle Earring */}
            <circle cx="21" cy="30" r="1.2" fill="#FBBF24" />
          </g>
        );
      case 'finance': // Marcus Vance (Clean silver-slate hair, gold wire glasses, tie clip)
        return (
          <g>
            <path d="M22 26 C20 17, 42 16, 42 26 C40 20, 36 18, 32 18 C26 18, 24 21, 22 26 Z" fill="#334155" />
            {/* Wireframe Gold Glasses */}
            <rect x="25" y="27" width="6" height="4" rx="1" fill="none" stroke="#EAB308" strokeWidth="1.2" />
            <rect x="33" y="27" width="6" height="4" rx="1" fill="none" stroke="#EAB308" strokeWidth="1.2" />
            <line x1="31" y1="29" x2="33" y2="29" stroke="#EAB308" strokeWidth="1.2" />
            {/* Gold Lapel Pin */}
            <circle cx="37" cy="46" r="1.6" fill="#14B8A6" stroke="#EAB308" strokeWidth="0.8" />
          </g>
        );
      case 'security': // Liam O'Connor (Cyber visor, hood/crop hair, tech glow)
        return (
          <g>
            <path d="M21 27 C19 18, 43 18, 43 27 C41 21, 35 17, 32 17 C27 17, 23 21, 21 27 Z" fill="#090D16" />
            {/* Cyber Visor Glow */}
            <rect x="24" y="27" width="16" height="4" rx="2" fill="#06B6D4" opacity="0.9" />
            <line x1="26" y1="29" x2="38" y2="29" stroke="#FFFFFF" strokeWidth="1" opacity="0.8" />
            {/* Hacker ear-comm piece */}
            <rect x="19" y="28" width="2" height="4" rx="1" fill="#22D3EE" />
          </g>
        );
      case 'product': // Nadia Thorne (Creative bun, stylus pen, modern glasses)
        return (
          <g>
            <ellipse cx="32" cy="15" rx="5" ry="4" fill="#3F2E1E" />
            <path d="M20 27 C19 16, 45 16, 44 27 C42 22, 38 19, 32 19 C25 19, 22 22, 20 27 Z" fill="#3F2E1E" />
            {/* Stylus behind ear */}
            <line x1="38" y1="20" x2="43" y2="25" stroke="#84CC16" strokeWidth="1.8" strokeLinecap="round" />
            {/* Designer Glasses */}
            <circle cx="28" cy="29" r="3.2" fill="none" stroke="#84CC16" strokeWidth="1.2" />
            <circle cx="36" cy="29" r="3.2" fill="none" stroke="#84CC16" strokeWidth="1.2" />
            <line x1="31.2" y1="29" x2="32.8" y2="29" stroke="#84CC16" strokeWidth="1.2" />
          </g>
        );
      case 'legal': // Priya Sharma (Sleek hair with gold hairband, scales insignia)
        return (
          <g>
            <path d="M21 27 C19 15, 43 15, 43 27 C45 36, 44 44, 42 46 C40 38, 42 30, 36 24 C28 24, 23 30, 22 46" fill="#1E1B4B" />
            {/* Golden Headband */}
            <path d="M22 24 C26 19, 38 19, 42 24" fill="none" stroke="#F59E0B" strokeWidth="1.6" />
            {/* Legal balance scale pendant */}
            <path d="M30 45 L34 45 M32 43 L32 47" stroke="#6366F1" strokeWidth="1.2" />
            <circle cx="30" cy="46" r="0.8" fill="#F59E0B" />
            <circle cx="34" cy="46" r="0.8" fill="#F59E0B" />
          </g>
        );
      case 'auditor': // Kenji Sato (Neat hair, inspect monocle, pen)
      default:
        return (
          <g>
            {/* Neat parted hair */}
            <path d="M21 26 C21 16, 43 16, 43 26 C36 20, 26 21, 21 26 Z" fill="#18181B" />
            {/* Inspect magnifier / monocle */}
            <circle cx="28" cy="28" r="3.5" fill="none" stroke="#EC4899" strokeWidth="1.4" />
            <line x1="28" y1="31.5" x2="26" y2="34" stroke="#EC4899" strokeWidth="1.2" />
            {/* Monocle chain */}
            <path d="M26 34 Q24 38 27 42" stroke="#FDA4AF" strokeWidth="0.8" fill="none" strokeDasharray="1,1" />
            {/* Clip / pen */}
            <line x1="37" y1="42" x2="37" y2="47" stroke="#F43F5E" strokeWidth="1.5" />
          </g>
        );
    }
  };

  const getContainerDimensions = () => {
    switch (size) {
      case 'sm': return 'w-10 h-10';
      case 'lg': return 'w-24 h-24';
      case 'desk': return 'w-28 h-28';
      case 'xl': return 'w-36 h-36';
      case '2xl': return 'w-48 h-48';
      case 'hero': return 'w-64 h-64';
      case 'md':
      default: return 'w-16 h-16';
    }
  };

  return (
    <div 
      className={`relative inline-flex items-center justify-center select-none transition-transform duration-300 ${getContainerDimensions()} ${className}`}
      style={{
        transform: zoomScale !== 1 ? `scale(${zoomScale})` : undefined,
        transformOrigin: 'center center'
      }}
    >
      
      {/* Dynamic Desk Glow when working or ambient */}
      <div 
        className={`absolute inset-0 rounded-full blur-xl pointer-events-none transition-all duration-500 ${
          activeWorking ? 'animate-desk-glow' : 'opacity-25'
        }`}
        style={{ backgroundColor: `${agent.color}40` }}
      />

      {/* Floating Ideation Particles when Working or Collaborating */}
      {activeWorking && (
        <div className="absolute -top-3 inset-x-0 flex justify-center pointer-events-none z-20">
          <span className="text-[11px] font-bold text-amber-300 animate-spark-1 mr-3">⚡</span>
          <span className="text-[11px] font-bold text-blue-300 animate-spark-2">💡</span>
          <span className="text-[11px] font-bold text-emerald-300 animate-spark-3 ml-3">✨</span>
        </div>
      )}

      {/* 3D Character SVG with Natural Floating / Bobbing & Typing Animations */}
      <svg 
        viewBox="0 0 64 64" 
        className={`w-full h-full filter drop-shadow-lg transition-transform duration-300 ${
          activeWorking ? 'scale-105' : floatAnimClass
        }`}
      >
        <defs>
          <radialGradient id={`glow-${agent.id}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={agent.color} stopOpacity="0.45" />
            <stop offset="100%" stopColor={agent.color} stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`skin-${agent.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDE68A" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
          <linearGradient id={`suit-${agent.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="100%" stopColor="#1E293B" />
          </linearGradient>
          <linearGradient id={`screen-${agent.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1E293B" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>
        </defs>

        {/* Ambient Ground Shadow that breathes */}
        <ellipse cx="32" cy="58" rx="20" ry="5" fill="#000000" opacity="0.3">
          <animate attributeName="rx" values="18;22;18" dur="3s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.25;0.35;0.25" dur="3s" repeatCount="indefinite" />
        </ellipse>
        
        {/* Department Radial Glow */}
        <ellipse cx="32" cy="38" rx="26" ry="24" fill={`url(#glow-${agent.id})`} />

        {/* Character Body Group (Head + Torso with subtle breathing bobbing) */}
        <g>
          {/* Torso & Suit */}
          <path d="M20 54 L24 40 L40 40 L44 54 Z" fill={`url(#suit-${agent.id})`} />
          
          {/* Collar / Shirt */}
          <path d="M28 40 L32 46 L36 40 Z" fill="#F8FAFC" />

          {/* Neck */}
          <rect x="29" y="35" width="6" height="6" rx="2" fill={`url(#skin-${agent.id})`} />

          {/* Head */}
          <ellipse cx="32" cy="28" rx="10" ry="11" fill={`url(#skin-${agent.id})`} />

          {/* Animated Eyes (Blinks naturally every 3.5 seconds) */}
          <ellipse cx="28" cy="29" rx="1.5" ry="1.5" fill="#1E293B">
            <animate 
              attributeName="ry" 
              values="1.5;1.5;0.1;1.5;1.5" 
              keyTimes="0;0.9;0.94;0.98;1" 
              dur="3.8s" 
              repeatCount="indefinite" 
            />
          </ellipse>
          <ellipse cx="36" cy="29" rx="1.5" ry="1.5" fill="#1E293B">
            <animate 
              attributeName="ry" 
              values="1.5;1.5;0.1;1.5;1.5" 
              keyTimes="0;0.9;0.94;0.98;1" 
              dur="3.8s" 
              repeatCount="indefinite" 
            />
          </ellipse>

          {/* Cheerful Smile */}
          <path d="M29 34 Q32 36.5 35 34" fill="none" stroke="#B45309" strokeWidth="1" strokeLinecap="round" />

          {/* Unique Character Hairstyle & Props */}
          {renderCharacterFeatures()}
        </g>

        {/* Workstation Desk & Laptop Setup (Visible on desk view or working) */}
        {(size === 'desk' || activeWorking || size === 'lg') && (
          <g transform="translate(13, 44)">
            {/* Wooden Desk Surface */}
            <path d="M1 12 L37 12 L35 15 L3 15 Z" fill="#334155" opacity="0.9" />

            {/* Laptop Base & Keyboard */}
            <path d="M6 10 L32 10 L30 13 L8 13 Z" fill="#475569" />
            {/* Keyboard keys texture */}
            <rect x="10" y="10.8" width="18" height="1.2" rx="0.5" fill="#1E293B" opacity="0.8" />

            {/* Animated Typing Hands / Arms */}
            <g>
              {/* Left Hand tapping keys */}
              <ellipse 
                cx="13" 
                cy="11.5" 
                rx="1.8" 
                ry="1.2" 
                fill={`url(#skin-${agent.id})`}
                className={activeWorking ? 'animate-type-l' : ''}
              >
                {!activeWorking && (
                  <animate attributeName="cy" values="11.5;10.8;11.5" dur="1.4s" repeatCount="indefinite" />
                )}
              </ellipse>

              {/* Right Hand tapping keys */}
              <ellipse 
                cx="25" 
                cy="11.5" 
                rx="1.8" 
                ry="1.2" 
                fill={`url(#skin-${agent.id})`}
                className={activeWorking ? 'animate-type-r' : ''}
              >
                {!activeWorking && (
                  <animate attributeName="cy" values="10.8;11.5;10.8" dur="1.2s" repeatCount="indefinite" />
                )}
              </ellipse>
            </g>

            {/* Laptop Screen Bezel */}
            <rect x="9" y="1" width="20" height="9" rx="1.2" fill="#0F172A" stroke="#64748B" strokeWidth="0.8" />
            
            {/* Glowing Laptop Display */}
            <rect 
              x="10.2" 
              y="2.2" 
              width="17.6" 
              height="6.8" 
              rx="0.6" 
              fill={`url(#screen-${agent.id})`} 
            />

            {/* Animated Code Lines on Screen */}
            <g opacity="0.9">
              {/* Line 1 (Code header) */}
              <rect x="11.5" y="3.2" width="7" height="0.8" rx="0.4" fill={agent.color} />
              {/* Line 2 (Code body) */}
              <rect x="11.5" y="4.6" width="13" height="0.8" rx="0.4" fill="#38BDF8">
                <animate attributeName="width" values="13;8;14;13" dur="2.4s" repeatCount="indefinite" />
              </rect>
              {/* Line 3 (Code statement) */}
              <rect x="13" y="6" width="9" height="0.8" rx="0.4" fill="#A78BFA">
                <animate attributeName="width" values="9;12;6;9" dur="1.8s" repeatCount="indefinite" />
              </rect>
              {/* Blinking Terminal Cursor */}
              <rect x="22.5" y="6" width="1.2" height="0.8" fill="#FFFFFF">
                <animate attributeName="opacity" values="1;0;1" dur="0.8s" repeatCount="indefinite" />
              </rect>
            </g>

            {/* Live Screen Glow Reflection on Face */}
            <ellipse 
              cx="19" 
              cy="5.5" 
              rx="8" 
              ry="3" 
              fill={agent.color} 
              opacity="0.25"
            >
              <animate attributeName="opacity" values="0.15;0.35;0.15" dur="1.5s" repeatCount="indefinite" />
            </ellipse>
          </g>
        )}
      </svg>

      {/* Floating Status Indicator Badge with Animated Pulse Ring */}
      <span 
        className={`absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white shadow-xs ${
          activeWorking ? 'bg-amber-400' : 'bg-emerald-500'
        }`}
        title={activeWorking ? 'Sedang Bekerja (Active)' : 'Siaga di Meja Kerja (Idle)'}
      >
        <span 
          className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
            activeWorking ? 'animate-ping bg-amber-400' : 'animate-pulse bg-emerald-400'
          }`} 
        />
      </span>
    </div>
  );
};
