// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

// SkillNFT represents a verified proof of work experience.
// Each NFT will have metadata detailing the task, skills used, and score.
contract SkillNFT is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    // An event emitted when a new SkillNFT is minted
    event SkillNFTMinted(address indexed to, uint256 tokenId, string tokenURI);

    constructor(address initialOwner)
        ERC721("SkillNFT", "SKILL")
        Ownable(initialOwner)
    {}

    // Allows the owner (or an authorized minter) to mint a new SkillNFT
    // 'to': The address of the student who completed the task.
    // 'tokenURI_': A URI pointing to the metadata of the SkillNFT (e.g., IPFS hash).
    function mint(address to, string memory tokenURI_) public onlyOwner returns (uint256) {
        _tokenIdCounter.increment();
        uint256 newTokenId = _tokenIdCounter.current();
        _safeMint(to, newTokenId);
        _setTokenURI(newTokenId, tokenURI_);

        emit SkillNFTMinted(to, newTokenId, tokenURI_);
        return newTokenId;
    }

    // We can add more functions later, like pausing minting,
    // or burning NFTs, but this is a solid start for the core functionality.
}