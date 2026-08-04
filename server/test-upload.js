const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');

async function testUpload() {
  try {
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'student@demo.com',
      password: 'password123'
    });
    const token = loginRes.data.data.token;
    
    // Create a dummy text file
    fs.writeFileSync('dummy-resume.txt', 'This is a test resume for John Doe. Skills: JavaScript, React.');
    
    const formData = new FormData();
    formData.append('resume', fs.createReadStream('dummy-resume.txt'));
    
    const uploadRes = await axios.post('http://localhost:5000/api/student/resume', formData, {
      headers: {
        ...formData.getHeaders(),
        Authorization: `Bearer ${token}`
      }
    });
    console.log('Upload success:', uploadRes.status);
  } catch (err) {
    console.error('Upload failed:', err.response ? err.response.data : err.message);
  }
}
testUpload();
