// Importing ethers library to interact with Ethereum and the logo image.
import { ethers } from 'ethers';
import logo from '../assets/logo.svg';

// Navigation component definition with `account` and `setAccount` props.
const Navigation = ({ account, setAccount }) => {
    // Function to handle wallet connection requests.
    const connectHandler = async () => {
        // Requesting account access from the Ethereum provider in the user's browser.
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        // Using ethers utility to safely get the checksummed Ethereum address.
        const account = ethers.utils.getAddress(accounts[0])
        // Updating the account state in the parent component with the connected account.
        setAccount(account);
    }

     // Rendering the navigation bar.
    return (
        <nav>
            <div className='nav__brand'>
                <img src={logo} alt="Logo" />
                <h1>Property Tokens</h1>
            </div>

            {/* Conditional rendering based on whether an account is connected or not. */}
            {account ? (
                <button
                    type="button"
                    className='nav__connect'
                >
                    {/* Displaying a shortened version of the connected account address. */}
                    {account.slice(0, 6) + '...' + account.slice(38, 42)}
                </button>
            ) : (
                <button
                    type="button"
                    className='nav__connect'
                    onClick={connectHandler}
                >
                    {/* Button to trigger connection to an Ethereum wallet. */}
                    Sign In
                </button>
            )}
        </nav>
    );
}

// Exporting the Navigation component for use in other parts of the application.
export default Navigation;