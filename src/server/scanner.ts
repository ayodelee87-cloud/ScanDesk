import { GoogleGenAI, Type } from "@google/genai";
import { ThreatStatus } from "../types";

// Initialize Gemini client lazily to avoid startup crashes if the key isn't provided yet
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY") {
    try {
      aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    } catch (e) {
      console.error("Failed to initialize Gemini Client", e);
    }
  }
  return aiClient;
}

interface ScanResult {
  riskScore: number;
  status: ThreatStatus;
  explanation: string;
}

// 1. Fully-specified Heuristic Scanner Engine
export function scanHeuristics(input: string): ScanResult {
  const text = input.trim();
  let score = 5; // Default baseline risk score
  const reasons: string[] = [];

  // Check if URL
  const isUrl = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/i.test(text);

  if (isUrl) {
    const urlLower = text.toLowerCase();
    
    // Check SSL/HTTPS connection
    if (urlLower.startsWith("http://")) {
      score += 25;
      reasons.push("HTTP protocol is unencrypted and vulnerable to eavesdropping or session hijacking");
    } else if (!urlLower.startsWith("https://")) {
      score += 15;
      reasons.push("Missing explicit HTTPS protocol declaration");
    }

    // Keyword checks (Phishing indicators)
    const phishingKeywords = ["login", "verify", "secure", "bank", "update", "signin", "account", "billing", "service-alert", "auth", "support", "credential"];
    const matchedKeywords = phishingKeywords.filter(kw => urlLower.includes(kw));
    if (matchedKeywords.length > 0) {
      score += matchedKeywords.length * 15;
      reasons.push(`Contains high-risk security triggers targeting phishing: [${matchedKeywords.join(", ")}]`);
    }

    // IP address instead of domain
    const hasIpAddress = /^(https?:\/\/)?\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(text);
    if (hasIpAddress) {
      score += 35;
      reasons.push("Domain uses raw IP octets which is a common signature for bypass lists or malicious hosting");
    }

    // Shorteners
    const shorteners = ["bit.ly", "tinyurl.com", "t.co", "goo.gl", "ow.ly", "is.gd"];
    if (shorteners.some(s => urlLower.includes(s))) {
      score += 20;
      reasons.push("Uses a URL redirector which masks the final destination address");
    }

    // Suspicious TLDs
    const badTLDs = [".zip", ".mov", ".tk", ".cf", ".gq", ".fit", ".top", ".xyz", ".club"];
    if (badTLDs.some(tld => urlLower.endsWith(tld) || urlLower.includes(tld + "/"))) {
      score += 15;
      reasons.push("Configured with high-risk top-level domains frequently abused by spammers");
    }
  } else {
    // Text-based heuristics
    const textLower = text.toLowerCase();
    
    // Cryptography, Wifi SSID details or credentials keywords
    if (textLower.includes("ssid") && (textLower.includes("key") || textLower.includes("password") || textLower.includes("wpa"))) {
      score += 10;
      reasons.push("Wireless local network credentials detected");
    }

    if (textLower.includes("private key") || textLower.includes("api_key") || textLower.includes("api-key") || textLower.includes("client_secret")) {
      score += 35;
      reasons.push("High-entropy development key or private API secret token exposure detected");
    }

    if (textLower.includes("password") || textLower.includes("pin") || textLower.includes("cvv") || textLower.includes("credit card")) {
      score += 40;
      reasons.push("Exposure risk of sensitive user credentials or electronic financial values in plaintext format");
    }
  }

  // Bound score
  score = Math.min(100, Math.max(0, score));

  let status: ThreatStatus = "safe";
  if (score >= 70) {
    status = "dangerous";
  } else if (score >= 30) {
    status = "suspicious";
  }

  const explanation = reasons.length > 0 
    ? `ScanDesk Security Heuristics detected an elevation of risk. Indicators: ${reasons.join(". ")}.`
    : "Resource is clean. Verified using basic heuristics check, no dangerous matches found.";

  return { riskScore: score, status, explanation };
}

// 2. Advanced Live Gemini Scanning Option
export async function auditThreatWithGemini(input: string): Promise<ScanResult> {
  const client = getGeminiClient();
  if (!client) {
    // Graceful fallback if API key is not configured
    return scanHeuristics(input);
  }

  try {
    const prompt = `
      You are ScanDesk, a senior cybersecurity scanner bot designed to analyze URLs, screen text, Wi-Fi credentials, or physical scans to detect vulnerabilities.
      Analyze the following input string: "${input}"
      Perform advanced scanning for security issues like:
      - Phishing campaigns, spoofing, or credential traps
      - Unsafe links or unencrypted credentials
      - Hardcoded secrets, API private keys, or passwords
      - Suspicious domains or URL bypasses

      Provide a unified assessment as a JSON object adhering to this schema:
      {
        "riskScore": number (integral range representing threat level from 0 to 100),
        "status": "safe" | "suspicious" | "dangerous",
        "explanation": string (concise, clear safety breakdown in 2 sentences max. Speak objectively and professionally.)
      }
      Do NOT include markdown packaging around the JSON output, return only pure parsed JSON.
    `;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["riskScore", "status", "explanation"],
          properties: {
            riskScore: { 
              type: Type.INTEGER, 
              description: "Numeric level of threat from 0 (clean) to 100 (critical malware/phishing)" 
            },
            status: { 
              type: Type.STRING, 
              description: "Unified classifications of threat details" 
            },
            explanation: { 
              type: Type.STRING, 
              description: "Compact explanatory sentences. Summarize why this score is assigned." 
            }
          }
        }
      }
    });

    const body = response.text?.trim();
    if (body) {
      const data = JSON.parse(body) as ScanResult;
      // Normalizing output values safely
      const riskScore = Math.max(0, Math.min(100, data.riskScore));
      let status = data.status;
      if (riskScore >= 70) {
        status = "dangerous";
      } else if (riskScore >= 30) {
        status = "suspicious";
      } else {
        status = "safe";
      }
      return {
        riskScore,
        status,
        explanation: data.explanation || "No threats identified during scan analytics"
      };
    }
  } catch (e) {
    console.error("Gemini Scan Error, falling back to heuristics", e);
  }

  return scanHeuristics(input);
}
