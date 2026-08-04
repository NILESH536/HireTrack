import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUpload, FiFile, FiCheck, FiX } from 'react-icons/fi';
import { studentService } from '../../services/api';
import toast from 'react-hot-toast';

const ResumeUploader = ({ onUpload }) => {
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [skills, setSkills] = useState([]);
  const [fileName, setFileName] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('resume', file);
    setFileName(file.name);
    setUploading(true);
    setProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress(p => {
        if (p >= 90) { clearInterval(progressInterval); return 90; }
        return p + Math.random() * 15;
      });
    }, 200);

    try {
      const res = await studentService.uploadResume(formData);
      clearInterval(progressInterval);
      setProgress(100);
      setUploaded(true);
      setSkills(res.data.extractedSkills || []);
      toast.success('Resume uploaded and parsed!');
      onUpload?.();
    } catch (err) {
      clearInterval(progressInterval);
      setProgress(0);
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleUpload = (e) => handleFile(e.target.files?.[0]);

  const handleDragOver = useCallback((e) => { e.preventDefault(); setIsDragging(true); }, []);
  const handleDragLeave = useCallback(() => setIsDragging(false), []);
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-premium p-6"
    >
      <h2 className="text-lg font-heading font-semibold mb-4">Resume</h2>

      <div
        onClick={() => !uploading && fileRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-500 ${
          isDragging ? 'border-electric bg-electric/5 scale-[1.02]' :
          uploaded ? 'border-green-500/30 bg-green-500/5' :
          'border-white/10 hover:border-electric/30'
        }`}
      >
        <input type="file" ref={fileRef} onChange={handleUpload} accept=".pdf,.docx,.doc" className="hidden" />

        {uploading ? (
          <div className="space-y-4">
            {/* Progress Ring */}
            <div className="relative inline-flex items-center justify-center">
              <svg className="progress-ring" width="64" height="64">
                <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
                <circle
                  cx="32" cy="32" r="28" fill="none" stroke="#3b82f6" strokeWidth="4"
                  strokeDasharray={176} strokeDashoffset={176 - (progress / 100) * 176}
                  strokeLinecap="round"
                  className="transition-all duration-300"
                />
              </svg>
              <span className="absolute text-xs font-mono text-electric">{Math.round(progress)}%</span>
            </div>
            <p className="text-sm text-gray-400">Uploading {fileName}...</p>
          </div>
        ) : uploaded ? (
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="space-y-2">
            <div className="inline-flex p-3 rounded-full bg-green-500/20">
              <FiCheck className="w-8 h-8 text-green-400" />
            </div>
            <p className="text-green-400 font-medium">Resume uploaded</p>
            <p className="text-xs text-gray-500">{fileName}</p>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setUploaded(false); setSkills([]); setFileName(''); }}
              className="text-xs text-gray-500 hover:text-white transition-colors mt-1"
            >
              Upload different file
            </button>
          </motion.div>
        ) : (
          <div className="text-gray-400 space-y-2">
            <motion.div
              animate={isDragging ? { scale: 1.1, y: -5 } : { scale: 1, y: 0 }}
              className="inline-flex p-3 rounded-full bg-white/5"
            >
              <FiUpload className="w-8 h-8" />
            </motion.div>
            <p className="font-medium">Drop your resume here or click to browse</p>
            <p className="text-xs text-gray-500">PDF or DOCX, max 5MB</p>
          </div>
        )}
      </div>

      {/* Extracted Skills */}
      <AnimatePresence>
        {skills.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4"
          >
            <p className="text-sm text-gray-400 mb-2 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-electric" />
              Extracted Skills
            </p>
            <div className="flex flex-wrap gap-2">
              {skills.map((s, i) => (
                <motion.span
                  key={s}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="px-3 py-1.5 rounded-full bg-electric/10 text-electric text-xs border border-electric/20"
                >
                  {s}
                </motion.span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ResumeUploader;
