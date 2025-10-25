"use client";

import { useState } from "react";
import { useAccount, useWriteContract } from "wagmi";
import { parseEther } from "viem";
import { PlusIcon, CurrencyDollarIcon } from "@heroicons/react/24/outline";
import { useDeployedContractInfo, useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

export const CreateJobModal = () => {
  const { address: connectedAddress } = useAccount();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    amount: ""
  });
  const [isCreating, setIsCreating] = useState(false);

  const { data: deployedContractData } = useDeployedContractInfo("JobEscrow");
  const { writeContractAsync } = useWriteContract();

  // Get total jobs count for display
  const { data: totalJobs } = useScaffoldReadContract({
    contractName: "JobEscrow",
    functionName: "getTotalJobs",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateJob = async () => {
    if (!connectedAddress) {
      notification.error("Please connect your wallet");
      return;
    }

    if (!formData.title.trim()) {
      notification.error("Please enter a job title");
      return;
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      notification.error("Please enter a valid amount");
      return;
    }

    try {
      setIsCreating(true);
      
      if (!deployedContractData?.address || !deployedContractData?.abi) {
        throw new Error("Contract not deployed");
      }

      await writeContractAsync({
        address: deployedContractData.address,
        abi: deployedContractData.abi,
        functionName: "createJob",
        args: [formData.title, formData.description],
        value: parseEther(formData.amount),
      });

      notification.success("Job created successfully!");
      
      // Reset form
      setFormData({
        title: "",
        description: "",
        amount: ""
      });

    } catch (error: any) {
      console.error("Error creating job:", error);
      notification.error(error?.message || "Failed to create job");
    } finally {
      setIsCreating(false);
    }
  };

  if (!connectedAddress) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-center">
          <CurrencyDollarIcon className="w-16 h-16 text-base-content/30 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Connect Your Wallet</h3>
          <p className="text-base-content/60">
            Connect your wallet to create gigs and start earning on CHOWK
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-base-100 rounded-2xl shadow-xl p-8">
        <div className="flex items-center mb-6">
          <PlusIcon className="w-6 h-6 text-primary mr-3" />
          <h2 className="text-2xl font-bold">Create New Gig</h2>
        </div>

        <div className="space-y-6">
          {/* Job Title */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Job Title *</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g., Build a landing page, Design a logo, Write content..."
              className="input input-bordered w-full"
              maxLength={100}
            />
            <label className="label">
              <span className="label-text-alt text-base-content/50">
                {formData.title.length}/100 characters
              </span>
            </label>
          </div>

          {/* Job Description */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Description</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe what you need done, requirements, timeline, etc."
              className="textarea textarea-bordered h-24 resize-none"
              maxLength={500}
            />
            <label className="label">
              <span className="label-text-alt text-base-content/50">
                {formData.description.length}/500 characters
              </span>
            </label>
          </div>

          {/* Amount */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Payment Amount (ETH) *</span>
            </label>
            <div className="relative">
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                placeholder="0.1"
                step="0.001"
                min="0"
                className="input input-bordered w-full pr-16"
              />
              <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-base-content/50 font-medium">
                ETH
              </span>
            </div>
            <label className="label">
              <span className="label-text-alt text-base-content/50">
                This amount will be held in escrow until job completion
              </span>
            </label>
          </div>

          {/* Create Button */}
          <div className="flex flex-col space-y-4">
            <button
              onClick={handleCreateJob}
              disabled={isCreating || !formData.title.trim() || !formData.amount}
              className="btn btn-primary btn-lg w-full"
            >
              {isCreating ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Creating Gig...
                </>
              ) : (
                <>
                  <PlusIcon className="w-5 h-5 mr-2" />
                  Create Gig & Escrow {formData.amount || "0"} ETH
                </>
              )}
            </button>

            {/* Info Box */}
            <div className="bg-info/10 border border-info/20 rounded-lg p-4">
              <div className="flex items-start">
                <div className="text-info mr-3 mt-0.5">ℹ️</div>
                <div className="text-sm">
                  <p className="font-medium text-info mb-1">How it works:</p>
                  <ul className="text-base-content/70 space-y-1">
                    <li>• Your ETH is held safely in escrow</li>
                    <li>• Freelancers can accept your gig</li>
                    <li>• Mark complete when satisfied</li>
                    <li>• Payment transfers instantly to freelancer</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        {totalJobs !== undefined && (
          <div className="mt-8 pt-6 border-t border-base-300">
            <div className="text-center text-sm text-base-content/60">
              Total gigs created: <span className="font-semibold">{totalJobs.toString()}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};