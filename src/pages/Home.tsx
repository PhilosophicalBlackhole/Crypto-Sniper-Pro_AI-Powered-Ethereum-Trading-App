/**
 * Home page component for CryptoSniper Pro
 * Main trading dashboard interface
 */
import React from 'react';

interface HomeProps {
  userId?: string;
}

/**
 * Home component - Main trading dashboard
 */
export default function Home({ userId }: HomeProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            CryptoSniper Pro
          </h1>
          <p className="text-slate-300">
            Advanced Ethereum Trading Dashboard
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Trading Panel */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              Quick Trade
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Token Address
                </label>
                <input
                  type="text"
                  placeholder="0x..."
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Amount (ETH)
                </label>
                <input
                  type="number"
                  placeholder="0.1"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors">
                Start Snipe
              </button>
            </div>
          </div>

          {/* Wallet Status */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              Wallet Status
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-300">Status:</span>
                <span className="text-red-400">Disconnected</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Balance:</span>
                <span className="text-white">-- ETH</span>
              </div>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors">
                Connect Wallet
              </button>
            </div>
          </div>

          {/* Market Overview */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700 p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              Market Overview
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-300">ETH Price:</span>
                <span className="text-green-400">$2,400</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Gas Price:</span>
                <span className="text-yellow-400">25 gwei</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300">Active Snipes:</span>
                <span className="text-white">0</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700 p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Recent Activity
          </h2>
          <div className="text-center text-slate-400 py-8">
            No recent transactions
          </div>
        </div>
      </div>
    </div>
  );
}