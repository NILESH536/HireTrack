import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiSave, FiTrash2, FiArrowLeft, FiList } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Navbar from '../components/common/Navbar';
import MatrixGridBackground from '../components/backgrounds/MatrixGridBackground';
import { workflowService } from '../services/api';

const DEFAULT_STAGES = [
  { name: 'Applied', type: 'AUTOMATIC', order: 1 },
  { name: 'CV Screening', type: 'MANUAL', order: 2 },
  { name: 'Technical Interview', type: 'MANUAL', order: 3 },
  { name: 'HR Interview', type: 'MANUAL', order: 4 },
  { name: 'Selected', type: 'AUTOMATIC', order: 5 },
];

const CompanyWorkflowBuilder = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [stages, setStages] = useState(DEFAULT_STAGES);
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const res = await workflowService.getTemplates();
      setTemplates(res.data.templates || []);
    } catch (err) {
      toast.error('Failed to load templates');
    }
  };

  const addStage = () => {
    setStages([...stages, { name: 'New Stage', type: 'MANUAL', order: stages.length + 1 }]);
  };

  const removeStage = (index) => {
    const newStages = stages.filter((_, i) => i !== index);
    // Reorder
    newStages.forEach((s, i) => (s.order = i + 1));
    setStages(newStages);
  };

  const updateStage = (index, field, value) => {
    const newStages = [...stages];
    newStages[index][field] = value;
    setStages(newStages);
  };

  const saveTemplate = async () => {
    if (!name.trim()) return toast.error('Template name is required');
    if (stages.length < 2) return toast.error('At least 2 stages required');

    setLoading(true);
    try {
      await workflowService.createTemplate({ name, description, stages });
      toast.success('Workflow template saved!');
      setName('');
      setDescription('');
      setStages(DEFAULT_STAGES);
      loadTemplates();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save template');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 relative">
      <MatrixGridBackground />
      <Navbar />
      <main className="relative max-w-5xl mx-auto px-4 py-8 pt-24">
        <button onClick={() => navigate('/company/dashboard')} className="flex items-center gap-2 text-gray-400 hover:text-electric transition-colors mb-6">
          <FiArrowLeft /> Back to Dashboard
        </button>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Builder Section */}
          <div className="flex-1 glass-premium p-6">
            <h2 className="text-2xl font-heading font-bold mb-6">Create Workflow Template</h2>
            
            <div className="space-y-4 mb-8">
              <div>
                <label className="input-label">Template Name</label>
                <input type="text" className="input-field" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Standard Engineering Flow" />
              </div>
              <div>
                <label className="input-label">Description (Optional)</label>
                <input type="text" className="input-field" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description of this workflow" />
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-2">Pipeline Stages</h3>
              {stages.map((stage, index) => (
                <div key={index} className="flex flex-wrap md:flex-nowrap items-center gap-3 bg-navy-900/50 p-3 rounded-lg border border-white/5">
                  <div className="w-8 h-8 rounded-full bg-navy-800 flex items-center justify-center font-bold text-gray-400">{index + 1}</div>
                  <input
                    type="text"
                    className="input-field flex-1 !py-2"
                    value={stage.name}
                    onChange={(e) => updateStage(index, 'name', e.target.value)}
                    placeholder="Stage Name"
                  />
                  <select
                    className="select-field w-auto !py-2"
                    value={stage.type}
                    onChange={(e) => updateStage(index, 'type', e.target.value)}
                  >
                    <option value="MANUAL">Manual</option>
                    <option value="AUTOMATIC">Automatic</option>
                    <option value="ASSESSMENT">Assessment</option>
                  </select>
                  <button onClick={() => removeStage(index)} className="p-2 text-gray-500 hover:text-red-400 transition-colors">
                    <FiTrash2 />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center mt-6 pt-6 border-t border-white/5">
              <button onClick={addStage} className="btn-secondary !py-2">
                <FiPlus className="w-4 h-4 mr-2 inline" /> Add Stage
              </button>
              <button onClick={saveTemplate} disabled={loading} className="btn-primary !py-2">
                {loading ? 'Saving...' : <><FiSave className="w-4 h-4 mr-2 inline" /> Save Template</>}
              </button>
            </div>
          </div>

          {/* Existing Templates Section */}
          <div className="w-full md:w-80 space-y-4">
            <h3 className="text-lg font-heading font-semibold text-white flex items-center gap-2">
              <FiList /> Saved Templates
            </h3>
            {templates.length === 0 ? (
              <p className="text-sm text-gray-500 bg-navy-800/50 p-4 rounded-xl border border-white/5">No custom templates created yet.</p>
            ) : (
              templates.map((tpl) => (
                <div key={tpl.id} className="glass-premium p-4 border border-white/5">
                  <h4 className="font-semibold text-white">{tpl.name}</h4>
                  <p className="text-xs text-gray-400 mt-1 mb-3">{tpl.description || 'No description'}</p>
                  <div className="flex gap-1 flex-wrap">
                    {tpl.stages?.map((s, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-electric/10 text-electric border border-electric/20">
                        {s.name}
                      </span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default CompanyWorkflowBuilder;
