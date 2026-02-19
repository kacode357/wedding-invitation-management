// Bootstrap: load environment variables and start the HTTP server
require("dotenv").config();

const app = require("./app");
const { initDatabase } = require("./db/init");
const { seedAdminUser } = require("./seeds/admin.seed");
const { exec } = require("child_process");

/**
 * Get port from environment or auto-detect from deployed URL
 * @returns {number} - The port number to use
 */
function getPort() {
  // If PORT is explicitly set in .env, use it
  if (process.env.PORT) {
    return parseInt(process.env.PORT, 10);
  }

  // In production, try to extract port from API_URL
  if (process.env.NODE_ENV === "production" && process.env.API_URL) {
    try {
      const url = new URL(process.env.API_URL);
      if (url.port) {
        return parseInt(url.port, 10);
      }
      // For HTTPS, default to 443; for HTTP, default to 80
      return url.protocol === "https:" ? 443 : 80;
    } catch (e) {
      // If URL parsing fails, use default
    }
  }

  // Default to 5000
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
  // Kill any process running on port 5000
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
    ? process.env.API_URL
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
