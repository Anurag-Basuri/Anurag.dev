# 🚀 Quick Start Guide - AnuragOS Portfolio

Get up and running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- PostgreSQL running
- Redis running (optional for now)

## Step 1: Install Dependencies

```bash
# Backend
cd server
npm install

# Frontend (in a new terminal)
cd client
npm install
```

## Step 2: Configure Backend

```bash
cd server

# Copy environment file
cp .env.example .env
```

Edit `.env` and set these **required** variables:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/anuragos_db
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long-please
JWT_REFRESH_SECRET=your-super-secret-refresh-key-at-least-32-characters-long
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_S3_BUCKET=your-bucket-name
```

## Step 3: Set Up Database

```bash
cd server

# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed with sample data
npm run db:seed
```

You should see:
```
✅ Created admin user: admin
✅ Created sample project: VideoStream Platform
✅ Created journey entries
✅ Created sample blog post: Building Scalable Systems
🎉 Seeding completed!
```

## Step 4: Start Backend

```bash
cd server
npm run dev
```

You should see:
```
🔧 Environment validated successfully
📦 Environment: development
✅ Redis connected
🚀 Server running on http://localhost:4000
📚 API Documentation: http://localhost:4000/api-docs
```

## Step 5: Start Frontend

In a new terminal:

```bash
cd client
npm run dev
```

You should see:
```
▲ Next.js 16.0.5
- Local:        http://localhost:3000
```

## Step 6: Access the Application

Open your browser to: **http://localhost:3000**

You'll see:
1. Boot animation
2. Terminal interface with file explorer
3. CLI ready for commands

## Step 7: Try It Out!

Type these commands in the terminal:

```bash
help          # See all commands
about         # Open About module
projects      # See your projects
journey       # View timeline
blog          # Read blog posts
contact       # Open contact form
```

## 🎯 What You Should See

### Backend (http://localhost:4000)
- Health check: http://localhost:4000/api/health
- API docs: http://localhost:4000/api-docs
- Projects: http://localhost:4000/api/projects

### Frontend (http://localhost:3000)
- Terminal-style interface
- File explorer on the left
- CLI on the right
- Type commands to open windows

## 🔐 Default Admin Credentials

- **Username**: `admin`
- **Password**: `admin123`
- **Email**: `admin@anuragos.dev`

⚠️ **Change these immediately in production!**

## 🐛 Troubleshooting

### Database Connection Error

```bash
# Make sure PostgreSQL is running
# Check your DATABASE_URL in .env
# Try creating the database manually:
createdb anuragos_db
```

### Redis Connection Error

```bash
# Redis is optional for basic functionality
# If you see Redis errors, you can ignore them for now
# Or start Redis:
redis-server
```

### Port Already in Use

```bash
# Backend (port 4000)
# Change PORT in server/.env

# Frontend (port 3000)
# Next.js will automatically try 3001, 3002, etc.
```

### Prisma Client Not Generated

```bash
cd server
npm run db:generate
```

### Module Not Found Errors

```bash
# Make sure you installed dependencies
cd server && npm install
cd client && npm install
```

## 📚 Next Steps

1. **Explore the API**: http://localhost:4000/api-docs
2. **Try all CLI commands**: Type `help` in the terminal
3. **Check the data**: Use Prisma Studio
   ```bash
   cd server
   npm run db:studio
   ```
4. **Read the docs**: Check README.md for detailed information

## 🎨 Customize

### Add Your Own Data

Edit `server/prisma/seed.ts` and run:
```bash
npm run db:seed
```

### Change Theme Colors

Edit `client/src/app/globals.css`

### Add New Commands

Edit `client/src/lib/commands.ts`

## 🚀 Deploy

### Backend
1. Deploy to Railway, Render, or Fly.io
2. Set environment variables
3. Run migrations

### Frontend
1. Deploy to Vercel (recommended)
2. Set `NEXT_PUBLIC_API_URL` to your backend URL
3. Deploy!

## 💡 Tips

- Use `↑` and `↓` arrows for command history
- Use `Tab` for command completion
- Type `clear` to clear the terminal
- Windows are draggable and resizable
- Multiple windows can be open at once

## 🎉 You're Ready!

Your portfolio is now running. Start customizing it with your own:
- Projects
- Journey entries
- Blog posts
- About information

Happy coding! 🚀
