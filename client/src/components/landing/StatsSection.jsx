import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const stats = [
  { label: 'Students Placed', value: 5000, suffix: '+' },
  { label: 'Partner Companies', value: 200, suffix: '+' },
  { label: 'Drives Conducted', value: 800, suffix: '+' },
  { label: 'Placement Rate', value: 92, suffix: '%' },
];

const AnimatedCounter = ({ target, suffix, inView }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 2000;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else { setCount(Math.floor(start)); }
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target]);

  return <span className="font-mono">{count.toLocaleString()}{suffix}</span>;
};

const StatsSection = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.3 });

  return (
    <section className="relative z-10 py-20 px-4" ref={ref}>
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={inView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: index * 0.15, type: 'spring', stiffness: 200 }}
              className="glass-card text-center"
            >
              <div className="text-4xl md:text-5xl font-heading font-bold gradient-text mb-2">
                <AnimatedCounter target={stat.value} suffix={stat.suffix} inView={inView} />
              </div>
              <p className="text-gray-400 text-sm">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
