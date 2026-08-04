const BaseRepository = require('./BaseRepository');
const { DriveMatch, Student, Drive } = require('../models');

class DriveMatchRepository extends BaseRepository {
  constructor() {
    super(DriveMatch);
  }

  /**
   * Find a cached match between a student and a drive.
   */
  async findMatch(studentId, driveId) {
    const { AIExplanation } = require('../models');
    
    return this.findOne({
      where: { studentId, driveId },
      include: [
        {
          model: AIExplanation,
          as: 'explanation',
        }
      ]
    });
  }
}

module.exports = new DriveMatchRepository();
