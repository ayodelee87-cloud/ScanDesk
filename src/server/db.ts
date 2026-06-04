import fs from "fs";
import path from "path";
import { User, Scan, ThreatStatus } from "../types";

interface DbSchema {
  users: Array<User & { passwordHash: string }>;
  scans: Scan[];
}

const DB_FILE_PATH = path.join(process.cwd(), "data", "scandesk_db.json");

class Database {
  private data: DbSchema = { users: [], scans: [] };

  constructor() {
    this.initDb();
  }

  private initDb() {
    try {
      const dir = path.dirname(DB_FILE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      if (fs.existsSync(DB_FILE_PATH)) {
        const fileContent = fs.readFileSync(DB_FILE_PATH, "utf-8");
        this.data = JSON.parse(fileContent);
      } else {
        // Preload database with mock scans and custom user for onboarding & demo
        this.data = {
          users: [],
          scans: [
            {
              id: "scan_1",
              userId: "mock_user_id",
              input: "https://linear.app/updates",
              riskScore: 8,
              status: "safe",
              details: "Verified domain with strong SSL certificate. Reputable SaaS development platform with clean rating.",
              source: "Browser Tab",
              createdAt: new Date(Date.now() - 2 * 60 * 1000).toISOString() // 2m ago
            },
            {
              id: "scan_2",
              userId: "mock_user_id",
              input: "Guest_WiFi_HQ_SSID_Secure",
              riskScore: 15,
              status: "safe",
              details: "SSID scanned locally. Strong WPA3 configuration detected, connection is private and secure.",
              source: "Physical Print",
              createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString() // 45m ago
            },
            {
              id: "scan_3",
              userId: "mock_user_id",
              input: "Product Security Audit Key Verification: #A9821-X-STABLE",
              riskScore: 42,
              status: "suspicious",
              details: "Scanning screen text detected high entropy hex token. Potential credential leak or API secret exposure.",
              source: "Screen Scan",
              createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString() // 3h ago
            },
            {
              id: "scan_4",
              userId: "mock_user_id",
              input: "https://secure-login-bank-verify-alert.com/account",
              riskScore: 94,
              status: "dangerous",
              details: "Phishing threat detected. URL mimics standard banking platform domain with dynamic verification keywords on an HTTP connection.",
              source: "Browser Tab",
              createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString() // 12h ago
            },
            {
              id: "scan_5",
              userId: "mock_user_id",
              input: "https://github.com/scandesk",
              riskScore: 3,
              status: "safe",
              details: "Secure repository hosting platform. Clean domain reputation with active security controls.",
              source: "Browser Tab",
              createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString() // Yesterday
            }
          ]
        };
        this.save();
      }
    } catch (e) {
      console.error("Error reading database file, using fallback empty state", e);
    }
  }

  private save() {
    try {
      fs.writeFileSync(DB_FILE_PATH, JSON.stringify(this.data, null, 2), "utf-8");
    } catch (e) {
      console.error("Failed to write to database file", e);
    }
  }

  // User Operations
  public getUsers() {
    return this.data.users;
  }

  public getUserByEmail(email: string) {
    const norm = email.toLowerCase().trim();
    return this.data.users.find(u => u.email.toLowerCase() === norm);
  }

  public getUserById(id: string) {
    return this.data.users.find(u => u.id === id);
  }

  public createUser(email: string, passwordHash: string): User {
    const user: User & { passwordHash: string } = {
      id: "u_" + Math.random().toString(36).substring(2, 11),
      email: email.trim(),
      createdAt: new Date().toISOString(),
      passwordHash
    };
    this.data.users.push(user);
    this.save();

    // Associate any previous global guest scans with this newly registered user
    this.data.scans = this.data.scans.map(scan => {
      if (scan.userId === "mock_user_id") {
        return { ...scan, userId: user.id };
      }
      return scan;
    });
    this.save();

    return { id: user.id, email: user.email, createdAt: user.createdAt };
  }

  // Scan Operations
  public getScans(userId: string): Scan[] {
    // If scanning for mock_user, or if user is logged in, merge/retrieve relevant files
    return this.data.scans
      .filter(s => s.userId === userId || s.userId === "mock_user_id")
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public createScan(userId: string, input: string, riskScore: number, status: ThreatStatus, details: string, source: string): Scan {
    const scan: Scan = {
      id: "scan_" + Math.random().toString(36).substring(2, 11),
      userId,
      input,
      riskScore,
      status,
      details,
      source,
      createdAt: new Date().toISOString()
    };
    this.data.scans.push(scan);
    
    // Maintain a maximum scroll of 50 total scans to avoid payload bloated arrays in memory
    if (this.data.scans.length > 100) {
      this.data.scans.shift();
    }
    
    this.save();
    return scan;
  }

  public deleteScan(userId: string, scanId: string): boolean {
    const initialLen = this.data.scans.length;
    this.data.scans = this.data.scans.filter(s => !(s.id === scanId && (s.userId === userId || s.userId === "mock_user_id")));
    const changed = this.data.scans.length !== initialLen;
    if (changed) {
      this.save();
    }
    return changed;
  }

  public clearUserScans(userId: string) {
    this.data.scans = this.data.scans.filter(s => s.userId !== userId && s.userId !== "mock_user_id");
    this.save();
  }
}

export const db = new Database();
