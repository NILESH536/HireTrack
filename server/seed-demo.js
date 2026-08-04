require('dotenv').config();
const { sequelize } = require('./src/config/database');
const { User, Student, Company } = require('./src/models');

async function seedDemoUsers() {
  try {
    await sequelize.authenticate();
    console.log('Connected to database.');

    const emails = ['admin@demo.com', 'company@demo.com', 'student@demo.com'];

    // Find and delete existing users
    for (const email of emails) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        if (existingUser.role === 'STUDENT') {
          await Student.destroy({ where: { userId: existingUser.id } });
        } else if (existingUser.role === 'COMPANY') {
          await Company.destroy({ where: { userId: existingUser.id } });
        }
        await existingUser.destroy();
      }
    }

    console.log('Creating demo Admin...');
    await User.create({
      name: 'Demo Admin',
      email: 'admin@demo.com',
      password: 'password123',
      role: 'ADMIN',
      approved: true,
    });

    console.log('Creating demo Company...');
    const companyUser = await User.create({
      name: 'Demo Company',
      email: 'company@demo.com',
      password: 'password123',
      role: 'COMPANY',
      approved: true,
    });
    await Company.create({
      userId: companyUser.id,
      industry: 'Technology',
      website: 'https://demo.com',
      description: 'A demo company for testing.',
      isVerified: true,
      approvalStatus: 'APPROVED'
    });

    console.log('Creating demo Student...');
    const studentUser = await User.create({
      name: 'Demo Student',
      email: 'student@demo.com',
      password: 'password123',
      role: 'STUDENT',
      approved: true,
    });
    const student = await Student.create({
      userId: studentUser.id,
      branch: 'Computer Science',
      cgpa: 8.5,
      skills: ['JavaScript', 'React', 'Node.js'],
      careerGoal: 'Full Stack Engineer',
      isVerified: true,
      placed: false,
      resumeText: 'Full Stack Developer with experience in React and Node.js. Built multiple web applications using the MERN stack. Strong problem-solving skills and a passion for learning new technologies.',
    });

    const { Resume, AIExplanation } = require('./src/models');
    const resume = await Resume.create({
      studentId: student.id,
      version: 1,
      isPrimary: true,
      fileUrl: 'demo-resume.pdf',
      rawText: student.resumeText,
      atsScore: 68,
      structuredData: {
        formatScore: 75,
        contentScore: 65,
        keywordScore: 62,
        matchingSkills: ['JavaScript', 'React', 'Node.js'],
        missingSkills: [
          { skill: 'Docker/Kubernetes', importance: 'critical' },
          { skill: 'System Design', importance: 'high' },
          { skill: 'CI/CD Pipelines', importance: 'medium' }
        ],
        futureSkills: [
          { skill: 'Cloud Architecture (AWS/GCP)', reason: 'Essential for modern scalable backend systems.', priority: 'high', resources: 'AWS Solutions Architect Associate' },
          { skill: 'GraphQL', reason: 'High demand in React ecosystems.', priority: 'medium', resources: 'Apollo GraphQL Docs' }
        ],
        formatIssues: [
          'Inconsistent margin spacing may confuse ATS parsers.',
          'Missing hyperlink on GitHub portfolio.',
          'Action verbs are repetitive (used "worked on" 4 times).'
        ],
        strengths: ['Strong core tech stack', 'Clear education timeline'],
        suggestions: [
          { category: 'content', suggestion: 'Replace generic phrases like "worked on" with strong action verbs (e.g., "Architected", "Engineered", "Spearheaded").', priority: 'high' },
          { category: 'impact', suggestion: 'Quantify your achievements. Instead of "improved performance", say "reduced API latency by 40%".', priority: 'critical' },
          { category: 'keywords', suggestion: 'Integrate exact keyword phrases from the Job Description into your Experience section rather than just listing them in Skills.', priority: 'medium' }
        ],
        sectionAnalysis: { 
          experience: { score: 60, feedback: 'Lacks measurable impact. You need to frame bullet points using the STAR method (Situation, Task, Action, Result).' },
          skills: { score: 85, feedback: 'Good technical coverage, but could group them by category (e.g., Languages, Frameworks, Tools) for better ATS parsing.' },
          education: { score: 90, feedback: 'Clear and well formatted.' }
        }
      },
      aiSummary: 'Your resume shows a strong foundation but struggles with ATS compatibility due to missing quantifiable metrics and passive language.'
    });

    await AIExplanation.create({
      entityId: resume.id,
      entityType: 'RESUME_ANALYSIS',
      logic: 'Analyzed using strict modern ATS rules focusing on semantic matching and layout compatibility.',
      keyFactors: ['Keyword match', 'Formatting', 'Measurable Impact'],
      confidence: 0.95,
      reasoningSummary: 'The ATS parser struggled to extract concrete achievements from your experience section. While you have the necessary technical skills, the lack of business impact metrics (e.g., %, $, time saved) lowers your content score. Furthermore, critical infrastructure skills often expected for Full Stack roles are missing.',
      recommendations: [
        'Rewrite your recent project bullet points using the XYZ formula: "Accomplished [X] as measured by [Y], by doing [Z]."',
        'Add a dedicated "Projects" section if you lack professional experience, detailing the tech stack and scaling challenges you solved.',
        'Fix the margin inconsistencies to ensure older ATS systems do not truncate your text.'
      ]
    });

    console.log('Demo users seeded successfully!');
    console.log('Admin: admin@demo.com / password123');
    console.log('Company: company@demo.com / password123');
    console.log('Student: student@demo.com / password123');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding demo users:', error);
    process.exit(1);
  }
}

seedDemoUsers();
