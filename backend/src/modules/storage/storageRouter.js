const express = require('express');
const router = express.Router();
const s3 = require('../../services/s3Storage');

router.get('/buckets', (req, res) => {
  res.json({ success: true, data: s3.getBuckets() });
});

router.get('/files', (req, res) => {
  const { bucket } = req.query;
  res.json({ success: true, count: s3.getFiles(bucket).length, data: s3.getFiles(bucket) });
});

router.post('/upload', (req, res) => {
  const { bucket, fileName, fileType } = req.body;
  if (!bucket || !fileName) {
    return res.status(400).json({ success: false, message: "Bucket and fileName are required." });
  }
  const presigned = s3.generatePresignedUploadUrl(bucket, fileName, fileType);
  res.json({
    success: true,
    message: "Presigned S3 upload URL generated successfully.",
    data: presigned
  });
});

module.exports = router;
