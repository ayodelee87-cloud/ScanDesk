import React from "react";
import { motion } from "motion/react";
import { Shield, Sparkles, CheckCircle, ArrowRight, Lock, Activity, Smartphone, Eye } from "lucide-react";

interface OnboardingLayoutProps {
  onNext: () => void;
  step: "welcome" | "permissions";
}

export default function OnboardingLayout({ onNext, step }: OnboardingLayoutProps) {
  if (step === "welcome") {
    return (
      <div className="relative min-h-[500px] flex flex-col justify-between py-6 px-4 z-10 w-full max-w-[360px] mx-auto">
        {/* Background blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[10%] -left-[10%] w-[180px] h-[180px] rounded-full bg-primary/10 blur-[60px]" />
          <div className="absolute -bottom-[10%] -right-[10%] w-[200px] h-[200px] rounded-full bg-tertiary-container/10 blur-[80px]" />
        </div>

        {/* Brand Header */}
        <div className="mt-8 flex flex-col items-center select-none text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, type: "spring" }}
            className="relative group"
          >
            {/* Broken corner bracket glow scanner icon */}
            <div className="w-20 h-20 bg-surface-container-high/70 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/5 shadow-2xl relative overflow-hidden">
              <Shield className="w-10 h-10 text-primary" />
              <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-primary/60 rounded-tl-sm" />
              <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-primary/60 rounded-tr-sm" />
              <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-primary/60 rounded-bl-sm" />
              <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-primary/60 rounded-br-sm" />
            </div>
          </motion.div>
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-5 text-headline-md font-extrabold text-primary tracking-tight"
          >
            ScanDesk
          </motion.h1>
        </div>

        {/* Description body */}
        <div className="flex flex-col gap-3 text-center px-2 my-8">
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-headline-lg font-headline-lg leading-tight text-on-surface"
          >
            Scan Screen Security Metrics Instantly
          </motion.h2>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-body-md text-on-surface-variant font-sans"
          >
            Audit browser inputs, physical Wi-Fi assets, or live desktop workflows for modern threat signatures.
          </motion.p>

          {/* Feature chips */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap justify-center gap-2 mt-4"
          >
            <div className="flex items-center gap-1.5 px-3 py-1 bg-surface-container border border-white/5 rounded-full select-none">
              <Activity className="w-3.5 h-3.5 text-secondary" />
              <span className="text-label-md text-on-surface">Screen Analytics</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-surface-container border border-white/5 rounded-full select-none">
              <Sparkles className="w-3.5 h-3.5 text-tertiary" />
              <span className="text-label-md text-on-surface">Gemini Engine</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-surface-container border border-white/5 rounded-full select-none">
              <Shield className="w-3.5 h-3.5 text-primary" />
              <span className="text-label-md text-on-surface">Privacy First</span>
            </div>
          </motion.div>
        </div>

        {/* CTA Banner */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-full h-20 bg-surface-container-low border border-white/5 rounded-xl flex items-center justify-between p-4 relative group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary-container/5 to-transparent" />
            <div className="z-10 flex gap-3 items-center">
              <div className="w-10 h-10 rounded-lg bg-surface-container-high border border-white/15 flex items-center justify-center p-1.5 shadow">
                <Shield className="w-5 h-5 text-secondary" />
              </div>
              <div className="flex flex-col text-left gap-0.5">
                <div className="w-20 h-2 bg-on-surface/30 rounded-full" />
                <div className="w-12 h-1.5 bg-on-surface/20 rounded-full" />
                <div className="w-16 h-1.5 bg-on-surface-variant/15 rounded-full" />
              </div>
            </div>
            {/* Simulated scan line */}
            <motion.div
              animate={{ top: ["10%", "90%", "10%"] }}
              transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
              className="absolute left-0 right-0 h-[2px] bg-primary/50 shadow-[0_0_8px_var(--color-primary)] opacity-70"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onNext}
            className="w-full h-12 bg-primary hover:bg-surface-tint text-on-primary font-bold rounded-xl transition-colors duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-primary/10"
          >
            Get Started
            <ArrowRight className="w-5 h-5" />
          </motion.button>
          
          <p className="text-label-sm text-on-surface-variant/40 uppercase tracking-widest font-mono">
            Professional Threat Capture System
          </p>
        </div>
      </div>
    );
  }

  // Permissions step
  return (
    <div className="relative min-h-[500px] flex flex-col justify-between py-6 px-4 z-10 w-full max-w-[360px] mx-auto">
      {/* Ambient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[180px] h-[180px] rounded-full bg-primary/10 blur-[60px]" />
      </div>

      {/* Screen access layout */}
      <div className="mt-6 flex flex-col items-center">
        <div className="relative w-48 h-32 bg-surface-container-low border border-white/5 rounded-xl flex items-center justify-center shadow-lg group overflow-hidden">
          {/* Laser Bracket Frame visual feedback */}
          <div className="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-primary/80 rounded-tl" />
          <div className="absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-primary/80 rounded-tr" />
          <div className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-primary/80 rounded-bl" />
          <div className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-primary/80 rounded-br" />

          {/* Core Laser Scanner line */}
          <motion.div
            animate={{ top: ["8%", "92%", "8%"] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
            className="absolute inset-x-0 h-[2px] bg-primary/60 shadow-[0_0_12px_var(--color-primary)] z-10"
          />

          {/* Vector screen contents placeholder */}
          <div className="w-full h-full p-4 flex flex-col gap-2 opacity-30 select-none">
            <div className="w-3/4 h-2 bg-on-surface-variant/30 rounded-full" />
            <div className="w-full h-2 bg-on-surface-variant/20 rounded-full" />
            <div className="w-1/2 h-2 bg-on-surface-variant/20 rounded-full" />
            <div className="mt-auto flex justify-end">
              <div className="w-8 h-8 rounded-md bg-primary-container/40" />
            </div>
          </div>

          <motion.div
            animate={{ x: [0, 8, -4, 0], y: [0, -8, 4, 0] }}
            transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
            className="absolute top-1/2 left-2/3"
          >
            <Shield className="w-6 h-6 text-primary filter drop-shadow-[0_0_8px_rgba(195,192,255,0.4)]" />
          </motion.div>
        </div>
      </div>

      <div className="text-center space-y-3 mt-6">
        <h1 className="text-headline-lg font-headline-lg text-on-surface tracking-tight">Allow Screen Access</h1>
        
        {/* Verification indicator */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container/10 border border-secondary-container/20">
          <CheckCircle className="w-3.5 h-3.5 text-secondary" />
          <span className="text-label-sm text-secondary uppercase tracking-wider font-mono">Heuristics Enabled</span>
        </div>
        
        <p className="text-body-md text-on-surface-variant leading-relaxed px-1">
          ScanDesk captures localized screenshots to audit domains or credentials. Zero persistent user metrics are logged in remote servers — processing is transparently local.
        </p>
      </div>

      {/* Speed details */}
      <div className="grid grid-cols-2 gap-3 mt-6">
        <div className="bg-surface-container border border-white/5 p-3 rounded-xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center shadow">
            <Lock className="w-4 h-4 text-primary" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-label-sm text-on-surface-variant uppercase text-[9px] tracking-wide font-mono opacity-60">Security</span>
            <span className="text-body-sm font-semibold text-on-surface text-[12px]">Direct Encrypted</span>
          </div>
        </div>
        <div className="bg-surface-container border border-white/5 p-3 rounded-xl flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center shadow">
            <Activity className="w-4 h-4 text-primary" />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-label-sm text-on-surface-variant uppercase text-[9px] tracking-wide font-mono opacity-60">Vetting</span>
            <span className="text-body-sm font-semibold text-on-surface text-[12px]">Local Speed</span>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onNext}
          className="w-full py-3.5 bg-primary hover:bg-surface-tint text-on-primary hover:text-white font-bold rounded-xl transition-all shadow-lg cursor-pointer"
        >
          Allow &amp; Continue
        </motion.button>
        
        <button className="text-label-md text-primary/80 hover:text-primary transition-colors flex items-center justify-center gap-1 group font-mono cursor-pointer">
          Telemetry &amp; Audit Scope
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
}
