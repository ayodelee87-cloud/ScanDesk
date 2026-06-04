import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Shield, 
  Search, 
  Settings, 
  Monitor, 
  Crop, 
  Layers, 
  FileUp, 
  Link as LinkIcon, 
  Wifi, 
  FileText, 
  ChevronRight, 
  ArrowLeft,
  Loader2,
  AlertTriangle,
  CheckCircle,
  Copy,
  ExternalLink
} from "lucide-react";
import { Scan, ThreatStatus, SystemStats } from "../types";

interface ExtensionPopupProps {
  scans: Scan[];
  token: string | null;
  onNewScan: (scan: Scan) => void;
  stats: SystemStats;
}

export default function ExtensionPopup({ scans, token, onNewScan, stats }: ExtensionPopupProps) {
  const [currentView, setCurrentView] = useState<"menu" | "scan-input" | "loading" | "result">("menu");
  const [scanType, setScanType] = useState<string>("Browser Tab");
  const [customInput, setCustomInput] = useState("");
  const [activeResult, setActiveResult] = useState<Scan | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Trigger simulated/realistic quick action screen scans
  const triggerScan = async (type: string, placeholderInput: string) => {
    setScanType(type);
    setCustomInput(placeholderInput);
    setCurrentView("scan-input");
  };

  const handleScanSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!customInput || customInput.trim().length === 0) return;

    setCurrentView("loading");
    setLoading(true);

    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch("/api/scan", {
        method: "POST",
        headers,
        body: JSON.stringify({
          input: customInput,
          source: scanType
        })
      });

      if (!res.ok) {
        throw new Error("Unable to execute scan correctly on backend.");
      }

      const scanResult: Scan = await res.json();
      setActiveResult(scanResult);
      onNewScan(scanResult); // Dispatch up the state chain
      setCurrentView("result");
    } catch (err) {
      console.error(err);
      setCurrentView("menu");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setActionFeedback("Copied to clipboard!");
    setTimeout(() => setActionFeedback(null), 2000);
  };

  const getStatusColor = (status: ThreatStatus) => {
    switch (status) {
      case "dangerous": return "text-error border-error/20 bg-error/10";
      case "suspicious": return "text-orange-400 border-orange-400/20 bg-orange-400/10";
      default: return "text-emerald-400 border-emerald-400/20 bg-emerald-400/10";
    }
  };

  const getStatusIcon = (status: ThreatStatus) => {
    switch (status) {
      case "dangerous": return <AlertTriangle className="w-8 h-8 text-error animate-bounce" />;
      case "suspicious": return <AlertTriangle className="w-8 h-8 text-orange-400" />;
      default: return <CheckCircle className="w-8 h-8 text-emerald-400" />;
    }
  };

  return (
    <div className="w-[360px] h-[520px] bg-surface rounded-xl border border-white/10 flex flex-col overflow-hidden relative shadow-[0_0_40px_rgba(0,0,0,0.8)] text-left select-none ring-1 ring-white/15">
      
      {/* Top Banner Bar */}
      <header className="flex justify-between items-center w-full px-4 h-14 bg-background/80 backdrop-blur-xl border-b border-white/10 shrink-0 select-none">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-primary-container rounded-lg flex items-center justify-center border border-primary/20 shadow-inner">
            <Shield className="w-4 h-4 text-primary" />
          </div>
          <span className="text-headline-md font-extrabold text-primary tracking-tight font-sans">ScanDesk</span>
          <span className="text-[9px] font-mono bg-white/5 border border-white/10 rounded px-1 text-on-surface-variant font-medium py-0.5">v3.0.0</span>
        </div>
        
        <div className="flex items-center gap-1">
          <button className="p-1.5 rounded-full hover:bg-surface-variant/40 transition-colors text-on-surface active:scale-90 cursor-pointer">
            <Search className="w-4 h-4 text-on-surface-variant" />
          </button>
          <button className="p-1.5 rounded-full hover:bg-surface-variant/40 transition-colors text-on-surface active:scale-90 cursor-pointer">
            <Settings className="w-4 h-4 text-on-surface-variant" />
          </button>
        </div>
      </header>

      {/* Main Extension Viewport */}
      <main className="flex-1 overflow-y-auto p-4 relative flex flex-col bg-background/60">
        
        <AnimatePresence mode="wait">
          
          {/* View 1: Main Menu & Controls */}
          {currentView === "menu" && (
            <motion.div
              key="view-menu"
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 10, opacity: 0 }}
              className="flex flex-col h-full"
            >
              {/* Quick Actions Grid */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                
                <div 
                  onClick={() => triggerScan("Screen Capture", "Captured system viewport analysis raw content")}
                  className="bg-surface-container-high/40 hover:bg-surface-container-high border border-white/5 hover:border-primary/20 p-3.5 rounded-xl flex flex-col gap-2 cursor-pointer transition-all duration-150 group"
                >
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20 group-hover:bg-primary/20 transition-colors">
                    <Monitor className="w-4 h-4" />
                  </div>
                  <div className="font-sans text-[13px] text-on-surface font-semibold text-left">Scan Screen</div>
                  <div className="text-[9px] text-on-surface-variant/60 font-mono text-left tracking-wide">CAPTURE ENTIRE VIEW</div>
                </div>

                <div 
                  onClick={() => triggerScan("Screen Area", "Custom lasso cropped visual sector details")}
                  className="bg-surface-container-high/40 hover:bg-surface-container-high border border-white/5 hover:border-secondary/20 p-3.5 rounded-xl flex flex-col gap-2 cursor-pointer transition-all duration-150 group"
                >
                  <div className="w-9 h-9 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary border border-secondary/20 group-hover:bg-secondary/20 transition-colors">
                    <Crop className="w-4 h-4" />
                  </div>
                  <div className="font-sans text-[13px] text-on-surface font-semibold text-left">Select Area</div>
                  <div className="text-[9px] text-on-surface-variant/60 font-mono text-left tracking-wide">DRAG AND CAPTURE</div>
                </div>

                <div 
                  onClick={() => triggerScan("Browser Tab", "https://linear.app/updates")}
                  className="bg-surface-container-high/40 hover:bg-surface-container-high border border-white/5 hover:border-tertiary/20 p-3.5 rounded-xl flex flex-col gap-2 cursor-pointer transition-all duration-150 group"
                >
                  <div className="w-9 h-9 rounded-lg bg-tertiary/10 flex items-center justify-center text-tertiary border border-tertiary/20 group-hover:bg-tertiary/20 transition-colors">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div className="font-sans text-[13px] text-on-surface font-semibold text-left">Scan Tab</div>
                  <div className="text-[9px] text-on-surface-variant/60 font-mono text-left tracking-wide">FOCUSED SOURCE</div>
                </div>

                <div 
                  onClick={() => triggerScan("Upload", "https://malicious-secure-update-billing.org/verify")}
                  className="bg-surface-container-high/40 hover:bg-surface-container-high border border-white/5 hover:border-white/15 p-3.5 rounded-xl flex flex-col gap-2 cursor-pointer transition-all duration-150 group"
                >
                  <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-on-surface-variant border border-white/10 group-hover:bg-white/10 transition-colors">
                    <FileUp className="w-4 h-4" />
                  </div>
                  <div className="font-sans text-[13px] text-on-surface font-semibold text-left">Upload Link</div>
                  <div className="text-[9px] text-on-surface-variant/60 font-mono text-left tracking-wide">IMAGE OR CLIPBOARD</div>
                </div>

              </div>

              {/* Stats Bar */}
              <div className="mb-6 px-1">
                <div className="flex justify-between items-end mb-1.5 select-none">
                  <div className="text-[10px] font-mono tracking-wider text-primary uppercase font-bold">Usage Statistics</div>
                  <div className="text-[10px] font-mono text-on-surface-variant font-bold">{stats.scansCount} / {stats.maxScans} SCANS</div>
                </div>
                <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden border border-white/5">
                  <div 
                    className="h-full bg-primary rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, (stats.scansCount / stats.maxScans) * 100)}%` }}
                  />
                </div>
              </div>

              {/* History Scans Title */}
              <div className="flex-1 flex flex-col min-h-0 select-none">
                <h3 className="text-[10px] font-mono text-on-surface-variant uppercase tracking-wider mb-2 font-bold px-1 text-left">Recent Activity</h3>
                
                <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[160px]">
                  {scans.slice(0, 4).map((scan) => (
                    <div 
                      key={scan.id} 
                      onClick={() => {
                        setActiveResult(scan);
                        setCurrentView("result");
                      }}
                      className="flex items-center gap-3 p-2.5 bg-surface-container/40 hover:bg-surface-container-high/80 border border-white/5 rounded-xl group cursor-pointer transition-all duration-150"
                    >
                      <div className="w-9 h-9 bg-surface-container-highest rounded-lg flex items-center justify-center border border-white/10">
                        {scan.input.startsWith("http") ? (
                          <LinkIcon className="w-4 h-4 text-secondary" />
                        ) : scan.input.toLowerCase().includes("wifi") ? (
                          <Wifi className="w-4 h-4 text-tertiary" />
                        ) : (
                          <FileText className="w-4 h-4 text-primary" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <div className="text-[13px] text-on-surface font-semibold truncate select-none leading-tight">{scan.input}</div>
                        <div className="text-[10px] text-on-surface-variant font-mono uppercase tracking-wide mt-0.5 select-none font-bold">
                          {scan.status} • {scan.source}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-on-surface-variant opacity-20 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all shrink-0" />
                    </div>
                  ))}
                  
                  {scans.length === 0 && (
                    <div className="text-center py-8 text-on-surface-variant text-body-sm select-none border border-dashed border-white/5 rounded-xl">
                      No scans executed. Execute an action to begin stats tracking.
                    </div>
                  )}
                </div>
              </div>

            </motion.div>
          )}

          {/* View 2: Scan Action input details form */}
          {currentView === "scan-input" && (
            <motion.div
              key="view-scan-input"
              initial={{ x: 10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -10, opacity: 0 }}
              className="flex flex-col justify-between h-full py-2"
            >
              <div className="space-y-4">
                <button 
                  onClick={() => setCurrentView("menu")}
                  className="flex items-center gap-1 text-[11px] font-mono text-primary hover:text-white transition-colors cursor-pointer select-none"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> BACK TO GENERAL OVERVIEW
                </button>

                <div className="space-y-1 text-left">
                  <h3 className="text-headline-md font-extrabold text-on-surface uppercase tracking-tight">Vetting: {scanType}</h3>
                  <p className="text-body-sm text-on-surface-variant">Enter a link, local wifi details, or token string to scan for vulnerabilities.</p>
                </div>

                <form onSubmit={handleScanSubmit} className="space-y-4 text-left">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono text-primary font-bold">TARGET DATA STREAM</label>
                    <textarea
                      rows={3}
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                      placeholder="e.g. https://secure-gate.com/login"
                      className="w-full px-3 py-2.5 bg-surface-container-low border border-white/10 rounded-lg text-body-md text-on-surface placeholder:text-on-surface-variant/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-mono"
                      id="extension-custom-scan-input"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full h-11 bg-primary text-on-primary font-bold rounded-lg hover:bg-surface-tint flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                  >
                    Execute Scanning Audit
                  </button>
                </form>
              </div>

              <div className="mt-auto pt-4 text-center">
                <span className="text-[10px] text-on-surface-variant/40 font-mono uppercase tracking-widest leading-loose">Secure Terminal Endpoint Connection</span>
              </div>
            </motion.div>
          )}

          {/* View 3: Scanning in active progress load sequence */}
          {currentView === "loading" && (
            <motion.div
              key="view-loading"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="flex flex-col items-center justify-center h-full py-8 text-center"
            >
              <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
              <h3 className="text-headline-md font-bold text-on-surface select-none">Executing Security Audit</h3>
              <p className="text-body-sm text-on-surface-variant mt-2 max-w-[240px] px-2 select-none leading-relaxed">
                Parsing indicators, SSL status, dynamic phishing components, and calling Gemini Core engine threat metrics...
              </p>
            </motion.div>
          )}

          {/* View 4: Completed scan results output details */}
          {currentView === "result" && activeResult && (
            <motion.div
              key="view-result"
              initial={{ x: 10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -10, opacity: 0 }}
              className="flex flex-col justify-between h-full py-1 text-left"
            >
              <div className="space-y-4">
                <button 
                  onClick={() => setCurrentView("menu")}
                  className="flex items-center gap-1 text-[11px] font-mono text-primary hover:text-white transition-colors cursor-pointer select-none"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> BACK TO GENERAL OVERVIEW
                </button>

                {/* Score header container */}
                <div className="flex gap-3.5 items-center p-3.5 bg-surface-container-low/80 border border-white/5 rounded-xl">
                  {getStatusIcon(activeResult.status)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono text-on-surface-variant/60 font-bold uppercase select-none">Risk Index Metric</span>
                      <span className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border select-none font-extrabold ${getStatusColor(activeResult.status)}`}>
                        {activeResult.status}
                      </span>
                    </div>
                    
                    <div className="flex items-baseline gap-1 mt-1 font-sans">
                      <span className="text-3xl font-extrabold text-on-surface leading-none">{activeResult.riskScore}</span>
                      <span className="text-body-sm text-on-surface-variant font-mono">/100</span>
                    </div>
                  </div>
                </div>

                {/* Source and Data target code block */}
                <div className="space-y-1">
                  <div className="text-[9px] font-mono text-primary uppercase font-bold tracking-wider select-none">Vetted Target URL / Stream</div>
                  <div className="p-2.5 bg-surface-container-highest/60 border border-white/5 rounded-lg font-mono text-body-sm text-on-surface truncate flex items-center justify-between">
                    <span className="truncate">{activeResult.input}</span>
                    <button 
                      onClick={() => copyToClipboard(activeResult.input)}
                      className="ml-2 p-1 rounded hover:bg-white/5 text-on-surface-variant cursor-pointer transition-colors"
                      title="Copy string"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Analysis detail markdown mock box */}
                <div className="space-y-1 flex-1 overflow-y-auto">
                  <div className="text-[9px] font-mono text-primary uppercase font-bold tracking-wider select-none">ScanDesk Threat Summary</div>
                  <div className="p-3 bg-surface-container/60 border border-white/5 rounded-xl text-body-sm text-on-surface-variant leading-relaxed select-none">
                    {activeResult.details}
                  </div>
                </div>

              </div>

              {actionFeedback && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-primary text-on-primary font-mono text-[11px] font-extrabold rounded-lg shadow-xl shrink-0">
                  {actionFeedback}
                </div>
              )}

              <div className="pt-3 border-t border-white/5 flex gap-2 w-full select-none mt-4 shrink-0">
                <button 
                  onClick={() => triggerScan(activeResult.source, activeResult.input)}
                  className="flex-1 h-9 bg-white/5 hover:bg-white/10 text-on-surface border border-white/15 rounded-lg text-body-sm font-semibold transition-colors cursor-pointer text-center"
                >
                  Rescan Target
                </button>
                {activeResult.input.startsWith("http") && (
                  <a 
                    href={activeResult.input}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 h-9 bg-primary hover:bg-surface-tint text-on-primary hover:text-white rounded-lg text-body-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1 text-center font-sans shadow"
                  >
                    Open Link <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Footer Nav Indicators */}
      <footer className="h-10 bg-surface-container-lowest/40 border-t border-white/5 px-4 flex items-center justify-between shrink-0 select-none">
        <span className="text-[9px] font-mono text-on-surface-variant/40 tracking-wider font-semibold">SECURE SESSION ENCRYPTED</span>
        <div className="flex items-center gap-1.5 select-none">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[9px] font-mono text-emerald-400 font-extrabold uppercase">Live Node</span>
        </div>
      </footer>

    </div>
  );
}
