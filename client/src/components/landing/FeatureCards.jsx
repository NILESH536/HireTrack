import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FiTarget, FiUsers, FiCpu, FiBarChart2, FiMessageSquare, FiShield, FiZap, FiGlobe } from 'react-icons/fi';

const features = [
  { icon: <FiTarget className="w-8 h-8" />, title: "Smart Matching", description: "AI-powered eligibility matching ensures students only see relevant drives based on CGPA and branch.", color: "from-blue-500 to-cyan-500" },
  { icon: <FiUsers className="w-8 h-8" />, title: "Unified Platform", description: "Students, companies, and placement cells collaborate in real-time on a single platform.", color: "from-purple-500 to-pink-500" },
  { icon: <FiCpu className="w-8 h-8" />, title: "AI Career Guide", description: "Personalized Claude AI chatbot analyzes your profile and guides your career decisions.", color: "from-green-500 to-emerald-500" },
  { icon: <FiBarChart2 className="w-8 h-8" />, title: "Live Analytics", description: "Real-time placement statistics with interactive charts for data-driven decisions.", color: "from-orange-500 to-red-500" },
  { icon: <FiMessageSquare className="w-8 h-8" />, title: "Instant Notifications", description: "Email and in-app alerts for every update—never miss a deadline or interview.", color: "from-cyan-500 to-blue-500" },
  { icon: <FiShield className="w-8 h-8" />, title: "Enterprise Security", description: "JWT authentication, role-based access, and encrypted data for complete protection.", color: "from-red-500 to-pink-500" },
  { icon: <FiZap className="w-8 h-8" />, title: "Lightning Fast", description: "Optimized React frontend with Node.js backend for sub-second response times.", color: "from-yellow-500 to-orange-500" },
  { icon: <FiGlobe className="w-8 h-8" />, title: "Scalable Architecture", description: "Docker containers, Nginx load balancing, and CI/CD ready for production.", color: "from-indigo-500 to-purple-500" },
];

const FeatureCards = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section className="relative z-10 py-20 px-4" ref={ref}>
      <div className="max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }} className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-heading font-bold mb-4">Why <span className="gradient-text">HireTrack</span>?</h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">Everything you need to streamline campus placements, from AI matching to real-time analytics.</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div key={index} initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: index * 0.1 }}
              className="glass-card group cursor-pointer" whileHover={{ scale: 1.05, rotateX: 5, rotateY: 5 }} style={{ transformStyle: 'preserve-3d' }}>
              <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${feature.color} mb-4 group-hover:shadow-lg transition-all duration-300`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-heading font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureCards;
