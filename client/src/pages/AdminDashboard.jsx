import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { FiUsers, FiBriefcase, FiCheckCircle, FiClock, FiTrendingUp, FiActivity, FiCheck, FiX, FiDownload, FiMail } from 'react-icons/fi';
import { adminService } from '../services/api';
import Navbar from '../components/common/Navbar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import MatrixGridBackground from '../components/backgrounds/MatrixGridBackground';
import { useAuth } from '../hooks/useAuth';
import { formatDateTime } from '../utils/helpers';
import toast from 'react-hot-toast';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

/* ── Animated counter ── */
const useCountUp = (end, duration = 1000) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!end && end !== 0) return;
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [end, duration]);
  return count;
};

const StatCard = ({ label, value, icon, color, index, trend }) => {
  const count = useCountUp(value, 800 + index * 100);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, type: 'spring', stiffness: 200 }}
      whileHover={{ scale: 1.05, y: -3 }}
      className="glass-premium p-5 group cursor-default"
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-lg bg-gradient-to-r ${color} text-white shadow-lg group-hover:shadow-xl transition-shadow`}>
          {icon}
        </div>
        {trend && (
          <span className="text-[10px] text-green-400 flex items-center gap-0.5 bg-green-500/10 px-1.5 py-0.5 rounded-full">
            <FiTrendingUp className="w-2.5 h-2.5" />+{trend}%
          </span>
        )}
      </div>
      <div className="text-2xl font-heading font-bold font-mono tabular-nums">{count}</div>
      <p className="text-gray-400 text-xs mt-1">{label}</p>
    </motion.div>
  );
};

/* ── Activity Item ── */
const ActivityItem = ({ act, index }) => (
  <motion.div
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.05 }}
    className="flex items-start gap-3 py-3"
  >
    <div className="relative mt-1.5">
      <div className="w-2 h-2 rounded-full bg-electric" />
      <motion.div
        className="absolute inset-0 rounded-full bg-electric"
        animate={{ scale: [1, 2], opacity: [0.4, 0] }}
        transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
      />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm text-gray-300">
        <strong className="text-white">{act.student?.user?.name}</strong> applied to{' '}
        <strong className="text-electric">{act.drive?.jobRole}</strong> at{' '}
        <strong className="text-white">{act.drive?.company?.user?.name}</strong>
      </p>
      <span className="text-[10px] text-gray-500">{formatDateTime(act.createdAt)}</span>
    </div>
  </motion.div>
);

const AdminDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([adminService.getDashboard(), adminService.getPendingCompanies()])
      .then(([dashRes, pendRes]) => { setData(dashRes.data); setPending(pendRes.data.companies); })
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  }, []);

  const handleApprove = async (id) => {
    try { await adminService.approveCompany(id); setPending(p => p.filter(c => c.id !== id)); toast.success('Approved'); } catch { toast.error('Failed'); }
  };

  const handleReject = async (id) => {
    const reason = prompt('Rejection reason:');
    if (!reason) return;
    try { await adminService.rejectCompany(id, reason); setPending(p => p.filter(c => c.id !== id)); toast.success('Rejected'); } catch { toast.error('Failed'); }
  };

  if (loading) return <LoadingSpinner />;

  const s = data?.stats || {};
  const stats = [
    { label: 'Students', value: s.totalStudents, icon: <FiUsers className="w-4 h-4" />, color: 'from-electric to-cyan' },
    { label: 'Companies', value: s.totalCompanies, icon: <FiBriefcase className="w-4 h-4" />, color: 'from-violet to-purple-400' },
    { label: 'Placed', value: s.placedStudents, icon: <FiCheckCircle className="w-4 h-4" />, color: 'from-emerald to-green-400' },
    { label: 'Drives', value: s.totalDrives, icon: <FiTrendingUp className="w-4 h-4" />, color: 'from-amber-500 to-orange-500' },
    { label: 'Active', value: s.activeDrives, icon: <FiActivity className="w-4 h-4" />, color: 'from-cyan to-blue-500' },
    { label: 'Pending', value: s.pendingCompanies, icon: <FiClock className="w-4 h-4" />, color: 'from-red-500 to-pink-500' },
  ];

  const branchChartData = {
    labels: data?.branchStats?.map(b => b.branch) || [],
    datasets: [
      {
        label: 'Total',
        data: data?.branchStats?.map(b => parseInt(b.total)) || [],
        backgroundColor: 'rgba(59,130,246,0.4)',
        borderColor: '#3b82f6',
        borderWidth: 1,
        borderRadius: 8,
      },
      {
        label: 'Placed',
        data: data?.branchStats?.map(b => parseInt(b.placed || 0)) || [],
        backgroundColor: 'rgba(16,185,129,0.4)',
        borderColor: '#10b981',
        borderWidth: 1,
        borderRadius: 8,
      },
    ],
  };

  const placementDonut = {
    labels: ['Placed', 'Unplaced'],
    datasets: [{
      data: [s.placedStudents || 0, (s.totalStudents || 0) - (s.placedStudents || 0)],
      backgroundColor: ['#10b981', '#1a2744'],
      borderWidth: 0,
      spacing: 2,
    }],
  };

  const placementRate = s.totalStudents > 0 ? ((s.placedStudents / s.totalStudents) * 100).toFixed(1) : 0;

  return (
    <div className="min-h-screen bg-navy-950 relative">
      <MatrixGridBackground />
      <Navbar />
      <main className="relative max-w-7xl mx-auto px-4 py-8 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        >
          <div>
            <h1 className="text-3xl font-heading font-bold">
              Admin <span className="gradient-text">Command Center</span>
            </h1>
            <p className="text-gray-400 mt-1">Welcome back, {user?.name}</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => window.location.href = '/admin/verification'} 
              className="px-4 py-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 rounded-xl transition-colors font-semibold text-sm flex items-center gap-2"
            >
              <FiCheckCircle /> Verification Center
            </button>
            <button 
              onClick={() => window.location.href = '/admin/audit'} 
              className="px-4 py-2 bg-cyan/10 text-cyan border border-cyan/20 hover:bg-cyan/20 rounded-xl transition-colors font-semibold text-sm flex items-center gap-2"
            >
              <FiActivity /> Audit Logs
            </button>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {stats.map((st, i) => (
            <StatCard key={i} {...st} index={i} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Branch Stats Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 glass-premium p-6"
          >
            <h2 className="text-lg font-heading font-semibold mb-4">Branch-wise Placements</h2>
            <Bar
              data={branchChartData}
              options={{
                responsive: true,
                animation: { duration: 1500, easing: 'easeOutQuart' },
                plugins: { legend: { labels: { color: '#9ca3af', font: { family: 'Manrope' } } } },
                scales: {
                  x: { ticks: { color: '#9ca3af', font: { family: 'Manrope', size: 10 } }, grid: { color: 'rgba(255,255,255,0.03)' } },
                  y: { ticks: { color: '#9ca3af', font: { family: 'Manrope' } }, grid: { color: 'rgba(255,255,255,0.03)' } },
                },
              }}
            />
          </motion.div>

          {/* Placement Rate Donut */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-premium p-6 flex flex-col items-center justify-center"
          >
            <h2 className="text-lg font-heading font-semibold mb-4 self-start">Placement Rate</h2>
            <div className="relative">
              <Doughnut
                data={placementDonut}
                options={{
                  responsive: true,
                  animation: { duration: 1500, animateRotate: true },
                  plugins: { legend: { display: false } },
                  cutout: '75%',
                }}
              />
              {/* Center number */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-heading font-bold gradient-text">{placementRate}%</span>
                <span className="text-[10px] text-gray-500 uppercase tracking-wider">placed</span>
              </div>
            </div>
            <div className="flex gap-4 mt-4 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald" />
                Placed: {s.placedStudents || 0}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-navy-700" />
                Unplaced: {(s.totalStudents || 0) - (s.placedStudents || 0)}
              </span>
            </div>
          </motion.div>
        </div>

        {/* Pending Approvals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-premium overflow-hidden mb-8"
        >
          <div className="p-6 border-b border-white/5 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-heading font-semibold">Pending Approvals</h2>
              <p className="text-xs text-gray-500 mt-1">Companies awaiting verification</p>
            </div>
            {pending.length > 0 && (
              <motion.span
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="px-2.5 py-1 bg-red-500/15 text-red-400 text-xs rounded-full font-bold"
              >
                {pending.length}
              </motion.span>
            )}
          </div>

          <div className="p-4 space-y-3">
            {pending.length === 0 ? (
              <div className="text-center py-6">
                <div className="text-3xl mb-2">✅</div>
                <p className="text-gray-500 text-sm">All caught up! No pending approvals.</p>
              </div>
            ) : (
              <AnimatePresence>
                {pending.map((company, index) => (
                  <motion.div
                    key={company.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20, height: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-4 p-4 rounded-xl bg-navy-800/30 border border-white/5 hover:border-white/10 transition-all"
                  >
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-violet/20 to-purple-400/20 flex items-center justify-center text-violet font-bold text-lg flex-shrink-0">
                      {company.name?.charAt(0) || '?'}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white">{company.name}</h3>
                      <p className="text-xs text-gray-400 truncate">
                        <FiMail className="inline w-3 h-3 mr-1" />{company.email}
                        {company.company?.industry && <span> · {company.company.industry}</span>}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 flex-shrink-0">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleApprove(company.id)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-500/10 text-green-400 text-xs font-medium hover:bg-green-500/20 transition-all border border-green-500/20"
                      >
                        <FiCheck className="w-3.5 h-3.5" /> Approve
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleReject(company.id)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500/10 text-red-400 text-xs font-medium hover:bg-red-500/20 transition-all border border-red-500/20"
                      >
                        <FiX className="w-3.5 h-3.5" /> Reject
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-premium overflow-hidden"
        >
          <div className="p-6 border-b border-white/5">
            <h2 className="text-lg font-heading font-semibold">Recent Activity</h2>
            <p className="text-xs text-gray-500 mt-1">Latest placement activity feed</p>
          </div>
          <div className="px-6 py-4 divide-y divide-white/5">
            {data?.recentActivity?.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-gray-500 text-sm">No recent activity</p>
              </div>
            ) : (
              data?.recentActivity?.map((act, i) => (
                <ActivityItem key={i} act={act} index={i} />
              ))
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default AdminDashboard;
