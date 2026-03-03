const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  // Create admin user (credentials login)
  const hashedPassword = await bcrypt.hash("admin123", 12);

  await prisma.user.upsert({
    where: { username: "skar" },
    update: { password: hashedPassword },
    create: {
      username: "skar",
      email: "skaryt2k23@gmail.com",
      password: hashedPassword,
      role: "admin",
    },
  });

  console.log("✅ Admin user created (username: skar, email: skaryt2k23@gmail.com)");

  // Clear existing data
  await prisma.resourceLink.deleteMany({});
  await prisma.video.deleteMany({});
  console.log("🗑️  Cleared existing videos and resources");

  // Create real videos — Video #001 on both platforms
  const ytVideo = await prisma.video.create({
    data: {
      videoNumber: "001",
      title: "Swiggy Clone — Full Build",
      description: "Built a Swiggy landing page clone from scratch using HTML, CSS and JavaScript.",
      platform: "YouTube",
      embedUrl: "https://www.youtube.com/embed/r-l5vpThBRs",
      tags: JSON.stringify(["swiggy", "clone", "html", "css", "javascript", "video-1"]),
      pinned: true,
    },
  });

  const igVideo = await prisma.video.create({
    data: {
      videoNumber: "001-ig",
      title: "Swiggy Clone — Full Build (Reel)",
      description: "Built a Swiggy landing page clone from scratch — Instagram reel version.",
      platform: "Instagram",
      embedUrl: "https://www.instagram.com/reel/DVGD-5fkla1/?igsh=ZzVocG1zb2xneWo5",
      tags: JSON.stringify(["swiggy", "clone", "html", "css", "javascript", "video-1"]),
      pinned: true,
    },
  });

  // Add resource link for the YouTube video
  await prisma.resourceLink.create({
    data: {
      videoId: ytVideo.id,
      title: "Swiggy Clone — Live Demo",
      url: "https://sia-swiggy.fly.dev/landing/index.html",
      description: "Live deployed Swiggy clone landing page",
      visitCount: 0,
    },
  });

  // Same resource on the Instagram video too
  await prisma.resourceLink.create({
    data: {
      videoId: igVideo.id,
      title: "Swiggy Clone — Live Demo",
      url: "https://sia-swiggy.fly.dev/landing/index.html",
      description: "Live deployed Swiggy clone landing page",
      visitCount: 0,
    },
  });

  console.log("✅ Real videos and resources created");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
