const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const Template = require('./models/Template');
const Review = require('./models/Review');

const connectDB = require('./config/db');

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    await Template.deleteMany({});
    await Review.deleteMany({});

    console.log('🗑️  Cleared existing data');

    // Create users
    const users = await User.create([
      {
        name: 'Admin User',
        email: 'admin@templatehub.com',
        password: 'admin123',
        role: 'admin',
        bio: 'TemplateHub administrator',
        avatar: ''
      },
      {
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        password: 'password123',
        bio: 'Professional template designer with 5 years of experience',
        avatar: ''
      },
      {
        name: 'Alex Chen',
        email: 'alex@example.com',
        password: 'password123',
        bio: 'UI/UX designer passionate about beautiful documents',
        avatar: ''
      },
      {
        name: 'Maya Patel',
        email: 'maya@example.com',
        password: 'password123',
        bio: 'Business consultant & template specialist',
        avatar: ''
      },
      {
        name: 'James Wilson',
        email: 'james@example.com',
        password: 'password123',
        bio: 'Educator and curriculum designer',
        avatar: ''
      },
      {
        name: 'Emily Davis',
        email: 'emily@example.com',
        password: 'password123',
        bio: 'Graphic designer & presentation expert',
        avatar: ''
      }
    ]);

    console.log('👤 Created users');

    // Create templates
    const templates = await Template.create([
      {
        title: 'Modern Business Proposal',
        description: 'A sleek, professional business proposal template with modern typography, clean layouts, and striking visual elements. Perfect for startups and established businesses alike.',
        category: 'Business',
        tags: ['proposal', 'business', 'professional', 'modern'],
        fileUrl: '/uploads/sample.pdf',
        fileName: 'business-proposal.pdf',
        fileSize: 2048000,
        fileType: 'application/pdf',
        author: users[1]._id,
        downloads: 1245,
        averageRating: 4.8,
        totalRatings: 56,
        featured: true
      },
      {
        title: 'Academic Research Paper',
        description: 'Comprehensive research paper template following APA 7th edition guidelines. Includes proper formatting for citations, references, tables, and figures.',
        category: 'Education',
        tags: ['research', 'academic', 'APA', 'paper'],
        fileUrl: '/uploads/sample.pdf',
        fileName: 'research-paper.docx',
        fileSize: 1536000,
        fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        author: users[4]._id,
        downloads: 2350,
        averageRating: 4.6,
        totalRatings: 89,
        featured: true
      },
      {
        title: 'Creative Portfolio Presentation',
        description: 'Stunning portfolio presentation template with animated transitions, bold color schemes, and creative layouts. Ideal for designers, artists, and creative professionals.',
        category: 'Design',
        tags: ['portfolio', 'creative', 'presentation', 'design'],
        fileUrl: '/uploads/sample.pdf',
        fileName: 'portfolio-presentation.pptx',
        fileSize: 5120000,
        fileType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        author: users[2]._id,
        downloads: 3120,
        averageRating: 4.9,
        totalRatings: 124,
        featured: true
      },
      {
        title: 'Tech Startup Pitch Deck',
        description: 'High-impact pitch deck template designed for technology startups. Features clean data visualization, market analysis slides, and compelling storytelling format.',
        category: 'Technology',
        tags: ['pitch deck', 'startup', 'technology', 'investment'],
        fileUrl: '/uploads/sample.pdf',
        fileName: 'pitch-deck.pptx',
        fileSize: 4096000,
        fileType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        author: users[3]._id,
        downloads: 1890,
        averageRating: 4.7,
        totalRatings: 67,
        featured: true
      },
      {
        title: 'Medical Report Template',
        description: 'Professional medical report template designed for healthcare providers. Includes sections for patient information, diagnosis, treatment plans, and follow-up notes.',
        category: 'Healthcare',
        tags: ['medical', 'healthcare', 'report', 'clinical'],
        fileUrl: '/uploads/sample.pdf',
        fileName: 'medical-report.pdf',
        fileSize: 1024000,
        fileType: 'application/pdf',
        author: users[1]._id,
        downloads: 890,
        averageRating: 4.5,
        totalRatings: 34
      },
      {
        title: 'Legal Contract Agreement',
        description: 'Comprehensive legal contract template suitable for freelancers and small businesses. Covers service agreements, terms & conditions, and liability clauses.',
        category: 'Legal',
        tags: ['legal', 'contract', 'agreement', 'freelance'],
        fileUrl: '/uploads/sample.pdf',
        fileName: 'legal-contract.docx',
        fileSize: 512000,
        fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        author: users[3]._id,
        downloads: 1567,
        averageRating: 4.4,
        totalRatings: 45
      },
      {
        title: 'Social Media Marketing Plan',
        description: 'Complete social media marketing plan template with content calendar, KPI tracking, audience analysis, and campaign strategy sections.',
        category: 'Marketing',
        tags: ['marketing', 'social media', 'strategy', 'plan'],
        fileUrl: '/uploads/sample.pdf',
        fileName: 'marketing-plan.pdf',
        fileSize: 3072000,
        fileType: 'application/pdf',
        author: users[5]._id,
        downloads: 2100,
        averageRating: 4.6,
        totalRatings: 78
      },
      {
        title: 'Professional Resume / CV',
        description: 'Modern, ATS-friendly resume template with clean typography, professional layout, and customizable sections. Stand out from the crowd with this elegant design.',
        category: 'Business',
        tags: ['resume', 'CV', 'job', 'career', 'professional'],
        fileUrl: '/uploads/sample.pdf',
        fileName: 'resume-template.docx',
        fileSize: 768000,
        fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        author: users[2]._id,
        downloads: 4500,
        averageRating: 4.9,
        totalRatings: 210,
        featured: true
      },
      {
        title: 'Course Syllabus Template',
        description: 'Well-structured course syllabus template for educators. Includes sections for learning objectives, schedule, grading rubrics, and policies.',
        category: 'Education',
        tags: ['education', 'syllabus', 'course', 'teaching'],
        fileUrl: '/uploads/sample.pdf',
        fileName: 'course-syllabus.pdf',
        fileSize: 656000,
        fileType: 'application/pdf',
        author: users[4]._id,
        downloads: 1320,
        averageRating: 4.3,
        totalRatings: 41
      },
      {
        title: 'Brand Identity Guidelines',
        description: 'Comprehensive brand identity guidelines template covering logo usage, color palette, typography, imagery style, and brand voice. Essential for any growing brand.',
        category: 'Design',
        tags: ['brand', 'identity', 'guidelines', 'branding'],
        fileUrl: '/uploads/sample.pdf',
        fileName: 'brand-guidelines.pdf',
        fileSize: 8192000,
        fileType: 'application/pdf',
        author: users[5]._id,
        downloads: 2780,
        averageRating: 4.8,
        totalRatings: 98
      },
      {
        title: 'Project Management Dashboard',
        description: 'Excel-based project management dashboard template with Gantt charts, task tracking, resource allocation, and progress visualization.',
        category: 'Business',
        tags: ['project management', 'dashboard', 'excel', 'tracking'],
        fileUrl: '/uploads/sample.pdf',
        fileName: 'project-dashboard.xlsx',
        fileSize: 2048000,
        fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        author: users[3]._id,
        downloads: 1650,
        averageRating: 4.5,
        totalRatings: 52
      },
      {
        title: 'AI & Machine Learning Report',
        description: 'Technical report template tailored for AI and ML projects. Features sections for methodology, model architecture, training results, and performance metrics.',
        category: 'Technology',
        tags: ['AI', 'machine learning', 'technical report', 'data science'],
        fileUrl: '/uploads/sample.pdf',
        fileName: 'ai-ml-report.pdf',
        fileSize: 3584000,
        fileType: 'application/pdf',
        author: users[2]._id,
        downloads: 980,
        averageRating: 4.7,
        totalRatings: 38
      }
    ]);

    console.log('📄 Created templates');

    // Create some reviews
    const reviews = await Review.create([
      { template: templates[0]._id, user: users[2]._id, rating: 5, comment: 'Absolutely stunning template! Clean design and very professional.' },
      { template: templates[0]._id, user: users[3]._id, rating: 5, comment: 'Used this for my client proposal. They were impressed!' },
      { template: templates[0]._id, user: users[4]._id, rating: 4, comment: 'Great template, would love to see more color options.' },
      { template: templates[2]._id, user: users[1]._id, rating: 5, comment: 'Best portfolio template I have ever used. The animations are beautiful!' },
      { template: templates[2]._id, user: users[3]._id, rating: 5, comment: 'Creative and eye-catching. Perfect for showcasing my work.' },
      { template: templates[7]._id, user: users[1]._id, rating: 5, comment: 'Got multiple interview calls after using this resume template!' },
      { template: templates[7]._id, user: users[3]._id, rating: 5, comment: 'ATS-friendly and beautiful at the same time. Highly recommend!' },
      { template: templates[7]._id, user: users[4]._id, rating: 5, comment: 'Clean, professional, and modern. Exactly what I needed.' },
      { template: templates[1]._id, user: users[2]._id, rating: 5, comment: 'Saved me hours of formatting! Perfect APA format.' },
      { template: templates[1]._id, user: users[5]._id, rating: 4, comment: 'Very thorough template. Great for academic papers.' },
      { template: templates[3]._id, user: users[1]._id, rating: 5, comment: 'Helped us secure $2M in funding! The design is incredible.' },
      { template: templates[3]._id, user: users[4]._id, rating: 4, comment: 'Good structure and flow for a pitch deck.' }
    ]);

    console.log('⭐ Created reviews');
    console.log('');
    console.log('✅ Seed data complete!');
    console.log('');
    console.log('📧 Login Credentials:');
    console.log('   Admin: admin@templatehub.com / admin123');
    console.log('   User:  sarah@example.com / password123');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed Error:', error);
    process.exit(1);
  }
};

seedData();
