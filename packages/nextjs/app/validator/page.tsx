"use client";

import React, { useState } from "react";
import { formatEther } from "viem";
import { useAccount } from "wagmi";
import { 
  ShieldCheckIcon, 
  CurrencyDollarIcon,
  XCircleIcon,
  ClockIcon,
  CheckCircleIcon,
  UserIcon
} from "@heroicons/react/24/outline";
import DashboardLayout from "~~/components/layout/DashboardLayout";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

// Job interface matching the contract
interface Job {
  id: bigint;
  maker: string;
  acceptor: string;
  validator: string;
  amount: bigint;
  title: string;
  description: string;
  status: number; // 0=Open, 1=Accepted, 2=Completed, 3=Cancelled, 4=Disputed
  createdAt: bigint;
  completedAt: bigint;
  disputedAt: bigint;
}

const ValidatorPage = () => {
  const { address: connectedAddress } = useAccount();
  const { writeContractAsync: writeRegisterValidator } = useScaffoldWriteContract("JobEscrow");
  const { writeContractAsync: writeResolveDispute } = useScaffoldWriteContract("JobEscrow");
  const [isRegistering, setIsRegistering] = useState(false);
  const [isResolving, setIsResolving] = useState<{ [key: string]: boolean }>({});

  // Check if user is a validator
  const { data: isValidator, refetch: refetchIsValidator } = useScaffoldReadContract({
    contractName: "JobEscrow",
    functionName: "isValidator",
    args: [connectedAddress],
  }) as { data: boolean | undefined, refetch: () => void };

  // Get total validators count
  const { data: totalValidators } = useScaffoldReadContract({
    contractName: "JobEscrow",
    functionName: "getTotalValidators",
    args: [],
  });

  // Get jobs assigned to this validator
  const { data: validatorJobs, refetch: refetchValidatorJobs } = useScaffoldReadContract({
    contractName: "JobEscrow",
    functionName: "getJobsByValidator",
    args: [connectedAddress],
  }) as { data: Job[] | undefined, refetch: () => void };

  const handleRegisterValidator = async () => {
    if (!connectedAddress) {
      notification.error("Please connect your wallet");
      return;
    }

    try {
      setIsRegistering(true);
      await writeRegisterValidator({
        functionName: "registerAsValidator",
        args: [],
      });
      
      notification.success("Successfully registered as validator!");
      refetchIsValidator();
    } catch (error) {
      console.error("Error registering validator:", error);
      notification.error("Failed to register as validator");
    } finally {
      setIsRegistering(false);
    }
  };

  const handleResolveDispute = async (jobId: bigint, approve: boolean) => {
    if (!connectedAddress) {
      notification.error("Please connect your wallet");
      return;
    }

    const jobIdStr = jobId.toString();
    try {
      setIsResolving(prev => ({ ...prev, [jobIdStr]: true }));
      
      await writeResolveDispute({
        functionName: "resolveDispute",
        args: [jobId, approve],
      });
      
      notification.success(`Dispute ${approve ? "approved" : "rejected"} successfully!`);
      refetchValidatorJobs();
    } catch (error) {
      console.error("Error resolving dispute:", error);
      notification.error("Failed to resolve dispute");
    } finally {
      setIsResolving(prev => ({ ...prev, [jobIdStr]: false }));
    }
  };

  if (!connectedAddress) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center bg-white rounded-xl p-8 shadow-lg max-w-md">
            <ShieldCheckIcon className="w-16 h-16 mx-auto mb-4 text-[#6c5ce7]" />
            <h2 className="text-2xl font-bold text-[#2d3436] mb-4 font-inter">Validator Dashboard</h2>
            <p className="text-[#636e72] mb-6">Please connect your wallet to access validator features</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-[#2d3436] mb-4 flex items-center justify-center font-inter">
            <ShieldCheckIcon className="w-10 h-10 mr-3 text-[#6c5ce7]" />
            Validator Dashboard
          </h1>
          <p className="text-lg text-[#636e72] max-w-2xl mx-auto">
            Help maintain marketplace quality by resolving disputes and earn 1% fees
          </p>
        </div>

        {/* Validator Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 text-center shadow-lg transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-xl">
            <ShieldCheckIcon className="w-12 h-12 mx-auto mb-4 text-[#6c5ce7]" />
            <div className="text-3xl font-bold text-[#2d3436] mb-2">{totalValidators ? Number(totalValidators).toString() : "0"}</div>
            <div className="text-sm text-[#636e72] uppercase tracking-wide font-medium">Total Validators</div>
          </div>
          <div className="bg-white rounded-xl p-6 text-center shadow-lg transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-xl">
            <CurrencyDollarIcon className="w-12 h-12 mx-auto mb-4 text-[#00b894]" />
            <div className="text-3xl font-bold text-[#2d3436] mb-2">1%</div>
            <div className="text-sm text-[#636e72] uppercase tracking-wide font-medium">Fee per Resolution</div>
          </div>
          <div className="bg-white rounded-xl p-6 text-center shadow-lg transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-xl">
            <CheckCircleIcon className="w-12 h-12 mx-auto mb-4 text-[#0984e3]" />
            <div className="text-3xl font-bold text-[#2d3436] mb-2">{validatorJobs?.length || 0}</div>
            <div className="text-sm text-[#636e72] uppercase tracking-wide font-medium">Pending Disputes</div>
          </div>
        </div>

        {/* Validator Registration */}
        {!isValidator && (
          <div className="bg-white rounded-xl p-8 shadow-lg text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-[#6c5ce7] to-[#a29bfe] rounded-full flex items-center justify-center">
              <ShieldCheckIcon className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-[#2d3436] mb-4 font-inter">Become a Validator</h2>
            <p className="text-[#636e72] mb-8 max-w-md mx-auto leading-relaxed">
              Join our validator network to help resolve disputes and earn fees for maintaining marketplace quality.
            </p>
            <button
              onClick={handleRegisterValidator}
              disabled={isRegistering}
              className="px-8 py-3 bg-gradient-to-r from-[#6c5ce7] to-[#a29bfe] text-white rounded-lg font-semibold transition-all duration-200 hover:transform hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRegistering ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Registering...
                </div>
              ) : (
                "Register as Validator"
              )}
            </button>
          </div>
        )}

        {/* Validator Jobs */}
        {isValidator && (
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h2 className="text-2xl font-bold text-[#2d3436] mb-6 flex items-center font-inter">
              <ClockIcon className="w-6 h-6 mr-3 text-[#fdcb6e]" />
              Disputes to Resolve
            </h2>
            
            {!validatorJobs || validatorJobs.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-6 bg-[#f8f9fa] rounded-full flex items-center justify-center">
                  <ShieldCheckIcon className="w-10 h-10 text-[#b2bec3]" />
                </div>
                <p className="text-[#636e72] text-lg mb-2">No disputes assigned to you yet</p>
                <p className="text-sm text-[#b2bec3]">
                  You&apos;ll be randomly assigned disputes when they occur
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {validatorJobs.map((job) => (
                  <div key={job.id.toString()} className="border border-[#dfe6e9] rounded-xl p-6 bg-[#f8f9fa] transition-all duration-200 hover:shadow-md">
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-[#2d3436] mb-3 font-inter">
                          {job.title}
                        </h3>
                        <p className="text-[#636e72] mb-4 leading-relaxed">
                          {job.description}
                        </p>
                        <div className="flex items-center space-x-6 text-sm text-[#636e72]">
                          <span className="flex items-center bg-white px-3 py-1 rounded-full">
                            <CurrencyDollarIcon className="w-4 h-4 mr-2 text-[#00b894]" />
                            {formatEther(job.amount)} MON
                          </span>
                          <span className="flex items-center bg-white px-3 py-1 rounded-full">
                            <UserIcon className="w-4 h-4 mr-2 text-[#6c5ce7]" />
                            Maker: {job.maker.slice(0, 6)}...{job.maker.slice(-4)}
                          </span>
                          <span className="flex items-center bg-white px-3 py-1 rounded-full">
                            <UserIcon className="w-4 h-4 mr-2 text-[#0984e3]" />
                            Worker: {job.acceptor.slice(0, 6)}...{job.acceptor.slice(-4)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-4">
                      <button
                        onClick={() => handleResolveDispute(job.id, true)}
                        disabled={isResolving[job.id.toString()]}
                        className="flex-1 px-6 py-3 bg-[#00b894] text-white rounded-lg font-semibold transition-all duration-200 hover:bg-[#00a085] hover:transform hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        {isResolving[job.id.toString()] ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <>
                            <CheckCircleIcon className="w-5 h-5 mr-2" />
                            Approve Work
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleResolveDispute(job.id, false)}
                        disabled={isResolving[job.id.toString()]}
                        className="flex-1 px-6 py-3 bg-[#ff7675] text-white rounded-lg font-semibold transition-all duration-200 hover:bg-[#e84393] hover:transform hover:-translate-y-0.5 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        {isResolving[job.id.toString()] ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <>
                            <XCircleIcon className="w-5 h-5 mr-2" />
                            Reject Work
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ValidatorPage;