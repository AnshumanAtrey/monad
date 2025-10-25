"use client";

import { useState } from "react";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { 
  PlusIcon, 
  BriefcaseIcon, 
  ClockIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  ChartBarIcon
} from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";
import { CreateJobModal } from "~~/components/chowk/CreateJobModal";
import { OpenJobs } from "~~/components/chowk/OpenJobs";
import { OngoingJobs } from "~~/components/chowk/OngoingJobs";
import { LiveMetrics } from "~~/components/chowk/LiveMetrics";
import { NetworkSwitcher } from "~~/components/chowk/NetworkSwitcher";
import { MonadBanner } from "~~/components/chowk/MonadBanner";


const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [activeTab, setActiveTab] = useState<"open" | "ongoing" | "create">("open");

  return (
    <>
      <MonadBanner />
      <div className="flex items-center flex-col grow pt-6">
        {/* Header */}
        <div className="px-5 text-center mb-8">
          <h1 className="text-center mb-4">
            <span className="block text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              CHOWK
            </span>
            <span className="block text-lg text-base-content/70 mt-2">
              On-chain gig marketplace with instant payouts
            </span>
          </h1>
          
          {connectedAddress && (
            <div className="flex flex-col items-center gap-3 mb-4">
              <div className="flex justify-center items-center space-x-2">
                <span className="text-sm text-base-content/60">Connected:</span>
                <Address address={connectedAddress} />
              </div>
              <NetworkSwitcher />
            </div>
          )}

          <div className="text-center text-sm text-base-content/60 mb-6">
            Powered by Monad&apos;s sub-second finality • Makers stake MON upfront • Acceptors get paid instantly
          </div>
        </div>

        {/* Live Metrics */}
        <LiveMetrics />

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

        {/* Features Section */}
        <div className="w-full bg-base-200 mt-16 px-8 py-12">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8">Why CHOWK?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col bg-base-100 px-6 py-8 text-center items-center rounded-2xl shadow-lg">
                <CurrencyDollarIcon className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Instant Payouts</h3>
                <p className="text-base-content/70">
                  Money is escrowed upfront. When work is complete, payment transfers instantly thanks to Monad&apos;s sub-second finality.
                </p>
              </div>
              <div className="flex flex-col bg-base-100 px-6 py-8 text-center items-center rounded-2xl shadow-lg">
                <UserGroupIcon className="h-12 w-12 text-secondary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Trust & Security</h3>
                <p className="text-base-content/70">
                  Smart contracts handle escrow automatically. No disputes, no delays, no middleman fees.
                </p>
              </div>
              <div className="flex flex-col bg-base-100 px-6 py-8 text-center items-center rounded-2xl shadow-lg">
                <ChartBarIcon className="h-12 w-12 text-accent mb-4" />
                <h3 className="text-xl font-semibold mb-2">Parallel Processing</h3>
                <p className="text-base-content/70">
                  Handle hundreds of concurrent gigs without congestion, powered by Monad&apos;s parallel execution.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
