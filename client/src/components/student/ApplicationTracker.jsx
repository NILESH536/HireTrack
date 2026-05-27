import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronDown, FiExternalLink } from 'react-icons/fi';
import { getStatusColor, getStatusIcon, getResultBadgeClass } from '../../utils/helpers';
import { RESULT_LABELS, ROUND_LABELS } from '../../utils/constants';

/* ── Pipeline Step Visual ── */
const PipelineStep = ({ status, label, isLast }) => {
  const isCleared = status === true;
  const isRejected = status === false;
  const isPending = status === null || status === undefined;

  return (
    <div className="flex items-center">
      <div className="flex flex-col items-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={`pipeline-step ${
            isCleared ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
            isRejected ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
            'bg-white/5 text-gray-500 border border-white/10'
          }`}
        >
          {isCleared ? '✓' : isRejected ? '✗' : isPending ? '?' : '—'}
        </motion.div>
        <span className="text-[10px] text-gray-500 mt-1 whitespace-nowrap">{label}</span>
      </div>
      {!isLast && (
        <div className={`pipeline-connector ${
          isCleared ? 'bg-green-500/40' : isRejected ? 'bg-red-500/30' : 'bg-white/10'
        }`} />
      )}
    </div>
  );
};

/* ── Expanded Row Detail ── */
const ExpandedDetail = ({ app }) => {
  const rounds = ['cvScreening', 'aptitudeTest', 'technicalRound1', 'technicalRound2', 'hrRound'];
  const roundNames = ['CV Screening', 'Aptitude Test', 'Technical 1', 'Technical 2', 'HR Round'];
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="overflow-hidden"
    >
      <div className="px-6 py-4 bg-navy-800/30 border-t border-white/5">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Selection Pipeline</span>
        </div>
        <div className="flex items-start gap-1 max-w-md">
          {rounds.map((round, i) => (
            <PipelineStep
              key={round}
              status={app[round]}
              label={roundNames[i]}
              isLast={i === rounds.length - 1}
            />
          ))}
        </div>
        {app.drive?.jobDescription && (
          <p className="text-xs text-gray-500 mt-3 line-clamp-2">{app.drive.jobDescription}</p>
        )}
      </div>
    </motion.div>
  );
};

const ApplicationTracker = ({ applications }) => {
  const [filter, setFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);

  const filtered = applications?.filter(app => {
    if (filter === 'active') return app.finalResult === 'IN_PROGRESS';
    if (filter === 'selected') return app.finalResult === 'SELECTED';
    if (filter === 'rejected') return app.finalResult === 'REJECTED';
    return true;
  }) || [];

  const filters = [
    { key: 'all', label: 'All', count: applications?.length },
    { key: 'active', label: 'Active', count: applications?.filter(a => a.finalResult === 'IN_PROGRESS').length },
    { key: 'selected', label: 'Selected', count: applications?.filter(a => a.finalResult === 'SELECTED').length },
    { key: 'rejected', label: 'Rejected', count: applications?.filter(a => a.finalResult === 'REJECTED').length },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass-premium overflow-hidden"
    >
      {/* Header */}
      <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl font-heading font-semibold">Application Tracker</h2>
          <p className="text-xs text-gray-500 mt-1">{filtered.length} applications</p>
        </div>
        <div className="flex gap-1.5 bg-navy-800/60 p-1 rounded-xl">
          {filters.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 ${
                filter === f.key
                  ? 'bg-electric/20 text-electric shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {f.label}
              {f.count > 0 && (
                <span className="ml-1.5 text-[10px] opacity-60">({f.count})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Applications List */}
      <div className="divide-y divide-white/5">
        <AnimatePresence>
          {filtered.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="text-4xl mb-3">📋</div>
              <p className="text-gray-500">No applications found</p>
              <p className="text-xs text-gray-600 mt-1">Start applying to eligible drives!</p>
            </motion.div>
          ) : (
            filtered.map((app, index) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                layout
              >
                <div
                  onClick={() => setExpandedId(expandedId === app.id ? null : app.id)}
                  className="p-5 flex items-center gap-4 hover:bg-white/[0.02] transition-colors cursor-pointer group"
                >
                  {/* Company Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-white truncate">
                        {app.drive?.company?.user?.name || 'Company'}
                      </h3>
                      <span className={`status-badge text-[10px] ${getResultBadgeClass(app.finalResult)}`}>
                        {RESULT_LABELS[app.finalResult] || app.finalResult}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 mt-0.5">{app.drive?.jobRole}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="font-mono text-electric text-xs">{app.drive?.salaryLpa} LPA</span>
                      <span className="text-xs text-gray-600">·</span>
                      <span className="text-xs text-gray-500">{app.drive?.location}</span>
                    </div>
                  </div>

                  {/* Mini Pipeline */}
                  <div className="hidden md:flex items-center gap-0.5">
                    {['cvScreening', 'aptitudeTest', 'technicalRound1', 'technicalRound2', 'hrRound'].map((round, i) => (
                      <div
                        key={round}
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          app[round] === true ? 'bg-green-500/20 text-green-400' :
                          app[round] === false ? 'bg-red-500/20 text-red-400' :
                          'bg-white/5 text-gray-600'
                        }`}
                        title={['CV', 'Apt', 'T1', 'T2', 'HR'][i]}
                      >
                        {app[round] === true ? '✓' : app[round] === false ? '✗' : (i + 1)}
                      </div>
                    ))}
                  </div>

                  {/* Expand icon */}
                  <motion.div
                    animate={{ rotate: expandedId === app.id ? 180 : 0 }}
                    className="text-gray-500 group-hover:text-gray-300"
                  >
                    <FiChevronDown className="w-4 h-4" />
                  </motion.div>
                </div>

                {/* Expanded Detail */}
                <AnimatePresence>
                  {expandedId === app.id && <ExpandedDetail app={app} />}
                </AnimatePresence>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default ApplicationTracker;
