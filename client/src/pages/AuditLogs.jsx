import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiActivity, FiArrowLeft, FiFilter } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Navbar from '../components/common/Navbar';
import MatrixGridBackground from '../components/backgrounds/MatrixGridBackground';
import { complianceService } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const AuditLogs = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('ALL');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const res = await complianceService.getAuditLogs();
      // Assume the response structure is { data: [ ...logs ] } or { data: { logs: [ ... ] } }
      setLogs(res.data.logs || res.data || []);
    } catch (err) {
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = filterType === 'ALL' ? logs : logs.filter(log => log.actionType.includes(filterType));

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-navy-950 relative">
      <MatrixGridBackground />
      <Navbar />
      <main className="relative max-w-7xl mx-auto px-4 py-8 pt-24">
        <button onClick={() => navigate('/admin/dashboard')} className="flex items-center gap-2 text-gray-400 hover:text-electric transition-colors mb-6">
          <FiArrowLeft /> Back to Dashboard
        </button>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-cyan/10 rounded-xl text-cyan">
              <FiActivity className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-heading font-bold text-white">System Audit Logs</h1>
              <p className="text-gray-400 mt-1">Monitor all critical compliance and system events.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 bg-navy-900/50 p-2 rounded-xl border border-white/5">
            <FiFilter className="text-gray-400 ml-2" />
            <select 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-transparent border-none text-white text-sm focus:ring-0 cursor-pointer p-2 outline-none"
            >
              <option value="ALL" className="bg-navy-900">All Events</option>
              <option value="VERIFICATION" className="bg-navy-900">Verification Events</option>
              <option value="FRAUD" className="bg-navy-900">Fraud Alerts</option>
              <option value="USER" className="bg-navy-900">User Actions</option>
            </select>
          </div>
        </div>

        <div className="glass-premium overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-navy-900/50 border-b border-white/5">
                  <th className="p-4 font-semibold text-gray-300 text-sm">Timestamp</th>
                  <th className="p-4 font-semibold text-gray-300 text-sm">Action Type</th>
                  <th className="p-4 font-semibold text-gray-300 text-sm">Target Entity</th>
                  <th className="p-4 font-semibold text-gray-300 text-sm">Actor ID</th>
                  <th className="p-4 font-semibold text-gray-300 text-sm">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-gray-500">
                      No audit logs found.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log, index) => (
                    <motion.tr 
                      key={log.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="p-4 text-sm text-gray-400 whitespace-nowrap">
                        {new Date(log.timestamp || log.createdAt).toLocaleString()}
                      </td>
                      <td className="p-4">
                        <span className="text-xs font-mono px-2 py-1 bg-electric/10 text-electric rounded-md border border-electric/20">
                          {log.actionType}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-300">
                        {log.targetEntityType} <span className="text-gray-500 font-mono text-xs ml-1">({log.targetEntityId?.substring(0,8)}...)</span>
                      </td>
                      <td className="p-4 text-sm font-mono text-gray-400">
                        {log.actorId ? log.actorId.substring(0, 8) + '...' : 'SYSTEM'}
                      </td>
                      <td className="p-4 text-sm text-gray-400 max-w-xs truncate" title={JSON.stringify(log.details)}>
                        {log.details ? JSON.stringify(log.details) : '-'}
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AuditLogs;
