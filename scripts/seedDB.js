// Database seeder script for testing
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
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

const sampleUsers = [
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123'
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'password123'
  },
  {
    name: 'Mike Johnson',
    email: 'mike@example.com',
    password: 'password123'
  }
];

const focusTopics = [
  'React Development',
  'Node.js Backend',
  'Database Design',
  'UI/UX Design',
  'Code Review',
  'Documentation Writing',
  'Bug Fixing',
  'Feature Planning',
  'Testing',
  'Learning New Technology'
];

const eventTypes = ['TAB_SWITCH', 'IDLE', 'WARNING', 'FOCUS_START', 'FOCUS_END', 'BREAK'];

async function seedDatabase() {
  try {
    console.log('\n🌱 Seeding database...');
    console.log(`   Connecting to: ${process.env.MONGO_URL}\n`);
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URL, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 5000
    });
    console.log('✅ Connected to MongoDB');
    
    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('🧹 Clearing existing data...');
    await Event.deleteMany({});
    await Session.deleteMany({});
    await User.deleteMany({});
    console.log('✅ Existing data cleared');
    
    // Create users
    console.log('👥 Creating users...');
    const createdUsers = [];
    
    for (const userData of sampleUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      const user = new User({
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        isActive: true
      });
      
      await user.save();
      createdUsers.push(user);
      console.log(`✅ Created user: ${user.name} (${user.email})`);
    }
    
    // Create sessions for each user
    console.log('📊 Creating sessions...');
    const createdSessions = [];
    
    for (const user of createdUsers) {
      // Create 5-10 sessions per user
      const sessionCount = Math.floor(Math.random() * 6) + 5;
      
      for (let i = 0; i < sessionCount; i++) {
        const topic = focusTopics[Math.floor(Math.random() * focusTopics.length)];
        const duration = Math.floor(Math.random() * 7200) + 300; // 5 minutes to 2 hours
        const daysAgo = Math.floor(Math.random() * 30); // Within last 30 days
        const startTime = new Date(Date.now() - (daysAgo * 24 * 60 * 60 * 1000) - (duration * 1000));
        const endTime = new Date(startTime.getTime() + (duration * 1000));
        
        // Generate random distractions
        const distractionCount = Math.floor(Math.random() * 5);
        const distractions = [];
        for (let d = 0; d < distractionCount; d++) {
          const distractionDuration = Math.floor(Math.random() * 300) + 30; // 30s to 5m
          const distractionTime = new Date(
            startTime.getTime() + Math.floor(Math.random() * (endTime.getTime() - startTime.getTime()))
          );
          distractions.push({
            time: distractionTime.toLocaleTimeString(),
            reason: ['Social Media', 'YouTube', 'Email', 'Messaging', 'News'][Math.floor(Math.random() * 5)],
            duration: `${Math.floor(distractionDuration / 60)}m ${distractionDuration % 60}s`,
            durationMs: distractionDuration * 1000
          });
        }
        
        const session = new Session({
          user: user._id,
          topic,
          duration,
          warnings: Math.floor(Math.random() * 5),
          distractions,
          startTime,
          endTime,
          title: topic,
          date: startTime.toLocaleDateString(),
          status: 'completed'
        });
        
        await session.save();
        createdSessions.push(session);
      }
      
      console.log(`✅ Created ${sessionCount} sessions for ${user.name}`);
    }
    
    // Create events for sessions
    console.log('📝 Creating events...');
    let totalEvents = 0;
    
    for (const session of createdSessions) {
      // Create 2-8 events per session
      const eventCount = Math.floor(Math.random() * 7) + 2;
      
      for (let i = 0; i < eventCount; i++) {
        const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
        const eventTime = new Date(
          session.startTime.getTime() + 
          Math.floor(Math.random() * (session.endTime.getTime() - session.startTime.getTime()))
        );
        
        const event = new Event({
          user: session.user,
          session: session._id,
          type: eventType,
          message: `${eventType.toLowerCase().replace('_', ' ')} event during ${session.topic}`,
          timestamp: eventTime,
          severity: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
          resolved: Math.random() > 0.3, // 70% resolved
          meta: {
            sessionTopic: session.topic,
            duration: session.duration
          }
        });
        
        await event.save();
        totalEvents++;
      }
    }
    
    // Final statistics
    const userCount = await User.countDocuments();
    const sessionCount = await Session.countDocuments();
    const eventCount = await Event.countDocuments();
    
    console.log('\n🎉 Database seeding completed!');
    console.log('📈 Final Statistics:');
    console.log(`   Users: ${userCount}`);
    console.log(`   Sessions: ${sessionCount}`);
    console.log(`   Events: ${eventCount}`);
    
    // Test queries
    console.log('\n🔍 Testing sample queries...');
    
    const userWithSessions = await User.findOne().populate({
      path: 'sessions',
      options: { limit: 3, sort: { createdAt: -1 } }
    });
    
    const recentSessions = await Session.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);
    
    console.log(`✅ Sample user with sessions: ${userWithSessions?.name}`);
    console.log(`✅ Recent sessions count: ${recentSessions.length}`);
    
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Add virtual for user sessions
User.schema.virtual('sessions', {
  ref: 'Session',
  localField: '_id',
  foreignField: 'user'
});

// Run seeding
seedDatabase();