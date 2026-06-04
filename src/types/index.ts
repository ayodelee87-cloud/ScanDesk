export interface User {
  id: string;
  email: string;
  createdAt: string;
}

export type ThreatStatus = "safe" | "suspicious" | "dangerous";

export interface Scan {
  id: string;
  userId: string;
  input: string;
  riskScore: number; // 0 - 100
  status: ThreatStatus;
  details: string;
  source: string; // e.g. "Browser Tab", "Screen Area", "Screen Capture", "Upload", "Extension popup"
  createdAt: string;
}

export interface ScanRequest {
  input: string;
  source?: string;
}

export interface ScanResponse {
  id: string;
  input: string;
  riskScore: number;
  status: ThreatStatus;
  details: string;
  source: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface SystemStats {
  scansCount: number;
  maxScans: number; // 50
  safeCount: number;
  warningCount: number;
  dangerCount: number;
}
