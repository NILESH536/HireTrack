import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiBookOpen, FiArrowLeft, FiCheckCircle, FiLock } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Navbar from '../components/common/Navbar';
import AuroraBackground from '../components/backgrounds/AuroraBackground';
import { coachingService } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const LearningRoadmap = () => {
  const navigate = useNavigate();
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const fetchRoadmap = async () => {
    try {
      const res = await coachingService.getRoadmap();
      setRoadmap(res.data);
    } catch (err) {
      toast.error('Failed to load learning roadmap');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-navy-950 relative">
      <AuroraBackground />
      <Navbar />
      <main className="relative max-w-5xl mx-auto px-4 py-8 pt-24">
        <button onClick={() => navigate('/student/dashboard')} className="flex items-center gap-2 text-gray-400 hover:text-electric transition-colors mb-6">
          <FiArrowLeft /> Back to Dashboard
        </button>

        <div className="mb-12 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/20">
            <FiBookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-heading font-bold text-white mb-2">Personalized Learning Roadmap</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Based on your resume and recent interview performance, our AI has generated a customized path to help you master the skills needed for your target roles.
          </p>
        </div>

        {!roadmap || !roadmap.roadmapData ? (
          <div className="glass-premium p-12 text-center border border-white/5">
            <h3 className="text-xl font-semibold text-white mb-2">No Roadmap Generated</h3>
            <p className="text-gray-400 mb-6">Complete a mock interview or update your resume to generate a personalized learning roadmap.</p>
            <button onClick={() => navigate('/student/mock-interview')} className="btn-primary">
              Take a Mock Interview
            </button>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-electric via-purple-500 to-navy-900 transform -translate-x-1/2 opacity-30 rounded-full" />
            
            <div className="space-y-12 relative z-10">
              {roadmap.roadmapData.map((node, index) => {
                const isEven = index % 2 === 0;
                // Since this is a generated roadmap without tracked status yet, we assume first week is active, rest is locked/pending
                const isCompleted = false;
                const isLocked = index > 0;
                
                return (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex flex-col md:flex-row items-center gap-6 ${isEven ? 'md:flex-row-reverse' : ''}`}
                  >
                    {/* Content Box */}
                    <div className="w-full md:w-1/2 flex justify-end md:px-8">
                      <div className={`w-full max-w-sm glass-premium p-6 rounded-2xl border ${
                        isCompleted ? 'border-green-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 
                        isLocked ? 'border-white/5 opacity-50' : 
                        'border-electric/30 shadow-[0_0_15px_rgba(59,130,246,0.1)]'
                      }`}>
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="text-lg font-bold text-white">Week {node.week}</h3>
                          {isCompleted ? <FiCheckCircle className="text-green-400 text-xl" /> : 
                           isLocked ? <FiLock className="text-gray-500 text-xl" /> : null}
                        </div>
                        <p className="text-sm text-gray-400 mb-4">{node.goals?.join(', ')}</p>
                        
                        <div className="space-y-2">
                          <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Topics:</h4>
                          <p className="text-sm text-gray-400">{node.topics?.join(', ')}</p>
                          <h4 className="text-xs font-semibold text-gray-300 uppercase tracking-wider mt-4">Resources:</h4>
                          <ul className="space-y-1">
                            {node.resources?.map((res, rIdx) => (
                              <li key={rIdx} className="text-xs text-electric hover:underline cursor-pointer flex items-center gap-2">
                                <div className="w-1 h-1 rounded-full bg-electric" /> {res}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        {!isCompleted && !isLocked && (
                          <button className="mt-6 w-full py-2 bg-electric/10 text-electric hover:bg-electric/20 rounded-lg text-sm font-semibold transition-colors border border-electric/20">
                            Start Module
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Center Node */}
                    <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 w-16 h-16 items-center justify-center">
                      <div className={`w-8 h-8 rounded-full border-4 border-navy-950 flex items-center justify-center ${
                        isCompleted ? 'bg-green-500' : isLocked ? 'bg-gray-600' : 'bg-electric animate-pulse shadow-[0_0_15px_rgba(59,130,246,0.5)]'
                      }`}>
                        <span className="text-navy-950 font-bold text-xs">{index + 1}</span>
                      </div>
                    </div>
                    
                    {/* Empty Space for layout */}
                    <div className="hidden md:block w-1/2" />
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default LearningRoadmap;
