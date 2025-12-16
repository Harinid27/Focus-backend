// Database initialization script
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

async function initializeDatabase() {
  try {
    console.log('\n🚀 Initializing database...');
    console.log(`   Connecting to: ${process.env.MONGO_URL}\n`);
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 5000
    });
    console.log('✅ Connected to MongoDB');
    
    // Get database info
    const db = mongoose.connection.db;
    const admin = db.admin();
    const dbStats = await admin.serverStatus();
    
    console.log(`📊 MongoDB Version: ${dbStats.version}`);
    console.log(`🏠 Database: ${db.databaseName}`);
    
    // Check collections
    const collections = await db.listCollections().toArray();
    console.log(`📁 Existing collections: ${collections.map(c => c.name).join(', ') || 'None'}`);
    
    // Create indexes
    console.log('🔍 Creating indexes...');
    
    // User indexes
    await User.createIndexes();
    console.log('✅ User indexes created');
    
    // Session indexes
    await Session.createIndexes();
    console.log('✅ Session indexes created');
    
    // Event indexes
    await Event.createIndexes();
    console.log('✅ Event indexes created');
    
    // Test data operations
    console.log('🧪 Testing database operations...');
    
    // Test user creation (if not exists)
    const testEmail = 'test@focusapp.com';
    let testUser = await User.findOne({ email: testEmail });
    
    if (!testUser) {
      testUser = new User({
        name: 'Test User',
        email: testEmail,
        password: 'hashedpassword123' // In real app, this would be hashed
      });
      await testUser.save();
      console.log('✅ Test user created');
    } else {
      console.log('ℹ️ Test user already exists');
    }
    
    // Test session creation
    const testSession = new Session({
      user: testUser._id,
      topic: 'Database Testing',
      duration: 1800, // 30 minutes
      startTime: new Date(Date.now() - 1800000), // 30 minutes ago
      endTime: new Date(),
      status: 'completed'
    });
    
    await testSession.save();
    console.log('✅ Test session created');
    
    // Test event creation
    const testEvent = new Event({
      user: testUser._id,
      session: testSession._id,
      type: 'FOCUS_START',
      message: 'User started focusing on database testing',
      severity: 'low'
    });
    
    await testEvent.save();
    console.log('✅ Test event created');
    
    // Query tests
    const userCount = await User.countDocuments();
    const sessionCount = await Session.countDocuments();
    const eventCount = await Event.countDocuments();
    
    console.log(`📈 Database Statistics:`);
    console.log(`   Users: ${userCount}`);
    console.log(`   Sessions: ${sessionCount}`);
    console.log(`   Events: ${eventCount}`);
    
    // Test relationships
    const sessionWithUser = await Session.findById(testSession._id).populate('user', 'name email');
    console.log(`🔗 Relationship test: Session "${sessionWithUser.topic}" belongs to "${sessionWithUser.user.name}"`);
    
    console.log('🎉 Database initialization completed successfully!');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run initialization
initializeDatabase();