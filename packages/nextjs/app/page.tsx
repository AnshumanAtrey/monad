"use client";

import { useState } from "react";
import type { NextPage } from "next";
import DashboardLayout from "~~/components/layout/DashboardLayout";
import ProfileCard from "~~/components/dashboard/ProfileCard";
import StatsOverview from "~~/components/dashboard/StatsOverview";
import RecentTransactions from "~~/components/dashboard/RecentTransactions";
import { CreateJobModal } from "~~/components/chowk/CreateJobModal";
import { OpenJobs } from "~~/components/chowk/OpenJobs";
import { OngoingJobs } from "~~/components/chowk/OngoingJobs";
import { WalletStatus } from "~~/components/chowk/WalletStatus";

const Home: NextPage = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <WalletStatus />
        
        {/* Dashboard Grid */}
        <div className="grid grid-cols-12 gap-6">
          {/* Profile Card */}
          <div className="col-span-12 lg:col-span-4">
            <ProfileCard />
          </div>

          {/* Stats Overview */}
          <div className="col-span-12 lg:col-span-8">
            <StatsOverview 
              totalEarnings={BigInt("12450000000000000000")} // 12.45 MON
              activeGigs={8}
              avgRating={4.9}
            />
          </div>

          {/* Recent Transactions */}
          <div className="col-span-12 lg:col-span-8">
            <RecentTransactions />
          </div>

          {/* Quick Actions */}
          <div className="col-span-12 lg:col-span-4">
            <div className="bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-[#2d3436] font-inter">Quick Actions</h3>
              </div>
              <div className="space-y-4">
                <button 
                  onClick={() => setShowCreateModal(true)}
                  className="w-full p-4 bg-gradient-to-r from-[#6c5ce7] to-[#a29bfe] text-white rounded-lg font-semibold transition-all duration-200 hover:transform hover:-translate-y-0.5 hover:shadow-lg"
                >
                  Create New Gig
                </button>
                <div className="text-sm">
                  <OngoingJobs />
                </div>
              </div>
            </div>
          </div>

          {/* Open Jobs */}
          <div className="col-span-12">
            <div className="bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-xl">
              <OpenJobs />
            </div>
          </div>
        </div>

        {/* Create Job Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-[#2d3436] font-inter">Create New Gig</h2>
                  <button 
                    onClick={() => setShowCreateModal(false)}
                    className="text-[#636e72] hover:text-[#2d3436] text-2xl"
                  >
                    ×
                  </button>
                </div>
                <CreateJobModal />
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Home;