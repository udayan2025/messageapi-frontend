"use client";

import React, { useState, useSyncExternalStore } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import WhyWeCreatedSection from "@/components/WhyWeCreatedSection";
import ValueProposition from "@/components/ValueProposition";
import BusinessNicheShowcase from "@/components/BusinessNicheShowcase";
import InteractiveLiveDemo from "@/components/InteractiveLiveDemo";
import RoiCalculator from "@/components/RoiCalculator";
import BusinessSetupWizard from "@/components/BusinessSetupWizard";
import BusinessWorkspace from "@/components/BusinessWorkspace";
import Footer from "@/components/Footer";

import { BusinessAccount, BusinessCategory } from "@/lib/types";
import { 
  subscribeToAccountStore, 
  getActiveAccountSnapshot, 
  getServerSnapshot,
  setActiveAccountId,
  logoutActiveAccount,
  getLastStoredAccount
} from "@/lib/storage";

export default function Home() {
  const [currentView, setCurrentView] = useState<"landing" | "workspace">("landing");
  const storedActiveAccount = useSyncExternalStore(
    subscribeToAccountStore,
    getActiveAccountSnapshot,
    getServerSnapshot
  );
  const [activeAccountOverride, setActiveAccountOverride] = useState<BusinessAccount | null>(null);

  const activeAccount = activeAccountOverride !== null ? activeAccountOverride : storedActiveAccount;
  const lastAccount = activeAccount || getLastStoredAccount();

  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardCategory, setWizardCategory] = useState<BusinessCategory>("custom");
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const handleOpenWizard = (cat?: BusinessCategory) => {
    if (cat) setWizardCategory(cat);
    setWizardOpen(true);
  };

  const handleAccountCreated = (newAcc: BusinessAccount) => {
    setActiveAccountOverride(newAcc);
    setActiveAccountId(newAcc.id);
    setCurrentView("workspace");
    setSuccessBanner(`🎉 ${newAcc.businessName} account created! Master API Token: ${newAcc.apiKey}`);
    setTimeout(() => setSuccessBanner(null), 10000);
  };

  const handleUpdateAccount = (updated: BusinessAccount) => {
    setActiveAccountOverride(updated);
  };

  const handleLogout = () => {
    setActiveAccountOverride(null);
    logoutActiveAccount();
    setCurrentView("landing");
    setWizardOpen(false);
    setWizardCategory("medicine");
  };

  const handleLogin = (acc: BusinessAccount) => {
    setActiveAccountOverride(acc);
    setActiveAccountId(acc.id);
    setCurrentView("workspace");
  };

  const handleActivateAccount = (acc: BusinessAccount) => {
    setActiveAccountOverride(acc);
    setActiveAccountId(acc.id);
  };

  const handleScrollToDemo = () => {
    const el = document.getElementById("demo-simulator");
    el?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className={`bg-white text-slate-900 font-sans selection:bg-emerald-500 selection:text-white flex flex-col justify-between ${currentView === "workspace" ? "h-screen max-h-screen overflow-hidden" : "min-h-screen"}`}>
      {/* Top Banner Alert when account created */}
      {successBanner && (
        <div className="bg-emerald-600 text-white text-xs font-bold py-2.5 px-4 text-center sticky top-0 z-50 shadow-md flex items-center justify-center gap-2">
          <span className="truncate max-w-2xl">{successBanner}</span>
          <button
            onClick={() => setSuccessBanner(null)}
            className="ml-2 underline text-emerald-100 hover:text-white cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Navbar Header (Rendered on Landing page only) */}
      {currentView === "landing" && (
        <Navbar
          onOpenWizard={handleOpenWizard}
          activeAccount={activeAccount}
          lastAccount={lastAccount}
          currentView={currentView}
          onGoToDashboard={() => setCurrentView("workspace")}
          onBackToLanding={() => setCurrentView("landing")}
          onLogout={handleLogout}
          onLogin={handleLogin}
          onActivateAccount={handleActivateAccount}
        />
      )}

      {/* Conditional View: Dashboard Workspace vs Master Landing Page */}
      {currentView === "workspace" && activeAccount ? (
        <main className="flex-1 w-full h-full min-h-0 overflow-hidden">
          <BusinessWorkspace
            key={activeAccount.id}
            account={activeAccount}
            onUpdateAccount={handleUpdateAccount}
            onBackToLanding={() => setCurrentView("landing")}
            onOpenWizard={() => handleOpenWizard()}
          />
        </main>
      ) : (
        <main className="flex-1">
          {/* 1. Hero Section with Universal Selector */}
          <HeroSection
            onOpenWizard={(cat) => handleOpenWizard(cat)}
            onScrollToDemo={handleScrollToDemo}
          />

          {/* 2. Educational Section: Why MessageAPI was created for all businesses & products */}
          <WhyWeCreatedSection onOpenWizard={(cat) => handleOpenWizard(cat)} />

          {/* 3. Value Proposition & Meta API Reality Check */}
          <ValueProposition onOpenWizard={() => handleOpenWizard()} />

          {/* 4. Deep Dive for Medicine, Gym, Grocery, Electronics, Custom, etc. */}
          <BusinessNicheShowcase onOpenWizard={(cat) => handleOpenWizard(cat)} />

          {/* 5. Interactive Live WhatsApp Simulator */}
          <InteractiveLiveDemo onOpenWizard={(cat) => handleOpenWizard(cat)} />

          {/* 6. Cost Savings ROI Calculator */}
          {/* <RoiCalculator onOpenWizard={() => handleOpenWizard()} /> */}
        </main>
      )}

      {/* Footer (Rendered on Landing page only) */}
      {currentView === "landing" && (
        <Footer onOpenWizard={() => handleOpenWizard()} />
      )}

      {/* 5-Step Business Setup Wizard Modal */}
      <BusinessSetupWizard
        key={`${wizardCategory}-${wizardOpen}`}
        initialCategory={wizardCategory}
        isOpen={wizardOpen}
        onClose={() => setWizardOpen(false)}
        onAccountCreated={handleAccountCreated}
      />
    </div>
  );
}
