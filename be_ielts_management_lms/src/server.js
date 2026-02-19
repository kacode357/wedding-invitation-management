// Bootstrap: load environment variables and start the HTTP server
require("dotenv").config();

const app = require("./app");
const { initDatabase } = require("./db/init");
const { seedAdminUser } = require("./seeds/admin.seed");
const { exec } = require("child_process");

/**
 * Normalize API_URL - add https:// if protocol is missing
 * @returns {string|null} - Normalized URL or null
 */
function getNormalizedApiUrl() {
  if (!process.env.API_URL) return null;
  
  let url = process.env.API_URL;
  // Add https:// if no protocol specified
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }
  return url;
}

/**
 * Get port for the server
 * In production (Railway, Render, etc.), always use the platform-assigned PORT
 * In development, use .env PORT or default 5000
 * @returns {number} - The port number to use
 */
function getPort() {
  // In production, always use platform PORT (Railway, Render, etc.)
  // These platforms set PORT environment variable automatically
  if (process.env.NODE_ENV === "production") {
    // Platform PORT takes priority in production
    if (process.env.PORT) {
      return parseInt(process.env.PORT, 10);
    }
    // Fallback for production without PORT (shouldn't happen on major platforms)
    return 8080;
  }

  // Development: use .env PORT if set, otherwise default 5000
  if (process.env.PORT) {
    return parseInt(process.env.PORT, 10);
  }
  
  return 5000;
}

const PORT = getPort();

/**
 * Kill process running on specified port
 * @param {number} port - The port number to check and kill
 * @returns {Promise<boolean>} - Returns true if a process was killed, false otherwise
 */
function killPort(port) {
  return new Promise((resolve) => {
    // Use netstat to find PID using the port
    const command = process.platform === "win32"
      ? `netstat -ano | findstr :${port} | findstr LISTENING`
      : `lsof -ti:${port}`;

    exec(command, (error, stdout) => {
      if (error || !stdout.trim()) {
        resolve(false);
        return;
      }

      // Extract PID from netstat output (Windows)
      const lines = stdout.trim().split("\n");
      const pids = new Set();

      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        if (parts.length > 4) {
          const pid = parts[parts.length - 1];
          if (pid && !isNaN(pid)) {
            pids.add(pid);
          }
        }
      }

      if (pids.size === 0) {
        resolve(false);
        return;
      }

      // Kill each PID found
      let killedCount = 0;
      const totalPids = pids.size;

      for (const pid of pids) {
        const killCommand = process.platform === "win32"
          ? `taskkill /PID ${pid} /F`
          : `kill -9 ${pid}`;

        exec(killCommand, (killError) => {
          if (!killError) {
            console.log(`✓ Killed process ${pid} on port ${port}`);
          }
          killedCount++;
          if (killedCount === totalPids) {
            resolve(true);
          }
        });
      }
    });
  });
}

/**
 * Initialize database and start the server
 */
async function start() {
  // Kill any process running on the determined port
  console.log(`⏳ Checking port ${PORT}...`);
  const killed = await killPort(PORT);
  if (killed) {
    console.log(`✓ Port ${PORT} is now free`);
    // Wait a bit for the port to be released
    await new Promise(resolve => setTimeout(resolve, 1000));
  } else {
    console.log(`✓ Port ${PORT} is available`);
  }

  // Connect to MongoDB
  try {
    await initDatabase();
    console.log("✓ MongoDB Connected");
  } catch (err) {
    console.error("✗ Database connection failed:", err.message);
    console.log("→ Vào MongoDB Atlas → Network Access → Thêm IP 0.0.0.0/0");
    process.exit(1);
  }

  // Seed admin user if not exists
  await seedAdminUser();

  // Start HTTP server - get API URL from environment
  const serverUrl = process.env.NODE_ENV === "production"
    ? getNormalizedApiUrl()
    : `http://localhost:${PORT}`;

  app.listen(PORT, () => {
    console.log(`\n🚀 IELTS Management LMS API`);
    console.log(`   Port: ${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV}`);
    console.log(`   API: ${serverUrl}`);
    console.log(`   Docs: ${serverUrl}/api-docs`);
    console.log("");
  });
}

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION! 💥 Shutting down...");
  console.error(err);
  process.exit(1);
});

start();
