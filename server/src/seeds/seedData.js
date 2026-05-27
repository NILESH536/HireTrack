require('dotenv').config();
const { sequelize } = require('../config/database');
const { User, Student, Company, Drive, Application, Notification } = require('../models');
const bcrypt = require('bcryptjs');

const seedData = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected');
    await sequelize.sync({ force: true });
    console.log('Tables recreated');

    // ──────── Admin ────────
    const adminUser = await User.create({
      email: 'admin@hirectrack.com', password: 'admin123',
      name: 'Placement Cell Admin', role: 'ADMIN', approved: true,
    });
    console.log('✅ Admin created');

    // ──────── Students ────────
    const students = [];
    const studentData = [
      { email: 'rahul@student.com', name: 'Rahul Sharma', branch: 'Computer Science', cgpa: 8.5, skills: ['JavaScript', 'React', 'Node.js', 'Python'], careerGoal: 'Full Stack Developer' },
      { email: 'priya@student.com', name: 'Priya Patel', branch: 'Information Technology', cgpa: 9.1, skills: ['Java', 'Spring Boot', 'MySQL', 'AWS'], careerGoal: 'Backend Developer' },
      { email: 'amit@student.com', name: 'Amit Kumar', branch: 'Electronics', cgpa: 7.8, skills: ['Python', 'Machine Learning', 'TensorFlow'], careerGoal: 'ML Engineer' },
      { email: 'sneha@student.com', name: 'Sneha Reddy', branch: 'Computer Science', cgpa: 9.4, skills: ['C++', 'Data Structures', 'Algorithms', 'System Design'], careerGoal: 'Software Engineer' },
      { email: 'vikram@student.com', name: 'Vikram Singh', branch: 'Mechanical', cgpa: 7.2, skills: ['AutoCAD', 'SolidWorks', 'Python'], careerGoal: 'Design Engineer' },
    ];

    for (const s of studentData) {
      const user = await User.create({ email: s.email, password: 'student123', name: s.name, role: 'STUDENT', approved: true });
      const student = await Student.create({ userId: user.id, branch: s.branch, cgpa: s.cgpa, skills: s.skills, careerGoal: s.careerGoal });
      students.push({ user, student });
    }
    console.log('✅ 5 Students created');

    // ──────── Companies ────────
    const companies = [];
    const companyData = [
      { email: 'hr@techcorp.com', name: 'TechCorp Solutions', industry: 'IT Services', website: 'https://techcorp.com', description: 'Leading IT services company' },
      { email: 'hr@innovate.com', name: 'InnovateTech', industry: 'Product Development', website: 'https://innovatetech.com', description: 'Cutting-edge product company' },
      { email: 'hr@datawise.com', name: 'DataWise Analytics', industry: 'Data Analytics', website: 'https://datawise.com', description: 'AI and data analytics firm' },
    ];

    for (const c of companyData) {
      const user = await User.create({ email: c.email, password: 'company123', name: c.name, role: 'COMPANY', approved: true });
      const company = await Company.create({ userId: user.id, industry: c.industry, website: c.website, description: c.description });
      companies.push({ user, company });
    }
    console.log('✅ 3 Companies created');

    // ──────── Drives ────────
    const drives = [];
    const driveData = [
      { companyIdx: 0, jobRole: 'Full Stack Developer', jobDescription: 'Build scalable web applications using React and Node.js. Must have strong DSA skills.', salaryLpa: 12, location: 'Bangalore', jobType: 'FULL_TIME', minCgpa: 7.0, eligibleBranches: ['Computer Science', 'Information Technology'], daysUntilDeadline: 15, daysUntilDrive: 20 },
      { companyIdx: 1, jobRole: 'Backend Engineer', jobDescription: 'Design and develop microservices using Java/Spring Boot. Experience with cloud platforms preferred.', salaryLpa: 15, location: 'Hyderabad', jobType: 'FULL_TIME', minCgpa: 8.0, eligibleBranches: ['Computer Science', 'Information Technology'], daysUntilDeadline: 10, daysUntilDrive: 18 },
      { companyIdx: 2, jobRole: 'Data Science Intern', jobDescription: 'Work on ML models for business analytics. Python and TensorFlow required.', salaryLpa: 6, location: 'Mumbai', jobType: 'INTERNSHIP', minCgpa: 7.5, eligibleBranches: ['Computer Science', 'Electronics', 'Information Technology'], daysUntilDeadline: 20, daysUntilDrive: 30 },
      { companyIdx: 0, jobRole: 'DevOps Engineer', jobDescription: 'Manage CI/CD pipelines, Docker, Kubernetes. Linux and scripting knowledge essential.', salaryLpa: 10, location: 'Pune', jobType: 'FULL_TIME', minCgpa: 6.5, eligibleBranches: ['Computer Science', 'Information Technology', 'Electronics'], daysUntilDeadline: 25, daysUntilDrive: 35 },
    ];

    for (const d of driveData) {
      const now = new Date();
      const drive = await Drive.create({
        companyId: companies[d.companyIdx].company.id,
        jobRole: d.jobRole, jobDescription: d.jobDescription, salaryLpa: d.salaryLpa,
        location: d.location, jobType: d.jobType, minCgpa: d.minCgpa, eligibleBranches: d.eligibleBranches,
        applicationDeadline: new Date(now.getTime() + d.daysUntilDeadline * 86400000),
        driveDate: new Date(now.getTime() + d.daysUntilDrive * 86400000),
      });
      drives.push(drive);
    }
    console.log('✅ 4 Drives created');

    // ──────── Applications ────────
    // Rahul applies to TechCorp Full Stack (cleared CV, aptitude pending)
    await Application.create({ studentId: students[0].student.id, driveId: drives[0].id, cvScreening: true });

    // Priya applies to InnovateTech Backend (cleared CV + Aptitude)
    await Application.create({ studentId: students[1].student.id, driveId: drives[1].id, cvScreening: true, aptitudeTest: true });

    // Sneha applies to TechCorp Full Stack and DataWise intern
    await Application.create({ studentId: students[3].student.id, driveId: drives[0].id, cvScreening: true, aptitudeTest: true, technicalRound1: true });
    await Application.create({ studentId: students[3].student.id, driveId: drives[2].id });

    // Amit applies to DataWise (rejected at CV)
    await Application.create({ studentId: students[2].student.id, driveId: drives[2].id, cvScreening: false, finalResult: 'REJECTED' });

    console.log('✅ 5 Applications created');

    // ──────── Notifications ────────
    for (const s of students) {
      await Notification.create({ userId: s.user.id, message: 'Welcome to HireTrack! Start exploring placement drives.', type: 'INFO' });
    }
    console.log('✅ Notifications created');

    console.log('\n🎉 Seed data loaded successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('  Admin:   admin@hirectrack.com / admin123');
    console.log('  Student: rahul@student.com / student123');
    console.log('  Company: hr@techcorp.com / company123');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedData();
