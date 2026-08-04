/**
 * Formatters (Data Transfer Objects)
 * Ensures sensitive data is stripped before returning to client.
 */

const formatUser = (user) => {
  if (!user) return null;
  const userJson = user.toJSON ? user.toJSON() : user;
  const { password, ...safeUser } = userJson;
  return safeUser;
};

const formatStudentProfile = (student) => {
  if (!student) return null;
  const studentJson = student.toJSON ? student.toJSON() : student;
  
  // If the user object is attached, format it too
  if (studentJson.user) {
    studentJson.user = formatUser(studentJson.user);
  }

  return studentJson;
};

const formatCompanyProfile = (company) => {
  if (!company) return null;
  const companyJson = company.toJSON ? company.toJSON() : company;

  if (companyJson.user) {
    companyJson.user = formatUser(companyJson.user);
  }

  return companyJson;
};

module.exports = {
  formatUser,
  formatStudentProfile,
  formatCompanyProfile,
};
