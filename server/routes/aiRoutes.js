const express = require('express');
const router = express.Router();
const multer = require('multer');
const os = require('os');
const { generateInsight, analyzeResume, analyzeSkillGap, extractResume, extractSkills, analyzeJDMatch, tailorResume } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');
const { checkQuota } = require('../middleware/quotaMiddleware');

const storage = multer.diskStorage({
  destination: os.tmpdir(),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF and DOC/DOCX are allowed.'));
  }
};
const upload = multer({ 
  storage, 
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter 
});

// Apply quota protection to heavy AI routes
router.get('/insights', protect, checkQuota(20), generateInsight);
router.post('/resume-analyze', protect, checkQuota(10), analyzeResume);
router.post('/skill-gap', protect, checkQuota(5), analyzeSkillGap);
router.post('/extract-resume', protect, upload.single('file'), extractResume);
router.post('/extract-skills', protect, extractSkills);
router.post('/jd-match', protect, checkQuota(10), analyzeJDMatch);
router.post('/resume-tailor', protect, checkQuota(10), tailorResume);

module.exports = router;
