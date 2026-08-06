import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMic, FiVideo, FiSend, FiPlayCircle, FiXCircle, FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Navbar from '../components/common/Navbar';
import { coachingService } from '../services/api';

const MockInterviewRoom = () => {
  const navigate = useNavigate();
  const [sessionActive, setSessionActive] = useState(false);
  const [attemptId, setAttemptId] = useState(null);
  const [chat, setChat] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [jobRole, setJobRole] = useState('Software Engineer');
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat]);

  const startInterview = async () => {
    setLoading(true);
    try {
      const res = await coachingService.startInterview({ jobRole, interviewType: 'TECHNICAL' });
      setAttemptId(res.data.id);
      setQuestions(res.data.questions || []);
      setCurrentIndex(0);
      setSessionActive(true);
      
      const firstQ = res.data.questions?.[0]?.question || 'Can you tell me about yourself?';
      
      setChat([
        { sender: 'AI', text: `Hello! I am your AI Interviewer. We will be conducting a mock interview for the ${jobRole} role today. Let's start.` },
        { sender: 'AI', text: firstQ }
      ]);
    } catch (err) {
      toast.error('Failed to start interview');
    } finally {
      setLoading(false);
    }
  };

  const [feedbackData, setFeedbackData] = useState(null);

  const endInterview = async () => {
    if (!attemptId) return;
    setLoading(true);
    try {
      const res = await coachingService.completeInterview(attemptId);
      setFeedbackData(res.data);
      toast.success('Interview Completed! Feedback generated.');
      setSessionActive(false);
      setAttemptId(null);
      setQuestions([]);
      setChat([]);
    } catch (err) {
      toast.error('Failed to complete interview');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e) => {
    e?.preventDefault();
    if (!input.trim() || !attemptId || !questions.length) return;

    const userText = input;
    const currentQ = questions[currentIndex];
    
    setInput('');
    setChat(prev => [...prev, { sender: 'USER', text: userText }]);

    try {
      await coachingService.submitAnswer(attemptId, { questionId: currentQ.id, answerText: userText });
      
      const nextIndex = currentIndex + 1;
      if (nextIndex < questions.length) {
        setCurrentIndex(nextIndex);
        setChat(prev => [...prev, { sender: 'AI', text: questions[nextIndex].question }]);
      } else {
        setChat(prev => [...prev, { sender: 'AI', text: 'Thank you. The interview has concluded.' }]);
        toast.success('Interview Concluded. Analyzing results...');
        setTimeout(endInterview, 3000);
      }
    } catch (err) {
      toast.error('Failed to send answer');
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 relative flex flex-col">
      <Navbar />
      
      {!sessionActive ? (
        feedbackData ? (
          <main className="flex-1 flex flex-col items-center justify-center pt-20 px-4 relative z-10">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-premium p-8 max-w-2xl w-full text-center text-white">
              <div className="w-20 h-20 bg-gradient-to-tr from-green-500 to-cyan rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/20">
                <span className="text-3xl font-bold">{feedbackData.overallScore ?? 'N/A'}</span>
              </div>
              <h1 className="text-2xl font-heading font-bold mb-6">Interview Completed!</h1>
                <div className="space-y-4 text-left mt-6">
                  {feedbackData.feedback?.strengths?.length > 0 && (
                    <div className="bg-navy-900/50 p-6 rounded-xl border border-white/10">
                      <h3 className="text-lg font-bold text-green-400 mb-3 flex items-center gap-2">
                        <FiCheckCircle /> Strengths
                      </h3>
                      <ul className="space-y-2">
                        {feedbackData.feedback.strengths.map((str, i) => (
                          <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                            <span className="text-green-400 mt-1">•</span> {str}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {feedbackData.feedback?.weaknesses?.length > 0 && (
                    <div className="bg-navy-900/50 p-6 rounded-xl border border-white/10">
                      <h3 className="text-lg font-bold text-amber-400 mb-3 flex items-center gap-2">
                        <FiAlertTriangle /> Areas for Improvement
                      </h3>
                      <ul className="space-y-2">
                        {feedbackData.feedback.weaknesses.map((wk, i) => (
                          <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                            <span className="text-amber-400 mt-1">•</span> {wk}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {(!feedbackData.feedback?.strengths?.length && !feedbackData.feedback?.weaknesses?.length) && (
                    <div className="bg-navy-900/50 p-6 rounded-xl border border-white/10 text-center text-gray-400 text-sm">
                      Detailed feedback is not available for this session.
                    </div>
                  )}
                </div>
              <button onClick={() => setFeedbackData(null)} className="btn-primary-glow px-8 py-3 font-semibold">
                Take Another Interview
              </button>
            </motion.div>
          </main>
        ) : (
          <main className="flex-1 flex flex-col items-center justify-center pt-20 px-4 relative z-10">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="glass-premium p-8 max-w-md w-full text-center">
              <div className="w-20 h-20 bg-gradient-to-tr from-electric to-cyan rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-electric/20">
                <FiPlayCircle className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-2xl font-heading font-bold text-white mb-2">AI Mock Interview</h1>
              <p className="text-gray-400 text-sm mb-8">Practice your interview skills with our intelligent conversational AI.</p>
              
              <div className="mb-6 text-left">
                <label className="input-label text-center block mb-2">Target Role</label>
                <input type="text" className="input-field text-center" value={jobRole} onChange={e => setJobRole(e.target.value)} />
              </div>

              <button onClick={startInterview} disabled={loading} className="btn-primary-glow w-full !py-3 font-semibold text-lg">
                {loading ? 'Connecting...' : 'Start Interview'}
              </button>
              <button onClick={() => navigate('/student/dashboard')} className="mt-4 text-gray-500 hover:text-white text-sm transition-colors">
                Cancel
              </button>
            </motion.div>
          </main>
        )
      ) : (
        <main className="flex-1 pt-20 pb-4 px-4 flex flex-col max-w-4xl mx-auto w-full relative z-10 h-screen">
          <div className="flex justify-between items-center mb-4 bg-navy-900/50 p-4 rounded-xl border border-white/5 backdrop-blur-md">
            <div>
              <h2 className="text-lg font-heading font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> Live Mock Interview
              </h2>
              <p className="text-xs text-gray-400">Role: {jobRole}</p>
            </div>
            <button onClick={endInterview} className="px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-sm transition-colors flex items-center gap-2">
              <FiXCircle /> End Session
            </button>
          </div>

          <div className="flex-1 glass-premium rounded-2xl mb-4 overflow-y-auto p-4 space-y-4 shadow-inner custom-scrollbar">
            <AnimatePresence>
              {chat.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex ${msg.sender === 'USER' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] p-4 rounded-2xl ${
                    msg.sender === 'USER' 
                      ? 'bg-electric text-white rounded-br-sm' 
                      : 'bg-navy-800 border border-white/10 text-gray-200 rounded-bl-sm'
                  }`}>
                    {msg.sender === 'AI' && <div className="text-[10px] uppercase font-bold text-gray-500 mb-1">AI Interviewer</div>}
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={chatEndRef} />
          </div>

          <div className="glass-static p-2 rounded-xl flex items-center gap-2">
            <button className="p-3 text-gray-400 hover:text-white transition-colors bg-navy-800 rounded-lg"><FiMic /></button>
            <button className="p-3 text-gray-400 hover:text-white transition-colors bg-navy-800 rounded-lg"><FiVideo /></button>
            <form onSubmit={sendMessage} className="flex-1 flex gap-2">
              <input 
                type="text" 
                className="flex-1 bg-navy-900 border border-white/10 rounded-lg px-4 text-white focus:outline-none focus:border-electric transition-colors"
                placeholder="Type your answer..."
                value={input}
                onChange={e => setInput(e.target.value)}
              />
              <button type="submit" disabled={!input.trim()} className="bg-electric text-white p-3 rounded-lg hover:bg-electric-light transition-colors disabled:opacity-50">
                <FiSend />
              </button>
            </form>
          </div>
        </main>
      )}
    </div>
  );
};

export default MockInterviewRoom;
