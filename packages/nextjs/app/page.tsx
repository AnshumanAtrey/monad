"use client";

import { useState } from "react";
import type { NextPage } from "next";
import { PlusIcon, BriefcaseIcon, ClockIcon } from "@heroicons/react/24/outline";
import { CreateJobModal } from "~~/components/chowk/CreateJobModal";
import { OpenJobs } from "~~/components/chowk/OpenJobs";
import { OngoingJobs } from "~~/components/chowk/OngoingJobs";
import { WalletStatus } from "~~/components/chowk/WalletStatus";

const Home: NextPage = () => {
  const [activeTab, setActiveTab] = useState<"open" | "ongoing" | "create">("open");

  return (
    <>
      <div className="flex items-center flex-col grow pt-6">
        {/* Header */}
        <div className="px-5 text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">CHOWK</h1>
          <p className="text-lg mb-4">Gig Marketplace</p>
        </div>

        {/* Wallet Status */}
        <WalletStatus />

        {/* Main Dashboard */}
        <div className="w-full max-w-6xl px-4">
          {/* Tab Navigation */}
          <div className="tabs tabs-boxed justify-center mb-8 bg-base-200">
            <button 
              className={`tab tab-lg ${activeTab === "open" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("open")}
            >
              <BriefcaseIcon className="w-5 h-5 mr-2" />
              Open Gigs
            </button>
            <button 
              className={`tab tab-lg ${activeTab === "ongoing" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("ongoing")}
            >
              <ClockIcon className="w-5 h-5 mr-2" />
              My Gigs
            </button>
            <button 
              className={`tab tab-lg ${activeTab === "create" ? "tab-active" : ""}`}
              onClick={() => setActiveTab("create")}
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Create Gig
            </button>
          </div>

          {/* Tab Content */}
          <div className="min-h-[400px]">
            {activeTab === "open" && <OpenJobs />}
            {activeTab === "ongoing" && <OngoingJobs />}
            {activeTab === "create" && <CreateJobModal />}
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;