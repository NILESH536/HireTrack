class InterviewCoachingProviderInterface {
  /**
   * Generates a set of mock interview questions.
   * @param {string} interviewType - HR, TECHNICAL, BEHAVIORAL, ROLE_SPECIFIC
   * @param {string} jobRole - (Optional) specific role, e.g., 'Frontend Developer'
   * @param {string} resumeText - Student's resume context
   * @param {number} count - Number of questions to generate
   * @returns {Promise<Array<{ question: string }>>}
   */
  async generateMockQuestions(interviewType, jobRole, resumeText, count = 3) {
    throw new Error('Not implemented');
  }

  /**
   * Evaluates a user's answer to a mock interview question.
   * @param {string} question 
   * @param {string} answer 
   * @returns {Promise<{ score: number, feedback: string, improvement: string }>}
   */
  async evaluateInterviewAnswer(question, answer) {
    throw new Error('Not implemented');
  }
}

module.exports = InterviewCoachingProviderInterface;
