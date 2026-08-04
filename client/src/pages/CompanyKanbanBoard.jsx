import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiMoreVertical, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/common/Navbar';
import MatrixGridBackground from '../components/backgrounds/MatrixGridBackground';
import { companyService, workflowService } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';

const COLUMNS = [
  { id: 'IN_PROGRESS', label: 'In Progress', color: 'bg-blue-500/10 border-blue-500/20 text-blue-400' },
  { id: 'ON_HOLD', label: 'On Hold', color: 'bg-amber-500/10 border-amber-500/20 text-amber-400' },
  { id: 'SELECTED', label: 'Selected', color: 'bg-green-500/10 border-green-500/20 text-green-400' },
  { id: 'REJECTED', label: 'Rejected', color: 'bg-red-500/10 border-red-500/20 text-red-400' },
];

const CompanyKanbanBoard = () => {
  const { driveId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [drive, setDrive] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [draggedAppId, setDraggedAppId] = useState(null);

  useEffect(() => {
    fetchData();
  }, [driveId]);

  const fetchData = async () => {
    try {
      const res = await companyService.getApplicants(driveId);
      setDrive(res.data.drive);
      setApplicants(res.data.applications);
    } catch (err) {
      toast.error('Failed to load board data');
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (e, appId) => {
    setDraggedAppId(appId);
    e.dataTransfer.setData('appId', appId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, colId) => {
    e.preventDefault();
    const appId = e.dataTransfer.getData('appId');
    if (!appId || !colId) return;

    const currentApp = applicants.find(a => a.id === appId);
    if (!currentApp || currentApp.finalResult === colId) return;

    // Optimistic UI update
    setApplicants(prev => prev.map(a => a.id === appId ? { ...a, finalResult: colId } : a));

    try {
      if (colId === 'REJECTED') {
        await workflowService.rejectCandidate(appId, { rejectionReason: 'Rejected via Kanban' });
      } else {
        await companyService.setResult(appId, { result: colId });
      }
      toast.success('Moved successfully');
    } catch (err) {
      toast.error('Failed to move candidate');
      fetchData(); // Revert on failure
    }
    setDraggedAppId(null);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-navy-950 relative">
      <MatrixGridBackground />
      <Navbar />
      <main className="relative max-w-7xl mx-auto px-4 py-8 pt-24">
        <div className="flex items-center justify-between mb-8">
          <div>
            <button onClick={() => navigate('/company/dashboard')} className="flex items-center gap-2 text-gray-400 hover:text-electric transition-colors mb-2">
              <FiArrowLeft /> Back to Dashboard
            </button>
            <h1 className="text-3xl font-heading font-bold text-white">
              {drive?.jobRole} <span className="text-gray-500 font-normal">Pipeline</span>
            </h1>
          </div>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory">
          {COLUMNS.map((col) => {
            const columnApps = applicants.filter(a => a.finalResult === col.id);
            return (
              <div
                key={col.id}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col.id)}
                className={`min-w-[300px] w-80 shrink-0 flex flex-col bg-navy-900/50 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden snap-center ${
                  draggedAppId ? 'ring-2 ring-electric/30 ring-inset' : ''
                }`}
              >
                <div className={`p-4 border-b ${col.color} flex justify-between items-center`}>
                  <h3 className="font-heading font-bold uppercase tracking-wide text-sm">{col.label}</h3>
                  <span className="text-xs font-mono bg-navy-950/50 px-2 py-0.5 rounded-full">{columnApps.length}</span>
                </div>

                <div className="flex-1 p-4 space-y-3 overflow-y-auto min-h-[500px]">
                  <AnimatePresence>
                    {columnApps.map((app) => (
                      <motion.div
                        key={app.id}
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        draggable
                        onDragStart={(e) => handleDragStart(e, app.id)}
                        className="glass-premium p-4 rounded-xl border border-white/5 cursor-grab active:cursor-grabbing hover:border-electric/50 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold text-white">{app.student?.user?.name}</h4>
                            <p className="text-xs text-gray-400">{app.student?.branch}</p>
                          </div>
                          <button className="text-gray-500 hover:text-white"><FiMoreVertical /></button>
                        </div>
                        <div className="flex justify-between items-center mt-3 pt-3 border-t border-white/5">
                          <span className="text-xs font-mono text-gray-300">CGPA: {app.student?.cgpa}</span>
                          <span className="text-[10px] bg-navy-800 px-2 py-1 rounded text-gray-400">
                            {new Date(app.appliedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  {columnApps.length === 0 && (
                    <div className="text-center py-10 text-gray-500 text-sm border border-dashed border-white/5 rounded-xl">
                      Drop candidates here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default CompanyKanbanBoard;
