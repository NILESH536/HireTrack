import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheck, FiX, FiDownload, FiFilter } from 'react-icons/fi';
import { companyService } from '../../services/api';
import { getStatusColor, getStatusIcon, formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';

const rounds = ['cvScreening', 'aptitudeTest', 'technicalRound1', 'technicalRound2', 'hrRound'];
const roundLabels = ['CV', 'Aptitude', 'Tech 1', 'Tech 2', 'HR'];

/* ── Mini Pipeline ── */
const MiniPipeline = ({ app }) => (
  <div className="flex items-center gap-0.5">
    {rounds.map((round, i) => (
      <React.Fragment key={round}>
        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold transition-all ${
          app[round] === true ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
          app[round] === false ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
          'bg-white/5 text-gray-600 border border-white/10'
        }`}>
          {app[round] === true ? '✓' : app[round] === false ? '✗' : (i + 1)}
        </div>
        {i < rounds.length - 1 && (
          <div className={`w-2 h-0.5 rounded-full ${
            app[round] === true ? 'bg-green-500/40' : 'bg-white/10'
          }`} />
        )}
      </React.Fragment>
    ))}
  </div>
);

const ApplicantsTable = ({ driveId }) => {
  const [apps, setApps] = useState([]);
  const [drive, setDrive] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    companyService.getApplicants(driveId).then(res => {
      setApps(res.data.applications);
      setDrive(res.data.drive);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [driveId]);

  const handleShortlist = async (appId, round, status) => {
    try {
      await companyService.updateShortlist(appId, { round, status });
      setApps(prev => prev.map(a => a.id === appId ? { ...a, [round]: status, ...(status === false ? { finalResult: 'REJECTED' } : {}) } : a));
      toast.success(`${status ? 'Shortlisted' : 'Rejected'}`);
    } catch (err) { toast.error('Failed to update'); }
  };

  const handleResult = async (appId, result) => {
    try {
      await companyService.setResult(appId, { result });
      setApps(prev => prev.map(a => a.id === appId ? { ...a, finalResult: result } : a));
      toast.success(`Result: ${result}`);
    } catch (err) { toast.error('Failed to set result'); }
  };

  const handleExport = async () => {
    try {
      const res = await companyService.exportApplicants(driveId);
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a'); a.href = url; a.download = `applicants-${driveId}.csv`; a.click();
      toast.success('Exported!');
    } catch { toast.error('Export failed'); }
  };

  const filtered = apps.filter(a => {
    if (filter === 'active') return a.finalResult === 'IN_PROGRESS';
    if (filter === 'selected') return a.finalResult === 'SELECTED';
    if (filter === 'rejected') return a.finalResult === 'REJECTED';
    return true;
  });

  if (loading) return (
    <div className="flex items-center justify-center py-12">
      <div className="w-8 h-8 border-2 border-electric/30 border-t-electric rounded-full animate-spin" />
    </div>
  );

  // Find current round (first null round for each applicant)
  const getCurrentRound = (app) => {
    for (const round of rounds) {
      if (app[round] === null) return round;
    }
    return null;
  };

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
        <div>
          <p className="text-sm text-gray-400">{filtered.length} applicants for <strong className="text-white">{drive?.jobRole}</strong></p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 bg-navy-800/60 p-1 rounded-xl">
            {['all', 'active', 'selected', 'rejected'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all ${
                  filter === f ? 'bg-electric/20 text-electric' : 'text-gray-400 hover:text-white'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
          <button onClick={handleExport} className="flex items-center gap-1.5 text-xs text-electric hover:text-electric-light px-3 py-1.5 rounded-lg hover:bg-electric/10 transition-all">
            <FiDownload className="w-3.5 h-3.5" /> Export
          </button>
        </div>
      </div>

      {/* Applicant Cards */}
      <div className="space-y-2">
        <AnimatePresence>
          {filtered.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-3xl mb-2">📭</div>
              <p className="text-gray-500 text-sm">No applicants found</p>
            </div>
          ) : (
            filtered.map((app, index) => {
              const currentRound = getCurrentRound(app);
              return (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="p-4 rounded-xl bg-navy-800/30 border border-white/5 hover:border-white/10 transition-all"
                >
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-electric/20 to-cyan/20 flex items-center justify-center text-electric font-bold text-sm flex-shrink-0">
                      {app.student?.user?.name?.charAt(0) || '?'}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-white text-sm">{app.student?.user?.name}</h4>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                          app.finalResult === 'SELECTED' ? 'bg-green-500/20 text-green-400' :
                          app.finalResult === 'REJECTED' ? 'bg-red-500/20 text-red-400' :
                          'bg-amber-500/15 text-amber-400'
                        }`}>
                          {app.finalResult}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">{app.student?.branch} · CGPA: <span className="font-mono">{app.student?.cgpa}</span></p>
                    </div>

                    {/* Pipeline */}
                    <div className="hidden md:block">
                      <MiniPipeline app={app} />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {currentRound && app.finalResult === 'IN_PROGRESS' && (
                        <>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleShortlist(app.id, currentRound, true)}
                            className="p-1.5 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-all"
                            title={`Pass ${roundLabels[rounds.indexOf(currentRound)]}`}
                          >
                            <FiCheck className="w-3.5 h-3.5" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleShortlist(app.id, currentRound, false)}
                            className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
                            title={`Reject at ${roundLabels[rounds.indexOf(currentRound)]}`}
                          >
                            <FiX className="w-3.5 h-3.5" />
                          </motion.button>
                        </>
                      )}
                      {!currentRound && app.finalResult === 'IN_PROGRESS' && (
                        <>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleResult(app.id, 'SELECTED')}
                            className="px-2.5 py-1 rounded-lg text-[10px] font-medium bg-green-500/15 text-green-400 hover:bg-green-500/25 transition-all"
                          >
                            Select
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleResult(app.id, 'REJECTED')}
                            className="px-2.5 py-1 rounded-lg text-[10px] font-medium bg-red-500/15 text-red-400 hover:bg-red-500/25 transition-all"
                          >
                            Reject
                          </motion.button>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ApplicantsTable;
