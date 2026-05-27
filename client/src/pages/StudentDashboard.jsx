import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useAuth } from '../hooks/useAuth';
import { studentService } from '../services/api';
import Navbar from '../components/common/Navbar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatCards from '../components/student/StatCards';
import ApplicationTracker from '../components/student/ApplicationTracker';
import SkillRadar from '../components/student/SkillRadar';
import InterviewTimeline from '../components/student/InterviewTimeline';
import CareerGuide from '../components/student/CareerGuide';
import ResumeUploader from '../components/student/ResumeUploader';
import ConstellationBackground from '../components/backgrounds/ConstellationBackground';
import { getGreeting } from '../utils/helpers';
import { FiMessageCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';

/* ── Section with scroll reveal ── */
const RevealSection = ({ children, delay = 0, className = '' }) => {
  const [ref, inView] = useInView({ threshold: 0.1, triggerOnce: true });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, type: 'spring', stiffness: 100 }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const StudentDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);

  const fetchData = async () => {
    try {
      const res = await studentService.getDashboard();
      setData(res.data);
    } catch (error) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-navy-950 relative">
      {/* Animated constellation background */}
      <ConstellationBackground />

      <Navbar />
      <main className="relative max-w-7xl mx-auto px-4 py-8 pt-24">
        {/* Welcome Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className={`glass-premium p-8 rounded-2xl mb-8 relative overflow-hidden ${data?.student?.placed ? 'border-green-500/40' : ''}`}
        >
          {/* Decorative orbs inside banner */}
          <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-electric/10 blur-3xl" />
          <div className="absolute -bottom-16 -left-16 w-32 h-32 rounded-full bg-cyan/10 blur-3xl" />

          {data?.student?.placed ? (
            <div className="text-center relative z-10">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.3 }}
                className="text-6xl mb-4"
              >
                🎉
              </motion.div>
              <h1 className="text-4xl font-heading font-bold gradient-text mb-2">Congratulations, {user?.name}!</h1>
              <p className="text-xl text-green-400">Placed at {data?.placedCompany}</p>

              {/* Celebration particles */}
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 rounded-full bg-green-400"
                    initial={{ x: '50%', y: '50%', opacity: 0 }}
                    animate={{
                      x: `${20 + Math.random() * 60}%`,
                      y: `${10 + Math.random() * 80}%`,
                      opacity: [0, 1, 0],
                      scale: [0, 1.5, 0],
                    }}
                    transition={{ duration: 2, delay: 0.5 + i * 0.2, repeat: Infinity, repeatDelay: 3 }}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="relative z-10">
              <h1 className="text-3xl font-heading font-bold">
                Good {getGreeting()}, <span className="gradient-text">{user?.name}</span>
              </h1>
              <p className="text-gray-400 mt-2 text-lg">
                Your placement journey is in your hands. Keep pushing forward.
              </p>
            </div>
          )}
        </motion.div>

        {/* Stats */}
        <RevealSection>
          <StatCards stats={data?.stats} />
        </RevealSection>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-2 space-y-8">
            <RevealSection delay={0.1}>
              <ApplicationTracker applications={data?.applications} />
            </RevealSection>
            <RevealSection delay={0.2}>
              <InterviewTimeline interviews={data?.interviews} />
            </RevealSection>
            <RevealSection delay={0.3}>
              <ResumeUploader onUpload={fetchData} />
            </RevealSection>
          </div>
          <div className="space-y-8">
            <RevealSection delay={0.15}>
              <SkillRadar studentSkills={data?.student?.skills} targetRole={data?.student?.careerGoal} />
            </RevealSection>
          </div>
        </div>
      </main>

      {/* Floating AI Chat Bot FAB */}
      {!chatOpen && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setChatOpen(true)}
          className="fab"
          title="AI Career Assistant"
        >
          <FiMessageCircle className="w-6 h-6" />
          <motion.div
            className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-navy-950"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.button>
      )}

      {/* Career Guide Chat Panel */}
      <CareerGuide
        student={data?.student}
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
      />
    </div>
  );
};

export default StudentDashboard;
