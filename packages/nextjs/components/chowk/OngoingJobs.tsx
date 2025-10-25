"use client";

import { useState } from "react";
import { useAccount, useWriteContract } from "wagmi";
import { formatEther } from "viem";
import { 
  ClockIcon, 
  CurrencyDollarIcon, 
  CheckCircleIcon,
  XCircleIcon,
  UserIcon,
  CalendarIcon
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

const JobStatus = {
  Open: 0,
  Accepted: 1,
  Completed: 2,
  Disputed: 3,
  Cancelled: 4
};

export const OngoingJobs = () => {
  const { address: connectedAddress } = useAccount();
  const [completingJobId, setCompletingJobId] = useState<bigint | null>(null);
  const [cancellingJobId, setCancellingJobId] = useState<bigint | null>(null);

  const { data: deployedContractData } = useDeployedContractInfo("JobEscrow");
  const { writeContractAsync } = useWriteContract();

  // Get jobs by maker (jobs I created)
  const { data: makerJobs, refetch: refetchMakerJobs } = useScaffoldReadContract({
    contractName: "JobEscrow",
    functionName: "getJobsByMaker",
    args: [connectedAddress],
  }) as { data: Job[] | undefined, refetch: () => void };

  // Get jobs by acceptor (jobs I accepted)
  const { data: acceptorJobs, refetch: refetchAcceptorJobs } = useScaffoldReadContract({
    contractName: "JobEscrow",
    functionName: "getJobsByAcceptor",
    args: [connectedAddress],
  }) as { data: Job[] | undefined, refetch: () => void };

  const handleCompleteJob = async (jobId: bigint) => {
    try {
      setCompletingJobId(jobId);
      
      if (!deployedContractData?.address || !deployedContractData?.abi) {
        throw new Error("Contract not deployed");
      }

      await writeContractAsync({
        address: deployedContractData.address,
        abi: deployedContractData.abi,
        functionName: "completeJob",
        args: [jobId],
      });

      notification.success("Job completed! Payment sent instantly to acceptor.");
      refetchMakerJobs();
      refetchAcceptorJobs();

    } catch (error: any) {
      console.error("Error completing job:", error);
      notification.error(error?.message || "Failed to complete job");
    } finally {
      setCompletingJobId(null);
    }
  };

  const handleCancelJob = async (jobId: bigint) => {
    try {
      setCancellingJobId(jobId);
      
      if (!deployedContractData?.address || !deployedContractData?.abi) {
        throw new Error("Contract not deployed");
      }

      await writeContractAsync({
        address: deployedContractData.address,
        abi: deployedContractData.abi,
        functionName: "cancelJob",
        args: [jobId],
      });

      notification.success("Job cancelled and refunded successfully!");
      refetchMakerJobs();

    } catch (error: any) {
      console.error("Error cancelling job:", error);
      notification.error(error?.message || "Failed to cancel job");
    } finally {
      setCancellingJobId(null);
    }
  };

  const getStatusBadge = (status: number) => {
    switch (status) {
      case JobStatus.Open:
        return <div className="badge badge-warning">Open</div>;
      case JobStatus.Accepted:
        return <div className="badge badge-info">In Progress</div>;
      case JobStatus.Completed:
        return <div className="badge badge-success">Completed</div>;
      case JobStatus.Cancelled:
        return <div className="badge badge-error">Cancelled</div>;
      default:
        return <div className="badge badge-ghost">Unknown</div>;
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

  const renderJobCard = (job: Job, isMaker: boolean) => (
    <div key={job.id.toString()} className="bg-base-100 rounded-xl shadow-lg border border-base-300 p-6">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        {/* Job Info */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-lg font-semibold text-base-content mb-1">
                {job.title}
              </h3>
              <div className="flex items-center gap-2">
                {getStatusBadge(job.status)}
                {isMaker ? (
                  <div className="badge badge-outline badge-sm">You created this</div>
                ) : (
                  <div className="badge badge-outline badge-sm">You accepted this</div>
                )}
              </div>
            </div>
            <div className="flex items-center ml-4">
              <CurrencyDollarIcon className="w-5 h-5 text-success mr-1" />
              <span className="text-xl font-bold text-success">
                {formatEther(job.amount)} ETH
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
              <UserIcon className="w-4 h-4 mr-1" />
              <span>{isMaker ? "Acceptor:" : "Maker:"}</span>
              <Address address={isMaker ? job.acceptor : job.maker} size="sm" />
            </div>
            <div className="flex items-center">
              <CalendarIcon className="w-4 h-4 mr-1" />
              <span>Created {formatTimeAgo(job.createdAt)}</span>
            </div>
            {job.status === JobStatus.Completed && (
              <div className="flex items-center">
                <CheckCircleIcon className="w-4 h-4 mr-1 text-success" />
                <span>Completed {formatTimeAgo(job.completedAt)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex-shrink-0 flex gap-2">
          {isMaker && job.status === JobStatus.Accepted && (
            <button
              onClick={() => handleCompleteJob(job.id)}
              disabled={completingJobId === job.id}
              className="btn btn-success"
            >
              {completingJobId === job.id ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Completing...
                </>
              ) : (
                <>
                  <CheckCircleIcon className="w-5 h-5 mr-2" />
                  Mark Complete
                </>
              )}
            </button>
          )}
          
          {isMaker && job.status === JobStatus.Open && (
            <button
              onClick={() => handleCancelJob(job.id)}
              disabled={cancellingJobId === job.id}
              className="btn btn-error btn-outline"
            >
              {cancellingJobId === job.id ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Cancelling...
                </>
              ) : (
                <>
                  <XCircleIcon className="w-5 h-5 mr-2" />
                  Cancel
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Status-specific messages */}
      {job.status === JobStatus.Accepted && (
        <div className="mt-4 bg-info/10 border border-info/20 rounded-lg p-3">
          <div className="flex items-center text-sm">
            <ClockIcon className="w-4 h-4 text-info mr-2" />
            {isMaker ? (
              <span className="text-info">
                Work in progress. Mark complete when satisfied to release payment instantly.
              </span>
            ) : (
              <span className="text-info">
                You're working on this gig. Payment will be released when the maker marks it complete.
              </span>
            )}
          </div>
        </div>
      )}

      {job.status === JobStatus.Completed && (
        <div className="mt-4 bg-success/10 border border-success/20 rounded-lg p-3">
          <div className="flex items-center text-sm">
            <CheckCircleIcon className="w-4 h-4 text-success mr-2" />
            <span className="text-success">
              ✅ Job completed! Payment transferred instantly via Monad's sub-second finality.
            </span>
          </div>
        </div>
      )}
    </div>
  );

  if (!connectedAddress) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-center">
          <ClockIcon className="w-16 h-16 text-base-content/30 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Connect Your Wallet</h3>
          <p className="text-base-content/60">
            Connect your wallet to see your ongoing gigs
          </p>
        </div>
      </div>
    );
  }

  const allJobs = [
    ...(makerJobs || []).map(job => ({ ...job, isMaker: true })),
    ...(acceptorJobs || []).map(job => ({ ...job, isMaker: false }))
  ].sort((a, b) => Number(b.createdAt) - Number(a.createdAt));

  if (allJobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-center">
          <ClockIcon className="w-16 h-16 text-base-content/30 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Gigs Yet</h3>
          <p className="text-base-content/60 mb-4">
            Create a gig or accept one from the Open Gigs tab to get started
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center">
          <ClockIcon className="w-6 h-6 mr-3 text-primary" />
          My Gigs ({allJobs.length})
        </h2>
      </div>

      <div className="grid gap-4">
        {allJobs.map((job) => renderJobCard(job, job.isMaker))}
      </div>
    </div>
  );
};