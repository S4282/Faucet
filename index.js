import React, { useEffect, useState , useRef, useCallback} from "react";
import { ToastContainer, toast } from "react-toastify";
import { ethers } from "ethers";
import "react-toastify/dist/ReactToastify.css";
import { Web3ReactProvider } from '@web3-react/core';
import { EtherscanProvider, Web3Provider } from '@ethersproject/providers';
import { useWeb3React } from '@web3-react/core';
import { InjectedConnector } from '@web3-react/injected-connector';



import Head from "next/head";

// Import abi
import abi from "../utils/Faucet.json";


export default function Home() {
  /**
   * Create a variable here that holds the contract address after you deploy!
   */
  const contractAddress = "0x5af52E8a5C3C2B9e9CE56f5402E23eC78Cf834Ef";

  /**
   * Create a variable here that references the abi content!
   */
  const contractABI = abi.abi;

  /*
   * Just a state variable we use to store our user's public wallet.
   */
  const [currentAccount, setCurrentAccount] = useState("");

  const [message, setMessage] = useState("");

  const [name, setName] = useState("");

  /*
   * All state property to store all coffee
   */
  const [allCoffee, setAllCoffee] = useState([]);

  // This provider is the default from Etherscan and Reads data from the blockchain
  const provider = ethers.getDefaultProvider('goerli');



  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      /*
       * Check if we're authorized to access the user's wallet
       */
      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        setCurrentAccount(account);
        toast.success("🦄 Wallet is Connected", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      } else {
        toast.warn("Make sure you have MetaMask Connected", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    } catch (error) {
      toast.error(`${error.message}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  /**
   * Implement your connectWallet method here
   */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        toast.warn("Make sure you have MetaMask Connected", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  const withdrawalFaucet = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const faucetContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        let count = await faucetContract.getTotalWithdrawals();
        console.log("Retrieved total coffee count...", count.toNumber());

        /*
         * Execute the actual coffee from your smart contract
         */
        const faucetTxn = await faucetContract.withdraw(
          message ? message : "Enjoy your Goerli ETH! Happy developing!",
          name ? name : "Anonymous",
          ethers.utils.parseEther("0.001"),
          {
            gasLimit: 300000,
          }
        );
        console.log("Mining...", faucetTxn.hash);

        toast.info("Sending Test Ethereum...", {
          position: "top-left",
          autoClose: 18050,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        await faucetTxn.wait();

        console.log("Mined -- ", faucetTxn.hash);

        //count = await coffeePortalContract.getTotalCoffee();

        console.log("Retrieved total coffee count...", count.toNumber());

        setMessage("");
        setName("");

        toast.success("Coffee Purchased!", {
          position: "top-left",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      toast.error(`${error.message}`, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  /*
   * Create a method that gets all coffee from your contract
   */
  const getAllCoffee = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const coffeePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        /*
         * Call the getAllCoffee method from your Smart Contract
         */
        const coffees = await coffeePortalContract.getTotalWithdrawals();

        /*
         * We only need address, timestamp, name, and message in our UI so let's
         * pick those out
         */
        const coffeeCleaned = coffees.map((coffee) => {
          return {
            address: coffee.giver,
            timestamp: new Date(coffee.timestamp * 1000),
            message: coffee.message,
            name: coffee.name,
          };
        });

        /*
         * Store our data in React State
         */
        setAllCoffee(coffeeCleaned);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  // This function and corresponding UseEffect below will fetch the Contract's balance
  function useEthBalance() {
    const [balance, setBalance] = useState(0);
    // Using React ref here to prevent component re-rendering when changing
    // previous balance value
    const prevBalanceRef = useRef(0);
      
    const fetchBalance = useCallback(async () => {
      const address = contractAddress;
      console.log(address);
  
      const rawBalance = await provider.getBalance(address);
      // Format ETH balance and parse it to JS number
      const value = parseFloat(ethers.utils.formatEther(rawBalance));
  
      // Optimization: check that user balance has actually changed before
      // updating state and triggering the consuming component re-render
      if (value !== prevBalanceRef.current) {
        prevBalanceRef.current = value;
        setBalance(value);
      }
    }, []);

    useEffect(() => {
      fetchBalance();
    }, [fetchBalance]);

    useEffect(() => {
      // Fetch user balance on each block
      provider.on('block', fetchBalance);
  
      // Cleanup function is used to unsubscribe from 'block' event and prevent
      // a possible memory leak in your application.
      return () => {
        provider.off('block', fetchBalance);
      };
    }, [fetchBalance]);
  
    return balance;
  }
  
  /*
   * This runs our function when the page loads.
   */
  useEffect(() => { // These all are called every second
    let coffeePortalContract;
    getAllCoffee();
    checkIfWalletIsConnected();

    const onNewCoffee = (from, timestamp, message, name) => {
      console.log("NewCoffee", from, timestamp, message, name);
      setAllCoffee((prevState) => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message: message,
          name: name,
        },
      ]);
    };



    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      coffeePortalContract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );
      coffeePortalContract.on("NewWithdrawal", onNewCoffee);
    }

    return () => {
      if (coffeePortalContract) {
        coffeePortalContract.off("NewWithdrawal", onNewCoffee);
      }
    };
  }, []);

  const handleOnMessageChange = (event) => {
    const { value } = event.target;
    setMessage(value);
  };
  const handleOnNameChange = (event) => {
    const { value } = event.target;
    setName(value);
  };
  
  // Setting for Display below
  const balance = useEthBalance();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <Head>
        {/*<title>Goerli ETH Faucet</title> */}
        <link rel="icon" href="/a.png" />
      </Head>
      <div className="contract-balance text-white ">
        <h1> Faucet Balance: {balance}</h1>
        </div>

      <main className="flex flex-col items-center w-full flex-1 px-20 text-center">
        {/*<h1 className="text-6xl font-bold text-blue-600 mb-6">
          Goerli ETH Faucet*
  </h1>*/}
        {/*
         * If there is currentAccount render this form, else render a button to connect wallet
         */}

        {currentAccount ? (
          <div className="w-full max-w-xs sticky top-3 z-50 ">
            <form className="main-box rounded px-8 pt-6 pb-8 mb-4">
              <div className="mb-4">
                <label
                  className="block text-white text-sm font-bold mb-2"
                  htmlFor="name"
                >
                  Name
                </label>
                <input
                  className="main-box shadow appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline"
                  id="name"
                  type="text"
                  placeholder="Name"
                  onChange={handleOnNameChange}
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  className="block text-white text-sm font-bold mb-2"
                  htmlFor="message"
                >
                  Send the Creator a Message
                </label>

                <textarea
                  className="main-box form-textarea mt-1 block w-full shadow appearance-none py-2 px-3 border rounded text-white leading-tight focus:outline-none focus:shadow-outline"
                  rows="3"
                  placeholder="Message"
                  id="message"
                  onChange={handleOnMessageChange}
                  required
                ></textarea>
              </div>

              <div className="main-box flex items-left justify-center">
                <button
                  className="main-box hover:bg-gray-700 text-center text-white font-bold py-2 px-4 focus:outline-none focus:shadow-outline"
                  type="button"
                  onClick={withdrawalFaucet}
                >
                  Receive Test Ether
                </button>
              </div>
            </form>
          </div>
        ) : (
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-full mt-3"
            onClick={connectWallet}
          >
            Connect Your Wallet
          </button>
        )}

        {/* Logo */}
        <div className="logo">  <img
        src="https://i.ibb.co/6FJKM5k/a.png"
        alt="logo"
      /></div>

        {allCoffee.map((coffee, index) => {
          return (
            <div className="border-l-2 mt-10" key={index}>
              <div className="transform transition cursor-pointer hover:-translate-y-2 ml-10 relative flex items-center px-6 py-4 bg-blue-800 text-white rounded mb-10 flex-col md:flex-row space-y-4 md:space-y-0">
                {/* <!-- Dot Following the Left Vertical Line --> */}
                <div className="w-5 h-5 bg-blue-600 absolute -left-10 transform -translate-x-2/4 rounded-full z-10 mt-2 md:mt-0"></div>

                {/* <!-- Line that connecting the box with the vertical line --> */}
                <div className="w-10 h-1 bg-green-300 absolute -left-10 z-0"></div>

                {/* <!-- Content that showing in the box --> */}
                <div className="flex-auto">
                  <h1 className="text-md">Supporter: {coffee.name}</h1>
                  <h1 className="text-md">Message: {coffee.message}</h1>
                  <h3>Address: {coffee.address}</h3>
                  <h1 className="text-md font-bold">
                    TimeStamp: {coffee.timestamp.toString()}
                  </h1>
                </div>
              </div>
            </div>
          );
        })}
      </main>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}