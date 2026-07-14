const { Schema, model } = require('mongoose');

const blockTimeSchema = new Schema(
  {
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: String, // YYYY-MM-DD
      required: true,
    },
    startTime: {
      type: String, // HH:MM
      required: true,
    },
    endTime: {
      type: String, // HH:MM
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Optimize lookup for checking doctor block times on a specific date
blockTimeSchema.index({ doctorId: 1, date: 1, isActive: 1 });

module.exports = model('BlockTime', blockTimeSchema);
