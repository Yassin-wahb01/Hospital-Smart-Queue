// server/seed.js
// Run with: node seed.js
// This script populates the database with realistic Egyptian data for testing.
// It connects to the same MongoDB URI as the server (from .env).

'use strict';
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const User = require('./src/models/User');
const Department = require('./src/models/Department');
const Appointment = require('./src/models/Appointment');
const BlockTime = require('./src/models/BlockTime');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/medicare?replicaSet=rs0';
const PLAIN_PASSWORD = 'Mediacare12345!'; // Meets the PASSWORD_REGEX and is set to requested password
const SALT_ROUNDS = 12;

// Egyptian names for realism
const usersData = {
  admin: [
    { name: 'Ahmed Samir', email: 'ahmed.samir@medicare.com', role: 'admin', phone: '01012345678' }
  ],
  receptionists: [
    { name: 'Nour Mohamed', email: 'nour.mohamed@medicare.com', role: 'receptionist', phone: '01023456789' },
    { name: 'Omar Yasser', email: 'omar.yasser@medicare.com', role: 'receptionist', phone: '01034567890' }
  ],
  doctors: [
    { name: 'Dr. Mona Fathy', email: 'mona.fathy@medicare.com', role: 'doctor', phone: '01234567891', departmentIndex: 0, isHead: true },
    { name: 'Dr. Khaled Ibrahim', email: 'khaled.ibrahim@medicare.com', role: 'doctor', phone: '01234567892', departmentIndex: 1, isHead: true },
    { name: 'Dr. Sara Adel', email: 'sara.adel@medicare.com', role: 'doctor', phone: '01234567893', departmentIndex: 2, isHead: true },
    { name: 'Dr. Mohamed Ali', email: 'mohamed.ali@medicare.com', role: 'doctor', phone: '01234567894', departmentIndex: 3, isHead: false },
    { name: 'Dr. Aya Tarek', email: 'aya.tarek@medicare.com', role: 'doctor', phone: '01234567895', departmentIndex: 4, isHead: false },
    { name: 'Dr. Mahmoud Gamal', email: 'mahmoud.gamal@medicare.com', role: 'doctor', phone: '01234567896', departmentIndex: 5, isHead: false }
  ],
  patients: [
    { name: 'Fatma Mahmoud', email: 'fatma@patient.com', role: 'patient', phone: '01112345678' },
    { name: 'Youssef Hassan', email: 'youssef@patient.com', role: 'patient', phone: '01112345679' },
    { name: 'Aya Mohamed', email: 'aya@patient.com', role: 'patient', phone: '01112345680' },
    { name: 'Karim Said', email: 'karim@patient.com', role: 'patient', phone: '01112345681' },
    { name: 'Laila Amin', email: 'laila@patient.com', role: 'patient', phone: '01112345682' },
    { name: 'Hassan Tawfik', email: 'hassan@patient.com', role: 'patient', phone: '01112345683' },
    { name: 'Salma Mostafa', email: 'salma@patient.com', role: 'patient', phone: '01112345684' },
    { name: 'Tarek Hussein', email: 'tarek@patient.com', role: 'patient', phone: '01112345685' },
    { name: 'Nada Sherif', email: 'nada@patient.com', role: 'patient', phone: '01112345686' },
    { name: 'Ibrahim El-Sayed', email: 'ibrahim@patient.com', role: 'patient', phone: '01112345687' }
  ]
};

const departmentsData = [
  { name: 'Cardiology', description: 'Heart & vascular care' },
  { name: 'Neurology', description: 'Brain & nervous system' },
  { name: 'Pediatrics', description: 'Children healthcare' },
  { name: 'Orthopedics', description: 'Bone & joint surgery' },
  { name: 'General Surgery', description: 'Surgical procedures' },
  { name: 'Dermatology', description: 'Skin & cosmetic treatments' }
];

// Helper to create dates relative to now
function dateRelative(daysFromNow, hours = 9, minutes = 0) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(hours, minutes, 0, 0);
  return d;
}

// Helper to format local date string (YYYY-MM-DD) for BlockTime
function formatLocalISODate(daysFromNow) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Department.deleteMany({});
    await Appointment.deleteMany({});
    await BlockTime.deleteMany({});
    console.log('Cleared old data');

    // --- 1. Create departments (without heads yet) ---
    const depts = await Department.insertMany(
      departmentsData.map(d => ({ name: d.name, description: d.description, isActive: true }))
    );
    console.log(`Inserted ${depts.length} departments`);

    // --- 2. Create users (first batch: admin, receptionists, doctors) ---
    const createdUsers = [];

    // Admin
    for (const admin of usersData.admin) {
      const user = new User({ ...admin, passwordHash: PLAIN_PASSWORD }); // pre-save hook hashes
      await user.save();
      createdUsers.push(user);
    }

    // Receptionists
    for (const rec of usersData.receptionists) {
      const user = new User({ ...rec, passwordHash: PLAIN_PASSWORD });
      await user.save();
      createdUsers.push(user);
    }

    // Doctors (assign departmentId)
    for (const doc of usersData.doctors) {
      const user = new User({
        name: doc.name,
        email: doc.email,
        role: 'doctor',
        phone: doc.phone,
        passwordHash: PLAIN_PASSWORD,
        departmentId: depts[doc.departmentIndex]._id
      });
      await user.save();
      createdUsers.push(user);
    }

    // Patients
    for (const pat of usersData.patients) {
      const user = new User({ ...pat, passwordHash: PLAIN_PASSWORD });
      await user.save();
      createdUsers.push(user);
    }
    console.log(`Inserted ${createdUsers.length} users`);

    // --- 3. Set department heads (some doctors are heads) ---
    for (const doc of usersData.doctors) {
      if (doc.isHead) {
        await Department.findByIdAndUpdate(depts[doc.departmentIndex]._id, {
          headUserId: createdUsers.find(u => u.email === doc.email)._id
        });
      }
    }
    console.log('Department heads assigned');

    // --- 4. Create appointments (mix of past, present, future) ---
    const doctorsList = createdUsers.filter(u => u.role === 'doctor');
    const patientsList = createdUsers.filter(u => u.role === 'patient');

    const appointmentsSeed = [
      // Past attended (yesterday)
      { patientIdx: 0, doctorIdx: 0, date: dateRelative(-1, 10, 0), status: 'attended' },
      { patientIdx: 1, doctorIdx: 1, date: dateRelative(-1, 11, 30), status: 'attended' },
      // Past no-show (day before yesterday)
      { patientIdx: 2, doctorIdx: 2, date: dateRelative(-2, 9, 0), status: 'no-show' },
      { patientIdx: 3, doctorIdx: 3, date: dateRelative(-2, 10, 30), status: 'no-show' },
      // Past cancelled (last week)
      { patientIdx: 4, doctorIdx: 0, date: dateRelative(-7, 14, 0), status: 'cancelled' },
      // Today's scheduled (morning)
      { patientIdx: 5, doctorIdx: 0, date: dateRelative(0, 8, 0), status: 'scheduled' },
      { patientIdx: 6, doctorIdx: 1, date: dateRelative(0, 9, 30), status: 'scheduled' },
      // Tomorrow's scheduled
      { patientIdx: 7, doctorIdx: 2, date: dateRelative(1, 10, 0), status: 'scheduled' },
      { patientIdx: 8, doctorIdx: 3, date: dateRelative(1, 11, 0), status: 'scheduled' },
      // Day after tomorrow
      { patientIdx: 9, doctorIdx: 4, date: dateRelative(2, 12, 0), status: 'scheduled' },
      { patientIdx: 0, doctorIdx: 5, date: dateRelative(2, 13, 0), status: 'scheduled' },
      // Next week (to test cascade on future)
      { patientIdx: 1, doctorIdx: 5, date: dateRelative(7, 9, 0), status: 'scheduled' }
    ];

    for (const appt of appointmentsSeed) {
      const appointment = new Appointment({
        patientId: patientsList[appt.patientIdx]._id,
        doctorId: doctorsList[appt.doctorIdx]._id,
        departmentId: doctorsList[appt.doctorIdx].departmentId,
        dateTime: appt.date,
        status: appt.status
      });
      await appointment.save();
    }
    console.log(`Inserted ${appointmentsSeed.length} appointments`);

    // --- 5. Create block times for one doctor (e.g., Dr. Khaled Ibrahim, idx 1) ---
    const blockDoctor = doctorsList[1];
    const blockTimes = [
      { doctorId: blockDoctor._id, date: formatLocalISODate(0), startTime: '12:00', endTime: '13:00', reason: 'Lunch block' },
      { doctorId: blockDoctor._id, date: formatLocalISODate(1), startTime: '14:00', endTime: '15:00', reason: 'Meeting' }
    ];

    await BlockTime.insertMany(blockTimes);
    console.log(`Inserted ${blockTimes.length} block times`);

    console.log('Seed completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
}

seed();
