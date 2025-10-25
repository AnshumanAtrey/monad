"use client";

import { useState } from "react";
import { useAccount, useWriteContract } from "wagmi";
import { formatEther } from "viem";
import { 
  BriefcaseIcon, 
  CurrencyDollarIcon, 
  ClockIcon,
  UserIcon,
  CheckIcon
} from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-eth";
import { useDeployedContractInfo, useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

interface Job {
  id: bigint;
  maker: string;
  acceptor: string;
  amount: bigint;
  title: string;
  description: string;
  status: number;
  createdAt: bigint;
  completedAt: bigint;
}

export const OpenJobs = () => {
  const { address: connectedAddress } = useAccount();
  const [acceptingJobId, setAcceptingJobId] = useState<bigint | null>(null);

  const { data: deployedContractData } = useDeployedContractInfo("JobEscrow");
  const { writeContractAsync } = useWriteContract();

  // Get open jobs
  const { data: openJobs, refetch: refetchOpenJobs } = useScaffoldReadContract({
    contractName: "JobEscrow",
    functionName: "getOpenJobs",
  }) as { data: Job[] | undefined, refetch: () => void };

  const handleAcceptJob = async (jobId: bigint) => {
    if (!connectedAddress) {
      notification.error("Please connect your wallet");
      return;
    }

    try {
      setAcceptingJobId(jobId);
      
      if (!deployedContractData?.address || !deployedContractData?.abi) {
        throw new Error("Contract not deployed");
      }

      await writeContractAsync({
        address: deployedContractData.address,
        abi: deployedContractData.abi,
        functionName: "acceptJob",
        args: [jobId],
      });

      notification.success("Job accepted successfully!");
      refetchOpenJobs();

    } catch (error: any) {
      console.error("Error accepting job:", error);
      notification.error(error?.message || "Failed to accept job");
    } finally {
      setAcceptingJobId(null);
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

  if (!openJobs || openJobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p>No open gigs available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center">
          <BriefcaseIcon className="w-6 h-6 mr-3 text-primary" />
          Open Gigs ({openJobs.length})
        </h2>
        <div className="text-sm text-base-content/60">
          Accept gigs and start earning instantly
        </div>
      </div>

      <div className="grid gap-4">
        {openJobs.map((job) => (
          <div key={job.id.toString()} className="bg-base-100 rounded-xl shadow-lg border border-base-300 p-6 hover:shadow-xl transition-shadow">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Job Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-base-content line-clamp-2">
                    {job.title}
                  </h3>
                  <div className="flex items-center ml-4">
                    <CurrencyDollarIcon className="w-5 h-5 text-success mr-1" />
                    <span className="text-xl font-bold text-success">
                      {formatEther(job.amount)} ETH
                    </span>
                  </div>
                </div>

                {job.description && (
                  <p className="text-base-content/70 mb-3 line-clamp-2">
                    {job.description}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-4 text-sm text-base-content/60">
                  <div className="flex items-center">
                    <UserIcon className="w-4 h-4 mr-1" />
                    <span>By:</span>
                    <Address address={job.maker} size="sm" />
                  </div>
                  <div className="flex items-center">
                    <ClockIcon className="w-4 h-4 mr-1" />
                    <span>{formatTimeAgo(job.createdAt)}</span>
                  </div>
                  <div className="badge badge-success badge-sm">
                    Escrowed
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex-shrink-0">
                {connectedAddress && job.maker.toLowerCase() === connectedAddress.toLowerCase() ? (
                  <div className="btn btn-disabled">
                    Your Gig
                  </div>
                ) : (
                  <button
                    onClick={() => handleAcceptJob(job.id)}
                    disabled={!connectedAddress || acceptingJobId === job.id}
                    className="btn btn-primary btn-lg"
                  >
                    {acceptingJobId === job.id ? (
                      <>
                        <span className="loading loading-spinner loading-sm"></span>
                        Accepting...
                      </>
                    ) : (
                      <>
                        <CheckIcon className="w-5 h-5 mr-2" />
                        Accept Gig
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>


          </div>
        ))}
      </div>


    </div>
  );
};