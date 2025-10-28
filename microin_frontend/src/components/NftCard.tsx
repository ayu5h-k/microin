
import React from 'react';
import type { SkillNFT } from '../types';

interface NftCardProps {
  nft: SkillNFT;
}

const NftCard: React.FC<NftCardProps> = ({ nft }) => {
  return (
    <div className="bg-base-200 rounded-lg shadow-lg overflow-hidden border border-base-300 hover:shadow-brand-primary/40 transition-shadow duration-300 group">
      <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden">
        <img
          src={nft.imageUrl}
          alt={nft.taskTitle}
          className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-110"
        />
      </div>
      <div className="p-4 bg-base-300">
        <h3 className="text-md font-semibold text-content-100 truncate">{nft.taskTitle}</h3>
        <p className="text-sm text-content-200">Issued: {nft.issueDate}</p>
      </div>
    </div>
  );
};

export default NftCard;