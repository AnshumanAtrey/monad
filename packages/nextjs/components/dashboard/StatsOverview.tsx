"use client";

import React, { useState } from "react";
import { formatEther } from "viem";

interface StatsOverviewProps {
  totalEarnings?: bigint;
  activeGigs?: number;
  avgRating?: number;
}

const StatsOverview: React.FC<StatsOverviewProps> = ({
  totalEarnings = BigInt(0),
  activeGigs = 0,
  avgRating = 0
}) => {
  const [timeFilter, setTimeFilter] = useState("This Month");

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-xl">
      {/* Card Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-[#2d3436] font-inter">Earnings Overview</h3>
        <select 
          value={timeFilter}
          onChange={(e) => setTimeFilter(e.target.value)}
          className="px-3 py-2 border border-[#dfe6e9] rounded-lg text-sm bg-white text-[#2d3436] focus:outline-none focus:border-[#a29bfe] focus:ring-2 focus:ring-[#6c5ce7]/10 transition-all duration-200"
        >
          <option>This Month</option>
          <option>Last Month</option>
          <option>Last 6 Months</option>
          <option>This Year</option>
        </select>
      </div>

      {/* Chart Placeholder */}
      <div className="h-48 mb-6 bg-gradient-to-br from-[#f8f9fa] to-[#e9ecef] rounded-lg flex items-center justify-center border border-[#dfe6e9]">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-[#6c5ce7] to-[#a29bfe] rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-[#636e72] text-sm">Earnings Chart</p>
          <p className="text-xs text-[#b2bec3]">Coming Soon</p>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#f8f9fa] p-4 rounded-lg text-center transition-all duration-200 hover:transform hover:-translate-y-1 hover:shadow-md">
          <span className="block text-xs text-[#636e72] mb-1 uppercase tracking-wide font-medium">Total Earnings</span>
          <span className="block text-2xl font-bold text-[#2d3436] mb-1">
            {Number(formatEther(totalEarnings)).toFixed(3)} MON
          </span>
          <span className="text-xs font-semibold text-[#00b894]">+12.5%</span>
        </div>
        
        <div className="bg-[#f8f9fa] p-4 rounded-lg text-center transition-all duration-200 hover:transform hover:-translate-y-1 hover:shadow-md">
          <span className="block text-xs text-[#636e72] mb-1 uppercase tracking-wide font-medium">Active Gigs</span>
          <span className="block text-2xl font-bold text-[#2d3436] mb-1">{activeGigs}</span>
          <span className="text-xs font-semibold text-[#00b894]">+2</span>
        </div>
        
        <div className="bg-[#f8f9fa] p-4 rounded-lg text-center transition-all duration-200 hover:transform hover:-translate-y-1 hover:shadow-md">
          <span className="block text-xs text-[#636e72] mb-1 uppercase tracking-wide font-medium">Avg. Rating</span>
          <span className="block text-2xl font-bold text-[#2d3436] mb-1">{avgRating.toFixed(1)}</span>
          <span className="text-xs font-semibold text-[#00b894]">+0.2</span>
        </div>
      </div>
    </div>
  );
};

export default StatsOverview;