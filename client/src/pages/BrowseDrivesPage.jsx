import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiMapPin, FiDollarSign, FiCalendar, FiCheck } from 'react-icons/fi';
import { studentService } from '../services/api';
import Navbar from '../components/common/Navbar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AuroraBackground from '../components/backgrounds/AuroraBackground';
import { formatDate, daysUntil } from '../utils/helpers';
import toast from 'react-hot-toast';

const BrowseDrivesPage = () => {
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentService.getEligibleDrives().then(res => { setDrives(res.data.drives); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleApply = async (driveId) => {
    try {
      await studentService.applyToDrive(driveId);
      setDrives(prev => prev.map(d => d.id === driveId ? { ...d, applied: true } : d));
      toast.success('Application submitted!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to apply'); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-navy-950 relative">
      <AuroraBackground />
      <Navbar />
      <main className="relative max-w-7xl mx-auto px-4 py-8 pt-24">
        <h1 className="text-3xl font-heading font-bold mb-8">Browse <span className="gradient-text">Eligible Drives</span></h1>
        {drives.length === 0 ? (
          <div className="glass p-12 text-center"><p className="text-gray-400 text-lg">No eligible drives available right now.</p></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {drives.map((drive, i) => (
              <motion.div key={drive.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card flex flex-col">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-heading font-bold text-lg">{drive.jobRole}</h3>
                    <p className="text-electric text-sm">{drive.company?.user?.name}</p>
                  </div>
                  <span className="status-badge bg-electric/20 text-electric">{drive.jobType?.replace('_', ' ')}</span>
                </div>
                <p className="text-gray-400 text-sm line-clamp-2 mb-4">{drive.jobDescription}</p>
                <div className="flex flex-wrap gap-3 text-sm text-gray-400 mb-4">
                  <span className="flex items-center gap-1"><FiDollarSign className="w-4 h-4 text-green-400" />{drive.salaryLpa} LPA</span>
                  <span className="flex items-center gap-1"><FiMapPin className="w-4 h-4" />{drive.location}</span>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {drive.eligibleBranches?.map(b => <span key={b} className="text-xs px-2 py-0.5 rounded-full bg-navy-700 text-gray-300">{b}</span>)}
                </div>
                <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-center">
                  <div className="text-xs text-gray-500">
                    <FiCalendar className="inline w-3 h-3 mr-1" />Deadline: {formatDate(drive.applicationDeadline)}
                    <span className="ml-2 text-amber-400">({daysUntil(drive.applicationDeadline)}d left)</span>
                  </div>
                  <button onClick={() => handleApply(drive.id)} disabled={drive.applied}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${drive.applied ? 'bg-green-500/20 text-green-400 cursor-default' : 'bg-gradient-to-r from-electric to-cyan text-white hover:shadow-lg hover:shadow-electric/25'}`}>
                    {drive.applied ? <><FiCheck className="inline mr-1" />Applied</> : 'Apply Now'}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default BrowseDrivesPage;
