import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const passwordHash = await bcrypt.hash('admin123', 12);
  
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@anuragos.dev',
      passwordHash,
    },
  });

  console.log('✅ Created admin user:', admin.username);

  // Create sample projects
  const project1 = await prisma.project.upsert({
    where: { id: 'sample-project-1' },
    update: {},
    create: {
      id: 'sample-project-1',
      title: 'VideoStream Platform',
      description: 'A low-latency video streaming platform built with WebRTC and Node.js',
      techStack: ['Node.js', 'WebRTC', 'React', 'TypeScript'],
      githubUrl: 'https://github.com/example/videostream',
      liveUrl: 'https://videostream.example.com',
      status: 'published',
    },
  });

  console.log('✅ Created sample project:', project1.title);

  // Create sample journey entries
  const journey1 = await prisma.journeyEntry.upsert({
    where: { id: 'journey-1' },
    update: {},
    create: {
      id: 'journey-1',
      year: 2017,
      title: 'Started Programming Journey',
      description: 'Began learning data structures and algorithms',
      category: 'education',
      order: 1,
    },
  });

  const journey2 = await prisma.journeyEntry.upsert({
    where: { id: 'journey-2' },
    update: {},
    create: {
      id: 'journey-2',
      year: 2020,
      title: 'Full Stack Developer',
      description: 'Started building MERN stack applications',
      category: 'work',
      order: 2,
    },
  });

  console.log('✅ Created journey entries');

  // Create sample blog post
  const blog1 = await prisma.blogPost.upsert({
    where: { slug: 'building-scalable-systems' },
    update: {},
    create: {
      title: 'Building Scalable Systems',
      slug: 'building-scalable-systems',
      content: '# Building Scalable Systems\n\nThis is a sample blog post about building scalable systems...',
      tags: ['architecture', 'scalability', 'backend'],
      status: 'published',
      publishedAt: new Date(),
    },
  });

  console.log('✅ Created sample blog post:', blog1.title);

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
