// Importing the Hardhat Runtime Environment (HRE) to use Hardhat's functionalities.
const hre = require("hardhat");

// A helper function to convert numbers to a format usable by Ethereum, specifically converting to wei.
const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

// The main asynchronous function where deployment and other operations are performed.
async function main() {
  // Retrieving accounts from the Hardhat environment. These could be test accounts provided by Hardhat.
  const [buyer, seller, inspector, lender] = await ethers.getSigners()

  // Creating a new contract instance for the Real Estate contract and deploying it.
  const RealEstate = await ethers.getContractFactory('RealEstate')
  const realEstate = await RealEstate.deploy()
  await realEstate.deployed()

  console.log(`Deployed Real Estate Contract at: ${realEstate.address}`)
  
  console.log(`Minting 3 properties...\n`)
// Minting three new properties by calling the mint function on the real estate contract. Links are IPFS links where property details are stored.
    let transaction = await realEstate.connect(seller).mint(`https://ipfs.filebase.io/ipfs/QmXWosxEy3LiaH4G4dRRzUwDHLRT7ZQwqy5XCKPEmxNRFf`)
    await transaction.wait()

    transaction = await realEstate.connect(seller).mint(`https://ipfs.filebase.io/ipfs/QmcmHWbwKNgcntGDJfe8ZoRApw6vyu4ujVkaX1L11qVZQq`)
    await transaction.wait()

    transaction = await realEstate.connect(seller).mint(`https://ipfs.filebase.io/ipfs/QmP51V9Gke61mLDg2JrGLr4iAvnZKbXXtP4bJnebQEGutk`)
    await transaction.wait()

  // Deploying the Escrow contract, passing it addresses of the Real Estate contract and the roles involved in transactions.
  const Escrow = await ethers.getContractFactory('Escrow')
  const escrow = await Escrow.deploy(
    realEstate.address,
    seller.address,
    inspector.address,
    lender.address
  )
  await escrow.deployed()

  console.log(`Deployed Escrow Contract at: ${escrow.address}`)
  console.log(`Listing 3 properties...\n`)

  // Looping through to approve each property for listing in the escrow.
  for (let i = 0; i < 3; i++) {
    // Approve properties...
    let transaction = await realEstate.connect(seller).approve(escrow.address, i + 1)
    await transaction.wait()
  }

  // Listing properties on the escrow. This includes setting buyers and the terms of the escrow.
  transaction = await escrow.connect(seller).list(1, buyer.address, tokens(20), tokens(10))
  await transaction.wait()

  transaction = await escrow.connect(seller).list(2, buyer.address, tokens(15), tokens(5))
  await transaction.wait()

  transaction = await escrow.connect(seller).list(3, buyer.address, tokens(10), tokens(5))
  await transaction.wait()

  console.log(`Finished.`)
}

// This structure ensures that the main function is called and any errors are caught and logged.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
