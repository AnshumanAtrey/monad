"use client";

import { useAccount, useChainId } from "wagmi";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { Address } from "~~/components/scaffold-eth";

export const DebugPanel = () => {
  const { address: connectedAddress } = useAccount();
  const chainId = useChainId();

  // Get total jobs count
  const { data: totalJobs, error: totalJobsError } = useScaffoldReadContract({
    contractName: "JobEscrow",
    functionName: "getTotalJobs",
  });

  // Get open jobs
  const { data: openJobs, error: openJobsError } = useScaffoldReadContract({
    contractName: "JobEscrow",
    functionName: "getOpenJobs",
  });

  // Get jobs by maker
  const { data: makerJobs, error: makerJobsError } = useScaffoldReadContract({
    contractName: "JobEscrow",
    functionName: "getJobsByMaker",
    args: [connectedAddress],
  });

  return (
    <div className="bg-base-200 p-4 rounded-lg mt-4">
      <h3 className="text-lg font-bold mb-4">🔍 Debug Panel</h3>
      
      <div className="space-y-2 text-sm">
        <div><strong>Connected Address:</strong> <Address address={connectedAddress} /></div>
        <div><strong>Chain ID:</strong> {chainId}</div>
        <div><strong>Total Jobs:</strong> {totalJobs?.toString() || "Loading..."}</div>
        {totalJobsError && <div className="text-error">Total Jobs Error: {totalJobsError.message}</div>}
        
        <div><strong>Open Jobs Count:</strong> {openJobs?.length || 0}</div>
        {openJobsError && <div className="text-error">Open Jobs Error: {openJobsError.message}</div>}
        
        <div><strong>My Created Jobs Count:</strong> {makerJobs?.length || 0}</div>
        {makerJobsError && <div className="text-error">Maker Jobs Error: {makerJobsError.message}</div>}
        
        {openJobs && openJobs.length > 0 && (
          <div>
            <strong>Open Jobs:</strong>
            <ul className="ml-4">
              {openJobs.map((job: any) => (
                <li key={job.id.toString()}>
                  Job #{job.id.toString()}: {job.title} - {job.amount.toString()} wei
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {makerJobs && makerJobs.length > 0 && (
          <div>
            <strong>My Created Jobs:</strong>
            <ul className="ml-4">
              {makerJobs.map((job: any) => (
                <li key={job.id.toString()}>
                  Job #{job.id.toString()}: {job.title} - Status: {job.status}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};