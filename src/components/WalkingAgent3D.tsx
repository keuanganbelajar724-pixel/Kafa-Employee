import React from 'react';
import { Agent } from '../types';

interface WalkingAgent3DProps {
  agent: Agent;
  isWalking: boolean;
  isSitting?: boolean;
  facing?: 'left' | 'right';
  speechText?: string | null;
  onClick?: () => void;
  scale?: 'normal' | 'large';
}

export const WalkingAgent3D: React.FC<WalkingAgent3DProps> = ({
  agent,
  isWalking,
  isSitting = false,
  facing = 'right',
  speechText,
  onClick,
  scale = 'large'
}) => {
  // Render character specific accessories
  const renderAccessories = () => {
    switch (agent.avatar3d) {
      case 'lead': // Alex Morgan (Smart glasses, royal blue tie, sharp swept hair)
        return (
          <g>
            {/* Hair */}
            <path d="M20 18 C16 4, 44 2, 44 18 C44 11, 40 7, 30 7 C23 7, 20 11, 20 18 Z" fill="#1E293B" />
            <path d="M26 10 C30 8, 36 8, 40 12" stroke="#475569" strokeWidth="1.2" fill="none" />
            {/* Glasses */}
            <rect x="23" y="16" width="7.5" height="5" rx="1.5" fill="none" stroke="#2563EB" strokeWidth="1.6" />
            <rect x="33.5" y="16" width="7.5" height="5" rx="1.5" fill="none" stroke="#2563EB" strokeWidth="1.6" />
            <line x1="30.5" y1="18.5" x2="33.5" y2="18.5" stroke="#2563EB" strokeWidth="1.6" />
            {/* Lens Glint */}
            <line x1="25" y1="18" x2="27" y2="20" stroke="#93C5FD" strokeWidth="1" />
            {/* Blue Tie */}
            <path d="M29.5 30 L32 40 L34.5 30 Z" fill="#2563EB" />
          </g>
        );
      case 'researcher': // Dr. Maya Chen (Ponytail, emerald glasses, research badge)
        return (
          <g>
            {/* Ponytail */}
            <path d="M19 18 C17 5, 45 5, 45 18 C47 22, 50 30, 49 35 C46 32, 45 27, 45 22" fill="#3B1C32" />
            <ellipse cx="32" cy="11" rx="12" ry="7.5" fill="#3B1C32" />
            <path d="M25 8 C30 6, 36 6, 40 9" stroke="#701A75" strokeWidth="1.2" fill="none" />
            {/* Emerald Specs */}
            <circle cx="27" cy="18" r="3.8" fill="none" stroke="#059669" strokeWidth="1.6" />
            <circle cx="37" cy="18" r="3.8" fill="none" stroke="#059669" strokeWidth="1.6" />
            <line x1="30.8" y1="18" x2="33.2" y2="18" stroke="#059669" strokeWidth="1.6" />
            {/* Lens Glint */}
            <circle cx="26" cy="17" r="1" fill="#A7F3D0" />
            {/* ID Badge */}
            <rect x="36" y="32" width="4" height="6" rx="1" fill="#10B981" />
          </g>
        );
      case 'engineer': // David Kim (Violet headset, cool spiky hair)
        return (
          <g>
            {/* Spiky Dark Hair */}
            <path d="M20 17 C19 7, 26 4, 32 4 C38 4, 44 7, 44 17 Z" fill="#0F172A" />
            <path d="M24 7 L26 3 L29 6 L32 2 L36 6 L39 3" stroke="#0F172A" strokeWidth="2.4" strokeLinecap="round" />
            {/* Headset band & ear cups */}
            <path d="M21 18 C21 8, 43 8, 43 18" fill="none" stroke="#7C3AED" strokeWidth="2.5" />
            <rect x="18" y="16" width="4" height="7" rx="2" fill="#8B5CF6" />
            <rect x="42" y="16" width="4" height="7" rx="2" fill="#8B5CF6" />
            {/* Headset LED */}
            <circle cx="20" cy="19.5" r="1.2" fill="#38BDF8">
              <animate attributeName="opacity" values="1;0.2;1" dur="1s" repeatCount="indefinite" />
            </circle>
            {/* Mic */}
            <path d="M21 23 L25 26 L29 26" fill="none" stroke="#8B5CF6" strokeWidth="1.6" strokeLinecap="round" />
            <circle cx="29" cy="26" r="1.2" fill="#A78BFA" />
          </g>
        );
      case 'writer': // Elena Rostova (Flowing rich hair, gold earrings, necklace)
        return (
          <g>
            {/* Flowing hair */}
            <path d="M19 18 C18 6, 46 6, 45 18 C46 27, 43 36, 41 38 C39 30, 43 21, 37 14 C28 14, 22 21, 21 38" fill="#78350F" />
            <path d="M22 26 Q19 32 22 38" stroke="#92400E" strokeWidth="1.6" fill="none" />
            <path d="M42 26 Q45 32 42 38" stroke="#92400E" strokeWidth="1.6" fill="none" />
            {/* Gold earrings */}
            <circle cx="21" cy="23" r="1.8" fill="#F59E0B">
              <animate attributeName="fill" values="#F59E0B;#FDE68A;#F59E0B" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx="43" cy="23" r="1.8" fill="#F59E0B">
              <animate attributeName="fill" values="#F59E0B;#FDE68A;#F59E0B" dur="2s" repeatCount="indefinite" />
            </circle>
            {/* Pearl Necklace */}
            <path d="M28 31 Q32 34 36 31" fill="none" stroke="#F59E0B" strokeWidth="1.4" />
          </g>
        );
      case 'marketer': // Sarah Jenkins (Red styled hair, growth badge, headset mic)
        return (
          <g>
            <path d="M20 18 C18 6, 44 6, 44 18 C42 12, 37 9, 32 9 C25 9, 22 13, 20 18 Z" fill="#991B1B" />
            <path d="M22 17 C20 23, 21 29, 23 33" stroke="#EF4444" strokeWidth="2" fill="none" strokeLinecap="round" />
            {/* Mic */}
            <path d="M21 23 L25 26 L29 26" fill="none" stroke="#EF4444" strokeWidth="1.6" strokeLinecap="round" />
            <circle cx="29" cy="26" r="1.2" fill="#F87171" />
            {/* Sparkle Earring */}
            <circle cx="21" cy="22" r="1.2" fill="#FBBF24" />
          </g>
        );
      case 'finance': // Marcus Vance (Clean silver-slate hair, gold wire glasses, tie clip)
        return (
          <g>
            <path d="M22 17 C20 8, 42 7, 42 17 C40 11, 36 9, 32 9 C26 9, 24 12, 22 17 Z" fill="#475569" />
            {/* Wireframe Gold Glasses */}
            <rect x="24" y="16" width="6.5" height="4.5" rx="1" fill="none" stroke="#EAB308" strokeWidth="1.2" />
            <rect x="33" y="16" width="6.5" height="4.5" rx="1" fill="none" stroke="#EAB308" strokeWidth="1.2" />
            <line x1="30.5" y1="18" x2="33" y2="18" stroke="#EAB308" strokeWidth="1.2" />
            {/* Gold Lapel Pin */}
            <circle cx="36" cy="34" r="1.4" fill="#14B8A6" stroke="#EAB308" strokeWidth="0.8" />
          </g>
        );
      case 'security': // Liam O'Connor (Cyber neon visor, dark tech crop)
        return (
          <g>
            <path d="M21 17 C19 8, 43 8, 43 17 C41 11, 35 7, 32 7 C27 7, 23 11, 21 17 Z" fill="#090D16" />
            {/* Cyber Visor Glow */}
            <rect x="23" y="16" width="18" height="4.5" rx="2" fill="#06B6D4" opacity="0.95" />
            <line x1="25" y1="18.2" x2="39" y2="18.2" stroke="#FFFFFF" strokeWidth="1.2" opacity="0.9" />
            {/* Tech ear piece */}
            <rect x="19" y="17" width="2" height="4" rx="1" fill="#22D3EE" />
          </g>
        );
      case 'product': // Nadia Thorne (Creative bun, stylus pen, modern glasses)
        return (
          <g>
            <ellipse cx="32" cy="7" rx="5" ry="4" fill="#3F2E1E" />
            <path d="M20 18 C19 7, 45 7, 44 18 C42 13, 38 10, 32 10 C25 10, 22 13, 20 18 Z" fill="#3F2E1E" />
            {/* Stylus behind ear */}
            <line x1="38" y1="11" x2="43" y2="16" stroke="#84CC16" strokeWidth="1.8" strokeLinecap="round" />
            {/* Designer Glasses */}
            <circle cx="27" cy="18" r="3.2" fill="none" stroke="#84CC16" strokeWidth="1.4" />
            <circle cx="37" cy="18" r="3.2" fill="none" stroke="#84CC16" strokeWidth="1.4" />
            <line x1="30.2" y1="18" x2="33.8" y2="18" stroke="#84CC16" strokeWidth="1.4" />
          </g>
        );
      case 'legal': // Priya Sharma (Sleek hair with gold headband, legal scales)
        return (
          <g>
            <path d="M21 18 C19 6, 43 6, 43 18 C45 27, 44 35, 42 37 C40 29, 42 21, 36 15 C28 15, 23 21, 22 37" fill="#1E1B4B" />
            {/* Golden Headband */}
            <path d="M22 15 C26 10, 38 10, 42 15" fill="none" stroke="#F59E0B" strokeWidth="1.6" />
            {/* Scales pendant */}
            <path d="M30 33 L34 33 M32 31 L32 35" stroke="#6366F1" strokeWidth="1.2" />
            <circle cx="30" cy="34" r="0.8" fill="#F59E0B" />
          </g>
        );
      case 'auditor': // Kenji Sato (Neat hair, inspector monocle, pen)
      default:
        return (
          <g>
            {/* Hair */}
            <path d="M20 16 C20 6, 44 6, 44 16 C37 10, 26 11, 20 16 Z" fill="#18181B" />
            {/* Rose Monocle */}
            <circle cx="27" cy="18" r="4.0" fill="none" stroke="#DB2777" strokeWidth="1.6" />
            <line x1="27" y1="22" x2="25" y2="25" stroke="#DB2777" strokeWidth="1.4" />
            <path d="M25 25 Q23 30 26 34" stroke="#F472B6" strokeWidth="1" fill="none" strokeDasharray="1.5,1.5" />
            {/* Inspector Pen in Pocket */}
            <line x1="38" y1="31" x2="38" y2="36" stroke="#E11D48" strokeWidth="1.8" />
          </g>
        );
    }
  };

  const svgSize = scale === 'large' ? 'w-20 h-20 sm:w-24 sm:h-24' : 'w-16 h-16';

  return (
    <div 
      onClick={onClick}
      className="relative flex flex-col items-center cursor-pointer select-none group transition-transform hover:scale-105"
      style={{
        transform: `scaleX(${facing === 'left' ? -1 : 1})`,
        transformOrigin: 'bottom center',
        transition: 'transform 0.2s ease-out'
      }}
    >
      {/* Dynamic Floating Speech / Thought Bubble (Bright, Clean White Card) */}
      {speechText && (
        <div 
          className="absolute -top-14 z-30 pointer-events-none"
          style={{
            transform: `scaleX(${facing === 'left' ? -1 : 1})`,
            transformOrigin: 'bottom center'
          }}
        >
          <div className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-slate-900 border border-slate-200/90 shadow-xl text-[11px] font-bold whitespace-nowrap max-w-[220px] truncate animate-bounce">
            <span>{speechText}</span>
            {/* Bubble Tail */}
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-r border-b border-slate-200/90 rotate-45" />
          </div>
        </div>
      )}

      {/* Full Body Animated Character SVG (Sharp, Bright, High-Contrast) */}
      <svg 
        viewBox="0 0 64 64" 
        className={`${svgSize} filter drop-shadow-md transition-all duration-150 ${
          isWalking ? 'animate-walk-bob' : ''
        }`}
      >
        <defs>
          <radialGradient id={`glow-walk-${agent.id}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={agent.color} stopOpacity="0.5" />
            <stop offset="100%" stopColor={agent.color} stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`suit-walk-${agent.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={agent.color} />
            <stop offset="100%" stopColor="#1E293B" />
          </linearGradient>
          <linearGradient id={`skin-walk-${agent.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
        </defs>

        {/* Dynamic Stepping Ground Shadow */}
        <ellipse 
          cx="32" 
          cy="60" 
          rx={isWalking ? '15' : '19'} 
          ry="4" 
          fill="#64748B" 
          opacity="0.3" 
        />

        {/* Aura Glow when Working */}
        {agent.status === 'working' && (
          <ellipse cx="32" cy="36" rx="26" ry="26" fill={`url(#glow-walk-${agent.id})`} />
        )}

        {/* --- LEGS & FEET (Visibly step and walk!) --- */}
        {!isSitting ? (
          <g>
            {/* Left Leg */}
            <g className={isWalking ? 'animate-walk-l origin-top' : ''}>
              <rect x="24.5" y="44" width="5.5" height="12" rx="2" fill="#1E293B" />
              {/* Left Shoe */}
              <path d="M23.5 56 L31.5 56 L33.5 59.5 L23.5 59.5 Z" fill="#0F172A" />
            </g>

            {/* Right Leg */}
            <g className={isWalking ? 'animate-walk-r origin-top' : ''}>
              <rect x="34" y="44" width="5.5" height="12" rx="2" fill="#1E293B" />
              {/* Right Shoe */}
              <path d="M33 56 L41 56 L43 59.5 L33 59.5 Z" fill="#0F172A" />
            </g>
          </g>
        ) : (
          /* Sitting Pose on Ergonomic Office Chair */
          <g>
            <rect x="24" y="44" width="6.5" height="8.5" rx="2" fill="#1E293B" transform="rotate(40 28 44)" />
            <rect x="33.5" y="44" width="6.5" height="8.5" rx="2" fill="#1E293B" transform="rotate(-40 37 44)" />
            {/* Shoes */}
            <circle cx="23" cy="52" r="3" fill="#0F172A" />
            <circle cx="41" cy="52" r="3" fill="#0F172A" />
          </g>
        )}

        {/* --- TORSO & VIVID COAT --- */}
        <path d="M21 44 L24.5 28 L39.5 28 L43 44 Z" fill={`url(#suit-walk-${agent.id})`} />
        {/* Crisp White Shirt Collar */}
        <path d="M28.5 28 L32 34 L35.5 28 Z" fill="#FFFFFF" />

        {/* --- ARMS & HANDS --- */}
        {/* Left Arm */}
        <g className={isWalking ? 'animate-walk-r origin-top' : ''}>
          <rect x="17" y="29" width="5" height="12" rx="2" fill={agent.color} />
          <circle cx="19.5" cy="42" r="2.8" fill={`url(#skin-walk-${agent.id})`} />
        </g>
        {/* Right Arm */}
        <g className={isWalking ? 'animate-walk-l origin-top' : ''}>
          <rect x="42" y="29" width="5" height="12" rx="2" fill={agent.color} />
          <circle cx="44.5" cy="42" r="2.8" fill={`url(#skin-walk-${agent.id})`} />
        </g>

        {/* Neck */}
        <rect x="29" y="24" width="6" height="5" rx="1.5" fill={`url(#skin-walk-${agent.id})`} />

        {/* The Sims Iconic Floating Plumbob Diamond Crystal */}
        <g className="animate-pulse">
          <polygon points="32,0 35,4.5 32,9 29,4.5" fill="#22C55E" stroke="#15803D" strokeWidth="0.6" />
          <polygon points="32,0 35,4.5 32,4.5" fill="#86EFAC" opacity="0.85" />
        </g>

        {/* --- HEAD (Clean stylized The Sims mannequin silhouette, strictly NO eyes, NO mouth) --- */}
        <ellipse cx="32" cy="18" rx="10.5" ry="11.5" fill={`url(#skin-walk-${agent.id})`} />

        {/* Character Hairstyles, Outfits & Accessories */}
        {renderAccessories()}
      </svg>

      {/* Clean, Bright Name & Role Pill Underneath */}
      <div 
        className="mt-1 flex flex-col items-center pointer-events-none"
        style={{
          transform: `scaleX(${facing === 'left' ? -1 : 1})`
        }}
      >
        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white border border-slate-200 shadow-sm text-[10px] font-bold text-slate-800 whitespace-nowrap">
          <span 
            className="w-2 h-2 rounded-full shrink-0" 
            style={{ backgroundColor: agent.color }} 
          />
          <span>{agent.name.split(' ')[0]}</span>
          <span className="text-[9px] text-blue-700 font-mono px-1 rounded bg-blue-50 border border-blue-200">
            {agent.apiEngine?.icon || '⚡'} {agent.apiEngine?.badge || 'AI'}
          </span>
        </div>
      </div>
    </div>
  );
};
