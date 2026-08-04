const AIProvider = require('./AIProvider');

class RecommendationProviderInterface extends AIProvider {
  /**
   * Generates personalized career advice and a study plan based on student profile.
   * @param {Object} studentContext - Background info about the student.
   * @param {string} userMessage - The student's specific question or request.
   * @param {Array} conversationHistory - Previous chat messages.
   * @returns {Promise<string>} The AI's response text.
   */
  async getCareerAdvice(studentContext, userMessage, conversationHistory = []) {
    throw new Error("Method 'getCareerAdvice()' must be implemented.");
  }
}

module.exports = RecommendationProviderInterface;
