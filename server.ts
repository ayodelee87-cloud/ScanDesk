import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { db } from "./src/server/db";
import { hashPassword, verifyPassword, generateToken, verifyToken } from "./src/server/auth";
import { auditThreatWithGemini } from "./src/server/scanner";

const PORT = 3000;

async function startServer() {
  const app = express();
  app.use(express.json());

  // Logging and CORS support
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
    if (req.method === "OPTIONS") {
      res.sendStatus(200);
      return;
    }
    next();
  });

  // Authentication Middleware helper to check Bearer token if present
  const parseAuth = (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      const decoded = verifyToken(token);
      if (decoded) {
        req.userId = decoded.sub;
        req.userEmail = decoded.email;
      }
    }
    next();
  };

  const requireAuth = (req: any, res: any, next: any) => {
    parseAuth(req, res, () => {
      if (!req.userId) {
        return res.status(401).json({ error: "Authentication credentials required" });
      }
      next();
    });
  };

  // 1. AUTH API Endpoints
  app.post("/api/auth/signup", (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }
      if (password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters" });
      }

      const existing = db.getUserByEmail(email);
      if (existing) {
        return res.status(400).json({ error: "An account with this email already exists" });
      }

      const passwordHash = hashPassword(password);
      const user = db.createUser(email, passwordHash);
      const token = generateToken(user);

      res.status(201).json({ user, token });
    } catch (e: any) {
      res.status(500).json({ error: e.message || "Signup failed unexpectedly" });
    }
  });

  app.post("/api/auth/login", (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }

      const userRecord = db.getUserByEmail(email);
      if (!userRecord || !verifyPassword(password, userRecord.passwordHash)) {
        return res.status(400).json({ error: "Invalid email or password credentials" });
      }

      const token = generateToken({
        id: userRecord.id,
        email: userRecord.email,
        createdAt: userRecord.createdAt
      });

      res.json({
        user: { id: userRecord.id, email: userRecord.email, createdAt: userRecord.createdAt },
        token
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message || "Login failed unexpectedly" });
    }
  });

  app.get("/api/auth/me", parseAuth, (req: any, res) => {
    if (!req.userId) {
      return res.status(401).json({ error: "Unauthorized access" });
    }
    const user = db.getUserById(req.userId);
    if (!user) {
      return res.status(404).json({ error: "User profile not found in database" });
    }
    res.json({ id: user.id, email: user.email, createdAt: user.createdAt });
  });

  // 2. SCANNING API
  app.post("/api/scan", parseAuth, async (req: any, res) => {
    try {
      const { input, source } = req.body;
      if (!input || typeof input !== "string") {
        return res.status(400).json({ error: "Threat scan input must be a valid non-empty string" });
      }

      const scanSource = source || "Browser Tab";
      const actualUserId = req.userId || "mock_user_id";

      // Dynamically run heuristic checks or connect to Gemini client
      const scanResult = await auditThreatWithGemini(input);

      // Record to history database
      const recordedScan = db.createScan(
        actualUserId,
        input,
        scanResult.riskScore,
        scanResult.status,
        scanResult.explanation,
        scanSource
      );

      res.json(recordedScan);
    } catch (e: any) {
      res.status(500).json({ error: e.message || "Scanning execution failed" });
    }
  });

  // 3. HISTORY MANAGEMENT API
  app.get("/api/scans", parseAuth, (req: any, res) => {
    try {
      const targetUserId = req.userId || "mock_user_id";
      const scansList = db.getScans(targetUserId);
      res.json(scansList);
    } catch (e: any) {
      res.status(500).json({ error: e.message || "Failed to fetch scan history records" });
    }
  });

  app.delete("/api/scans/:id", parseAuth, (req: any, res) => {
    try {
      const targetUserId = req.userId || "mock_user_id";
      const deleted = db.deleteScan(targetUserId, req.params.id);
      if (deleted) {
        res.json({ success: true, message: "Scan history entry deleted successfully" });
      } else {
        res.status(404).json({ error: "Scan record not found or unauthorized to delete" });
      }
    } catch (e: any) {
      res.status(500).json({ error: e.message || "Failed to delete scan record" });
    }
  });

  app.post("/api/scans/clear", parseAuth, (req: any, res) => {
    try {
      const targetUserId = req.userId || "mock_user_id";
      db.clearUserScans(targetUserId);
      res.json({ success: true, message: "All scan history records have been cleared" });
    } catch (e: any) {
      res.status(500).json({ error: e.message || "Failed to clear history" });
    }
  });

  // VITE BROWSER MIDDLEWARE & STATIC ASSETS ROUTING
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in development mode, hooking up Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in production mode, serving built files...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`ScanDesk backend successfully running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((e) => {
  console.error("Critical server bootstrap failure!", e);
});
