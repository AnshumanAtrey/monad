"use client";

import { useAccount, useDisconnect } from "wagmi";
import { Address } from "~~/components/scaffold-eth";

export const WalletStatus = () => {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  if (!isConnected) {
    return (
      <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-center">
          <span className="font-medium">Connect your wallet to use CHOWK</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-base-200 rounded-lg p-4 mb-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <Address address={address} />
        <button
          onClick={() => disconnect()}
          className="btn btn-ghost btn-sm"
        >
          Disconnect
        </button>
      </div>
    </div>
  );
};