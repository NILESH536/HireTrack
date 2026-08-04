const AIProvider = require('./AIProvider');

class ResumeAnalysisProviderInterface extends AIProvider {
  /**
   * Analyzes a resume for ATS compatibility and quality.
   * @param {string} resumeText - The resume text.
   * @param {Object} studentContext - Background info about the student.
   * @param {string} [jobDescription] - Optional job description to analyze against.
   * @returns {Promise<Object>} Analysis results including ATS score, format issues, strengths, and suggestions.
   */
  async analyzeResumeATS(resumeText, studentContext, jobDescription = null) {
    throw new Error("Method 'analyzeResumeATS()' must be implemented.");
  }
}

module.exports = ResumeAnalysisProviderInterface;
