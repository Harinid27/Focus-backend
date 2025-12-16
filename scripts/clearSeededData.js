// Script to remove only seeded fake data
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Session from '../models/Session.js';
import Event from '../models/Event.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory for dotenv
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

console.log('📋 Environment Check:');
console.log(`   MONGO_URL: ${process.env.MONGO_URL ? '✅ Set' : '❌ NOT SET'}`);
if (!process.env.MONGO_URL) {
  console.error('❌ Error: MONGO_URL is not defined in .env file');
  process.exit(1);
}

// Seeded fake user emails
const SEEDED_USER_EMAILS = [
  'john@example.com',
  'jane@example.com',
  'mike@example.com'
];

async function clearSeededData() {
  try {
    console.log('\n🗑️  Clearing seeded fake data...');
    console.log(`   Connecting to: ${process.env.MONGO_URL}\n`);
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 5000
    });
    console.log('✅ Connected to MongoDB');
    
    // Find seeded users
    console.log('🔍 Finding seeded users...');
    const seededUsers = await User.find({ email: { $in: SEEDED_USER_EMAILS } });
    const seededUserIds = seededUsers.map(u => u._id);
    
    console.log(`✅ Found ${seededUsers.length} seeded users to remove`);
    
    // Delete events associated with seeded users
    console.log('🗑️  Deleting events for seeded users...');
    const deletedEventsResult = await Event.deleteMany({ user: { $in: seededUserIds } });
    console.log(`✅ Deleted ${deletedEventsResult.deletedCount} events`);
    
    // Delete sessions associated with seeded users
    console.log('🗑️  Deleting sessions for seeded users...');
    const deletedSessionsResult = await Session.deleteMany({ user: { $in: seededUserIds } });
    console.log(`✅ Deleted ${deletedSessionsResult.deletedCount} sessions`);
    
    // Delete seeded users
    console.log('🗑️  Deleting seeded users...');
    const deletedUsersResult = await User.deleteMany({ email: { $in: SEEDED_USER_EMAILS } });
    console.log(`✅ Deleted ${deletedUsersResult.deletedCount} users`);
    
    // Final statistics
    const userCount = await User.countDocuments();
    const sessionCount = await Session.countDocuments();
    const eventCount = await Event.countDocuments();
    
    console.log('\n🎉 Seeded data cleared successfully!');
    console.log('📈 Remaining Data:');
    console.log(`   Users: ${userCount}`);
    console.log(`   Sessions: ${sessionCount}`);
    console.log(`   Events: ${eventCount}`);
    
  } catch (error) {
    console.error('❌ Failed to clear seeded data:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run clearing
clearSeededData();
