const { Schema, model } = require('mongoose');
const bcrypt = require('bcryptjs'); // pure-JS drop-in — no native binding, no node-gyp

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{12,}$/;

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    role: {
      type: String,
      enum: ['admin', 'doctor', 'receptionist', 'patient'],
      required: true,
    },
    phone: { type: String, default: null },
    departmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
    },
    isActive: { type: Boolean, default: true },
    deletedAt: { type: Date, default: null },
    // rotated on every /refresh; null = logged out
    refreshTokenId: { type: String, default: null },
  },
  { timestamps: true }
);

// Partial unique index — allows soft-deleted emails to be reused
userSchema.index(
  { email: 1 },
  { unique: true, partialFilterExpression: { isActive: true } }
);
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ departmentId: 1, isActive: 1 });

// Hash password before save (only when passwordHash field is explicitly set as plaintext)
userSchema.pre('save', async function () {
  if (!this.isModified('passwordHash')) return;

  const plain = this.passwordHash;
  if (!PASSWORD_REGEX.test(plain)) {
    throw new Error(
      'Password must be at least 12 characters and include uppercase, lowercase, and a digit.'
    );
  }
  this.passwordHash = await bcrypt.hash(plain, 12);
});

userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

module.exports = model('User', userSchema);
