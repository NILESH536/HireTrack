import React, { useState, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiLock, FiUser, FiBookOpen, FiGlobe, FiBriefcase, FiCheck, FiArrowRight, FiArrowLeft } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';
import { BRANCHES } from '../utils/constants';
import { getDashboardRoute } from '../utils/helpers';
import DNAHelixBackground from '../components/backgrounds/DNAHelixBackground';
import AnimatedLogo from '../components/common/AnimatedLogo';
import toast from 'react-hot-toast';

/* Background animation is now DNAHelixBackground */

/* ── Animated Step Indicator ── */
const StepIndicator = ({ currentStep, totalSteps }) => (
  <div className="flex items-center justify-center gap-2 mb-8">
    {Array.from({ length: totalSteps }, (_, i) => {
      const step = i + 1;
      const isActive = step === currentStep;
      const isDone = step < currentStep;
      return (
        <React.Fragment key={step}>
          <motion.div
            animate={{
              scale: isActive ? 1.2 : 1,
              backgroundColor: isDone ? '#3b82f6' : isActive ? '#3b82f6' : 'rgba(255,255,255,0.1)',
            }}
            className="relative flex items-center justify-center"
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500 ${
              isDone ? 'bg-electric text-white' : isActive ? 'bg-electric/20 text-electric border-2 border-electric' : 'bg-white/5 text-gray-500 border border-white/10'
            }`}>
              {isDone ? <FiCheck className="w-4 h-4" /> : step}
            </div>
            {isActive && (
              <motion.div
                layoutId="step-ring"
                className="absolute inset-0 rounded-full border-2 border-electric"
                initial={false}
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
          </motion.div>
          {i < totalSteps - 1 && (
            <div className="w-16 h-0.5 rounded-full overflow-hidden bg-white/5">
              <motion.div
                animate={{ width: isDone ? '100%' : '0%' }}
                transition={{ duration: 0.5 }}
                className="h-full bg-gradient-to-r from-electric to-cyan rounded-full"
              />
            </div>
          )}
        </React.Fragment>
      );
    })}
  </div>
);

/* ── Skill Pills Input ── */
const SkillPillsInput = ({ value, onChange }) => {
  const [inputVal, setInputVal] = useState('');
  const skills = value ? value.split(',').map(s => s.trim()).filter(Boolean) : [];

  const addSkill = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const skill = inputVal.trim().replace(',', '');
      if (skill && !skills.includes(skill)) {
        const newSkills = [...skills, skill].join(', ');
        onChange(newSkills);
      }
      setInputVal('');
    }
  };

  const removeSkill = (skillToRemove) => {
    const newSkills = skills.filter(s => s !== skillToRemove).join(', ');
    onChange(newSkills);
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        <AnimatePresence>
          {skills.map(skill => (
            <motion.span
              key={skill}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-electric/15 text-electric text-xs font-medium border border-electric/20"
            >
              {skill}
              <button type="button" onClick={() => removeSkill(skill)} className="hover:text-red-400 transition-colors">×</button>
            </motion.span>
          ))}
        </AnimatePresence>
      </div>
      <input
        type="text"
        value={inputVal}
        onChange={e => setInputVal(e.target.value)}
        onKeyDown={addSkill}
        className="input-field"
        placeholder="Type a skill and press Enter"
      />
    </div>
  );
};

/* ── 3D tilt hook ── */
const useTilt = () => {
  const ref = useRef(null);
  const handleMouseMove = useCallback((e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    ref.current.style.transform = `perspective(1200px) rotateY(${x * 5}deg) rotateX(${-y * 5}deg)`;
  }, []);
  const handleMouseLeave = useCallback(() => {
    if (!ref.current) return;
    ref.current.style.transform = 'perspective(1200px) rotateY(0deg) rotateX(0deg)';
  }, []);
  return { ref, handleMouseMove, handleMouseLeave };
};

const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
};

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: '', password: '', name: '', role: 'STUDENT',
    branch: 'Computer Science', cgpa: '', skills: '', careerGoal: '',
    industry: '', website: '', description: '',
  });
  const tilt = useTilt();

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const goTo = (s) => { setDirection(s > step ? 1 : -1); setStep(s); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = { ...form };
      if (form.role === 'STUDENT') {
        data.cgpa = parseFloat(form.cgpa);
        data.skills = form.skills.split(',').map(s => s.trim()).filter(Boolean);
      }
      const result = await register(data);
      toast.success(result.message);
      navigate(getDashboardRoute(form.role));
    } catch (error) {
      if (error.response?.data?.errors?.length > 0) {
        toast.error(error.response.data.errors[0].message);
      } else {
        toast.error(error.response?.data?.message || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = () => {
    const p = form.password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 6) s++;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  };

  const strengthLevel = passwordStrength();
  const strengthColors = ['bg-red-500', 'bg-red-500', 'bg-amber-500', 'bg-amber-500', 'bg-green-500', 'bg-green-500'];
  const strengthLabels = ['', 'Weak', 'Fair', 'Fair', 'Strong', 'Very Strong'];

  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center px-4 py-12 relative">
      <DNAHelixBackground />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
        className="relative z-10 w-full max-w-lg"
      >
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <AnimatedLogo size="md" linkTo="/" />
          </div>
          <h1 className="text-2xl font-heading font-bold text-white">Create Account</h1>
          <p className="text-gray-400 mt-1">Join the placement revolution</p>
        </div>

        {/* Step Indicator */}
        <StepIndicator currentStep={step} totalSteps={2} />

        {/* Form Card */}
        <div
          ref={tilt.ref}
          onMouseMove={tilt.handleMouseMove}
          onMouseLeave={tilt.handleMouseLeave}
          className="transition-transform duration-200 ease-out"
          style={{ transformStyle: 'preserve-3d' }}
        >
          <form onSubmit={handleSubmit} className="glass-premium shimmer-border p-8">
            <AnimatePresence mode="wait" custom={direction}>
              {step === 1 && (
                <motion.div
                  key="step1"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  className="space-y-5"
                >
                  {/* Role Selection */}
                  <div>
                    <label className="input-label">I am a...</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: 'STUDENT', icon: <FiBookOpen className="w-5 h-5" />, label: 'Student', desc: 'Looking for opportunities', gradient: 'from-electric to-cyan' },
                        { value: 'COMPANY', icon: <FiBriefcase className="w-5 h-5" />, label: 'Company', desc: 'Hiring talent', gradient: 'from-violet to-purple-400' },
                      ].map(r => (
                        <motion.button
                          key={r.value}
                          type="button"
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => update('role', r.value)}
                          className={`relative flex flex-col items-center gap-2 p-5 rounded-xl border-2 transition-all duration-300 ${
                            form.role === r.value
                              ? 'border-electric bg-electric/10 text-electric'
                              : 'border-white/10 text-gray-400 hover:border-white/20 hover:bg-white/5'
                          }`}
                        >
                          {form.role === r.value && (
                            <motion.div layoutId="role-indicator" className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-electric flex items-center justify-center">
                              <FiCheck className="w-3 h-3 text-white" />
                            </motion.div>
                          )}
                          <div className={`p-2 rounded-lg ${form.role === r.value ? `bg-gradient-to-r ${r.gradient} text-white` : 'bg-white/5'}`}>
                            {r.icon}
                          </div>
                          <span className="font-semibold text-sm">{r.label}</span>
                          <span className="text-xs text-gray-500">{r.desc}</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="input-label">Full Name</label>
                    <div className="relative">
                      <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                      <input type="text" value={form.name} onChange={e => update('name', e.target.value)} className="input-field pl-11" placeholder="Your full name" required />
                    </div>
                  </div>

                  <div>
                    <label className="input-label">Email</label>
                    <div className="relative">
                      <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                      <input type="email" value={form.email} onChange={e => update('email', e.target.value)} className="input-field pl-11" placeholder="you@example.com" required />
                    </div>
                  </div>

                  <div>
                    <label className="input-label">Password</label>
                    <div className="relative">
                      <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                      <input type="password" value={form.password} onChange={e => update('password', e.target.value)} className="input-field pl-11" placeholder="Min 6 characters" required minLength={6} />
                    </div>
                    {/* Password Strength Bar */}
                    {form.password && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-2">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strengthLevel ? strengthColors[strengthLevel] : 'bg-white/10'}`} />
                          ))}
                        </div>
                        <p className={`text-xs mt-1 ${strengthLevel <= 2 ? 'text-amber-400' : 'text-green-400'}`}>
                          {strengthLabels[strengthLevel]}
                        </p>
                      </motion.div>
                    )}
                  </div>

                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => goTo(2)}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                    disabled={!form.name || !form.email || form.password.length < 6}
                  >
                    Continue <FiArrowRight className="w-4 h-4" />
                  </motion.button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  className="space-y-5"
                >
                  {form.role === 'STUDENT' ? (
                    <>
                      <div>
                        <label className="input-label">Branch</label>
                        <select value={form.branch} onChange={e => update('branch', e.target.value)} className="select-field">
                          {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                        </select>
                      </div>

                      <div>
                        <label className="input-label">CGPA</label>
                        <div className="flex items-center gap-4">
                          <input
                            type="range"
                            min="0"
                            max="10"
                            step="0.1"
                            value={form.cgpa || 0}
                            onChange={e => update('cgpa', e.target.value)}
                            className="flex-1 h-2 rounded-full appearance-none cursor-pointer"
                            style={{
                              background: `linear-gradient(to right, #3b82f6 0%, #06b6d4 ${(form.cgpa || 0) * 10}%, rgba(255,255,255,0.1) ${(form.cgpa || 0) * 10}%)`,
                            }}
                          />
                          <div className="w-16 text-center">
                            <span className="text-2xl font-heading font-bold text-white">{form.cgpa || '0.0'}</span>
                            <span className="text-xs text-gray-500 block">/10</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="input-label">Skills</label>
                        <SkillPillsInput value={form.skills} onChange={(val) => update('skills', val)} />
                      </div>

                      <div>
                        <label className="input-label">Career Goal</label>
                        <input type="text" value={form.careerGoal} onChange={e => update('careerGoal', e.target.value)} className="input-field" placeholder="e.g. Full Stack Developer" />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label className="input-label">Industry</label>
                        <input type="text" value={form.industry} onChange={e => update('industry', e.target.value)} className="input-field" placeholder="e.g. IT Services" />
                      </div>
                      <div>
                        <label className="input-label">Website</label>
                        <div className="relative">
                          <FiGlobe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                          <input type="url" value={form.website} onChange={e => update('website', e.target.value)} className="input-field pl-11" placeholder="https://company.com" />
                        </div>
                      </div>
                      <div>
                        <label className="input-label">Company Description</label>
                        <textarea value={form.description} onChange={e => update('description', e.target.value)} className="input-field h-24 resize-none" placeholder="Brief description of your company" />
                      </div>
                    </>
                  )}

                  <div className="flex gap-3">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => goTo(1)}
                      className="btn-secondary flex-1 !py-3 flex items-center justify-center gap-2"
                    >
                      <FiArrowLeft className="w-4 h-4" /> Back
                    </motion.button>
                    <motion.button
                      type="submit"
                      disabled={loading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="btn-primary flex-1 !py-3"
                    >
                      {loading ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Creating...
                        </div>
                      ) : (
                        'Create Account'
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </div>

        <p className="text-center text-gray-400 text-sm mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-electric hover:text-electric-light font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
