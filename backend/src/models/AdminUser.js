const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const AdminUserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Administrator name is required'],
      trim: true,
      maxlength: [80, 'Name cannot exceed 80 characters']
    },
    email: {
      type: String,
      required: [true, 'Administrator email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Valid email required']
    },
    password_hash: {
      type: String,
      required: [true, 'Password hash is required'],
      select: false // Never return password hash in queries by default
    },
    role: {
      type: String,
      enum: ['admin'],
      default: 'admin'
    },
    last_login: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

AdminUserSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password_hash);
};

module.exports = mongoose.model('AdminUser', AdminUserSchema);
