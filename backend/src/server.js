const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/auth');
const templateRoutes = require('./routes/templates');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'TemplateHub API is running' });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

// Auto-seed function for in-memory DB
const autoSeed = async () => {
  const User = require('./models/User');
  const count = await User.countDocuments();
  if (count === 0) {
    console.log('🌱 Database is empty, seeding demo data...');
    const Template = require('./models/Template');
    const Review = require('./models/Review');

    const users = await User.create([
      { name: 'Admin User', email: 'admin@templatehub.com', password: 'admin123', role: 'admin', bio: 'TemplateHub administrator' },
      { name: 'Sarah Johnson', email: 'sarah@example.com', password: 'password123', bio: 'Professional template designer with 5 years of experience' },
      { name: 'Alex Chen', email: 'alex@example.com', password: 'password123', bio: 'UI/UX designer passionate about beautiful documents' },
      { name: 'Maya Patel', email: 'maya@example.com', password: 'password123', bio: 'Business consultant & template specialist' },
      { name: 'James Wilson', email: 'james@example.com', password: 'password123', bio: 'Educator and curriculum designer' },
      { name: 'Emily Davis', email: 'emily@example.com', password: 'password123', bio: 'Graphic designer & presentation expert' }
    ]);

    const templates = await Template.create([
      { title: 'Modern Business Proposal', description: 'Clean layout for professionals...', category: 'Business', tags: ['proposal', 'corporate'], fileUrl: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?q=80&w=800', fileName: 'proposal.jpeg', fileSize: 1024000, fileType: 'image/jpeg', thumbnailUrl: 'https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?q=80&w=800', author: users[1]._id, downloads: 1245, averageRating: 4.8, totalRatings: 56, featured: true },
      { title: 'Tech Startup Pitch Deck', description: 'High-impact presentation', category: 'Technology', tags: ['pitch', 'deck', 'startup'], fileUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800', fileName: 'pitch.jpeg', fileSize: 4096000, fileType: 'image/jpeg', thumbnailUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800', author: users[2]._id, downloads: 4500, averageRating: 4.9, totalRatings: 210, featured: true },
      { title: 'Creative Design Portfolio', description: 'Showcase your work', category: 'Design', tags: ['portfolio', 'creative'], fileUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=800', fileName: 'portfolio.jpeg', fileSize: 3048000, fileType: 'image/jpeg', thumbnailUrl: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=800', author: users[3]._id, downloads: 3120, averageRating: 4.6, totalRatings: 124 },
      { title: 'Healthcare Patient Record', description: 'Medical record template', category: 'Healthcare', tags: ['medical', 'record'], fileUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=800', fileName: 'medical.jpeg', fileSize: 512000, fileType: 'image/jpeg', thumbnailUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=800', author: users[4]._id, downloads: 890, averageRating: 4.5, totalRatings: 34 },
      { title: 'Minimalist Resume Template', description: 'Modern, clean resume', category: 'Education', tags: ['resume', 'clean'], fileUrl: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=800', fileName: 'resume.jpeg', fileSize: 2048000, fileType: 'image/jpeg', thumbnailUrl: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=800', author: users[1]._id, downloads: 5200, averageRating: 4.9, totalRatings: 256, featured: true },
      { title: 'Marketing Campaign Flyer', description: 'Actionable marketing asset', category: 'Marketing', tags: ['marketing', 'flyer'], fileUrl: 'https://images.unsplash.com/photo-1542361345-89e58247f2d5?q=80&w=800', fileName: 'flyer.jpeg', fileSize: 2048000, fileType: 'image/jpeg', thumbnailUrl: 'https://images.unsplash.com/photo-1542361345-89e58247f2d5?q=80&w=800', author: users[2]._id, downloads: 1200, averageRating: 4.3, totalRatings: 56, featured: true }
    ]);

    await Review.create([
      { template: templates[0]._id, user: users[2]._id, rating: 5, comment: 'Absolutely stunning template! Clean design and very professional.' },
      { template: templates[0]._id, user: users[3]._id, rating: 5, comment: 'Used this for my client proposal. They were impressed!' },
      { template: templates[2]._id, user: users[1]._id, rating: 5, comment: 'Best portfolio template I have ever used. The animations are beautiful!' },
      { template: templates[2]._id, user: users[3]._id, rating: 5, comment: 'Creative and eye-catching. Perfect for showcasing my work.' },
      { template: templates[4]._id, user: users[1]._id, rating: 5, comment: 'Got multiple interview calls after using this resume template!' },
      { template: templates[4]._id, user: users[3]._id, rating: 5, comment: 'ATS-friendly and beautiful at the same time. Highly recommend!' },
      { template: templates[1]._id, user: users[2]._id, rating: 5, comment: 'Saved me hours of formatting! Helped us secure our series A.' },
      { template: templates[1]._id, user: users[3]._id, rating: 5, comment: 'Helped us secure funding! The design is incredible.' }
    ]);

    console.log('✅ Demo data seeded successfully!');
    console.log('📧 Admin: admin@templatehub.com / admin123');
    console.log('📧 User:  sarah@example.com / password123');
  }
};

// Start server
const startServer = async () => {
  await connectDB();
  await autoSeed();

  app.listen(PORT, () => {
    console.log(`🚀 TemplateHub API running on port ${PORT}`);
    console.log(`📁 Environment: ${process.env.NODE_ENV}`);
  });
};

startServer();

module.exports = app;
