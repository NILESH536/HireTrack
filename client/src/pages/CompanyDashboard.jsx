import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiBriefcase, FiUsers, FiCheckCircle, FiTrendingUp, FiCalendar, FiMapPin, FiChevronRight, FiFileText } from 'react-icons/fi';
import { companyService } from '../services/api';
import Navbar from '../components/common/Navbar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Modal from '../components/common/Modal';
import DriveForm from '../components/company/DriveForm';
import ApplicantsTable from '../components/company/ApplicantsTable';
import HexGridBackground from '../components/backgrounds/HexGridBackground';
import { useAuth } from '../hooks/useAuth';
import { daysUntil, formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';

/* ── Animated counter ── */
const useCountUp = (end, duration = 1000) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!end) return;
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

const StatCard = ({ label, value, icon, color, index }) => {
  const count = useCountUp(value, 800 + index * 150);
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1, type: 'spring', stiffness: 200 }}
      whileHover={{ scale: 1.05, y: -4 }}
      className="glass-premium p-6 text-center group cursor-default"
    >
      <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${color} mb-3 shadow-lg group-hover:shadow-xl transition-shadow`}>
        {icon}
      </div>
      <div className="text-3xl font-heading font-bold font-mono tabular-nums">{count}</div>
      <p className="text-gray-400 text-sm mt-1">{label}</p>
    </motion.div>
  );
};

const CompanyDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDriveForm, setShowDriveForm] = useState(false);
  const [selectedDrive, setSelectedDrive] = useState(null);

  const fetchData = async () => {
    try { const res = await companyService.getDashboard(); setData(res.data); }
    catch { toast.error('Failed to load dashboard'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return <LoadingSpinner />;

  const stats = [
    { label: 'Total Drives', value: data?.stats?.totalDrives || 0, icon: <FiBriefcase className="w-5 h-5 text-white" />, color: 'from-electric to-cyan' },
    { label: 'Active Drives', value: data?.stats?.activeDrives || 0, icon: <FiTrendingUp className="w-5 h-5 text-white" />, color: 'from-emerald to-green-400' },
    { label: 'Total Applicants', value: data?.stats?.totalApplications || 0, icon: <FiUsers className="w-5 h-5 text-white" />, color: 'from-violet to-purple-400' },
    { label: 'Selected', value: data?.stats?.totalSelected || 0, icon: <FiCheckCircle className="w-5 h-5 text-white" />, color: 'from-amber-500 to-orange-500' },
  ];

  return (
    <div className="min-h-screen bg-navy-950 relative">
      <HexGridBackground />
      <Navbar />
      <main className="relative max-w-7xl mx-auto px-4 py-8 pt-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4"
        >
          <div>
            <h1 className="text-3xl font-heading font-bold">
              Company <span className="gradient-text">Dashboard</span>
            </h1>
            <p className="text-gray-400 mt-1">Welcome back, {user?.name}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.location.href = '/company/assessments'}
              className="btn-secondary !py-3 flex items-center gap-2"
            >
              <FiFileText className="w-4 h-4" /> Assessments
            </button>
            <button
              onClick={() => window.location.href = '/company/workflows'}
              className="btn-secondary !py-3 flex items-center gap-2"
            >
              <FiCheckCircle className="w-4 h-4" /> Workflows
            </button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowDriveForm(true)}
              className="btn-primary-glow !py-3 flex items-center gap-2"
            >
              <FiPlus className="w-4 h-4" /> Post Drive
            </motion.button>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((s, i) => (
            <StatCard key={i} {...s} index={i} />
          ))}
        </div>

        {/* Drives List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-premium overflow-hidden"
        >
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-heading font-semibold">Your Drives</h2>
              <p className="text-xs text-gray-500 mt-1">{data?.drives?.length || 0} drives posted</p>
            </div>
          </div>

          <div className="divide-y divide-white/5">
            {data?.drives?.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-4xl mb-3">📋</div>
                <p className="text-gray-500">No drives posted yet</p>
                <p className="text-xs text-gray-600 mt-1">Post your first drive to start hiring!</p>
                <button
                  onClick={() => setShowDriveForm(true)}
                  className="mt-4 px-4 py-2 rounded-xl bg-electric/10 text-electric text-sm hover:bg-electric/20 transition-all"
                >
                  <FiPlus className="inline w-4 h-4 mr-1" /> Post Drive
                </button>
              </div>
            ) : (
              data?.drives?.map((drive, index) => (
                <motion.div
                  key={drive.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * index }}
                  onClick={() => setSelectedDrive(drive.id)}
                  className="p-5 flex items-center gap-4 hover:bg-white/[0.02] transition-all cursor-pointer group"
                >
                  {/* Drive icon */}
                  <div className={`p-3 rounded-xl ${drive.active ? 'bg-emerald/10 text-emerald' : 'bg-gray-700/30 text-gray-500'}`}>
                    <FiBriefcase className="w-5 h-5" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-semibold text-white">{drive.jobRole}</h3>
                      <span className={`status-badge text-[10px] ${drive.active ? 'status-cleared' : 'status-rejected'}`}>
                        {drive.active ? 'Active' : 'Closed'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-400">
                      <span className="flex items-center gap-1"><FiMapPin className="w-3 h-3" />{drive.location}</span>
                      <span className="font-mono text-electric">{drive.salaryLpa} LPA</span>
                      <span>{drive.jobType?.replace('_', ' ')}</span>
                    </div>
                  </div>

                  {/* Applicant count & deadline */}
                  <div className="hidden md:flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <div className="font-heading font-bold text-white text-lg">{drive.applicantCount || 0}</div>
                      <p className="text-xs text-gray-500">applicants</p>
                    </div>
                    {drive.applicationDeadline && (
                      <div className="text-center">
                        <div className={`font-mono text-sm ${daysUntil(drive.applicationDeadline) <= 3 ? 'text-amber-400' : 'text-gray-400'}`}>
                          {daysUntil(drive.applicationDeadline) > 0 ? `${daysUntil(drive.applicationDeadline)}d left` : 'Closed'}
                        </div>
                        <p className="text-xs text-gray-500">deadline</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.location.href = `/company/drive/${drive.id}/kanban`;
                      }}
                      className="px-3 py-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 text-xs hover:bg-indigo-500/20 transition-colors border border-indigo-500/20 mr-2"
                    >
                      Kanban Board
                    </button>
                    <FiChevronRight className="w-4 h-4 text-gray-600 group-hover:text-electric transition-colors" />
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        {/* Drive Form Modal */}
        <Modal isOpen={showDriveForm} onClose={() => setShowDriveForm(false)} title="Post New Drive" size="lg">
          <DriveForm onSuccess={() => { setShowDriveForm(false); fetchData(); }} />
        </Modal>

        {/* Applicants Modal */}
        <Modal isOpen={!!selectedDrive} onClose={() => setSelectedDrive(null)} title="Applicants" size="xl">
          {selectedDrive && <ApplicantsTable driveId={selectedDrive} />}
        </Modal>
      </main>
    </div>
  );
};

export default CompanyDashboard;
