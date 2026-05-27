import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiTarget, FiBriefcase, FiCheckCircle, FiXCircle } from 'react-icons/fi';

/* ── Animated counter hook ── */
const useCountUp = (end, duration = 1200) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!end) return;
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [end, duration]);
  return count;
};

/* ── Progress ring SVG ── */
const ProgressRing = ({ progress, color, size = 52, strokeWidth = 3 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;
  return (
    <svg className="progress-ring" width={size} height={size}>
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={strokeWidth} />
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" />
    </svg>
  );
};

const statConfig = [
  { key: 'eligibleDrives', label: 'Eligible Drives', icon: <FiTarget className="w-5 h-5" />, color: 'from-electric to-cyan', ringColor: '#3b82f6', maxVal: 50 },
  { key: 'totalApplied', label: 'Applied', icon: <FiBriefcase className="w-5 h-5" />, color: 'from-violet to-purple-400', ringColor: '#8b5cf6', maxVal: 30 },
  { key: 'shortlistedCount', label: 'Shortlisted', icon: <FiCheckCircle className="w-5 h-5" />, color: 'from-emerald to-green-400', ringColor: '#10b981', maxVal: 20 },
  { key: 'rejectedCount', label: 'Learning Exp.', icon: <FiXCircle className="w-5 h-5" />, color: 'from-amber-500 to-orange-500', ringColor: '#f59e0b', maxVal: 20 },
];

const StatCard = ({ config, value, index }) => {
  const count = useCountUp(value, 1000 + index * 200);
  const progress = Math.min(100, (value / config.maxVal) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1, type: 'spring', stiffness: 200 }}
      whileHover={{ scale: 1.05, y: -4, transition: { duration: 0.2 } }}
      className="glass-premium p-6 text-center cursor-default group"
      style={{ perspective: '600px' }}
    >
      {/* Icon with progress ring */}
      <div className="relative inline-flex items-center justify-center mb-3">
        <ProgressRing progress={progress} color={config.ringColor} />
        <div className={`absolute inset-0 flex items-center justify-center`}>
          <div className={`p-2 rounded-xl bg-gradient-to-r ${config.color} text-white shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
            {config.icon}
          </div>
        </div>
      </div>

      {/* Animated count */}
      <div className="text-3xl font-heading font-bold text-white font-mono tabular-nums">
        {count}
      </div>
      <p className="text-gray-400 text-sm mt-1">{config.label}</p>
    </motion.div>
  );
};

const StatCards = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statConfig.map((config, index) => (
        <StatCard key={config.key} config={config} value={stats?.[config.key] ?? 0} index={index} />
      ))}
    </div>
  );
};

export default StatCards;
