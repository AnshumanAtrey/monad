"use client";

import { useState } from "react";
import type { NextPage } from "next";
import { useAccount, useWriteContract } from "wagmi";
import { formatEther } from "viem";
import { 
  ShieldCheckIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  CurrencyDollarIcon,
  ClockIcon
} from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";
import { useDeployedContractInfo, useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

interface Job {
  id: bigint;
  maker: string;
  acceptor: string;
  validator: string;
  amount: bigint;
  title: string;
  description: string;
  status: number;
  createdAt: bigint;
  completedAt: bigint;
  disputedAt: bigint;
}

const ValidatorPage: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const [isRegistering, setIsRegistering] = useState(false);
  const [resolvingJobId, setResolvingJobId] = useState<bigint | null>(null);

  const { data: deployedContractData } = useDeployedContractInfo("JobEscrow");
  const { writeContractAsync } = useWriteContract();

  // Check if user is already a validator
  const { data: isValidator } = useScaffoldReadContract({
    contractName: "JobEscrow",
    functionName: "isValidator",
    args: [connectedAddress],
  });

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
      
      if (!deployedContractData?.address || !deployedContractData?.abi) {
        throw new Error("Contract not deployed");
      }

      await writeContractAsync({
        address: deployedContractData.address,
        abi: deployedContractData.abi,
        functionName: "registerAsValidator",
        args: [],
      });

      notification.success("Successfully registered as validator!");

    } catch (error: any) {
      console.error("Error registering validator:", error);
      notification.error(error?.message || "Failed to register as validator");
    } finally {
      setIsRegistering(false);
    }
  };

  const handleResolveDispute = async (jobId: bigint, approve: boolean) => {
    try {
      setResolvingJobId(jobId);
      
      if (!deployedContractData?.address || !deployedContractData?.abi) {
        throw new Error("Contract not deployed");
      }

      await writeContractAsync({
        address: deployedContractData.address,
        abi: deployedContractData.abi,
        functionName: "resolveDispute",
        args: [jobId, approve],
      });

      notification.success(`Dispute ${approve ? 'approved' : 'rejected'} successfully!`);
      refetchValidatorJobs();

    } catch (error: any) {
      console.error("Error resolving dispute:", error);
      notification.error(error?.message || "Failed to resolve dispute");
    } finally {
      setResolvingJobId(null);
    }
  };

  const formatTimeAgo = (timestamp: bigint) => {
    const now = Math.floor(Date.now() / 1000);
    const diff = now - Number(timestamp);
    
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  if (!connectedAddress) {
    return (
      <div className="flex items-center flex-col grow pt-6">
        <div className="px-5 text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Validator Dashboard</h1>
          <p className="text-lg mb-4">Connect your wallet to become a validator</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center flex-col grow pt-6">
      {/* Header */}
      <div className="px-5 text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">Validator Dashboard</h1>
        <p className="text-lg mb-4">Resolve disputes and earn MON</p>
      </div>

      {/* Validator Stats */}
      <div className="w-full max-w-4xl px-4 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-base-200 rounded-lg p-4 text-center">
            <ShieldCheckIcon className="w-8 h-8 mx-auto mb-2 text-primary" />
            <div className="text-2xl font-bold">{totalValidators ? Number(totalValidators).toString() : "0"}</div>
            <div className="text-sm text-base-content/60">Total Validators</div>
          </div>
          <div className="bg-base-200 rounded-lg p-4 text-center">
            <CurrencyDollarIcon className="w-8 h-8 mx-auto mb-2 text-success" />
            <div className="text-2xl font-bold">1%</div>
            <div className="text-sm text-base-content/60">Fee per Resolution</div>
          </div>
          <div className="bg-base-200 rounded-lg p-4 text-center">
            <ClockIcon className="w-8 h-8 mx-auto mb-2 text-warning" />
            <div className="text-2xl font-bold">{validatorJobs?.length || "0"}</div>
            <div className="text-sm text-base-content/60">Pending Disputes</div>
          </div>
        </div>
      </div>

      {/* Registration Section */}
      {!isValidator && (
        <div className="w-full max-w-2xl px-4 mb-8">
          <div className="bg-base-100 rounded-2xl shadow-xl p-8 text-center">
            <ShieldCheckIcon className="w-16 h-16 mx-auto mb-4 text-primary" />
            <h2 className="text-2xl font-bold mb-4">Become a Validator</h2>
            <p className="text-base-content/70 mb-6">
              Help resolve disputes between gig makers and acceptors. Earn 1% fee for each resolution.
            </p>
            <button
              onClick={handleRegisterValidator}
              disabled={isRegistering}
              className="btn btn-primary btn-lg"
            >
              {isRegistering ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Registering...
                </>
              ) : (
                <>
                  <ShieldCheckIcon className="w-5 h-5 mr-2" />
                  Register as Validator
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Disputes to Resolve */}
      {isValidator && (
        <div className="w-full max-w-6xl px-4">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <ShieldCheckIcon className="w-6 h-6 mr-3 text-primary" />
            Disputes to Resolve ({validatorJobs?.length || 0})
          </h2>

          {!validatorJobs || validatorJobs.length === 0 ? (
            <div className="text-center py-12">
              <p>No disputes assigned to you yet</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {validatorJobs.map((job) => (
                <div key={job.id.toString()} className="bg-base-100 rounded-xl shadow-lg border border-base-300 p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    {/* Job Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-base-content mb-1">
                            {job.title}
                          </h3>
                          <div className="badge badge-warning">Under Review</div>
                        </div>
                        <div className="flex items-center ml-4">
                          <CurrencyDollarIcon className="w-5 h-5 text-success mr-1" />
                          <span className="text-xl font-bold text-success">
                            {formatEther(job.amount)} MON
                          </span>
                        </div>
                      </div>

                      {job.description && (
                        <p className="text-base-content/70 mb-3">
                          {job.description}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-4 text-sm text-base-content/60">
                        <div className="flex items-center">
                          <span>Maker:</span>
                          <Address address={job.maker} size="sm" />
                        </div>
                        <div className="flex items-center">
                          <span>Acceptor:</span>
                          <Address address={job.acceptor} size="sm" />
                        </div>
                        <div className="flex items-center">
                          <ClockIcon className="w-4 h-4 mr-1" />
                          <span>Disputed {formatTimeAgo(job.disputedAt)}</span>
                        </div>
                      </div>

                      <div className="mt-4 bg-warning/10 border border-warning/20 rounded-lg p-3">
                        <div className="text-sm">
                          <p className="font-medium text-warning mb-1">Your Fee:</p>
                          <p className="text-base-content/70">
                            You will earn {formatEther((job.amount * BigInt(1)) / BigInt(100))} MON (1%) for resolving this dispute
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex-shrink-0 flex gap-2">
                      <button
                        onClick={() => handleResolveDispute(job.id, true)}
                        disabled={resolvingJobId === job.id}
                        className="btn btn-success"
                      >
                        {resolvingJobId === job.id ? (
                          <>
                            <span className="loading loading-spinner loading-sm"></span>
                            Resolving...
                          </>
                        ) : (
                          <>
                            <CheckCircleIcon className="w-5 h-5 mr-2" />
                            Approve Work
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleResolveDispute(job.id, false)}
                        disabled={resolvingJobId === job.id}
                        className="btn btn-error btn-outline"
                      >
                        {resolvingJobId === job.id ? (
                          <>
                            <span className="loading loading-spinner loading-sm"></span>
                            Resolving...
                          </>
                        ) : (
                          <>
                            <XCircleIcon className="w-5 h-5 mr-2" />
                            Reject Work
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ValidatorPage;