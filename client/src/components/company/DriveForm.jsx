import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiBriefcase, FiMapPin, FiDollarSign, FiCalendar, FiCheck, FiFileText } from 'react-icons/fi';
import { BRANCHES, JOB_TYPES } from '../../utils/constants';
import { companyService } from '../../services/api';
import toast from 'react-hot-toast';

const DriveForm = ({ onSuccess }) => {
  const [form, setForm] = useState({
    jobRole: '', jobDescription: '', salaryLpa: '', location: '',
    jobType: 'FULL_TIME', minCgpa: '6.0', eligibleBranches: [],
    applicationDeadline: '', driveDate: '',
  });
  const [loading, setLoading] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);

  const update = (f, v) => setForm(p => ({ ...p, [f]: v }));

  const toggleBranch = (b) => {
    setForm(p => ({
      ...p,
      eligibleBranches: p.eligibleBranches.includes(b)
        ? p.eligibleBranches.filter(x => x !== b)
        : [...p.eligibleBranches, b],
    }));
  };

  const selectAllBranches = () => {
    setForm(p => ({
      ...p,
      eligibleBranches: p.eligibleBranches.length === BRANCHES.length ? [] : [...BRANCHES],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await companyService.createDrive({ ...form, salaryLpa: parseFloat(form.salaryLpa), minCgpa: parseFloat(form.minCgpa) });
      toast.success('Drive posted!');
      onSuccess();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to post drive'); }
    finally { setLoading(false); }
  };

  const step1Valid = form.jobRole && form.location && form.salaryLpa && form.jobType && form.jobDescription;
  const step2Valid = form.applicationDeadline && form.driveDate && form.eligibleBranches.length > 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Wizard Steps */}
      <div className="flex items-center gap-2 mb-2">
        {[
          { n: 1, label: 'Details', icon: <FiBriefcase className="w-3.5 h-3.5" /> },
          { n: 2, label: 'Requirements', icon: <FiCalendar className="w-3.5 h-3.5" /> },
          { n: 3, label: 'Review', icon: <FiFileText className="w-3.5 h-3.5" /> },
        ].map((s, i) => (
          <React.Fragment key={s.n}>
            <button
              type="button"
              onClick={() => setWizardStep(s.n)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                wizardStep === s.n ? 'bg-electric/20 text-electric' :
                wizardStep > s.n ? 'bg-green-500/10 text-green-400' :
                'bg-white/5 text-gray-500'
              }`}
            >
              {wizardStep > s.n ? <FiCheck className="w-3 h-3" /> : s.icon}
              {s.label}
            </button>
            {i < 2 && <div className={`w-8 h-0.5 rounded-full ${wizardStep > s.n ? 'bg-green-500/30' : 'bg-white/5'}`} />}
          </React.Fragment>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {wizardStep === 1 && (
          <motion.div key="ws1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="input-label">Job Role *</label>
                <div className="relative">
                  <FiBriefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                  <input value={form.jobRole} onChange={e => update('jobRole', e.target.value)} className="input-field pl-11" placeholder="e.g. Software Engineer" required />
                </div>
              </div>
              <div>
                <label className="input-label">Location *</label>
                <div className="relative">
                  <FiMapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                  <input value={form.location} onChange={e => update('location', e.target.value)} className="input-field pl-11" placeholder="e.g. Bangalore" required />
                </div>
              </div>
              <div>
                <label className="input-label">Salary (LPA) *</label>
                <div className="relative">
                  <FiDollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                  <input type="number" step="0.5" value={form.salaryLpa} onChange={e => update('salaryLpa', e.target.value)} className="input-field pl-11" placeholder="e.g. 12" required />
                </div>
              </div>
              <div>
                <label className="input-label">Job Type *</label>
                <select value={form.jobType} onChange={e => update('jobType', e.target.value)} className="select-field">
                  {JOB_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="input-label">Job Description *</label>
              <textarea value={form.jobDescription} onChange={e => update('jobDescription', e.target.value)} className="input-field h-28 resize-none" placeholder="Describe the role, responsibilities, and requirements..." required />
            </div>
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setWizardStep(2)}
              disabled={!step1Valid}
              className="btn-primary w-full !py-3"
            >
              Next: Requirements →
            </motion.button>
          </motion.div>
        )}

        {wizardStep === 2 && (
          <motion.div key="ws2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="input-label">Min CGPA *</label>
                <input type="number" step="0.1" min="0" max="10" value={form.minCgpa} onChange={e => update('minCgpa', e.target.value)} className="input-field" required />
              </div>
              <div>
                <label className="input-label">Application Deadline *</label>
                <input type="date" value={form.applicationDeadline} onChange={e => update('applicationDeadline', e.target.value)} className="input-field" required />
              </div>
              <div className="md:col-span-2">
                <label className="input-label">Drive Date *</label>
                <input type="date" value={form.driveDate} onChange={e => update('driveDate', e.target.value)} className="input-field" required />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="input-label !mb-0">Eligible Branches *</label>
                <button type="button" onClick={selectAllBranches} className="text-xs text-electric hover:text-electric-light">
                  {form.eligibleBranches.length === BRANCHES.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {BRANCHES.map(b => (
                  <motion.button
                    key={b}
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => toggleBranch(b)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                      form.eligibleBranches.includes(b)
                        ? 'bg-electric/20 text-electric border border-electric/30'
                        : 'bg-navy-800 text-gray-400 border border-white/10 hover:border-white/20'
                    }`}
                  >
                    {form.eligibleBranches.includes(b) && <FiCheck className="inline w-3 h-3 mr-1" />}
                    {b}
                  </motion.button>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setWizardStep(1)} className="btn-secondary flex-1 !py-3">← Back</button>
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setWizardStep(3)}
                disabled={!step2Valid}
                className="btn-primary flex-1 !py-3"
              >
                Review →
              </motion.button>
            </div>
          </motion.div>
        )}

        {wizardStep === 3 && (
          <motion.div key="ws3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
            {/* Preview Card */}
            <div className="border border-white/10 rounded-xl p-5 bg-navy-800/30 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-heading font-bold text-lg text-white">{form.jobRole}</h4>
                <span className="status-badge status-cleared">Active</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <span className="flex items-center gap-1"><FiMapPin className="w-3 h-3" />{form.location}</span>
                <span className="font-mono text-electric">{form.salaryLpa} LPA</span>
                <span>{form.jobType?.replace('_', ' ')}</span>
              </div>
              <div className="text-xs text-gray-500 flex gap-4">
                <span>Min CGPA: {form.minCgpa}</span>
                <span>Deadline: {form.applicationDeadline}</span>
                <span>Drive: {form.driveDate}</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {form.eligibleBranches.map(b => (
                  <span key={b} className="text-[10px] px-2 py-0.5 rounded-full bg-electric/10 text-electric">{b}</span>
                ))}
              </div>
              {form.jobDescription && (
                <p className="text-xs text-gray-500 mt-2 line-clamp-3 border-t border-white/5 pt-3">{form.jobDescription}</p>
              )}
            </div>

            <div className="flex gap-3">
              <button type="button" onClick={() => setWizardStep(2)} className="btn-secondary flex-1 !py-3">← Back</button>
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
                    Posting...
                  </div>
                ) : '🚀 Post Drive'}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
};

export default DriveForm;
