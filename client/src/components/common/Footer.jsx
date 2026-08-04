import React from 'react';
import { Link } from 'react-router-dom';
import { FiGithub, FiTwitter, FiLinkedin, FiMail } from 'react-icons/fi';

const Footer = () => (
  <footer className="relative z-10 border-t border-white/5 bg-navy-950/80">
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand */}
        <div className="md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-electric to-cyan flex items-center justify-center">
              <span className="text-white font-bold text-sm">H</span>
            </div>
            <span className="text-xl font-heading font-bold gradient-text">HireTrack</span>
          </div>
          <p className="text-gray-400 text-sm max-w-md leading-relaxed">
            The AI-powered campus placement platform that connects students, companies, and placement cells on a single unified platform.
          </p>
          <div className="flex gap-4 mt-4">
            {[FiGithub, FiTwitter, FiLinkedin, FiMail].map((Icon, i) => (
              <a key={i} href="#" className="text-gray-500 hover:text-electric transition-colors">
                <Icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </div>

        {/* Links */}
        <div>
          <h4 className="font-heading font-semibold mb-4 text-sm uppercase tracking-wider text-gray-400">Platform</h4>
          <ul className="space-y-2">
            {['Features', 'How It Works', 'Pricing', 'Documentation'].map(link => (
              <li key={link}><a href="#" className="text-gray-500 hover:text-white text-sm transition-colors">{link}</a></li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-heading font-semibold mb-4 text-sm uppercase tracking-wider text-gray-400">Support</h4>
          <ul className="space-y-2">
            {['Help Center', 'Privacy Policy', 'Terms of Service', 'Contact'].map(link => (
              <li key={link}><a href="#" className="text-gray-500 hover:text-white text-sm transition-colors">{link}</a></li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-white/5 mt-8 pt-8 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} HireTrack. Built with React, Node.js & AI.
      </div>
    </div>
  </footer>
);

export default Footer;
