import React, { useState, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiLogIn, FiUser, FiBriefcase, FiShield } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';
import { getDashboardRoute } from '../utils/helpers';
import NeuralWaveBackground from '../components/backgrounds/NeuralWaveBackground';
import AnimatedLogo from '../components/common/AnimatedLogo';
import toast from 'react-hot-toast';

/* ── 3D tilt hook ── */
const useTilt = () => {
  const ref = useRef(null);

  const handleMouseMove = useCallback((e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    ref.current.style.transform = `perspective(1000px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) scale3d(1.02, 1.02, 1.02)`;
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (!ref.current) return;
    ref.current.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg) scale3d(1, 1, 1)';
  }, []);

  return { ref, handleMouseMove, handleMouseLeave };
};

/* ── Stagger children animation ── */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(null);
  const tilt = useTilt();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate(getDashboardRoute(user.role));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const demoCreds = [
    { label: 'Admin', email: 'admin@hirectrack.com', pass: 'admin123', icon: <FiShield className="w-3.5 h-3.5" />, color: 'from-amber-500 to-orange-500' },
    { label: 'Student', email: 'rahul@student.com', pass: 'student123', icon: <FiUser className="w-3.5 h-3.5" />, color: 'from-electric to-cyan' },
    { label: 'Company', email: 'hr@techcorp.com', pass: 'company123', icon: <FiBriefcase className="w-3.5 h-3.5" />, color: 'from-violet to-purple-400' },
  ];

  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center px-4 relative">
      <NeuralWaveBackground />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <motion.div variants={itemVariants} className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <AnimatedLogo size="md" linkTo="/" />
          </div>
          <h1 className="text-2xl font-heading font-bold text-white">Welcome Back</h1>
          <p className="text-gray-400 mt-2">Sign in to continue your journey</p>
        </motion.div>

        {/* Form Card with 3D tilt */}
        <motion.div variants={itemVariants}>
          <div
            ref={tilt.ref}
            onMouseMove={tilt.handleMouseMove}
            onMouseLeave={tilt.handleMouseLeave}
            className="transition-transform duration-200 ease-out"
            style={{ transformStyle: 'preserve-3d' }}
          >
            <form onSubmit={handleSubmit} className="glass-premium shimmer-border p-8 space-y-6">
              {/* Email Field */}
              <div>
                <label className="input-label">Email</label>
                <div className="relative">
                  <FiMail className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-300 ${focused === 'email' ? 'text-electric' : 'text-gray-500'}`} />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    onFocus={() => setFocused('email')}
                    onBlur={() => setFocused(null)}
                    className="input-field pl-11"
                    placeholder="you@example.com"
                    required
                    id="login-email"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="input-label">Password</label>
                <div className="relative">
                  <FiLock className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-300 ${focused === 'password' ? 'text-electric' : 'text-gray-500'}`} />
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    onFocus={() => setFocused('password')}
                    onBlur={() => setFocused(null)}
                    className="input-field pl-11"
                    placeholder="••••••••"
                    required
                    id="login-password"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-primary w-full flex items-center justify-center gap-2 !py-4"
                id="login-submit"
              >
                {loading ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </div>
                ) : (
                  <><FiLogIn className="w-5 h-5" /> Sign In</>
                )}
              </motion.button>

              {/* Demo Credentials */}
              <div className="border-t border-white/5 pt-5">
                <p className="text-xs text-gray-500 text-center mb-3 uppercase tracking-wider">Quick Demo Access</p>
                <div className="grid grid-cols-3 gap-2">
                  {demoCreds.map((cred) => (
                    <motion.button
                      key={cred.label}
                      type="button"
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setForm({ email: cred.email, password: cred.pass })}
                      className="group flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl bg-navy-800/60 border border-white/5 hover:border-electric/30 transition-all duration-300"
                    >
                      <div className={`p-1.5 rounded-lg bg-gradient-to-r ${cred.color} text-white`}>
                        {cred.icon}
                      </div>
                      <span className="text-xs text-gray-400 group-hover:text-white transition-colors">{cred.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            </form>
          </div>
        </motion.div>

        <motion.p variants={itemVariants} className="text-center text-gray-400 text-sm mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-electric hover:text-electric-light font-medium transition-colors">
            Sign up
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
};

export default LoginPage;
