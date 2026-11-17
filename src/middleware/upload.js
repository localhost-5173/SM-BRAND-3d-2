const multer = require('multer');

// Configure Multer memory storage (buffers file directly in RAM, max 8 MB)
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 8 * 1024 * 1024 // 8 Megabytes maximum
  },
  fileFilter: (req, file, cb) => {
    // Basic MIME check on stream initiation
    const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedMimes.includes(file.mimetype)) {
      const err = new Error('Invalid file type. Only JPEG, PNG, and WebP images are allowed.');
      err.code = 'INVALID_FILE_TYPE';
      return cb(err, false);
    }
    cb(null, true);
  }
});

/**
 * Validates file magic bytes (binary signatures) directly from the in-memory Buffer.
 * Prevents file extension spoofing attacks (e.g. executable renamed to image.jpg).
 */
function validateImageSignature(buffer) {
  if (!buffer || buffer.length < 12) return false;

  // JPEG signature: FF D8 FF
  const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;

  // PNG signature: 89 50 4E 47 (0x89 'P' 'N' 'G')
  const isPng = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;

  // WebP signature: bytes 0-3 "RIFF" and bytes 8-11 "WEBP"
  const isWebp =
    buffer.slice(0, 4).toString('ascii') === 'RIFF' &&
    buffer.slice(8, 12).toString('ascii') === 'WEBP';

  return isJpeg || isPng || isWebp;
}

module.exports = {
  upload,
  validateImageSignature
};
