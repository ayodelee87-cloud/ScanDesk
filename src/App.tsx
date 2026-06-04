import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Shield, Lock, AlertTriangle, UserCheck, Eye, LogIn, ChevronRight, Activity } from "lucide-react";
import { User as AppUser, Scan, AuthResponse } from "./types";
import OnboardingLayout from "./components/OnboardingLayout";
import DashboardSaaS from "./components/DashboardSaaS";
import AuthForm from "./components/AuthForm";

export default function App() {
  // Coordinating views: "welcome" | "permissions" | "saas"
  const [currentPage, setCurrentPage] = useState<"welcome" | "permissions" | "saas">("welcome");
  
  // Auth state management
  const [user, setUser] = useState<AppUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Scan logs database synced state
  const [scans, setScans] = useState<Scan[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Restore session from localStorage on startup
  useEffect(() => {
    const savedToken = localStorage.getItem("scandesk_jwt_token");
    const savedUser = localStorage.getItem("scandesk_user_profile");
    const savedPage = localStorage.getItem("scandesk_current_page");

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    
    if (savedPage) {
      setCurrentPage(savedPage as any);
    }
  }, []);

  // Fetch target history list whenever token or user profile triggers changes
  const fetchHistory = async (activeToken: string | null) => {
    setHistoryLoading(true);
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (activeToken) {
        headers["Authorization"] = `Bearer ${activeToken}`;
      }

      const res = await fetch("/api/scans", {
        method: "GET",
        headers,
      });

      if (res.ok) {
        const data = await res.json();
        setScans(data);
      }
    } catch (e) {
      console.error("Failed to fetch scan metrics logs history from server node", e);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    // Initial history fetch for current authenticated session (or guest/mock session if unauthenticated)
    fetchHistory(token);
  }, [token]);

  // Handle route and view transition states persistent storage limits
  const transitionTo = (page: "welcome" | "permissions" | "saas") => {
    setCurrentPage(page);
    localStorage.setItem("scandesk_current_page", page);
  };

  const handleAuthSuccess = (auth: AuthResponse) => {
    setToken(auth.token);
    setUser(auth.user);
    localStorage.setItem("scandesk_jwt_token", auth.token);
    localStorage.setItem("scandesk_user_profile", JSON.stringify(auth.user));
    setShowAuthModal(false);
    transitionTo("saas");
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("scandesk_jwt_token");
    localStorage.removeItem("scandesk_user_profile");
    localStorage.removeItem("scandesk_current_page");
    setCurrentPage("welcome");
  };

  const handleNewScanInserted = (newScan: Scan) => {
    setScans((prev) => [newScan, ...prev]);
  };

  const handleDeleteScan = async (scanId: string) => {
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(`/api/scans/${scanId}`, {
        method: "DELETE",
        headers,
      });

      if (res.ok) {
        setScans((prev) => prev.filter((s) => s.id !== scanId));
      }
    } catch (err) {
      console.error("Failed to secure delete target trace log record", err);
    }
  };

  const handleClearAllLogs = async () => {
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch("/api/scans/clear", {
        method: "POST",
        headers,
      });

      if (res.ok) {
        setScans([]);
      }
    } catch (err) {
      console.error("Failed to clean threat log database", err);
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface relative flex flex-col justify-between selection:bg-primary-container selection:text-white">
      {/* Dynamic atmospheric background glows layout */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-primary-container/10 blur-[130px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-tertiary-container/10 blur-[120px]" />
      </div>

      {/* Global Navigation Header bar */}
      <nav className="relative z-40 border-b border-white/5 bg-background/50 backdrop-blur shrink-0 md:px-8">
        <div className="max-w-7xl mx-auto h-16 flex items-center justify-between px-container-padding">
          <div className="flex items-center gap-2 select-none cursor-pointer" onClick={() => transitionTo("welcome")}>
            <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center p-0.5 border border-primary/20">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <span className="font-sans text-lg font-black text-on-surface tracking-tight uppercase">ScanDesk</span>
          </div>

          <div className="flex items-center gap-3">
            {currentPage === "saas" ? (
              <span className="text-[11px] font-mono tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full uppercase font-bold select-none flex items-center gap-1.5 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Workspace Active
              </span>
            ) : (
              <button
                onClick={() => transitionTo("saas")}
                className="text-label-md text-primary/80 hover:text-primary font-bold cursor-pointer transition-colors flex items-center gap-1 font-mono hover:scale-105 active:scale-95 duration-150 py-1"
              >
                Go to SaaS panel <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}

            {!user ? (
              <button
                onClick={() => setShowAuthModal(true)}
                className="h-9 px-4 bg-primary hover:bg-surface-tint text-on-primary hover:text-white text-body-sm font-bold rounded-lg transition-all shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <LogIn className="w-4 h-4" /> Sign In / Log In
              </button>
            ) : (
              <button
                onClick={handleLogout}
                className="h-9 px-3 border border-white/10 hover:border-error/20 hover:text-error text-on-surface-variant text-body-sm font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1"
                title="Sign out of current secure node"
              >
                Sign out
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Primary Canvas Router */}
      <main className="flex-grow flex items-center justify-center relative z-20">
        <AnimatePresence mode="wait">
          
          {currentPage === "welcome" && (
            <motion.div
              key="page-welcome"
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              className="py-12 w-full flex items-center justify-center"
            >
              <OnboardingLayout step="welcome" onNext={() => transitionTo("permissions")} />
            </motion.div>
          )}

          {currentPage === "permissions" && (
            <motion.div
              key="page-permissions"
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              className="py-12 w-full flex items-center justify-center"
            >
              <OnboardingLayout step="permissions" onNext={() => transitionTo("saas")} />
            </motion.div>
          )}

          {currentPage === "saas" && (
            <motion.div
              key="page-saas"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full flex"
            >
              <DashboardSaaS
                user={user}
                scans={scans}
                token={token}
                onLogout={handleLogout}
                onNewScan={handleNewScanInserted}
                onDeleteScan={handleDeleteScan}
                onClearAll={handleClearAllLogs}
              />
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Global Interactive Credentials Modal overlay */}
      <AnimatePresence>
        {showAuthModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020617]/80 backdrop-blur-md"
          >
            {/* Click outside target */}
            <div className="absolute inset-0 z-0 cursor-default" onClick={() => setShowAuthModal(false)} />
            <div className="z-10 relative">
              <AuthForm 
                onAuthSuccess={handleAuthSuccess} 
                onClose={() => setShowAuthModal(false)} 
              />
              
              <button 
                onClick={() => setShowAuthModal(false)}
                className="absolute top-4 right-4 text-on-surface-variant/40 hover:text-white transition-colors cursor-pointer p-1 rounded-full font-mono text-xs select-none"
              >
                [ CLOSE ]
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dynamic Security Footer details */}
      <footer className="h-14 bg-surface-container-lowest/20 border-t border-white/5 relative z-30 shrink-0 select-none">
        <div className="max-w-7xl mx-auto px-container-padding h-full flex flex-col sm:flex-row justify-between items-center text-[10px] font-mono text-on-surface-variant/40 gap-1 mt-1 sm:mt-0 leading-relaxed font-semibold">
          <span>SCANDESK NETWORK INTERFACE SECURITY AUDIT CENTER</span>
          <div className="flex gap-4 tracking-wider">
            <span>LIVE ENVIRONMENT STATUS: <span className="text-emerald-500 animate-pulse">● SECURED</span></span>
            <span>ENVELOPE SYSTEM TIME UTC: 2026-06-04</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
