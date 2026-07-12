const { Schema, model } = require('mongoose');

const departmentSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    headUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Partial unique index — allows soft-deleted department names to be reused
departmentSchema.index(
  { name: 1 },
  { unique: true, partialFilterExpression: { isActive: true } }
);

module.exports = model('Department', departmentSchema);
