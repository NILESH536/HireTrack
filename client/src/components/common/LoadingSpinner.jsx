import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = () => (
  <div className="min-h-screen bg-navy-950 flex items-center justify-center">
    <motion.div
      className="flex flex-col items-center gap-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Orbital rings */}
      <div className="relative w-20 h-20">
        {/* Outer ring */}
        <motion.div
          className="absolute inset-0 border-2 border-electric/20 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        >
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-electric shadow-lg shadow-electric/50" />
        </motion.div>

        {/* Middle ring */}
        <motion.div
          className="absolute inset-2 border-2 border-cyan/20 rounded-full"
          animate={{ rotate: -360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-cyan shadow-lg shadow-cyan/50" />
        </motion.div>

        {/* Inner ring */}
        <motion.div
          className="absolute inset-4 border-2 border-violet/20 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
        >
          <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-violet shadow-lg shadow-violet/50" />
        </motion.div>

        {/* Center logo */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="w-8 h-8 rounded-lg bg-gradient-to-r from-electric to-cyan flex items-center justify-center"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="text-white font-bold text-sm">H</span>
          </motion.div>
        </div>
      </div>

      {/* Loading text */}
      <div className="flex items-center gap-1 text-gray-400 font-body text-sm">
        <span>Loading</span>
        <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity, times: [0, 0.5, 1] }}>.</motion.span>
        <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity, times: [0, 0.5, 1], delay: 0.2 }}>.</motion.span>
        <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity, times: [0, 0.5, 1], delay: 0.4 }}>.</motion.span>
      </div>
    </motion.div>
  </div>
);

export default LoadingSpinner;
