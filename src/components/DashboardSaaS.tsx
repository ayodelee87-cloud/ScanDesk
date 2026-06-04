import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Shield, 
  Search, 
  Settings, 
  LogOut, 
  Activity, 
  Clock, 
  Trash2, 
  Copy, 
  ExternalLink, 
  User, 
  ArrowRight, 
  Loader2, 
  CheckCircle, 
  AlertTriangle,
  Lock,
  Wifi,
  FileText,
  Filter,
  RefreshCw,
  Info,
  Layers,
  Link as LinkIcon
} from "lucide-react";
import ExtensionPopup from "./ExtensionPopup";
import { Scan, ThreatStatus, User as AppUser, SystemStats } from "../types";

interface DashboardSaaSProps {
  user: AppUser | null;
  scans: Scan[];
  token: string | null;
  onLogout: () => void;
  onNewScan: (scan: Scan) => void;
  onDeleteScan: (scanId: string) => void;
  onClearAll: () => void;
}

export default function DashboardSaaS({ 
  user, 
  scans, 
  token, 
  onLogout, 
  onNewScan, 
  onDeleteScan, 
  onClearAll 
}: DashboardSaaSProps) {
  const [filterType, setFilterType] = useState<"All" | "URLs" | "WiFi" | "Contacts">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedScan, setSelectedScan] = useState<Scan | null>(null);
  
  // Scans loading / submit states
  const [customInput, setCustomInput] = useState("");
  const [customSource, setCustomSource] = useState("Browser Tab");
  const [scanning, setScanning] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Copy-paste status popup feedback
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (scans.length > 0 && !selectedScan) {
      setSelectedScan(scans[0]);
    }
  }, [scans, selectedScan]);

  const triggerCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback("Copied string securely!");
    setTimeout(() => setCopyFeedback(null), 2000);
  };

  const handleCreateScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInput || customInput.trim().length === 0) {
      setFormError("Target stream string cannot be empty.");
      return;
    }

    setScanning(true);
    setFormError(null);

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
          source: customSource
        })
      });

      if (!res.ok) {
        throw new Error("API scan failed on remote node.");
      }

      const result: Scan = await res.json();
      onNewScan(result);
      setSelectedScan(result);
      setCustomInput("");
      setFormError(null);
    } catch (err: any) {
      setFormError(err.message || "Execution exception during manual audit scan.");
    } finally {
      setScanning(false);
    }
  };

  // Compute stats on-the-fly dynamically based on live actual scans array
  const activeStats: SystemStats = {
    scansCount: scans.length,
    maxScans: 50,
    safeCount: scans.filter(s => s.status === "safe").length,
    warningCount: scans.filter(s => s.status === "suspicious").length,
    dangerCount: scans.filter(s => s.status === "dangerous").length
  };

  // Filter and search live list
  const filteredScans = scans.filter(scan => {
    const matchesSearch = scan.input.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          scan.details.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterType === "All") return matchesSearch;
    if (filterType === "URLs") return matchesSearch && (scan.input.startsWith("http") || scan.input.includes(".app") || scan.input.includes(".com") || scan.input.includes(".org") || scan.input.includes(".net"));
    if (filterType === "WiFi") return matchesSearch && (scan.input.toLowerCase().includes("wifi") || scan.input.toLowerCase().includes("ssid") || scan.source.toLowerCase().includes("wifi") || scan.source.toLowerCase().includes("print"));
    if (filterType === "Contacts") return matchesSearch && (scan.input.toLowerCase().includes("contact") || scan.input.toLowerCase().includes("person") || scan.source.toLowerCase().includes("contact") || scan.input.toLowerCase().includes("marcus") || scan.input.toLowerCase().includes("key"));
    return matchesSearch;
  });

  const getStatusBg = (status: ThreatStatus) => {
    switch (status) {
      case "dangerous": return "bg-error/15 border-error/20 text-error";
      case "suspicious": return "bg-orange-500/15 border-orange-500/20 text-orange-400";
      default: return "bg-emerald-500/15 border-emerald-500/20 text-emerald-400";
    }
  };

  const getStatusLabelText = (status: ThreatStatus) => {
    switch (status) {
      case "dangerous": return "Dangerous / Phishing threat verified";
      case "suspicious": return "Suspicious / Threat mitigation guidelines suggested";
      default: return "Safe / Clean domain reputation verified";
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto min-h-[600px] flex flex-col pt-4 pb-12 px-container-padding text-left select-none relative z-10">
      
      {/* Toast Alert Feedback */}
      <AnimatePresence>
        {copyFeedback && (
          <motion.div
            initial={{ y: 20, opacity: 0, x: "-50%" }}
            animate={{ y: 0, opacity: 1, x: "-50%" }}
            exit={{ y: 20, opacity: 0, x: "-50%" }}
            className="fixed bottom-6 left-1/2 z-50 bg-primary border border-white/20 text-on-primary font-mono text-xs font-semibold px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{copyFeedback}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main SaaS Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-4 mb-6">
        <div className="flex items-center gap-3 select-none">
          <div className="w-10 h-10 bg-primary-container rounded-xl flex items-center justify-center border border-primary/25 shadow-lg shadow-primary/10">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-headline-lg font-extrabold text-on-surface tracking-tight leading-tight">ScanDesk CLI Workspace</h1>
            <p className="text-body-sm text-on-surface-variant font-medium mt-0.5 select-none">
              {user ? `Active secure node session: ${user.email}` : "Global Dev Mode Playground (Sign up to save persistent data)"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {user && (
            <div className="flex items-center gap-2 bg-surface-container border border-white/5 px-3 py-1.5 rounded-xl shadow select-none">
              <User className="w-4 h-4 text-primary" />
              <span className="text-body-sm text-on-surface font-semibold truncate max-w-[120px]">{user.email}</span>
            </div>
          )}
          <button
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-surface-container hover:bg-surface-container-high hover:text-error border border-white/10 rounded-xl text-body-sm font-semibold transition-all cursor-pointer shadow"
          >
            <LogOut className="w-4 h-4" /> {user ? "Close Node" : "Back to welcome"}
          </button>
        </div>
      </header>

      {/* Core Bento/Grid Section structure layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
        
        {/* LEFT & CENTER PANEL (SaaS core data workspace) - spans 8 cols */}
        <div className="lg:col-span-8 flex flex-col gap-6 min-h-0">
          
          {/* Bento Block 1: Real-time scan console entry points */}
          <div className="bg-surface-container border border-white/10 p-5 rounded-lg shadow-xl relative overflow-hidden flex flex-col">
            <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-primary to-secondary" />
            <h3 className="text-headline-md font-extrabold text-on-surface mb-1 flex items-center gap-1">
              <Activity className="w-5 h-5 text-primary" /> Security Threat Vector Scanning Console
            </h3>
            <p className="text-body-sm text-on-surface-variant mb-4">
              Enter any URL link or raw text contents to diagnose potential threats, phish schemes and leaks.
            </p>

            <form onSubmit={handleCreateScan} className="space-y-4">
              <div className="flex flex-col gap-1.5 text-left">
                <label className="text-label-sm font-mono text-primary font-bold uppercase tracking-wider">TARGET DATA ENDPOINT</label>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                      placeholder="e.g. https://bank-secure-accounts.tk/login-verification"
                      className="w-full px-4 py-3 bg-surface-container-low border border-white/10 rounded-xl text-body-md text-on-surface placeholder:text-on-surface-variant/30 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-mono shadow-inner"
                      disabled={scanning}
                      id="saas-custom-scan-input"
                    />
                  </div>
                  
                  <select
                    value={customSource}
                    onChange={(e) => setCustomSource(e.target.value)}
                    className="px-3 bg-surface-container-low border border-white/10 rounded-xl text-body-sm text-on-surface focus:outline-none focus:border-primary font-semibold cursor-pointer"
                    disabled={scanning}
                  >
                    <option value="Browser Tab">Browser Tab</option>
                    <option value="Screen Scan">Screen Scan</option>
                    <option value="Upload">Upload File</option>
                    <option value="Select Area">Select Area</option>
                  </select>

                  <button
                    type="submit"
                    className="px-6 bg-primary hover:bg-surface-tint text-on-primary hover:text-white font-bold rounded-xl transition-all duration-200 cursor-pointer shadow flex items-center justify-center gap-2"
                    disabled={scanning}
                  >
                    {scanning ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        Vexecute
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>

              {formError && (
                <div className="p-3 bg-error-container/20 border border-error/20 rounded-xl text-error text-body-sm flex gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}
            </form>
          </div>

          {/* Bento Block 2: Interactive metrics tracker distribution widgets */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            
            <div className="bg-surface-container border border-white/5 p-4 rounded-xl flex items-center justify-between shadow-md">
              <div className="text-left select-none">
                <span className="text-[10px] font-mono tracking-wider text-on-surface-variant uppercase font-bold">Total Scans</span>
                <h4 className="text-2xl font-black text-on-surface leading-tight mt-1">{activeStats.scansCount}</h4>
              </div>
              <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 text-on-surface-variant">
                <Clock className="w-4.5 h-4.5" />
              </div>
            </div>

            <div className="bg-surface-container border border-white/5 p-4 rounded-xl flex items-center justify-between shadow-md">
              <div className="text-left select-none">
                <span className="text-[10px] font-mono tracking-wider text-emerald-400 uppercase font-bold">Safe Matches</span>
                <h4 className="text-2xl font-black text-emerald-400 leading-tight mt-1">{activeStats.safeCount}</h4>
              </div>
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-400">
                <CheckCircle className="w-4.5 h-4.5" />
              </div>
            </div>

            <div className="bg-surface-container border border-white/5 p-4 rounded-xl flex items-center justify-between shadow-md">
              <div className="text-left select-none">
                <span className="text-[10px] font-mono tracking-wider text-orange-400 uppercase font-bold">Suspicious Flag</span>
                <h4 className="text-2xl font-black text-orange-400 leading-tight mt-1">{activeStats.warningCount}</h4>
              </div>
              <div className="w-9 h-9 rounded-lg bg-orange-500/10 flex items-center justify-center border border-orange-500/20 text-orange-400">
                <AlertTriangle className="w-4.5 h-4.5" />
              </div>
            </div>

            <div className="bg-surface-container border border-white/5 p-4 rounded-xl flex items-center justify-between shadow-md">
              <div className="text-left select-none">
                <span className="text-[10px] font-mono tracking-wider text-error uppercase font-bold">Danger Vulns</span>
                <h4 className="text-2xl font-black text-error leading-tight mt-1">{activeStats.dangerCount}</h4>
              </div>
              <div className="w-9 h-9 rounded-lg bg-error/10 flex items-center justify-center border border-error/20 text-error">
                <AlertTriangle className="w-4.5 h-4.5" />
              </div>
            </div>

          </div>

          {/* Bento Block 3: History list + details preview splitter */}
          <div className="bg-surface-container border border-white/10 rounded-lg shadow-2xl flex-1 flex flex-col min-h-[380px] overflow-hidden">
            
            {/* Header filters banner bar */}
            <div className="px-5 py-4 border-b border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-background/30-dim shrink-0">
              <div className="flex items-center gap-2 select-none">
                <Clock className="w-4.5 h-4.5 text-primary" />
                <span className="font-sans text-[15px] text-on-surface font-extrabold tracking-tight">Vulnerability Log Ledger</span>
              </div>
              
              <div className="flex flex-wrap items-center gap-2">
                
                {/* Search bar inputs */}
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-on-surface-variant/40" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search logs..."
                    className="pl-8 pr-3 py-1 bg-surface-container-low border border-white/10 rounded-lg text-body-sm text-on-surface placeholder:text-on-surface-variant/30 focus:outline-none focus:border-primary font-sans w-36 sm:w-44 focus:w-48 transition-all"
                  />
                </div>

                {/* Filter chips triggers */}
                <div className="flex bg-surface-container-high/40 border border-white/10 p-0.5 rounded-lg select-none">
                  {(["All", "URLs", "WiFi", "Contacts"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setFilterType(t)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-mono tracking-wider font-extrabold cursor-pointer transition-all ${
                        filterType === t 
                          ? "bg-primary text-on-primary shadow-sm" 
                          : "text-on-surface-variant hover:text-white"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>

                {scans.length > 0 && (
                  <button
                    onClick={onClearAll}
                    className="p-1 px-2.5 rounded-lg border border-white/5 bg-white/5 hover:bg-error/15 hover:text-error hover:border-error/20 text-on-surface-variant text-[11px] font-mono tracking-wider font-extrabold cursor-pointer transition-colors"
                  >
                    Clear Log
                  </button>
                )}

              </div>
            </div>

            {/* Split viewport details panel */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-12 min-h-0 bg-background/20">
              
              {/* Left Column: History items log lists (spans 5 cols) */}
              <div className="md:col-span-5 border-r border-white/10 overflow-y-auto max-h-[340px] pr-0.5">
                <div className="divide-y divide-white/5">
                  {filteredScans.map((scan) => (
                    <div
                      key={scan.id}
                      onClick={() => setSelectedScan(scan)}
                      className={`p-3.5 flex gap-3 text-left items-start cursor-pointer transition-all ${
                        selectedScan?.id === scan.id 
                          ? "bg-primary/5 border-l-2 border-primary" 
                          : "hover:bg-white/[0.02]"
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-surface-container-high border border-white/10 flex items-center justify-center shrink-0">
                        {scan.input.startsWith("http") ? (
                          <LinkIcon className="w-4 h-4 text-secondary" />
                        ) : scan.input.toLowerCase().includes("wifi") ? (
                          <Wifi className="w-4 h-4 text-tertiary" />
                        ) : (
                          <FileText className="w-4 h-4 text-primary" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-semibold text-on-surface truncate leading-tight">{scan.input}</div>
                        <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wide mt-1 select-none font-bold">
                          <span className="text-on-surface-variant">{scan.source}</span>
                          <span className={scan.status === "dangerous" ? "text-error" : scan.status === "suspicious" ? "text-orange-400" : "text-emerald-400"}>
                            {scan.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {filteredScans.length === 0 && (
                    <div className="p-8 text-center text-on-surface-variant text-body-sm select-none">
                      No matching log metrics recorded matching search parameters.
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Detailed analysis report layout widget (spans 7 cols) */}
              <div className="md:col-span-7 p-5 flex flex-col justify-between overflow-y-auto max-h-[340px]">
                <AnimatePresence mode="wait">
                  {selectedScan ? (
                    <motion.div
                      key={selectedScan.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col h-full justify-between gap-4 text-left"
                    >
                      <div className="space-y-4">
                        <div className="flex justify-between items-start">
                          <div className="text-left">
                            <span className="text-[10px] font-mono tracking-widest text-primary uppercase font-bold">THREAT AUDIT DATA RECORD</span>
                            <h4 className="text-headline-md font-extrabold text-on-surface truncate leading-tight mt-1 max-w-[240px] title-target" title={selectedScan.input}>
                              {selectedScan.input}
                            </h4>
                          </div>
                          
                          <button
                            onClick={() => onDeleteScan(selectedScan.id)}
                            className="p-1.5 rounded-lg border border-white/5 bg-white/5 hover:bg-error/15 hover:text-error hover:border-error/20 text-on-surface-variant cursor-pointer transition-colors"
                            title="Purge trace record"
                          >
                            <Trash2 className="w-4.5 h-4.5" />
                          </button>
                        </div>

                        {/* Analysis Risk Index Gauge info card */}
                        <div className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${getStatusBg(selectedScan.status)}`}>
                          <div className="text-left select-none">
                            <span className="text-[10px] font-mono uppercase font-extrabold tracking-wider opacity-60">Audit Risk Index classification</span>
                            <p className="text-body-sm font-bold mt-0.5 leading-snug">{getStatusLabelText(selectedScan.status)}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-3xl font-black">{selectedScan.riskScore}</div>
                            <span className="text-[9px] font-mono opacity-60 uppercase font-bold">Score Index</span>
                          </div>
                        </div>

                        {/* Breakdown description detail text */}
                        <div className="space-y-1.5 text-left select-none">
                          <span className="text-[9px] font-mono text-primary font-bold uppercase tracking-wider">SECURE PEN-VECTOR BRIEF</span>
                          <div className="p-3.5 bg-surface-container-low border border-white/5 rounded-xl text-body-md text-on-surface-variant leading-relaxed">
                            {selectedScan.details}
                          </div>
                        </div>

                        {/* Details source layout indicators */}
                        <div className="grid grid-cols-2 gap-3 text-left">
                          <div className="p-2.5 bg-surface-container-low border border-white/5 rounded-xl">
                            <span className="text-[9px] font-mono text-on-surface-variant uppercase opacity-50 block">METRICS VECTOR SOURCE</span>
                            <span className="text-body-sm font-semibold text-on-surface mt-0.5 inline-block">{selectedScan.source}</span>
                          </div>
                          <div className="p-2.5 bg-surface-container-low border border-white/5 rounded-xl">
                            <span className="text-[9px] font-mono text-on-surface-variant uppercase opacity-50 block">AUDIT STAMP TIMELINE</span>
                            <span className="text-[11px] font-mono text-on-surface mt-0.5 inline-block">
                              {new Date(selectedScan.createdAt).toLocaleString()}
                            </span>
                          </div>
                        </div>

                      </div>

                      {/* Quick copy, share vectors */}
                      <div className="pt-4 border-t border-white/5 flex gap-2 w-full mt-2 shrink-0">
                        <button
                          onClick={() => triggerCopy(selectedScan.input)}
                          className="flex-1 h-10 bg-white/5 hover:bg-white/10 text-on-surface border border-white/10 rounded-xl text-body-sm font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Copy className="w-4 h-4" /> Copy Secure Target
                        </button>
                        {selectedScan.input.startsWith("http") && (
                          <a
                            href={selectedScan.input}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 h-10 bg-primary hover:bg-surface-tint text-on-primary hover:text-white rounded-xl text-body-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow"
                          >
                            Safeguard Nav <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </motion.div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center py-20 text-center select-none text-on-surface-variant">
                      <Clock className="w-8 h-8 text-on-surface-variant/30 mb-2" />
                      <p className="text-body-sm select-none">Select a vulnerability ledger record to view full penetration metrics & security summary briefs.</p>
                    </div>
                  )}
                </AnimatePresence>
              </div>

            </div>

          </div>

        </div>

        {/* RIGHT PANEL: Live Browser-Extension Replica Mockup Container (spans 4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4 items-center">
          
          <div className="text-center w-full max-w-[360px] select-none">
            <h3 className="text-headline-md font-extrabold text-on-surface mb-1 flex items-center gap-1 justify-center">
              <Layers className="w-5 h-5 text-secondary animate-pulse" /> Chrome Extension Popup
            </h3>
            <p className="text-body-sm text-on-surface-variant leading-normal mb-3">
              Fitted securely with active real-time proxy API connections. Click quick action nodes below to triggers scans instantly!
            </p>
          </div>

          <div className="sticky top-4 flex flex-col gap-4">
            {/* Direct extension preview window */}
            <ExtensionPopup 
              scans={scans} 
              token={token} 
              onNewScan={onNewScan}
              stats={activeStats}
            />

            {/* Quick guide on how to load unpacked extension */}
            <div className="w-full max-w-[360px] bg-surface-container border border-white/10 rounded-2xl p-4.5 text-left shadow-lg select-none">
              <div className="flex items-center gap-2 mb-2 text-primary">
                <Info className="w-4 h-4" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider">CHROME DEVELOPMENT HANDBOOK</span>
              </div>
              <h4 className="text-body-sm font-bold text-on-surface mb-2">How to load extension in Chrome</h4>
              
              <div className="p-3 bg-surface-container-low border border-white/5 rounded-xl space-y-2 text-xs text-on-surface-variant">
                <p className="leading-relaxed">
                  The extension is configured! When loading unpacked on Chrome, make sure to enter the project folder and select the inner subfolder:
                </p>
                <div className="flex flex-col gap-1 w-full bg-surface-container/50 p-2 rounded-lg border border-white/5 font-mono text-[11px] text-on-surface">
                  <div className="flex items-center gap-1.5 text-on-surface-variant/70 text-[10px]">
                    📂 Project Root ⇒ ❌ <span className="text-error font-sans font-bold">No manifest.json found</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1 text-primary">
                    📁 extension / ⇒ <span className="bg-primary/20 px-1 rounded text-primary font-sans font-medium text-[10px]">✓ Choose this folder</span>
                  </div>
                </div>
                <ol className="list-decimal pl-4.5 space-y-1.5 mt-2.5 leading-relaxed text-on-surface-variant">
                  <li>Type <code className="bg-white/10 px-1.5 py-0.5 rounded font-mono text-on-surface">chrome://extensions/</code> in Chrome browser URL bar.</li>
                  <li>Enable <strong>Developer mode</strong> switch in the top-right corner.</li>
                  <li>Click <strong>Load unpacked</strong> in the top-left area.</li>
                  <li>Choose the <strong className="text-primary font-bold font-mono">extension</strong> subdirectory inside this source directory.</li>
                </ol>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
