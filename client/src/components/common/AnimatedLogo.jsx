import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getDashboardRoute } from '../../utils/helpers';

/**
 * AnimatedLogo — Animated SVG "HT" logo with orbit ring & pulse glow
 * Sizes: sm (navbar), md (login/register), lg (landing hero)
 */
const sizes = {
  sm: { box: 32, font: 13, orbit: 18, ring: 1.5, textSize: 'text-xl' },
  md: { box: 48, font: 20, orbit: 28, ring: 2, textSize: 'text-3xl' },
  lg: { box: 56, font: 24, orbit: 32, ring: 2, textSize: 'text-4xl' },
};

const AnimatedLogo = ({ size = 'md', showText = true, linkTo }) => {
  const { user, isAuthenticated } = useAuth();
  const s = sizes[size] || sizes.md;
  const half = s.box / 2;

  const destination = linkTo || (isAuthenticated ? getDashboardRoute(user?.role) : '/');

  return (
    <Link to={destination} className="inline-flex items-center gap-2 group" aria-label="HireTrack Home">
      <motion.div
        whileHover={{ scale: 1.08, rotate: 5 }}
        whileTap={{ scale: 0.95 }}
        className="relative flex-shrink-0"
        style={{ width: s.box, height: s.box }}
      >
        <svg
          width={s.box}
          height={s.box}
          viewBox={`0 0 ${s.box} ${s.box}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10"
        >
          <defs>
            <linearGradient id={`logo-grad-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="50%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#60a5fa" />
            </linearGradient>
            <filter id={`logo-glow-${size}`}>
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background rounded rect */}
          <rect
            x="1" y="1"
            width={s.box - 2} height={s.box - 2}
            rx={s.box * 0.3}
            fill={`url(#logo-grad-${size})`}
            filter={`url(#logo-glow-${size})`}
          />

          {/* H letter with circuit traces */}
          <text
            x={half}
            y={half}
            textAnchor="middle"
            dominantBaseline="central"
            fill="white"
            fontWeight="800"
            fontSize={s.font}
            fontFamily="Syne, sans-serif"
          >
            H
          </text>

          {/* Circuit trace lines */}
          <line x1={s.box * 0.15} y1={s.box * 0.8} x2={s.box * 0.15} y2={s.box * 0.65} stroke="rgba(255,255,255,0.3)" strokeWidth="0.8" />
          <line x1={s.box * 0.15} y1={s.box * 0.65} x2={s.box * 0.3} y2={s.box * 0.65} stroke="rgba(255,255,255,0.3)" strokeWidth="0.8" />
          <circle cx={s.box * 0.15} cy={s.box * 0.8} r="1.5" fill="rgba(255,255,255,0.5)" />

          <line x1={s.box * 0.85} y1={s.box * 0.2} x2={s.box * 0.85} y2={s.box * 0.35} stroke="rgba(255,255,255,0.3)" strokeWidth="0.8" />
          <line x1={s.box * 0.85} y1={s.box * 0.35} x2={s.box * 0.7} y2={s.box * 0.35} stroke="rgba(255,255,255,0.3)" strokeWidth="0.8" />
          <circle cx={s.box * 0.85} cy={s.box * 0.2} r="1.5" fill="rgba(255,255,255,0.5)" />
        </svg>

        {/* Orbiting ring */}
        <motion.div
          className="absolute inset-0"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        >
          <svg
            width={s.box}
            height={s.box}
            viewBox={`0 0 ${s.box} ${s.box}`}
            className="absolute inset-0"
          >
            <circle
              cx={half}
              cy={half}
              r={s.orbit}
              fill="none"
              stroke="rgba(59, 130, 246, 0.2)"
              strokeWidth={s.ring}
              strokeDasharray="4 8"
            />
            {/* Orbiting dot */}
            <circle
              cx={half + s.orbit}
              cy={half}
              r={s.ring}
              fill="#06b6d4"
            >
              <animate
                attributeName="opacity"
                values="1;0.4;1"
                dur="2s"
                repeatCount="indefinite"
              />
            </circle>
          </svg>
        </motion.div>

        {/* Pulse glow behind */}
        <motion.div
          className="absolute inset-0 rounded-2xl"
          style={{
            background: 'radial-gradient(circle, rgba(59,130,246,0.3) 0%, transparent 70%)',
          }}
          animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.15, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>

      {showText && (
        <motion.span
          initial={{ opacity: 0, x: -5 }}
          animate={{ opacity: 1, x: 0 }}
          className={`${s.textSize} font-heading font-bold gradient-text`}
        >
          HireTrack
        </motion.span>
      )}
    </Link>
  );
};

export default AnimatedLogo;
