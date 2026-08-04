import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck, FiX, FiShield, FiFileText, FiArrowLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Navbar from '../components/common/Navbar';
import MatrixGridBackground from '../components/backgrounds/MatrixGridBackground';
import { complianceService } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const VerificationCenter = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await complianceService.getPendingRequests();
      setRequests(res.data);
    } catch (err) {
      toast.error('Failed to load pending requests');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, status) => {
    const comments = prompt(`${status === 'APPROVED' ? 'Approval' : 'Rejection'} Comments (Optional):`);
    if (comments === null) return;

    try {
      await complianceService.processRequest(id, { status, comments });
      toast.success(`Request ${status.toLowerCase()} successfully`);
      fetchRequests();
    } catch (err) {
      toast.error('Action failed');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-navy-950 relative">
      <MatrixGridBackground />
      <Navbar />
      <main className="relative max-w-6xl mx-auto px-4 py-8 pt-24">
        <button onClick={() => navigate('/admin/dashboard')} className="flex items-center gap-2 text-gray-400 hover:text-electric transition-colors mb-6">
          <FiArrowLeft /> Back to Dashboard
        </button>

        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-indigo-500/10 rounded-xl text-indigo-400">
            <FiShield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-heading font-bold text-white">Verification Center</h1>
            <p className="text-gray-400 mt-1">Process pending compliance and background checks.</p>
          </div>
        </div>

        <div className="glass-premium overflow-hidden">
          <div className="p-6 border-b border-white/5 flex justify-between items-center bg-navy-900/50">
            <h2 className="text-lg font-heading font-semibold flex items-center gap-2">
              Pending Requests
              <span className="bg-red-500/20 text-red-400 text-xs px-2 py-0.5 rounded-full">{requests.length}</span>
            </h2>
          </div>

          <div className="p-0">
            {requests.length === 0 ? (
              <div className="text-center py-16">
                <FiCheck className="w-12 h-12 text-emerald mx-auto mb-4 opacity-50" />
                <p className="text-gray-400 text-lg">No pending verification requests.</p>
                <p className="text-gray-500 text-sm mt-1">All compliance checks are up to date.</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                <AnimatePresence>
                  {requests.map((req, index) => (
                    <motion.div
                      key={req.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-6 hover:bg-white/[0.02] transition-colors flex flex-col md:flex-row gap-6 items-start md:items-center justify-between"
                    >
                      <div className="flex items-start gap-4 flex-1">
                        <div className="p-3 bg-navy-800 rounded-lg text-gray-400">
                          <FiFileText className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-mono px-2 py-0.5 bg-electric/10 text-electric rounded">
                              {req.entityType}
                            </span>
                            <span className="text-xs text-gray-500">{new Date(req.createdAt).toLocaleString()}</span>
                          </div>
                          <h3 className="text-lg font-semibold text-white">ID: {req.entityId}</h3>
                          {req.comments && <p className="text-sm text-gray-400 mt-2 bg-navy-900/50 p-2 rounded border border-white/5 line-clamp-2">"{req.comments}"</p>}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 w-full md:w-auto">
                        <button
                          onClick={() => handleAction(req.id, 'APPROVED')}
                          className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/20 rounded-lg transition-colors"
                        >
                          <FiCheck /> Approve
                        </button>
                        <button
                          onClick={() => handleAction(req.id, 'REJECTED')}
                          className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 rounded-lg transition-colors"
                        >
                          <FiX /> Reject
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default VerificationCenter;
