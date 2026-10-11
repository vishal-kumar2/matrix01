const { S3Client } = require('@aws-sdk/client-s3');

// WHEN_REQUIRED stops newer SDK versions from adding x-amz-checksum-* params to
// presigned PUT URLs (which makes browser uploads fail with 403/400).
module.exports = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  requestChecksumCalculation: 'WHEN_REQUIRED',
  responseChecksumValidation: 'WHEN_REQUIRED',
});
