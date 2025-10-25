"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  HomeIcon, 
  ShoppingBagIcon, 
  ShieldCheckIcon,
  BellIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  EllipsisVerticalIcon
} from "@heroicons/react/24/outline";
import { useAccount } from "wagmi";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const { address } = useAccount();
  const [searchQuery, setSearchQuery] = useState("");

  const navigation = [
    { name: "Dashboard", href: "/", icon: HomeIcon },
    { name: "Marketplace", href: "/", icon: ShoppingBagIcon },
    { name: "Validator", href: "/validator", icon: ShieldCheckIcon },
  ];

  return (
    <div className="flex min-h-screen bg-[#f5eee8]">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg fixed h-full z-10 transition-all duration-300">
        {/* Logo */}
        <div className="p-6 border-b border-[#dfe6e9]">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-[#2d3436] to-[#6c5ce7] bg-clip-text text-transparent font-inter">
            CHOWK
          </h2>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-5 overflow-y-auto">
          <ul className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center px-6 py-3 text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? "text-[#6c5ce7] bg-[#6c5ce7]/5 border-r-3 border-[#6c5ce7]"
                        : "text-[#636e72] hover:text-[#6c5ce7] hover:bg-[#6c5ce7]/5"
                    }`}
                  >
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-5 border-t border-[#dfe6e9]">
          <button className="w-full mb-5 px-4 py-3 bg-gradient-to-r from-[#6c5ce7] to-[#a29bfe] text-white rounded-lg font-semibold transition-all duration-200 hover:transform hover:-translate-y-0.5 hover:shadow-lg">
            Upgrade to Pro
          </button>
          
          {/* User Menu */}
          <div className="flex items-center p-2">
            <div className="w-10 h-10 rounded-full overflow-hidden mr-3 border-2 border-[#a29bfe]">
              <div className="w-full h-full bg-gradient-to-br from-[#6c5ce7] to-[#a29bfe] flex items-center justify-center text-white font-semibold">
                {address ? address.slice(2, 4).toUpperCase() : "??"}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-[#2d3436] truncate">
                {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Not Connected"}
              </div>
              <div className="text-xs text-[#636e72]">
                {address ? "Connected" : "Wallet"}
              </div>
            </div>
            <button className="p-1 text-[#636e72] hover:text-[#2d3436] hover:bg-[#dfe6e9] rounded">
              <EllipsisVerticalIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8 transition-all duration-300">
        {/* Top Bar */}
        <header className="flex justify-between items-center mb-8 pb-4">
          {/* Search Bar */}
          <div className="relative w-96 max-w-full">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#b2bec3]" />
            <input
              type="text"
              placeholder="Search gigs, transactions, or users..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-[#dfe6e9] rounded-lg text-sm transition-all duration-200 focus:outline-none focus:border-[#a29bfe] focus:ring-3 focus:ring-[#6c5ce7]/10 bg-white"
            />
          </div>

          {/* Header Actions */}
          <div className="flex items-center space-x-4">
            <button className="relative w-10 h-10 rounded-full bg-white border border-[#dfe6e9] text-[#636e72] flex items-center justify-center transition-all duration-200 hover:bg-[#6c5ce7] hover:text-white hover:border-[#6c5ce7]">
              <BellIcon className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#ff7675] text-white text-xs rounded-full flex items-center justify-center border-2 border-white font-semibold">
                3
              </span>
            </button>
            <button className="flex items-center space-x-2 px-5 py-2.5 bg-[#6c5ce7] text-white rounded-lg font-semibold transition-all duration-200 hover:bg-[#5a4bc9] hover:transform hover:-translate-y-0.5 hover:shadow-lg">
              <PlusIcon className="w-4 h-4" />
              <span>New Gig</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;