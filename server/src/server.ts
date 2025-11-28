import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Dummy data
const aboutInfo = {
  name: 'Anurag Basuri',
  tagline: 'MERN + AI/ML | System-first Engineer',
  bio: 'Passionate full‑stack engineer with a love for building developer‑first experiences.',
  skills: ['React', 'TypeScript', 'Node', 'Express', 'PostgreSQL', 'Prisma', 'TensorFlow.js'],
};

const projects = [
  {
    id: 'video-stream',
    title: 'Video Stream Platform',
    description: 'Live video streaming with adaptive bitrate.',
    tech: ['Next.js', 'Node', 'WebRTC'],
    demoUrl: 'https://example.com/video-stream',
    repoUrl: 'https://github.com/anurag/video-stream',
  },
  {
    id: 'ai-chatbot',
    title: 'AI Chatbot',
    description: 'Conversational AI powered by TensorFlow.js.',
    tech: ['React', 'TensorFlow.js'],
    demoUrl: 'https://example.com/ai-chatbot',
    repoUrl: 'https://github.com/anurag/ai-chatbot',
  },
];

// Routes
app.get('/api/about', (_req: Request, res: Response) => {
  res.json(aboutInfo);
});

app.get('/api/projects', (_req: Request, res: Response) => {
  res.json(projects);
});

app.post('/api/contact', (req: Request, res: Response) => {
  const { name, email, message } = req.body;
  // In a real app you'd send an email or store in DB. Here we just echo back.
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  res.json({ status: 'received', name, email, message });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend listening on http://localhost:${PORT}`);
});
