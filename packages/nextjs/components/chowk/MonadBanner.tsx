"use client";

import { useChainId } from "wagmi";
import { monadTestnet } from "~~/scaffold.config";
import { FireIcon, BoltIcon, CpuChipIcon } from "@heroicons/react/24/outline";

export const MonadBanner = () => {
  const chainId = useChainId();
  const isOnMonad = chainId === monadTestnet.id;

  if (!isOnMonad) return null;

  return (
    <div className="w-full bg-gradient-to-r from-success/20 via-primary/20 to-secondary/20 border-y border-success/30 py-3 mb-6">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <BoltIcon className="w-5 h-5 text-success" />
            <span className="font-semibold text-success">LIVE ON MONAD TESTNET</span>
          </div>
          
          <div className="hidden md:flex items-center gap-4 text-base-content/70">
            <div className="flex items-center gap-1">
              <FireIcon className="w-4 h-4" />
              <span>Sub-second finality</span>
            </div>
            <div className="flex items-center gap-1">
              <CpuChipIcon className="w-4 h-4" />
              <span>Parallel execution</span>
            </div>
            <div className="flex items-center gap-1">
              <BoltIcon className="w-4 h-4" />
              <span>10,000+ TPS</span>
            </div>
          </div>
          
          <div className="text-xs text-base-content/60">
            Experience instant payouts powered by Monad
          </div>
        </div>
      </div>
    </div>
  );
};