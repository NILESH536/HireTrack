const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

class ResumeParser {
  /**
   * Extract text from uploaded resume file.
   * Supports PDF (via pdf-parse) and plain text files.
   */
  async extractText(filePath) {
    const ext = path.extname(filePath).toLowerCase();

    try {
      if (ext === '.pdf') {
        return await this.extractFromPdf(filePath);
      } else if (ext === '.docx' || ext === '.doc') {
        return await this.extractFromDocx(filePath);
      } else {
        // Fallback: read as text
        return fs.readFileSync(filePath, 'utf-8');
      }
    } catch (error) {
      logger.error('Resume parsing error:', error.message);
      return '';
    }
  }

  async extractFromPdf(filePath) {
    try {
      const pdfParse = require('pdf-parse');
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      return data.text || '';
    } catch (error) {
      logger.error('PDF parsing error:', error.message);
      return '';
    }
  }

  async extractFromDocx(filePath) {
    // Basic DOCX parsing - reads the XML content
    try {
      const AdmZip = require('adm-zip');
      const zip = new AdmZip(filePath);
      const contentXml = zip.readAsText('word/document.xml');
      // Strip XML tags to get plain text
      const text = contentXml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      return text;
    } catch (error) {
      logger.error('DOCX parsing error:', error.message);
      // Fallback: try reading as plain text
      try {
        return fs.readFileSync(filePath, 'utf-8');
      } catch {
        return '';
      }
    }
  }

  /**
   * Extract skills from resume text using keyword matching.
   */
  extractSkills(text) {
    const skillKeywords = [
      'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 'Ruby',
      'React', 'Angular', 'Vue', 'Node.js', 'Express', 'Django', 'Flask', 'Spring Boot',
      'HTML', 'CSS', 'Tailwind', 'Bootstrap', 'SASS',
      'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'SQLite',
      'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP',
      'Git', 'Jenkins', 'CI/CD', 'Linux',
      'REST API', 'GraphQL', 'WebSocket',
      'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch',
      'Data Structures', 'Algorithms', 'System Design',
      'Agile', 'Scrum', 'JIRA',
    ];

    const lowerText = text.toLowerCase();
    return skillKeywords.filter(skill => lowerText.includes(skill.toLowerCase()));
  }
}

module.exports = new ResumeParser();
