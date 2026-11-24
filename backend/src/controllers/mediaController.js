const cloudinary = require('../config/cloudinary');
const { validateImageSignature } = require('../middleware/upload');
const path = require('path');

/**
 * Admin: Upload product photography to Cloudinary with binary signature verification.
 */
async function uploadImage(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'BAD_REQUEST',
          message: 'No image file uploaded in the request.'
        }
      });
    }

    // Verify binary magic bytes
    const isValidSignature = validateImageSignature(req.file.buffer);
    if (!isValidSignature) {
      return res.status(422).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'File binary signature does not match a valid JPEG, PNG, or WebP image.'
        }
      });
    }

    // Sanitize filename
    const parsedName = path.parse(req.file.originalname).name;
    const cleanBase = parsedName.toLowerCase().replace(/[^a-z0-9_-]/g, '-').replace(/-+/g, '-').slice(0, 40);
    const uniquePublicId = `${cleanBase}-${Date.now()}`;

    // Upload buffer to Cloudinary folder sm-brand/products
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'sm-brand/products',
        public_id: uniquePublicId,
        resource_type: 'image'
      },
      (error, result) => {
        if (error) {
          return next(error);
        }

        return res.status(201).json({
          success: true,
          data: {
            url: result.secure_url,
            public_id: result.public_id,
            format: result.format,
            width: result.width,
            height: result.height
          }
        });
      }
    );

    uploadStream.end(req.file.buffer);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  uploadImage
};
