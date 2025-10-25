"use client";

import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { monadTestnet } from "~~/scaffold.config";
import { foundry } from "viem/chains";

export const NetworkSwitcher = () => {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  if (!isConnected) return null;

  const isOnMonad = chainId === monadTestnet.id;
  const isOnLocal = chainId === foundry.id;

  return (
    <div className="flex items-center gap-2">
      {/* Current Network Indicator */}
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${isOnMonad ? 'bg-success' : isOnLocal ? 'bg-warning' : 'bg-error'}`} />
        <span className="text-sm font-medium">
          {isOnMonad ? 'Monad Testnet' : isOnLocal ? 'Local Chain' : 'Unsupported Network'}
        </span>
      </div>

      {/* Switch Network Buttons */}
      {!isOnMonad && (
        <button
          onClick={() => switchChain({ chainId: monadTestnet.id })}
          className="btn btn-primary btn-sm"
        >
          Switch to Monad
        </button>
      )}
      
      {!isOnLocal && (
        <button
          onClick={() => switchChain({ chainId: foundry.id })}
          className="btn btn-ghost btn-sm"
        >
          Local Dev
        </button>
      )}
    </div>
  );
};