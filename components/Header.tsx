
import React from 'react';
import { View } from '../types';
import type { User } from '../types';
import { WalletIcon, BriefcaseIcon, UserIcon } from './icons';

interface HeaderProps {
  user: User | null;
  onConnectWallet: () => void;
  currentView: View;
  setCurrentView: (view: View) => void;
}

const Header: React.FC<HeaderProps> = ({ user, onConnectWallet, currentView, setCurrentView }) => {
  const truncatedAddress = user ? `${user.walletAddress.substring(0, 6)}...${user.walletAddress.substring(user.walletAddress.length - 4)}` : '';

  return (
    <header className="bg-base-200 border-b border-base-300 shadow-lg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center space-x-4">
             <BriefcaseIcon className="h-8 w-8 text-brand-primary" />
            <h1 className="text-2xl font-bold text-content-100 tracking-wider">MICROIN</h1>
          </div>
          
          <div className="hidden md:flex items-center justify-center flex-grow">
            <div className="bg-base-300 p-1 rounded-lg flex space-x-1">
              <button
                onClick={() => setCurrentView(View.Student)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                  currentView === View.Student ? 'bg-brand-primary text-white' : 'text-content-200 hover:bg-base-100'
                }`}
              >
                Student
              </button>
              <button
                onClick={() => setCurrentView(View.Company)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                  currentView === View.Company ? 'bg-brand-primary text-white' : 'text-content-200 hover:bg-base-100'
                }`}
              >
                Company
              </button>
            </div>
          </div>

          <div>
            {user ? (
              <div className="flex items-center space-x-3 bg-base-300 px-4 py-2 rounded-full">
                <UserIcon className="h-6 w-6 text-content-200" />
                <span className="text-sm font-medium text-content-100">{truncatedAddress}</span>
              </div>
            ) : (
              <button
                onClick={onConnectWallet}
                className="flex items-center justify-center bg-brand-primary hover:bg-brand-secondary text-white font-bold py-2 px-4 rounded-full transition-transform duration-200 hover:scale-105"
              >
                <WalletIcon className="h-5 w-5 mr-2" />
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;