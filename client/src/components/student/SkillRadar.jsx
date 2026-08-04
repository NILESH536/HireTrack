import React, { useEffect, useRef, useState } from 'react';
import { Radar } from 'react-chartjs-2';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiAlertCircle } from 'react-icons/fi';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const defaultSkillCategories = ['DSA', 'Frontend', 'Backend', 'Database', 'DevOps', 'System Design', 'Communication'];

const SkillRadar = ({ studentSkills = [], targetRole }) => {
  const [animated, setAnimated] = useState(false);
  const chartRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const skillMapping = {
    DSA: ['Data Structures', 'Algorithms', 'C++', 'Competitive Programming'],
    Frontend: ['React', 'Angular', 'Vue', 'HTML', 'CSS', 'JavaScript', 'TypeScript', 'Tailwind'],
    Backend: ['Node.js', 'Express', 'Django', 'Flask', 'Spring Boot', 'Java', 'Python', 'Go'],
    Database: ['PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'SQLite'],
    DevOps: ['Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Jenkins', 'CI/CD', 'Linux', 'Git'],
    'System Design': ['System Design', 'Microservices', 'REST API', 'GraphQL'],
    Communication: ['Agile', 'Scrum', 'JIRA', 'Leadership', 'Teamwork'],
  };

  const scores = defaultSkillCategories.map(cat => {
    const keywords = skillMapping[cat] || [];
    const matched = keywords.filter(k => studentSkills.some(s => s.toLowerCase().includes(k.toLowerCase())));
    return Math.min(100, (matched.length / Math.max(keywords.length, 1)) * 100 + (matched.length > 0 ? 30 : 0));
  });

  const targetScores = defaultSkillCategories.map(() => 70 + Math.random() * 20);

  // Find skill gaps
  const gaps = defaultSkillCategories
    .map((cat, i) => ({ category: cat, gap: targetScores[i] - scores[i] }))
    .filter(g => g.gap > 20)
    .sort((a, b) => b.gap - a.gap)
    .slice(0, 3);

  const strengths = defaultSkillCategories
    .map((cat, i) => ({ category: cat, score: scores[i] }))
    .filter(s => s.score > 50)
    .sort((a, b) => b.score - a.score)
    .slice(0, 2);

  const data = {
    labels: defaultSkillCategories,
    datasets: [
      {
        label: 'Your Skills',
        data: animated ? scores : scores.map(() => 0),
        backgroundColor: 'rgba(59, 130, 246, 0.15)',
        borderColor: '#3b82f6',
        borderWidth: 2,
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#0a0f1a',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: '#60a5fa',
        pointHoverBorderColor: '#fff',
      },
      {
        label: targetRole || 'Target Role',
        data: animated ? targetScores : targetScores.map(() => 0),
        backgroundColor: 'rgba(6, 182, 212, 0.08)',
        borderColor: '#06b6d4',
        borderWidth: 2,
        borderDash: [5, 5],
        pointBackgroundColor: '#06b6d4',
        pointBorderColor: '#0a0f1a',
        pointBorderWidth: 2,
        pointRadius: 3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    animation: { duration: 1200, easing: 'easeOutQuart' },
    plugins: { legend: { labels: { color: '#9ca3af', font: { family: 'Manrope', size: 11 } } } },
    scales: {
      r: {
        grid: { color: 'rgba(255,255,255,0.05)' },
        angleLines: { color: 'rgba(255,255,255,0.05)' },
        ticks: { display: false },
        pointLabels: { color: '#9ca3af', font: { size: 11, family: 'Manrope' } },
        suggestedMin: 0,
        suggestedMax: 100,
      },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="glass-premium p-6"
    >
      <h2 className="text-lg font-heading font-semibold mb-4">Skill Radar</h2>
      <Radar ref={chartRef} data={data} options={options} />

      {/* Skill Gap Analysis */}
      <div className="mt-4 space-y-3">
        {strengths.length > 0 && (
          <div className="flex items-start gap-2 p-2.5 rounded-lg bg-green-500/5 border border-green-500/10">
            <FiTrendingUp className="w-3.5 h-3.5 text-green-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-green-300">
              <strong>Strengths:</strong> {strengths.map(s => s.category).join(', ')}
            </p>
          </div>
        )}
        {gaps.length > 0 && (
          <div className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/10">
            <FiAlertCircle className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-amber-300">
              <strong>Improve:</strong> {gaps.map(g => g.category).join(', ')}
            </p>
          </div>
        )}
      </div>

      <p className="text-xs text-gray-500 text-center mt-3">
        Skills vs {targetRole || 'Target Role'} requirements
      </p>
    </motion.div>
  );
};

export default SkillRadar;
