"use client";

import { useAccount, useDisconnect, useChainId } from "wagmi";
import { Address } from "~~/components/scaffold-eth";
import { monadTestnet } from "~~/scaffold.config";

export const WalletStatus = () => {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  
  const isOnMonad = chainId === monadTestnet.id;

  if (!isConnected) {
    return (
      <div className="bg-warning/10 border border-warning/20 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-center">
          <div className="text-warning mr-2">⚠️</div>
          <span className="font-medium">Connect your wallet to use CHOWK</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-base-200 rounded-lg p-4 mb-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isOnMonad ? 'bg-success' : 'bg-warning'}`} />
            <span className="font-medium">
              {isOnMonad ? 'Monad Testnet' : 'Wrong Network'}
            </span>
          </div>
          <div className="text-sm text-base-content/60">•</div>
          <Address address={address} />
        </div>
        
        <button
          onClick={() => disconnect()}
          className="btn btn-ghost btn-sm"
        >
          Disconnect
        </button>
      </div>
      
      {!isOnMonad && (
        <div className="mt-3 text-sm text-warning">
          Please switch to Monad Testnet to use the marketplace
        </div>
      )}
    </div>
  );
};