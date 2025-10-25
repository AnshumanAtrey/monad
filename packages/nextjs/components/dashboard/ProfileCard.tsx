"use client";

import React from "react";
import { CameraIcon, MapPinIcon } from "@heroicons/react/24/outline";
import { useAccount } from "wagmi";

const ProfileCard: React.FC = () => {
  const { address } = useAccount();

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-xl">
      {/* Profile Header */}
      <div className="relative text-center p-8 pb-5 border-b border-[#dfe6e9]">
        {/* Cover */}
        <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-r from-[#6c5ce7] to-[#a29bfe] z-0"></div>
        
        {/* Avatar */}
        <div className="relative z-10 mb-4">
          <div className="w-24 h-24 mx-auto rounded-full border-4 border-white bg-gradient-to-br from-[#6c5ce7] to-[#a29bfe] flex items-center justify-center text-white text-2xl font-bold shadow-lg">
            {address ? address.slice(2, 4).toUpperCase() : "??"}
          </div>
          <button className="absolute bottom-0 right-1/2 transform translate-x-8 w-8 h-8 bg-[#6c5ce7] text-white border-2 border-white rounded-full flex items-center justify-center hover:bg-[#5a4bc9] hover:scale-110 transition-all duration-200 z-20">
            <CameraIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Profile Info */}
        <div className="relative z-10">
          <h2 className="text-xl font-bold text-[#2d3436] mb-1 font-inter">
            {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Anonymous User"}
          </h2>
          <p className="text-[#636e72] text-sm mb-2">Freelancer</p>
          <div className="flex items-center justify-center text-[#636e72] text-sm">
            <MapPinIcon className="w-4 h-4 mr-1 text-[#6c5ce7]" />
            Monad Network
          </div>
        </div>
      </div>

      {/* Profile Stats */}
      <div className="flex justify-around py-5 border-b border-[#dfe6e9]">
        <div className="text-center">
          <span className="block text-2xl font-bold text-[#6c5ce7] mb-1">12</span>
          <span className="text-xs text-[#636e72] uppercase tracking-wide font-medium">Gigs</span>
        </div>
        <div className="text-center">
          <span className="block text-2xl font-bold text-[#6c5ce7] mb-1">4.9</span>
          <span className="text-xs text-[#636e72] uppercase tracking-wide font-medium">Rating</span>
        </div>
        <div className="text-center">
          <span className="block text-2xl font-bold text-[#6c5ce7] mb-1">98%</span>
          <span className="text-xs text-[#636e72] uppercase tracking-wide font-medium">Success</span>
        </div>
      </div>

      {/* Profile Bio */}
      <div className="p-5 text-center border-b border-[#dfe6e9]">
        <p className="text-[#636e72] text-sm leading-relaxed">
          Passionate freelancer specializing in blockchain development and smart contracts. 
          Building the future of decentralized work on Monad.
        </p>
      </div>

      {/* Profile Actions */}
      <div className="p-5 flex space-x-2">
        <button className="flex-1 px-4 py-2 bg-[#6c5ce7] text-white rounded-lg font-medium transition-all duration-200 hover:bg-[#5a4bc9] hover:transform hover:-translate-y-0.5 hover:shadow-lg">
          Edit Profile
        </button>
        <button className="flex-1 px-4 py-2 bg-transparent border border-[#dfe6e9] text-[#2d3436] rounded-lg font-medium transition-all duration-200 hover:bg-[#f8f9fa] hover:border-[#a29bfe] hover:text-[#6c5ce7]">
          View Portfolio
        </button>
      </div>
    </div>
  );
};

export default ProfileCard;