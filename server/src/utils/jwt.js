const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'hirectrack-super-secret-jwt-key-2024',
    { expiresIn: process.env.JWT_EXPIRATION || '24h' }
  );
};

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET || 'hirectrack-super-secret-jwt-key-2024');
};

module.exports = { generateToken, verifyToken };
