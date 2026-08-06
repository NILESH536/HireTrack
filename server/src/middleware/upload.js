const multer = require('multer');
const path = require('path');
const { S3Client } = require('@aws-sdk/client-s3');
const multerS3 = require('multer-s3');

// Local storage implementation
const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `resume-${req.user.id}-${uniqueSuffix}${ext}`);
  },
});

// S3 storage implementation
let s3Storage = null;
if (process.env.STORAGE_PROVIDER === 's3' && process.env.AWS_REGION && process.env.AWS_BUCKET_NAME) {
  const s3 = new S3Client({
    region: process.env.AWS_REGION,
    // Note: In production AWS EC2, credentials can be assumed from IAM roles.
    // If testing locally, ensure AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY are set.
  });

  s3Storage = multerS3({
    s3: s3,
    bucket: process.env.AWS_BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname, userId: String(req.user.id) });
    },
    key: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      cb(null, `resumes/resume-${req.user.id}-${uniqueSuffix}${ext}`);
    }
  });
}

// Select storage provider based on environment
const storage = (process.env.STORAGE_PROVIDER === 's3' && s3Storage) ? s3Storage : localStorage;

const fileFilter = async (req, file, cb) => {
  const allowedExts = ['.pdf', '.docx', '.doc'];
  const allowedMimes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  const ext = path.extname(file.originalname).toLowerCase();
  
  // Extension check
  if (!allowedExts.includes(ext)) {
    return cb(new Error('Only PDF and DOCX files are allowed by extension'), false);
  }

  // MIME type check
  if (!allowedMimes.includes(file.mimetype)) {
    return cb(new Error('Invalid MIME type. Only PDF and Word documents are allowed.'), false);
  }

  // Note: Magic number validation (file-type) requires inspecting the file buffer, 
  // which is incompatible with direct streaming to S3 or disk via multer without a memory buffer.
  // We rely on multer's stream combined with strict mime and extension checks here for scalability.
  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

module.exports = upload;
