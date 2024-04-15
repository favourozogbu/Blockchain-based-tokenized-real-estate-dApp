// Importing necessary dependencies from testing framework and hardhat library.
const { expect } = require('chai');
const { ethers } = require('hardhat');

// Helper function to convert an integer amount to a token unit using ether as a standard unit.
const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
}

// Main describe block defining tests for the Escrow contract.
describe('Escrow', () => {
    let buyer, seller, inspector, lender    // Declare roles involved in the escrow transaction.
    let realEstate, escrow  // Declare the smart contracts used in the tests.

    // Code block that runs before each test case, setting up necessary preconditions.
    beforeEach(async () => {
        // Assign accounts to roles.
        [buyer, seller, inspector, lender] = await ethers.getSigners()

        // Deploy the Real Estate contract.
        const RealEstate = await ethers.getContractFactory('RealEstate')
        realEstate = await RealEstate.deploy()

        // Mint an NFT representing property using the seller account.
        let transaction = await realEstate.connect(seller).mint("https://ipfs.filebase.io/ipfs/QmXWosxEy3LiaH4G4dRRzUwDHLRT7ZQwqy5XCKPEmxNRFf")
        await transaction.wait()

        // Deploy the Escrow contract with necessary role addresses and the address of the Real Estate NFT.
        const Escrow = await ethers.getContractFactory('Escrow')
        escrow = await Escrow.deploy(
            realEstate.address,
            seller.address,
            inspector.address,
            lender.address
        )

        // Approve the Escrow contract to handle the NFT on behalf of the seller.
        transaction = await realEstate.connect(seller).approve(escrow.address, 1)
        await transaction.wait()

        // List the property in the escrow contract, specifying the buyer and the amounts for purchase and escrow.
        transaction = await escrow.connect(seller).list(1, buyer.address, tokens(10), tokens(5))
        await transaction.wait()
    })

    // Nested describe block for testing the deployment of the Escrow contract.
    describe('Deployment', () => {
        it('Returns NFT address', async () => {
            const result = await escrow.nftAddress()
            expect(result).to.be.equal(realEstate.address)
        })

        it('Returns seller', async () => {
            const result = await escrow.seller()
            expect(result).to.be.equal(seller.address)
        })

        it('Returns inspector', async () => {
            const result = await escrow.inspector()
            expect(result).to.be.equal(inspector.address)
        })

        it('Returns lender', async () => {
            const result = await escrow.lender()
            expect(result).to.be.equal(lender.address)
        })
    })

    // Tests to ensure that properties are correctly listed in the escrow contract.
    describe('Listing', () => {
        it('Updates as listed', async () => {
            const result = await escrow.isListed(1)
            expect(result).to.be.equal(true)
        })

        it('Returns buyer', async () => {
            const result = await escrow.buyer(1)
            expect(result).to.be.equal(buyer.address)
        })

        it('Returns purchase price', async () => {
            const result = await escrow.purchasePrice(1)
            expect(result).to.be.equal(tokens(10))
        })

        it('Returns escrow amount', async () => {
            const result = await escrow.escrowAmount(1)
            expect(result).to.be.equal(tokens(5))
        })

        it('Updates ownership', async () => {
            expect(await realEstate.ownerOf(1)).to.be.equal(escrow.address)
        })
    })

    // Tests specific to deposit actions within the escrow transaction process.
    describe('Deposits', () => {
        beforeEach(async () => {
            const transaction = await escrow.connect(buyer).depositEarnest(1, { value: tokens(5) })
            await transaction.wait()
        })

        it('Updates contract balance', async () => {
            const result = await escrow.getBalance()
            expect(result).to.be.equal(tokens(5))
        })
    })

    // Tests the update of inspection status by the inspector.
    describe('Inspection', () => {
        beforeEach(async () => {
            const transaction = await escrow.connect(inspector).updateInspectionStatus(1, true)
            await transaction.wait()
        })

        it('Updates inspection status', async () => {
            const result = await escrow.inspectionPassed(1)
            expect(result).to.be.equal(true)
        })
    })

    // Testing the approval process from different parties involved in the escrow.
    describe('Approval', () => {
        beforeEach(async () => {
            let transaction = await escrow.connect(buyer).approveSale(1)
            await transaction.wait()

            transaction = await escrow.connect(seller).approveSale(1)
            await transaction.wait()

            transaction = await escrow.connect(lender).approveSale(1)
            await transaction.wait()
        })

        it('Updates approval status', async () => {
            expect(await escrow.approval(1, buyer.address)).to.be.equal(true)
            expect(await escrow.approval(1, seller.address)).to.be.equal(true)
            expect(await escrow.approval(1, lender.address)).to.be.equal(true)
        })
    })

    // Tests the finalization and completion of the property sale process.
    describe('Sale', () => {
        beforeEach(async () => {
            let transaction = await escrow.connect(buyer).depositEarnest(1, { value: tokens(5) })
            await transaction.wait()

            transaction = await escrow.connect(inspector).updateInspectionStatus(1, true)
            await transaction.wait()

            transaction = await escrow.connect(buyer).approveSale(1)
            await transaction.wait()

            transaction = await escrow.connect(seller).approveSale(1)
            await transaction.wait()

            transaction = await escrow.connect(lender).approveSale(1)
            await transaction.wait()

            await lender.sendTransaction({ to: escrow.address, value: tokens(5) })

            transaction = await escrow.connect(seller).finalizeSale(1)
            await transaction.wait()
        })

        it('Updates ownership', async () => {
            expect(await realEstate.ownerOf(1)).to.be.equal(buyer.address)
        })

        it('Updates balance', async () => {
            expect(await escrow.getBalance()).to.be.equal(0)
        })
    })
})