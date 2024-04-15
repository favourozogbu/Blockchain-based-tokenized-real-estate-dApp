// Importing React hooks for managing state and side effects.
import { useEffect, useState } from 'react';
// Importing ethers library for interacting with Ethereum blockchain.
import { ethers } from 'ethers';

// Importing custom React components for navigation, search, and home display.
import Navigation from './components/Navigation';
import Search from './components/Search';
import Home from './components/Home';

// Importing ABI (Application Binary Interface) files for smart contracts.
import RealEstate from './abis/RealEstate.json'
import Escrow from './abis/Escrow.json'

// Importing configuration file that contains addresses of deployed smart contracts.
import config from './config.json';

// Main functional component for the app.
function App() {
  // State hooks for managing blockchain data and UI.
  const [provider, setProvider] = useState(null)  // Ethereum provider.
  const [escrow, setEscrow] = useState(null)  // Escrow smart contract.

  const [account, setAccount] = useState(null)  // User's account.

  const [homes, setHomes] = useState([])  // List of properties.
  const [home, setHome] = useState({})  // Selected property.
  const [toggle, setToggle] = useState(false);  // State to show/hide modal.

  // Function to initialize and load data from blockchain.
  const loadBlockchainData = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    setProvider(provider)
    const network = await provider.getNetwork()

    // Initializing the RealEstate contract and fetching properties.
    const realEstate = new ethers.Contract(config[network.chainId].realEstate.address, RealEstate, provider)
    const totalSupply = await realEstate.totalSupply()
    const homes = []

    for (var i = 1; i <= totalSupply; i++) {
      const uri = await realEstate.tokenURI(i)
      const response = await fetch(uri)
      const metadata = await response.json()
      homes.push(metadata)
    }

    setHomes(homes)

    // Initializing the Escrow contract.
    const escrow = new ethers.Contract(config[network.chainId].escrow.address, Escrow, provider)
    setEscrow(escrow)

    // Event listener for account changes (e.g., account switch in MetaMask).
    window.ethereum.on('accountsChanged', async () => {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const account = ethers.utils.getAddress(accounts[0])
      setAccount(account);
    })
  }

  // React hook to load blockchain data on component mount.
  useEffect(() => {
    loadBlockchainData()
  }, [])

  // Function to toggle the visibility of the property details popup.
  const togglePop = (home) => {
    setHome(home)
    toggle ? setToggle(false) : setToggle(true);
  }

  // Rendering the application UI.
  return (
    <div>
      <Navigation account={account} setAccount={setAccount} />
      <Search />

      <div className='cards__section'>

        <h3>Explore Properties</h3>

        <hr />

        <div className='cards'>
          {homes.map((home, index) => (
            <div className='card' key={index} onClick={() => togglePop(home)}>
              <div className='card__image'>
                <img src={home.image} alt="Home" />
              </div>
              <div className='card__info'>
                <h4>{home.attributes[0].value} ETH</h4>
                <p>
                  <strong>{home.attributes[2].value}</strong> bds |
                  <strong>{home.attributes[3].value}</strong> ba |
                  <strong>{home.attributes[4].value}</strong> sqft
                </p>
                <p>{home.address}</p>
              </div>
            </div>
          ))}
        </div>

      </div>

      {toggle && (
        <Home home={home} provider={provider} account={account} escrow={escrow} togglePop={togglePop} />
      )}

    </div>
  );
}

export default App;
