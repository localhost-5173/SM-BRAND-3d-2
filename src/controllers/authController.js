const jwt = require('jsonwebtoken');
const AdminUser = require('../models/AdminUser');

/**
 * Admin: Login with email and password.
 * Returns JWT stored in HttpOnly cookie.
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'BAD_REQUEST',
          message: 'Email and password are required.'
        }
      });
    }

    const user = await AdminUser.findOne({ email: String(email).trim().toLowerCase() }).select('+password_hash');

    if (!user) {
      // Generic error message to prevent account enumeration
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid email or password.'
        }
      });
    }

    const isMatch = await user.comparePassword(String(password));
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid email or password.'
        }
      });
    }

    // Sign session token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Set secure cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    user.last_login = new Date();
    await user.save();

    return res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Admin: Logout and clear session cookie.
 */
function logout(req, res) {
  res.clearCookie('token', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/'
  });

  return res.json({
    success: true,
    data: {
      message: 'Logged out successfully.'
    }
  });
}

/**
 * Admin: Verify active session and return current admin identity.
 */
function getMe(req, res) {
  return res.json({
    success: true,
    data: {
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role
      }
    }
  });
}

module.exports = {
  login,
  logout,
  getMe
};
