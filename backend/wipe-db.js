require('dotenv').config({ path: '/Users/mrmobinansari/Desktop/Projects/ppp/backend/.env' });
const mongoose = require('mongoose');
const User = require('/Users/mrmobinansari/Desktop/Projects/ppp/backend/src/models/User');
const Template = require('/Users/mrmobinansari/Desktop/Projects/ppp/backend/src/models/Template');
const Review = require('/Users/mrmobinansari/Desktop/Projects/ppp/backend/src/models/Review');

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  await User.deleteMany({});
  await Template.deleteMany({});
  await Review.deleteMany({});
  console.log('Database wiped!');
  
  // Actually copy the seed logic here since it's easy:
  const users = await User.create([
      { name: 'Admin User', email: 'admin@templatehub.com', password: 'admin123', role: 'admin', bio: 'TemplateHub administrator' },
      { name: 'Sarah Johnson', email: 'sarah@example.com', password: 'password123', bio: 'Professional template designer with 5 years of experience' },
      { name: 'Alex Chen', email: 'alex@example.com', password: 'password123', bio: 'UI/UX designer passionate about beautiful documents' },
      { name: 'Maya Patel', email: 'maya@example.com', password: 'password123', bio: 'Business consultant & template specialist' },
      { name: 'James Wilson', email: 'james@example.com', password: 'password123', bio: 'Educator and curriculum designer' },
      { name: 'Emily Davis', email: 'emily@example.com', password: 'password123', bio: 'Graphic designer & presentation expert', avatar: 'https://i.pravatar.cc/150?u=emily' }
    ]);
  const templates = await Template.create([
      { title: 'Graphic Designer Resume', description: 'Modern, creative resume...', category: 'Resumes', tags: ['resume', 'creative'], fileUrl: 'https://picsum.photos/seed/resume-1/800/600', fileName: 'resume.jpeg', fileSize: 1024000, fileType: 'image/jpeg', thumbnailUrl: 'https://picsum.photos/seed/resume-1/800/600', author: users[1]._id, downloads: 1245, averageRating: 4.8, totalRatings: 56, featured: true },
      { title: 'Corporate Professional CV', description: 'Clean layout for professionals...', category: 'Resumes', tags: ['resume', 'corporate'], fileUrl: 'https://picsum.photos/seed/resume-2/800/600', fileName: 'cv.jpeg', fileSize: 768000, fileType: 'image/jpeg', thumbnailUrl: 'https://picsum.photos/seed/resume-2/800/600', author: users[2]._id, downloads: 4500, averageRating: 4.9, totalRatings: 210 },
      { title: 'Minimalist White Resume', description: 'White clean...', category: 'Resumes', tags: ['resume', 'white'], fileUrl: 'https://picsum.photos/seed/resume-3/800/600', fileName: 'white.jpeg', fileSize: 768000, fileType: 'image/jpeg', thumbnailUrl: 'https://picsum.photos/seed/resume-3/800/600', author: users[3]._id, downloads: 400, averageRating: 4.4, totalRatings: 10 },
      { title: 'Startup Pitch Deck', description: 'High-impact presentation for startups...', category: 'Presentations', tags: ['pitch', 'deck', 'startup'], fileUrl: 'https://picsum.photos/seed/presentation-1/800/600', fileName: 'pitch.jpeg', fileSize: 4096000, fileType: 'image/jpeg', thumbnailUrl: 'https://picsum.photos/seed/presentation-1/800/600', author: users[3]._id, downloads: 1890, averageRating: 4.7, totalRatings: 67, featured: true },
      { title: 'Minimalist Project Proposal', description: 'Clean presentation...', category: 'Presentations', tags: ['proposal', 'minimal'], fileUrl: 'https://picsum.photos/seed/presentation-2/800/600', fileName: 'proposal.jpeg', fileSize: 3048000, fileType: 'image/jpeg', thumbnailUrl: 'https://picsum.photos/seed/presentation-2/800/600', author: users[4]._id, downloads: 3120, averageRating: 4.9, totalRatings: 124 },
      { title: 'Creative Agency Pitch', description: 'Bold and distinct...', category: 'Presentations', tags: ['pitch', 'agency'], fileUrl: 'https://picsum.photos/seed/presentation-3/800/600', fileName: 'agency.jpeg', fileSize: 4096000, fileType: 'image/jpeg', thumbnailUrl: 'https://picsum.photos/seed/presentation-3/800/600', author: users[5]._id, downloads: 1000, averageRating: 4.5, totalRatings: 30 },
      { title: 'Vintage Music Poster', description: 'Retro poster design...', category: 'Posters', tags: ['poster', 'vintage'], fileUrl: 'https://picsum.photos/seed/poster-1/800/600', fileName: 'poster.jpeg', fileSize: 2048000, fileType: 'image/jpeg', thumbnailUrl: 'https://picsum.photos/seed/poster-1/800/600', author: users[1]._id, downloads: 890, averageRating: 4.5, totalRatings: 34 },
      { title: 'Happy Birthday Celebration', description: 'Birthday poster...', category: 'Posters', tags: ['poster', 'birthday'], fileUrl: 'https://picsum.photos/seed/poster-2/800/600', fileName: 'bday.jpeg', fileSize: 512000, fileType: 'image/jpeg', thumbnailUrl: 'https://picsum.photos/seed/poster-2/800/600', author: users[2]._id, downloads: 1567, averageRating: 4.4, totalRatings: 45 },
      { title: 'Minimalist Event Flyer', description: 'Modern flyer...', category: 'Flyers', tags: ['flyer', 'event'], fileUrl: 'https://picsum.photos/seed/flyer-1/800/600', fileName: 'flyer.jpeg', fileSize: 3072000, fileType: 'image/jpeg', thumbnailUrl: 'https://picsum.photos/seed/flyer-1/800/600', author: users[3]._id, downloads: 2100, averageRating: 4.6, totalRatings: 78 },
      { title: 'Chill Lofi Music Cover', description: 'YouTube thumbnail...', category: 'YouTube Thumbnails', tags: ['youtube', 'lofi'], fileUrl: 'https://picsum.photos/seed/yt-1/800/600', fileName: 'thumb.jpeg', fileSize: 656000, fileType: 'image/jpeg', thumbnailUrl: 'https://picsum.photos/seed/yt-1/800/600', author: users[4]._id, downloads: 1320, averageRating: 4.3, totalRatings: 41 },
      { title: 'Tech Review Video Thumbnail', description: 'Catchy YT thumb...', category: 'YouTube Thumbnails', tags: ['youtube', 'tech'], fileUrl: 'https://picsum.photos/seed/yt-2/800/600', fileName: 'thumb2.jpeg', fileSize: 8192000, fileType: 'image/jpeg', thumbnailUrl: 'https://picsum.photos/seed/yt-2/800/600', author: users[5]._id, downloads: 2780, averageRating: 4.8, totalRatings: 98 },
      { title: 'White Business Document', description: 'Clean doc...', category: 'Documents', tags: ['doc', 'business'], fileUrl: 'https://picsum.photos/seed/doc-1/800/600', fileName: 'doc.jpeg', fileSize: 2048000, fileType: 'image/jpeg', thumbnailUrl: 'https://picsum.photos/seed/doc-1/800/600', author: users[1]._id, downloads: 1650, averageRating: 4.5, totalRatings: 52 },
      { title: 'Aesthetic Instagram Story', description: 'Social template...', category: 'Social Media', tags: ['instagram', 'story'], fileUrl: 'https://picsum.photos/seed/social-1/800/600', fileName: 'story.jpeg', fileSize: 3584000, fileType: 'image/jpeg', thumbnailUrl: 'https://picsum.photos/seed/social-1/800/600', author: users[2]._id, downloads: 980, averageRating: 4.7, totalRatings: 38 }
    ]);
  console.log('Seeded done');
  process.exit();
}
run();
