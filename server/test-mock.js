const axios = require('axios');

async function testMockInterview() {
  try {
    console.log('Logging in...');
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'student@demo.com',
      password: 'password123'
    });
    
    const token = loginRes.data.data.token;
    console.log('Logged in successfully! Token:', token.substring(0, 20) + '...');

    console.log('Fetching Dashboard...');
    const dashRes = await axios.get('http://localhost:5000/api/student/dashboard', {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('Dashboard Fetched Successfully:');
    console.log('Student resumeText length:', dashRes.data.data.student.resumeText?.length);

  } catch (error) {
    if (error.response) {
      console.error('API Error Response:', error.response.status, error.response.data);
    } else {
      console.error('Request failed:', error.message);
    }
  }
}

testMockInterview();
