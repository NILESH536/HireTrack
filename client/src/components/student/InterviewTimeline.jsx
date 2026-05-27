import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCalendar, FiMapPin, FiVideo, FiClock } from 'react-icons/fi';
import { formatDateTime, daysUntil } from '../../utils/helpers';

/* ── Countdown Timer ── */
const CountdownBadge = ({ dateStr }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const update = () => {
      const diff = new Date(dateStr) - new Date();
      if (diff <= 0) { setTimeLeft('Now!'); return; }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const mins = Math.floor((diff / (1000 * 60)) % 60);
      if (days > 0) setTimeLeft(`${days}d ${hours}h`);
      else if (hours > 0) setTimeLeft(`${hours}h ${mins}m`);
      else setTimeLeft(`${mins}m`);
    };
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [dateStr]);

  const days = daysUntil(dateStr);
  const isToday = days <= 0 && days > -1;
  const isSoon = days <= 2 && days > 0;

  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
      isToday ? 'bg-green-500/20 text-green-400 animate-pulse' :
      isSoon ? 'bg-amber-500/15 text-amber-400' :
      'bg-electric/10 text-electric'
    }`}>
      <FiClock className="w-2.5 h-2.5" />
      {timeLeft}
    </span>
  );
};

const InterviewTimeline = ({ interviews }) => {
  const [tab, setTab] = useState('upcoming');
  const items = tab === 'upcoming' ? (interviews?.upcoming || []) : (interviews?.past || []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="glass-premium overflow-hidden"
    >
      <div className="p-6 border-b border-white/5 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-heading font-semibold">Interviews</h2>
          <p className="text-xs text-gray-500 mt-1">{items.length} {tab}</p>
        </div>
        <div className="flex gap-1.5 bg-navy-800/60 p-1 rounded-xl">
          {['upcoming', 'past'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                tab === t ? 'bg-electric/20 text-electric' : 'text-gray-400 hover:text-white'
              }`}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, x: tab === 'upcoming' ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: tab === 'upcoming' ? 20 : -20 }}
            transition={{ duration: 0.3 }}
          >
            {items.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">{tab === 'upcoming' ? '📅' : '📝'}</div>
                <p className="text-gray-500">No {tab} interviews</p>
              </div>
            ) : (
              <div className="relative space-y-0">
                {/* Timeline line */}
                {items.length > 1 && <div className="timeline-line" style={{ top: '1.5rem', bottom: '1.5rem' }} />}

                {items.map((slot, index) => {
                  const isToday = daysUntil(slot.interviewDateTime) <= 0 && daysUntil(slot.interviewDateTime) > -1;
                  return (
                    <motion.div
                      key={slot.id || index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="relative flex items-start gap-4 py-3"
                    >
                      {/* Timeline dot */}
                      <div className={`mt-1.5 ${isToday ? 'timeline-dot-active' : 'timeline-dot'}`}>
                        {isToday && (
                          <motion.div
                            className="absolute inset-0 rounded-full border border-electric"
                            animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 p-4 rounded-xl bg-navy-800/30 border border-white/5 hover:border-electric/15 transition-all group">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h4 className="font-semibold text-white truncate">{slot.companyName}</h4>
                          <span className="px-2 py-0.5 rounded-full bg-electric/10 text-electric text-[10px] font-semibold">
                            {slot.roundType?.replace(/_/g, ' ')}
                          </span>
                          {tab === 'upcoming' && <CountdownBadge dateStr={slot.interviewDateTime} />}
                        </div>
                        <p className="text-sm text-gray-400">{slot.jobRole}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <FiCalendar className="w-3 h-3" />
                            {formatDateTime(slot.interviewDateTime)}
                          </span>
                          <span className="flex items-center gap-1">
                            {slot.mode === 'ONLINE' ? <FiVideo className="w-3 h-3" /> : <FiMapPin className="w-3 h-3" />}
                            {slot.mode}
                          </span>
                        </div>
                        {slot.venueOrLink && (
                          <p className="text-xs text-electric mt-1.5 truncate">
                            {slot.mode === 'ONLINE' ? (
                              <a href={slot.venueOrLink} target="_blank" rel="noreferrer" className="hover:underline inline-flex items-center gap-1">
                                Join Meeting <FiVideo className="w-3 h-3" />
                              </a>
                            ) : slot.venueOrLink}
                          </p>
                        )}
                        {slot.feedback && (
                          <p className="text-xs text-amber-400 mt-2 bg-amber-500/10 p-2 rounded-lg">
                            💡 {slot.feedback}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default InterviewTimeline;
