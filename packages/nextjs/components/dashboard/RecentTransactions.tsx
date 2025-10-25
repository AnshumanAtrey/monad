"use client";

import React from "react";
import { CheckCircleIcon, ClockIcon } from "@heroicons/react/24/outline";
import { formatEther } from "viem";

interface Transaction {
  id: string;
  title: string;
  description: string;
  amount: bigint;
  status: "completed" | "pending";
  date: string;
}

interface RecentTransactionsProps {
  transactions?: Transaction[];
}

const RecentTransactions: React.FC<RecentTransactionsProps> = ({ transactions = [] }) => {
  // Mock data if no transactions provided
  const mockTransactions: Transaction[] = [
    {
      id: "1",
      title: "Website Redesign",
      description: "Payment received",
      amount: BigInt("1250000000000000000"), // 1.25 MON
      status: "completed",
      date: "2 hours ago"
    },
    {
      id: "2", 
      title: "Mobile App UI",
      description: "In progress",
      amount: BigInt("2400000000000000000"), // 2.4 MON
      status: "pending",
      date: "1 day ago"
    },
    {
      id: "3",
      title: "Logo Design", 
      description: "Payment received",
      amount: BigInt("350000000000000000"), // 0.35 MON
      status: "completed",
      date: "3 days ago"
    },
    {
      id: "4",
      title: "Brand Guidelines",
      description: "Payment received", 
      amount: BigInt("780000000000000000"), // 0.78 MON
      status: "completed",
      date: "1 week ago"
    }
  ];

  const displayTransactions = transactions.length > 0 ? transactions : mockTransactions;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-xl">
      {/* Card Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-[#2d3436] font-inter">Recent Transactions</h3>
        <a href="#" className="text-sm text-[#6c5ce7] font-medium hover:text-[#a29bfe] hover:underline transition-colors duration-200">
          View All
        </a>
      </div>

      {/* Transactions List */}
      <div className="space-y-4">
        {displayTransactions.map((transaction) => (
          <div 
            key={transaction.id}
            className="flex items-center p-4 bg-[#f8f9fa] rounded-lg transition-all duration-200 hover:transform hover:translate-x-1 hover:shadow-md"
          >
            {/* Transaction Icon */}
            <div className={`w-11 h-11 rounded-full flex items-center justify-center mr-4 text-white ${
              transaction.status === "completed" 
                ? "bg-[#00b894]" 
                : "bg-[#fdcb6e]"
            }`}>
              {transaction.status === "completed" ? (
                <CheckCircleIcon className="w-6 h-6" />
              ) : (
                <ClockIcon className="w-6 h-6" />
              )}
            </div>

            {/* Transaction Details */}
            <div className="flex-1">
              <h4 className="text-sm font-medium text-[#2d3436] mb-1">{transaction.title}</h4>
              <p className="text-xs text-[#636e72] mb-1">{transaction.description}</p>
              <span className="text-xs text-[#b2bec3]">{transaction.date}</span>
            </div>

            {/* Transaction Amount */}
            <div className="text-right">
              <span className="block font-semibold text-[#2d3436] mb-2">
                {Number(formatEther(transaction.amount)).toFixed(3)} MON
              </span>
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${
                transaction.status === "completed"
                  ? "bg-[#00b894]/10 text-[#00b894]"
                  : "bg-[#fdcb6e]/10 text-[#e17055]"
              }`}>
                {transaction.status === "completed" ? "Completed" : "In Escrow"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentTransactions;