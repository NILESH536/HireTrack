import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FiUserPlus, FiSearch, FiAward } from 'react-icons/fi';

const steps = [
  { icon: <FiUserPlus className="w-8 h-8" />, title: "Register & Set Up", description: "Students register with their academic profile. Companies register and await admin approval. The placement cell manages everything.", color: "from-electric to-cyan" },
  { icon: <FiSearch className="w-8 h-8" />, title: "Discover & Apply", description: "Students browse eligible drives filtered by CGPA and branch. Apply with one click and track every stage in real-time.", color: "from-cyan to-green-500" },
  { icon: <FiAward className="w-8 h-8" />, title: "Get Placed", description: "Companies shortlist, interview, and select candidates. AI guides students throughout. Results are announced instantly.", color: "from-green-500 to-emerald-400" },
];

const HowItWorks = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 });

  return (
    <section className="relative z-10 py-20 px-4" ref={ref}>
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-heading font-bold mb-4">How It <span className="gradient-text">Works</span></h2>
          <p className="text-xl text-gray-400">Three simple steps to transform your placement process</p>
        </motion.div>

        <div className="relative">
          {/* Connecting Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-electric via-cyan to-green-500 hidden md:block" />

          <div className="space-y-16">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.3 }}
                className={`flex items-center gap-8 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} flex-col`}
              >
                <div className="flex-1 glass-card">
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${step.color} mb-4`}>{step.icon}</div>
                  <h3 className="text-2xl font-heading font-bold mb-2">{step.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{step.description}</p>
                </div>

                {/* Step Number */}
                <div className="relative z-10 w-14 h-14 rounded-full bg-gradient-to-r from-electric to-cyan flex items-center justify-center text-xl font-bold font-heading shrink-0">
                  {index + 1}
                </div>

                <div className="flex-1 hidden md:block" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
