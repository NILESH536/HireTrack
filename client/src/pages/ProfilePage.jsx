import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiSave, FiUser, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { studentService, complianceService } from '../services/api';
import { BRANCHES } from '../utils/constants';
import Navbar from '../components/common/Navbar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AuroraBackground from '../components/backgrounds/AuroraBackground';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', branch: '', cgpa: '', skills: '', careerGoal: '' });

  useEffect(() => {
    studentService.getProfile().then(res => {
      const s = res.data.student;
      setProfile(s);
      setForm({
        name: s.user?.name || '', branch: s.branch || '', cgpa: s.cgpa || '',
        skills: (s.skills || []).join(', '), careerGoal: s.careerGoal || '',
      });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await studentService.updateProfile({ ...form, cgpa: parseFloat(form.cgpa) });
      toast.success('Profile updated!');
    } catch (err) { toast.error('Failed to update'); }
    finally { setSaving(false); }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-navy-950 relative">
      <AuroraBackground />
      <Navbar />
      <main className="relative max-w-2xl mx-auto px-4 py-8 pt-24">
        <h1 className="text-3xl font-heading font-bold mb-8">Your <span className="gradient-text">Profile</span></h1>

        <form onSubmit={handleSave} className="glass p-8 space-y-6">
          <div className="flex items-center gap-4 pb-6 border-b border-white/5">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-electric to-cyan flex items-center justify-center">
              <FiUser className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-heading font-bold">{user?.name}</h2>
              <p className="text-gray-400 text-sm">{user?.email}</p>
              <span className="text-xs px-2 py-0.5 rounded-full bg-electric/20 text-electric mt-1 inline-block">{user?.role}</span>
            </div>
          </div>

          <div><label className="input-label">Name</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field" /></div>
          <div><label className="input-label">Branch</label><select value={form.branch} onChange={e => setForm({ ...form, branch: e.target.value })} className="select-field">{BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}</select></div>
          <div><label className="input-label">CGPA</label><input type="number" step="0.1" min="0" max="10" value={form.cgpa} onChange={e => setForm({ ...form, cgpa: e.target.value })} className="input-field" /></div>
          <div><label className="input-label">Skills (comma-separated)</label><input value={form.skills} onChange={e => setForm({ ...form, skills: e.target.value })} className="input-field" placeholder="React, Node.js, Python" /></div>
          <div><label className="input-label">Career Goal</label><input value={form.careerGoal} onChange={e => setForm({ ...form, careerGoal: e.target.value })} className="input-field" placeholder="Full Stack Developer" /></div>

          {profile?.isVerified ? (
            <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm flex items-center gap-2">
              <div className="p-1 bg-green-500/20 rounded-full"><FiCheckCircle className="w-4 h-4" /></div>
              Profile Verified
            </div>
          ) : (
            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 text-sm flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <FiAlertCircle className="w-4 h-4" /> Profile Not Verified
              </div>
              <button 
                type="button"
                onClick={async () => {
                  try {
                    await complianceService.submitRequest({ entityType: 'STUDENT', entityId: profile.id, comments: 'Profile verification request' });
                    toast.success('Verification request submitted!');
                  } catch (e) { toast.error('Failed to submit request'); }
                }}
                className="self-start px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 rounded-lg text-xs font-semibold transition-colors"
              >
                Request Verification
              </button>
            </div>
          )}

          <button type="submit" disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2">
            {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><FiSave className="w-4 h-4" /> Save Changes</>}
          </button>
        </form>
      </main>
    </div>
  );
};

export default ProfilePage;
