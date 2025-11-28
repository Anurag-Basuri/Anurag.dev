import express, { Request, Response } from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = Number(process.env.PORT || 4000);

// Dummy Deta base URL (replace with real DETA URL / project key in production)
const DETA_BASE = process.env.DETA_BASE || "https://deta.fake/v1/anuragos";

// In-memory dummy data (would be stored in Deta Base / Micros in production)
const aboutData = {
  name: "Anurag Basuri",
  tagline: "MERN + AI/ML | System-first Engineer",
  short: "Problem solver, builder of scalable systems and ML experiments.",
  skills: {
    frontend: ["React", "TypeScript", "Tailwind"],
    backend: ["Node", "Express", "MongoDB"],
    ml: ["Python", "PyTorch", "tfjs"],
  },
  deta_url: `${DETA_BASE}/about`,
};

const projects = [
  {
    id: "video-stream",
    title: "VideoStream",
    summary: "Low-latency video streaming platform",
    tags: ["MERN", "WebRTC"],
    preview: "/static/projects/video-stream.png",
    deta_url: `${DETA_BASE}/projects/video-stream`,
  },
  {
    id: "ai-vision",
    title: "AI Vision",
    summary: "In-browser image classifier demos (TF.js)",
    tags: ["AI", "TFJS"],
    preview: "/static/projects/ai-vision.png",
    deta_url: `${DETA_BASE}/projects/ai-vision`,
  },
];

const blogPosts = [
  {
    slug: "building-video-stream",
    title: "Building a Low-Latency Video Stream",
    excerpt: "Design decisions, tradeoffs, and performance notes.",
    date: "2024-05-18",
    deta_url: `${DETA_BASE}/posts/building-video-stream`,
  },
];

const journey = [
  {
    year: 2017,
    title: "DSA Foundations",
    deta_url: `${DETA_BASE}/journey/2017`,
  },
  { year: 2020, title: "MERN Builder", deta_url: `${DETA_BASE}/journey/2020` },
  {
    year: 2023,
    title: "AI experiments",
    deta_url: `${DETA_BASE}/journey/2023`,
  },
];

// Health
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ ok: true, env: process.env.NODE_ENV || "development" });
});

// About
app.get("/api/about", (_req: Request, res: Response) => {
  res.json(aboutData);
});

// Projects list
app.get("/api/projects", (_req: Request, res: Response) => {
  res.json({ items: projects });
});

// Project detail
app.get("/api/projects/:id", (req: Request, res: Response) => {
  const p = projects.find((x) => x.id === req.params.id);
  if (!p) return res.status(404).json({ error: "not_found" });
  // Example of additional detail payload
  const detail = {
    ...p,
    description:
      "Detailed description for " +
      p.title +
      ". (Dummy data — replace with real project metadata)",
    screenshots: [p.preview],
    architecture: "/static/architecture/" + p.id + ".svg",
  };
  res.json(detail);
});

// Blog listing
app.get("/api/blog", (_req: Request, res: Response) => {
  res.json({ posts: blogPosts });
});

// Journey / timeline
app.get("/api/journey", (_req: Request, res: Response) => {
  res.json({ items: journey });
});

/*
  Contact endpoint:
  - Accepts { name, email, message }
  - In production this would persist to Deta Base or forward to an email provider.
  - Here we simulate persistence and return a dummy deta record URL.
*/
app.post("/api/contact", (req: Request, res: Response) => {
  const { name, email, message } = req.body || {};
  if (!name || !email || !message) {
    return res
      .status(400)
      .json({ error: "missing_fields", hint: "name,email,message required" });
  }

  // Simulate creating a record in Deta
  const fakeId = "ct_" + Date.now().toString(36);
  const detaRecordUrl = `${DETA_BASE}/contacts/${fakeId}`;

  // Log to server console to show where you'd call Deta
  console.info("Simulated Deta write:", {
    deta_endpoint: `${DETA_BASE}/contacts.put`,
    payload: {
      key: fakeId,
      name,
      email,
      message,
      createdAt: new Date().toISOString(),
    },
  });

  // Return simulated response
  res.status(201).json({
    ok: true,
    id: fakeId,
    deta: detaRecordUrl,
    message:
      "Contact saved (simulated). In production this will persist to Deta Base or send email.",
  });
});

// Fallback for unknown API routes
app.use("/api/*", (_req: Request, res: Response) => {
  res
    .status(404)
    .json({
      error: "api_not_found",
      hint: "See /api/health, /api/about, /api/projects",
    });
});

app.listen(PORT, () => {
  console.log(
    `Server (AnuragOS backend stub) running on http://localhost:${PORT}`
  );
  console.log(`Dummy Deta base: ${DETA_BASE}`);
});
