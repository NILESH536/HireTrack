const AIProvider = require('./AIProvider');

class MatchProviderInterface extends AIProvider {
  /**
   * Matches a student resume against a job description.
   * @param {string} resumeText - The student's resume text.
   * @param {string} jobDescription - The job description text.
   * @returns {Promise<Object>} The match result { matchScore, confidenceLevel, matchedSkills, missingSkills, strengths, weaknesses, improvementSuggestions, expectedShortlistingProbability, reasoningSummary }
   */
  async matchJob(resumeText, jobDescription) {
    throw new Error("Method 'matchJob()' must be implemented.");
  }
}

module.exports = MatchProviderInterface;
