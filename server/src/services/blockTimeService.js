const BlockTime = require('../models/BlockTime');

/**
 * List all active block times for a specific doctor.
 */
async function listBlocks(doctorId) {
  return BlockTime.find({ doctorId, isActive: true }).sort({ date: 1, startTime: 1 });
}

/**
 * Create a new block time window.
 */
async function createBlock({ doctorId, date, startTime, endTime, reason }) {
  const [startH, startM] = startTime.split(':').map(Number);
  const [endH, endM] = endTime.split(':').map(Number);
  const startMin = startH * 60 + startM;
  const endMin = endH * 60 + endM;

  if (startMin >= endMin) {
    const err = new Error('Start time must be before end time');
    err.status = 400;
    throw err;
  }

  return BlockTime.create({
    doctorId,
    date,
    startTime,
    endTime,
    reason,
  });
}

/**
 * Soft delete a block time after verifying ownership.
 */
async function deleteBlock(blockId, doctorId) {
  const block = await BlockTime.findOne({ _id: blockId, isActive: true });
  if (!block) {
    const err = new Error('Block time not found');
    err.status = 404;
    throw err;
  }

  if (block.doctorId.toString() !== doctorId) {
    const err = new Error('Forbidden');
    err.status = 403;
    throw err;
  }

  block.isActive = false;
  block.deletedAt = new Date();
  await block.save();
  return block;
}

module.exports = {
  listBlocks,
  createBlock,
  deleteBlock,
};
