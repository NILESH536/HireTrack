import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiZap, FiTarget, FiTrendingUp, FiAlertTriangle, FiCheckCircle, FiBook, FiChevronDown, FiChevronUp, FiFileText, FiAward, FiStar } from 'react-icons/fi';
import { studentService } from '../../services/api';
import toast from 'react-hot-toast';

/* ── Animated Score Gauge ── */
const ScoreGauge = ({ score, label, size = 140 }) => {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : score >= 40 ? '#f97316' : '#ef4444';

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
          <motion.circle
            cx={size/2} cy={size/2} r={radius} fill="none" stroke={color} strokeWidth="8"
            strokeLinecap="round" strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-3xl font-bold font-heading"
            style={{ color }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
          >
            {score}
          </motion.span>
          <span className="text-[10px] text-gray-500 uppercase tracking-wider">/ 100</span>
        </div>
      </div>
      <span className="text-xs text-gray-400 mt-2 font-medium">{label}</span>
    </div>
  );
};

/* ── Mini Score Bar ── */
const MiniBar = ({ score, label }) => {
  const color = score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-amber-500' : score >= 40 ? 'bg-orange-500' : 'bg-red-500';
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-gray-400">{label}</span>
        <span className="text-gray-300 font-mono">{score}%</span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <motion.div className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }} animate={{ width: `${score}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.5 }}
        />
      </div>
    </div>
  );
};

/* ── Priority Badge ── */
const PriorityBadge = ({ priority }) => {
  const styles = {
    high: 'bg-red-500/20 text-red-400 border-red-500/30',
    critical: 'bg-red-500/20 text-red-400 border-red-500/30',
    medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    important: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    low: 'bg-green-500/20 text-green-400 border-green-500/30',
    'nice-to-have': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  };
  return (
    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold uppercase tracking-wider ${styles[priority] || styles.medium}`}>
      {priority}
    </span>
  );
};

/* ── Collapsible Section ── */
const Section = ({ title, icon: Icon, children, defaultOpen = false, count }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-white/5 rounded-xl overflow-hidden">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-electric/10">
            <Icon className="w-4 h-4 text-electric" />
          </div>
          <span className="font-medium text-sm">{title}</span>
          {count !== undefined && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-gray-400">{count}</span>
          )}
        </div>
        {open ? <FiChevronUp className="w-4 h-4 text-gray-500" /> : <FiChevronDown className="w-4 h-4 text-gray-500" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}
            className="overflow-hidden">
            <div className="p-4 pt-0 space-y-3">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ── Main Component ── */
const ResumeAnalyzer = ({ student }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [jobDesc, setJobDesc] = useState('');
  const [showJD, setShowJD] = useState(false);

  const hasResume = !!student?.resumeText;

  const runAnalysis = async () => {
    if (!hasResume) {
      toast.error('Please upload your resume first');
      return;
    }
    setLoading(true);
    try {
      const res = await studentService.analyzeATS({ jobDescription: jobDesc || undefined });
      setAnalysis(res.data.analysis);
      toast.success('Resume analysis complete!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Analysis failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const a = analysis;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-premium p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-electric/20 to-cyan/10 border border-electric/20">
            <FiFileText className="w-5 h-5 text-electric" />
          </div>
          <div>
            <h2 className="text-lg font-heading font-semibold">ATS Resume Analyzer</h2>
            <p className="text-xs text-gray-500">AI-powered resume scoring & career insights</p>
          </div>
        </div>
        {a && (
          <button onClick={() => { setAnalysis(null); setJobDesc(''); }}
            className="text-xs text-gray-500 hover:text-white transition-colors">
            Reset
          </button>
        )}
      </div>

      {/* Pre-Analysis State */}
      {!a && (
        <div className="space-y-4">
          {!hasResume ? (
            <div className="text-center py-8 space-y-3">
              <div className="inline-flex p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                <FiAlertTriangle className="w-8 h-8 text-amber-400" />
              </div>
              <p className="text-gray-400">Upload your resume first to get an ATS analysis</p>
            </div>
          ) : (
            <>
              {/* Optional JD */}
              <button onClick={() => setShowJD(!showJD)}
                className="text-xs text-electric hover:text-electric-light transition-colors flex items-center gap-1">
                <FiTarget className="w-3 h-3" />
                {showJD ? 'Hide' : 'Add'} job description for targeted analysis (optional)
              </button>
              <AnimatePresence>
                {showJD && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}>
                    <textarea value={jobDesc} onChange={(e) => setJobDesc(e.target.value)}
                      placeholder="Paste a job description here for targeted matching..."
                      className="input-field text-sm min-h-[100px] resize-y" rows={4} />
                  </motion.div>
                )}
              </AnimatePresence>

              <button onClick={runAnalysis} disabled={loading}
                className="w-full btn-primary py-3 flex items-center justify-center gap-2 text-sm">
                {loading ? (
                  <>
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                    Analyzing with AI...
                  </>
                ) : (
                  <><FiZap className="w-4 h-4" /> Analyze My Resume</>
                )}
              </button>
            </>
          )}
        </div>
      )}

      {/* Results */}
      {a && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="space-y-5">

          {/* Score Gauges */}
          <div className="flex justify-center gap-6 flex-wrap">
            <ScoreGauge score={a.atsScore || 0} label="ATS Score" size={130} />
            {a.jobMatchScore !== undefined && (
              <ScoreGauge score={a.jobMatchScore} label="Job Match" size={130} />
            )}
          </div>

          {/* Sub-scores */}
          <div className="bg-navy-800/40 rounded-xl p-4 space-y-3">
            <MiniBar score={a.formatScore || 0} label="Formatting" />
            <MiniBar score={a.contentScore || 0} label="Content Quality" />
            <MiniBar score={a.keywordScore || 0} label="Keyword Density" />
          </div>

          {/* Summary */}
          {a.summary && (
            <div className="bg-electric/5 border border-electric/10 rounded-xl p-4">
              <p className="text-sm text-gray-300 leading-relaxed">{a.summary}</p>
            </div>
          )}

          {/* Section Analysis */}
          {a.sectionAnalysis && (
            <Section title="Section Analysis" icon={FiAward} defaultOpen={true}
              count={Object.keys(a.sectionAnalysis).length}>
              {Object.entries(a.sectionAnalysis).map(([key, val]) => (
                <div key={key} className="bg-navy-800/30 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium capitalize">{key}</span>
                    <span className={`text-xs font-mono font-bold ${
                      val.score >= 70 ? 'text-green-400' : val.score >= 50 ? 'text-amber-400' : 'text-red-400'
                    }`}>{val.score}/100</span>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">{val.feedback}</p>
                </div>
              ))}
            </Section>
          )}

          {/* Strengths */}
          {a.strengths?.length > 0 && (
            <Section title="Strengths" icon={FiStar} defaultOpen={true} count={a.strengths.length}>
              {a.strengths.map((s, i) => (
                <div key={i} className="flex items-start gap-2">
                  <FiCheckCircle className="w-3.5 h-3.5 text-green-400 mt-0.5 shrink-0" />
                  <span className="text-sm text-gray-300">{s}</span>
                </div>
              ))}
            </Section>
          )}

          {/* Matching Skills */}
          {a.matchingSkills?.length > 0 && (
            <Section title="Matching Skills" icon={FiCheckCircle} count={a.matchingSkills.length}>
              <div className="flex flex-wrap gap-2">
                {a.matchingSkills.map((s, i) => (
                  <motion.span key={i} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="px-3 py-1.5 rounded-full bg-green-500/10 text-green-400 text-xs border border-green-500/20">
                    ✓ {s}
                  </motion.span>
                ))}
              </div>
            </Section>
          )}

          {/* Missing Skills */}
          {a.missingSkills?.length > 0 && (
            <Section title="Missing Skills" icon={FiAlertTriangle} count={a.missingSkills.length}>
              <div className="space-y-2">
                {a.missingSkills.map((s, i) => (
                  <div key={i} className="flex items-center justify-between bg-navy-800/30 rounded-lg px-3 py-2">
                    <span className="text-sm text-gray-300">{s.skill}</span>
                    <PriorityBadge priority={s.importance} />
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Future Skills to Learn */}
          {a.futureSkills?.length > 0 && (
            <Section title="Skills to Learn Next" icon={FiTrendingUp} defaultOpen={true} count={a.futureSkills.length}>
              <div className="space-y-3">
                {a.futureSkills.map((s, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * i }}
                    className="bg-gradient-to-r from-violet-500/5 to-transparent border border-violet-500/10 rounded-lg p-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-violet-300">{s.skill}</span>
                      <PriorityBadge priority={s.priority} />
                    </div>
                    <p className="text-xs text-gray-400">{s.reason}</p>
                    {s.resources && (
                      <div className="flex items-center gap-1.5 text-xs text-cyan">
                        <FiBook className="w-3 h-3" />
                        <span>{s.resources}</span>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </Section>
          )}

          {/* Suggestions */}
          {a.suggestions?.length > 0 && (
            <Section title="Improvement Suggestions" icon={FiTarget} defaultOpen={true} count={a.suggestions.length}>
              <div className="space-y-2">
                {a.suggestions.map((s, i) => (
                  <div key={i} className="bg-navy-800/30 rounded-lg p-3 flex items-start gap-3">
                    <div className={`mt-0.5 shrink-0 w-1.5 h-1.5 rounded-full ${
                      s.priority === 'high' ? 'bg-red-400' : s.priority === 'medium' ? 'bg-amber-400' : 'bg-green-400'
                    }`} />
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-gray-500 uppercase tracking-wider">
                          {s.category}
                        </span>
                        <PriorityBadge priority={s.priority} />
                      </div>
                      <p className="text-sm text-gray-300">{s.suggestion}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Format Issues */}
          {a.formatIssues?.length > 0 && (
            <Section title="Format Issues" icon={FiAlertTriangle} count={a.formatIssues.length}>
              {a.formatIssues.map((issue, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                  <span className="text-sm text-gray-400">{issue}</span>
                </div>
              ))}
            </Section>
          )}

          {/* Re-analyze button */}
          <button onClick={runAnalysis} disabled={loading}
            className="w-full btn-secondary py-2.5 text-sm flex items-center justify-center gap-2">
            {loading ? 'Analyzing...' : <><FiZap className="w-4 h-4" /> Re-analyze</>}
          </button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ResumeAnalyzer;
