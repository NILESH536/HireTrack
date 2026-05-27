import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import ParticleBackground from '../components/landing/ParticleBackground';
import FeatureCards from '../components/landing/FeatureCards';
import HowItWorks from '../components/landing/HowItWorks';
import StatsSection from '../components/landing/StatsSection';
import CTASection from '../components/landing/CTASection';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const LandingPage = () => {
  const navigate = useNavigate();
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.8]);

  return (
    <div className="relative min-h-screen">
      <ParticleBackground />
      <Navbar />

      {/* Hero */}
      <motion.section style={{ opacity: heroOpacity, scale: heroScale }} className="relative min-h-screen flex items-center justify-center px-4">
        <div className="max-w-7xl mx-auto text-center relative z-10 pt-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full mb-8">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-sm text-gray-300">AI-Powered Campus Placements</span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="text-5xl md:text-7xl lg:text-8xl font-heading font-bold mb-6">
            <span className="gradient-text">Your Career,</span><br /><span className="text-white">Digitally Accelerated</span>
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }} className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-12">
            The all-in-one platform that connects students, companies, and placement cells. Powered by AI to guide your career journey.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.6 }} className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => navigate('/register')} className="btn-primary text-lg">
              Get Started Free
              <svg className="w-5 h-5 ml-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </button>
            <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="btn-secondary text-lg">Explore Features</button>
          </motion.div>

          {/* Dashboard Mockup */}
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.8 }} className="mt-16 glass p-2 rounded-2xl max-w-5xl mx-auto">
            <div className="bg-navy-800 rounded-xl p-4">
              <div className="flex gap-2 mb-4"><div className="w-3 h-3 rounded-full bg-red-500" /><div className="w-3 h-3 rounded-full bg-yellow-500" /><div className="w-3 h-3 rounded-full bg-green-500" /></div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[1,2,3,4].map(i => (<div key={i} className="glass p-4 rounded-lg"><div className="h-4 bg-electric/20 rounded w-3/4 mb-3" /><div className="h-8 bg-electric/10 rounded w-1/2 mb-2" /><div className="h-3 bg-white/5 rounded w-full" /></div>))}
              </div>
              <div className="mt-4 glass p-4 rounded-lg"><div className="h-4 bg-electric/20 rounded w-1/4 mb-3" /><div className="space-y-2">{[1,2,3].map(i => (<div key={i} className="flex gap-3 items-center"><div className="w-2 h-2 rounded-full bg-electric" /><div className="h-3 bg-white/5 rounded flex-1" /><div className="h-3 bg-green-500/20 rounded w-16" /></div>))}</div></div>
            </div>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }} className="mt-12 mb-8">
            <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 2, repeat: Infinity }} className="w-6 h-10 border-2 border-white/20 rounded-full flex justify-center mx-auto">
              <div className="w-1.5 h-3 bg-electric rounded-full mt-2" />
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      <section id="features"><FeatureCards /></section>
      <section id="how-it-works"><HowItWorks /></section>
      <StatsSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default LandingPage;
