"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { 
  MessageSquare, 
  Sparkles, 
  Plus, 
  Menu, 
  X, 
  LayoutDashboard, 
  Home,
  LogOut,
  LogIn,
  Power
} from "lucide-react";
import { BusinessAccount, BusinessCategory } from "@/lib/types";
import { getStoredAccounts, createBusinessAccount } from "@/lib/storage";

interface NavbarProps {
  onOpenWizard: (cat?: BusinessCategory) => void;
  activeAccount?: BusinessAccount | null;
  lastAccount?: BusinessAccount | null;
  currentView?: "landing" | "workspace";
  onGoToDashboard?: () => void;
  onBackToLanding?: () => void;
  onLogout?: () => void;
  onLogin?: (account: BusinessAccount) => void;
  onActivateAccount?: (account: BusinessAccount) => void;
}

export default function Navbar({ 
  onOpenWizard,
  activeAccount,
  lastAccount,
  currentView = "landing",
  onGoToDashboard,
  onBackToLanding,
  onLogout,
  onLogin,
  onActivateAccount
}: NavbarProps) {
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Login Modal Form State
  const [loginBusinessName, setLoginBusinessName] = useState("");
  const [loginApiKey, setLoginApiKey] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (showLoginModal) {
      setLoginError(null);
      if (lastAccount) {
        setLoginBusinessName(lastAccount.businessName || "");
        setLoginApiKey(lastAccount.apiKey || "");
      } else {
        setLoginBusinessName("");
        setLoginApiKey("");
      }
    }
  }, [showLoginModal, lastAccount]);

  const handlePerformLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!loginBusinessName.trim()) {
      setLoginError("Please enter your Business / Store Name.");
      return;
    }

    const allAccounts = getStoredAccounts();
    let matched = allAccounts.find(
      (a) =>
        (loginApiKey.trim() && a.apiKey.toLowerCase() === loginApiKey.trim().toLowerCase()) ||
        a.businessName.toLowerCase() === loginBusinessName.trim().toLowerCase()
    );

    if (!matched && lastAccount) {
      matched = lastAccount;
    }

    if (!matched) {
      matched = createBusinessAccount({
        businessName: loginBusinessName.trim(),
        category: "medicine",
        apiKey: loginApiKey.trim() || undefined,
      });
    }

    if (onLogin && matched) {
      onLogin(matched);
      setShowLoginModal(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div 
            onClick={() => {
              if (onBackToLanding) {
                onBackToLanding();
              } else {
                window.scrollTo({ top: 0, behavior: "smooth" });
              }
            }}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-[5px] bg-gradient-to-tr from-emerald-600 via-teal-500 to-blue-600 flex items-center justify-center shadow-md shadow-emerald-500/20 text-white font-bold group-hover:scale-105 transition-transform">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <span className="font-black text-slate-900 tracking-tight text-xl">MessageAPI</span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          {currentView === "landing" ? (
            <nav className="hidden md:flex items-center gap-8">
              <button
                onClick={() => {
                  const el = document.getElementById("features");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
                className="text-xs font-semibold text-slate-600 hover:text-emerald-600 transition-colors rounded-[5px] cursor-pointer"
              >
                How It Works
              </button>
              <button
                onClick={() => {
                  const el = document.getElementById("businesses");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
                className="text-xs font-semibold text-slate-600 hover:text-emerald-600 transition-colors rounded-[5px] cursor-pointer"
              >
                Use Cases &amp; Niches
              </button>
              <button
                onClick={() => {
                  const el = document.getElementById("demo-simulator");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
                className="text-xs font-semibold text-slate-600 hover:text-emerald-600 transition-colors flex items-center gap-1.5 rounded-[5px] cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                <span>Live Simulator</span>
              </button>
              <button
                onClick={() => {
                  const el = document.getElementById("roi-calculator");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
                className="text-xs font-semibold text-slate-600 hover:text-emerald-600 transition-colors rounded-[5px] cursor-pointer"
              >
                Zero-Cost ROI
              </button>
            </nav>
          ) : (
            <nav className="hidden md:flex items-center gap-4">
              <button
                onClick={onBackToLanding}
                className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-emerald-600 transition-colors px-3 py-2 rounded-[5px] hover:bg-slate-50 cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>Home Landing</span>
              </button>
            </nav>
          )}

          {/* Right Action CTA */}
          <div className="hidden md:flex items-center gap-3">
            {/* 1. When Active Account Exists (Logged In) -> Show Dashboard & Log Out Account (Get Started is hidden!) */}
            {activeAccount && currentView === "landing" ? (
              <>
                {onGoToDashboard && (
                  <button
                    onClick={onGoToDashboard}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-[5px] bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Dashboard ({activeAccount.businessName})</span>
                  </button>
                )}

                <button
                  onClick={() => setShowLogoutModal(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-[5px] bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-500/20 hover:shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out Account</span>
                </button>
              </>
            ) : (
              /* 2. When Logged Out (or Fresh Visitor) -> Show Both Log In and Get Started Buttons */
              <>
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-[5px] bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Log In</span>
                </button>

                <button
                  onClick={() => onOpenWizard()}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-[5px] bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-extrabold shadow-md shadow-emerald-500/20 hover:shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Get Started</span>
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex md:hidden items-center gap-2">
            {activeAccount && currentView === "landing" ? (
              <>
                {onGoToDashboard && (
                  <button
                    onClick={onGoToDashboard}
                    className="px-2.5 py-1.5 rounded-[5px] bg-slate-900 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <LayoutDashboard className="w-3 h-3 text-emerald-400" />
                    <span>Dashboard</span>
                  </button>
                )}

                <button
                  onClick={() => setShowLogoutModal(true)}
                  className="px-3 py-1.5 rounded-[5px] bg-rose-600 text-white text-xs font-bold cursor-pointer"
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="px-2.5 py-1.5 rounded-[5px] bg-slate-900 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                >
                  <LogIn className="w-3 h-3 text-emerald-400" />
                  <span>Log In</span>
                </button>

                <button
                  onClick={() => onOpenWizard()}
                  className="px-3 py-1.5 rounded-[5px] bg-emerald-600 text-white text-xs font-bold cursor-pointer"
                >
                  Get Started
                </button>
              </>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-[5px] text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 py-3 space-y-2 bg-white px-2">
            {currentView === "workspace" ? (
              <button
                onClick={() => {
                  if (onBackToLanding) onBackToLanding();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-[5px] flex items-center gap-2 cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>Back to Home Landing</span>
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    const el = document.getElementById("features");
                    el?.scrollIntoView({ behavior: "smooth" });
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-[5px] cursor-pointer"
                >
                  How It Works
                </button>
                <button
                  onClick={() => {
                    const el = document.getElementById("businesses");
                    el?.scrollIntoView({ behavior: "smooth" });
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-[5px] cursor-pointer"
                >
                  Use Cases &amp; Niches
                </button>
                <button
                  onClick={() => {
                    const el = document.getElementById("demo-simulator");
                    el?.scrollIntoView({ behavior: "smooth" });
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-[5px] cursor-pointer"
                >
                  Live Simulator
                </button>
              </>
            )}

            {activeAccount && currentView === "landing" && onGoToDashboard && (
              <button
                onClick={() => {
                  onGoToDashboard();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-xs font-bold text-emerald-700 bg-emerald-50 rounded-[5px] flex items-center gap-2 cursor-pointer"
              >
                <LayoutDashboard className="w-4 h-4 text-emerald-600" />
                <span>Go to {activeAccount.businessName} Dashboard</span>
              </button>
            )}

            {activeAccount ? (
              <button
                onClick={() => {
                  setShowLogoutModal(true);
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-[5px] flex items-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out Account</span>
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    setShowLoginModal(true);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-[5px] flex items-center gap-2 cursor-pointer"
                >
                  <LogIn className="w-4 h-4 text-emerald-600" />
                  <span>{lastAccount ? `Log In to ${lastAccount.businessName}` : "Log In"}</span>
                </button>

                <button
                  onClick={() => {
                    onOpenWizard();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs font-bold text-emerald-600 hover:bg-emerald-50 rounded-[5px] flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Get Started</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* CONFIRMATION MODAL 1: Log Out Account Confirmation (Mounted to Document Body for full-screen centering) */}
      {mounted && showLogoutModal && typeof document !== "undefined" && createPortal(
        <div
          className="fixed inset-0 w-screen h-screen min-h-screen bg-black/80 backdrop-blur-sm flex items-center justify-center z-[999999] p-4 animate-in fade-in duration-200"
          style={{ top: 0, left: 0, right: 0, bottom: 0 }}
        >
          <div className="bg-white rounded-[5px] border border-slate-200 max-w-sm w-full p-6 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] space-y-4 text-center">
            <div className="w-12 h-12 rounded-[5px] bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
              <LogOut className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-slate-900">Log Out Account</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Are you sure you want to log out of the account{activeAccount ? ` for ${activeAccount.businessName}` : ""}?
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-2 px-3 rounded-[5px] border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onLogout) onLogout();
                  setShowLogoutModal(false);
                }}
                className="flex-1 py-2 px-3 rounded-[5px] bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
              >
                Yes, Log Out
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* CONFIRMATION MODAL 2: Activate Account Confirmation (Mounted to Document Body for full-screen centering) */}
      {mounted && showActivateModal && typeof document !== "undefined" && createPortal(
        <div
          className="fixed inset-0 w-screen h-screen min-h-screen bg-black/80 backdrop-blur-sm flex items-center justify-center z-[999999] p-4 animate-in fade-in duration-200"
          style={{ top: 0, left: 0, right: 0, bottom: 0 }}
        >
          <div className="bg-white rounded-[5px] border border-slate-200 max-w-sm w-full p-6 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] space-y-4 text-center">
            <div className="w-12 h-12 rounded-[5px] bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
              <LayoutDashboard className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-slate-900">Activate Account</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Are you sure you want to activate the account{lastAccount ? ` for ${lastAccount.businessName}` : ""}?
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowActivateModal(false)}
                className="flex-1 py-2 px-3 rounded-[5px] border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (lastAccount && onActivateAccount) {
                    onActivateAccount(lastAccount);
                  }
                  setShowActivateModal(false);
                }}
                className="flex-1 py-2 px-3 rounded-[5px] bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
              >
                Yes, Activate
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* CONFIRMATION MODAL 3: Log In Account Modal (Mounted to Document Body) */}
      {mounted && showLoginModal && typeof document !== "undefined" && createPortal(
        <div
          className="fixed inset-0 w-screen h-screen min-h-screen bg-black/80 backdrop-blur-sm flex items-center justify-center z-[999999] p-4 animate-in fade-in duration-200"
          style={{ top: 0, left: 0, right: 0, bottom: 0 }}
        >
          <div className="bg-white rounded-[5px] border border-slate-200 max-w-sm w-full p-6 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] space-y-4 text-center">
            <div className="w-12 h-12 rounded-[5px] bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
              <LogIn className="w-6 h-6" />
            </div>
            <div className="space-y-1 text-center">
              <h3 className="text-base font-bold text-slate-900">Log In to Business Account</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Enter your business details or API token to access your dashboard.
              </p>
            </div>

            <form onSubmit={handlePerformLogin} className="space-y-3.5 text-left pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Business / Store Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={loginBusinessName}
                  onChange={(e) => {
                    setLoginBusinessName(e.target.value);
                    if (loginError) setLoginError(null);
                  }}
                  placeholder="e.g. Lifeline Medico / City Care"
                  className="w-full px-3 py-2 rounded-[5px] border border-slate-300 text-xs font-semibold focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-slate-900 bg-white placeholder:text-slate-400"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Your Master API Token:
                </label>
                <input
                  type="text"
                  value={loginApiKey}
                  onChange={(e) => {
                    setLoginApiKey(e.target.value);
                    if (loginError) setLoginError(null);
                  }}
                  placeholder="e.g. msgapi_live_med_88921a99"
                  className="w-full px-3 py-2 rounded-[5px] border border-slate-300 text-xs font-mono focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-slate-900 bg-white placeholder:text-slate-400"
                />
              </div>

              {loginError && (
                <p className="text-[11px] font-semibold text-rose-600 animate-in fade-in">
                  {loginError}
                </p>
              )}

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLoginModal(false)}
                  className="py-2 px-3 rounded-[5px] border w-1/2 border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
               
                <button
                  type="submit"
                  className="flex-1 py-2 px-3 rounded-[5px] w-1/2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-1"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Log In &amp; Open</span>
                </button>
              </div>
              <div className="text-[11px] text-slate-500 leading-snug flex items-center gap-1 justify-center">
                Don&apos;t have an account yet?{" "}
                <span
                  onClick={() => {
                    setShowLoginModal(false);
                    onOpenWizard();
                  }}
                  className="text-emerald-600 font-bold hover:underline cursor-pointer"
                >
                  Get Started
                </span>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </header>
  );
}


