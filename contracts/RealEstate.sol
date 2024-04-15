//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

// Importing necessary OpenZeppelin contracts for ERC721 functionality and counter utilities.   
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

// Declaring the contract `RealEstate`, which inherits from `ERC721URIStorage` to utilize both
// ERC721 token functionalities and URI storage capabilities.
contract RealEstate is ERC721URIStorage {
    // Using the Counters utility to help keep track of token IDs in a safe manner.
    using Counters for Counters.Counter;
    // A private counter to keep track of the last used token ID.
    Counters.Counter private _tokenIds;

    // Constructor that initializes the ERC721 token with a name and symbol.
    constructor() ERC721("Real Estate", "REAL") {}

    // A function to mint new tokens.
    function mint(string memory tokenURI) public returns (uint256) {
        // Increment the counter to get a new token ID.
        _tokenIds.increment();

        // Store the value of the current counter which represents the new token ID.
        uint256 newItemId = _tokenIds.current();
        // Mint the new token. The `msg.sender` is the owner of the new token.
        _mint(msg.sender, newItemId);
        // Set the token URI (metadata) for the newly minted token.
        _setTokenURI(newItemId, tokenURI);

        // Return the new token ID.
        return newItemId;
    }

    // A function to retrieve the total number of tokens minted.
    function totalSupply() public view returns (uint256) {
        // Returns the current value of the _tokenIds counter.
        return _tokenIds.current();
    }
}
