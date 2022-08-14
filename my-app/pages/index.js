import { Contract, providers, utils } from "ethers";
import Head from "next/head";
import Link from 'next/link'
import React, { useEffect, useRef, useState } from "react";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { abi, NFT_CONTRACT_ADDRESS } from "../constants";
import styles from "../styles/Home.module.css";
import navStyles from '../styles/Navbar.module.css'
import { RiMenu3Line, RiCloseLine } from "react-icons/ri"



export default function Home() {
  const [toggleMenu, setToggleMenu] = useState(false)
  // walletConnected keep track of whether the user's wallet is connected or not
  const [walletConnected, setWalletConnected] = useState(false);
  // presaleStarted keeps track of whether the presale has started or not
  const [presaleStarted, setPresaleStarted] = useState(false);
  // presaleEnded keeps track of whether the presale ended
  const [presaleEnded, setPresaleEnded] = useState(false);
  // loading is set to true when we are waiting for a transaction to get mined
  const [loading, setLoading] = useState(false);
  // checks if the currently connected MetaMask wallet is the owner of the contract
  const [isOwner, setIsOwner] = useState(false);
  // tokenIdsMinted keeps track of the number of tokenIds that have been minted
  const [tokenIdsMinted, setTokenIdsMinted] = useState("0");
  // Create a reference to the Web3 Modal (used for connecting to Metamask) which persists as long as the page is open
  const web3ModalRef = useRef();

    /**
   * publicMint: Mint an NFT after the presale
   */
     const Mint = async () => {
      try {
        // We need a Signer here since this is a 'write' transaction.
        const signer = await getProviderOrSigner(true);
        // Create a new instance of the Contract with a Signer, which allows
        // update methods
        const citaContract = new Contract(
          NFT_CONTRACT_ADDRESS,
          abi,
          signer
        );
        // call the mint from the contract to mint the Crypto Dev
        const tx = await citaContract.mint({
          // value signifies the cost of one crypto dev which is "0.01" eth.
          // We are parsing `0.01` string to ether using the utils library from ethers.js
          value: utils.parseEther("0.00"),
        });
        setLoading(true);
        // wait for the transaction to get mined
        await tx.wait();
        setLoading(false);
        window.alert("You successfully minted a Cita Nft!");
      } catch (err) {
        console.error(err);
      }
    };


     /*
      connectWallet: Connects the MetaMask wallet
    */
      const connectWallet = async () => {
        try {
          // Get the provider from web3Modal, which in our case is MetaMask
          // When used for the first time, it prompts the user to connect their wallet
          const signer = await getProviderOrSigner();
          // const userAddress = await signer.getAddress();
          setWalletConnected(true);
          // setAddress(userAddress);
        } catch (err) {
          console.error(err);
        }
      };

   


   /**
   * startPresale: starts the presale for the NFT Collection
   */
  const startPresale = async () => {
    try {
      // We need a Signer here since this is a 'write' transaction.
      const signer = await getProviderOrSigner(true);
      // Create a new instance of the Contract with a Signer, which allows
      // update methods
      const citaContract = new Contract(
        NFT_CONTRACT_ADDRESS,
        abi,
        signer
      );
      // call the startPresale from the contract
      const tx = await citaContract.startPresale();
      setLoading(true);
      // wait for the transaction to get mined
      await tx.wait();
      setLoading(false);
      // set the presale started to true
      await checkIfPresaleStarted();
    } catch (err) {
      console.error(err);
    }
  };



  /**
   * checkIfPresaleStarted: checks if the presale has started by quering the `presaleStarted`
   * variable in the contract
   */
   const checkIfPresaleStarted = async () => {
    try {
      // Get the provider from web3Modal, which in our case is MetaMask
      // No need for the Signer here, as we are only reading state from the blockchain
      const provider = await getProviderOrSigner();
      // We connect to the Contract using a Provider, so we will only
      // have read-only access to the Contract
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider);
      // call the presaleStarted from the contract
      const _presaleStarted = await nftContract.presaleStarted();
      if (!_presaleStarted) {
        await getOwner();
      }
      setPresaleStarted(_presaleStarted);
      return _presaleStarted;
    } catch (err) {
      console.error(err);
      return false;
    }
  };



   /**
   * checkIfPresaleEnded: checks if the presale has ended by quering the `presaleEnded`
   * variable in the contract
   */
    const checkIfPresaleEnded = async () => {
      try {
        // Get the provider from web3Modal, which in our case is MetaMask
        // No need for the Signer here, as we are only reading state from the blockchain
        const provider = await getProviderOrSigner();
        // We connect to the Contract using a Provider, so we will only
        // have read-only access to the Contract
        const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider);
        // call the presaleEnded from the contract
        const _presaleEnded = await nftContract.presaleEnded();
        // _presaleEnded is a Big Number, so we are using the lt(less than function) instead of `<`
        // Date.now()/1000 returns the current time in seconds
        // We compare if the _presaleEnded timestamp is less than the current time
        // which means presale has ended
        const hasEnded = _presaleEnded.lt(Math.floor(Date.now() / 1000));
        if (hasEnded) {
          setPresaleEnded(true);
        } else {
          setPresaleEnded(false);
        }
        return hasEnded;
      } catch (err) {
        console.error(err);
        return false;
      }
    };

    

     /**
   * getOwner: calls the contract to retrieve the owner
   */
  const getOwner = async () => {
    try {
      // Get the provider from web3Modal, which in our case is MetaMask
      // No need for the Signer here, as we are only reading state from the blockchain
      const provider = await getProviderOrSigner();
      // We connect to the Contract using a Provider, so we will only
      // have read-only access to the Contract
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider);
      // call the owner function from the contract
      const _owner = await nftContract.owner();
      // We will get the signer now to extract the address of the currently connected MetaMask account
      const signer = await getProviderOrSigner(true);
      // Get the address associated to the signer which is connected to  MetaMask
      const address = await signer.getAddress();
      if (address.toLowerCase() === _owner.toLowerCase()) {
        setIsOwner(true);
      }
    } catch (err) {
      console.error(err.message);
    }
  };



  /**
   * getTokenIdsMinted: gets the number of tokenIds that have been minted
   */
   const getTokenIdsMinted = async () => {
    try {
      // Get the provider from web3Modal, which in our case is MetaMask
      // No need for the Signer here, as we are only reading state from the blockchain
      const provider = await getProviderOrSigner();
      // We connect to the Contract using a Provider, so we will only
      // have read-only access to the Contract
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider);
      // call the tokenIds from the contract
      const _tokenIds = await nftContract.tokenIds();
      //_tokenIds is a `Big Number`. We need to convert the Big Number to a string
      setTokenIdsMinted(_tokenIds.toString());
    } catch (err) {
      console.error(err);
    }
  };





  //* A `Provider` is needed to interact with the blockchain - reading transactions, reading balances, reading state, etc.
  
  // A `Signer` is a special type of Provider used in case a `write` transaction needs to be made to the blockchain, which involves the connected account
  // needing to make a digital signature to authorize the transaction being sent. Metamask exposes a Signer API to allow your website to
 // request signatures from the user using Signer functions.
  
  // @param {*} needSigner - True if you need the signer, default false otherwise

 const getProviderOrSigner = async (needSigner = false) => {
   // Connect to Metamask
   // Since we store `web3Modal` as a reference, we need to access the `current` value to get access to the underlying object
   const provider = await web3ModalRef.current.connect();
   const web3Provider = new providers.Web3Provider(provider);

   // If user is not connected to the Rinkeby network, let them know and throw an error
   const { chainId } = await web3Provider.getNetwork();
   if (chainId !== 4) {
     window.alert("Change the network to Rinkeby");
     throw new Error("Change network to Rinkeby");
   }

   if (needSigner) {
     const signer = web3Provider.getSigner();
     return signer;
   }
   return web3Provider;
 };


 const providerOptions = {
  binancechainwallet: {
    package:true,
  },
  walletconnect: {
    package: WalletConnectProvider,
    options: {
      rpc: {
        4: "https://rinkeby.infura.io/v3/",
      },
      chainId: 4,
    },
  },
};


   



  
  const onDisconnect = async () => {
    try {
      await web3ModalRef.current.clearCachedProvider();
      setWalletConnected(false);
      console.log("Disconnected");

    } catch (err) {
      console.error(err);
    }
  };



  // useEffects are used to react to changes in state of the website
  // The array at the end of function call represents what state changes will trigger this effect
  // In this case, whenever the value of `walletConnected` changes - this effect will be called
  useEffect(() => {
    // if wallet is not connected, create a new instance of Web3Modal and connect the MetaMask wallet
    if (!walletConnected) {
      // Assign the Web3Modal class to the reference object by setting it's `current` value
      // The `current` value is persisted throughout as long as this page is open
      web3ModalRef.current = new Web3Modal({
        network: "rinkeby",
        providerOptions,
        cacheProvider: false,
        disableInjectedProvider: false,
      });
      // connectWallet();

       // Check if presale has started and ended
       const _presaleStarted = checkIfPresaleStarted();
       if (_presaleStarted) {
         checkIfPresaleEnded();
       }

       // tokens minted
       getTokenIdsMinted();

        // Set an interval which gets called every 5 seconds to check presale has ended
      const presaleEndedInterval = setInterval(async function () {
        const _presaleStarted = await checkIfPresaleStarted();
        if (_presaleStarted) {
          const _presaleEnded = await checkIfPresaleEnded();
          if (_presaleEnded) {
            clearInterval(presaleEndedInterval);
          }
        }
      }, 5 * 1000);


       // set an interval to get the number of token Ids minted every 5 seconds
       setInterval(async function () {
        await getTokenIdsMinted();
      }, 5 * 1000);
    }
  }, [walletConnected]);


   
  //     renderButton: Returns a button based on the state of the dapp
    
  //     const renderButton = () => {
  //       // If wallet is not connected, return a button which allows them to connect their wllet
  //       if (!walletConnected) {
  //         return (

  //           <button onClick={connectWallet} className={styles.button}>
  //             Connect Wallet
  //           </button>
  //         );
  //       }


  //        // If we are currently waiting for something, return a loading button
  //   if (loading) {
  //     return <button className={styles.button}>Loading...</button>;
  //   }

  //   // If connected user is the owner, and presale hasnt started yet, allow them to start the presale
  //   if (isOwner && !presaleStarted) {
  //     return (
  //       <button className={styles.button} onClick={startPresale}>
  //         Start Mint!
  //       </button>
  //     );
  //   }

  //   // If connected user is not the owner but presale hasn't started yet, tell them that
  //   if (!presaleStarted) {
  //     return (
  //       <div>
  //         <div className={styles.description}>Mint hasnt started!</div>
  //       </div>
  //     );
  //   }


  //   // If presale started its time for public minting
  //   if (presaleStarted ) {
  //     return (
  //       <button className={styles.button} onClick={publicMint}>
  //          Mint 🚀
  //       </button>
  //     );
  //   }
  // };




  const renderMenuButton = () => {
    if(!walletConnected){
      return (
        <div className={navStyles.navbar_menu_container_button}>
        <button onClick={connectWallet}>Connect Wallet</button>
      </div>
      )
    } 
    if(walletConnected) {
      return(
        <div className={navStyles.navbar_menu_container_button}>
          <button onClick={onDisconnect}>Disconnect</button>
        </div>
      )
    }
}


const renderButton = () =>{
  if(!walletConnected){
    return (
      <div className={navStyles.navbar_button}>
      <button onClick={connectWallet}>Connect Wallet</button>
    </div>
    )
  } 
  
    if ( isOwner && !presaleStarted){
      return(
        <div className={navStyles.navbar_button}>
          <button onClick={startPresale}>Start Sale</button>
        </div>
      )
    }


  else if(walletConnected) {
  
    return(
      <div className={navStyles.navbar_button}>
        <button onClick={onDisconnect}>Disconnect</button>
      </div>
    )
  }
  
}





// ui mint func 

  const renderMint = () => {
    if(walletConnected){
      if (walletConnected){
        return (<button onClick={Mint}>Mint Cita</button>)
      }else if(loading){
        return (<button>Loading...</button>)
      }else if(tokenIdsMinted >= 333){
        return <h3>Supply sold out</h3>
      }else{
        return(<h3>Wait for sale to start</h3>)
      }
    }else{
      return (<h3>Connect your wallet to Mint</h3>)
    }
  }






/// frontend



return (
  <div className={styles.container}>
    <Head>
      <title>Cita Nft</title>
      <meta name="description" content="Generated by create next app" />
      <link rel="icon" href="/favicon.ico" />
    </Head>

    <div className={navStyles.navContainer}>
      <div className={navStyles.navbar}>
        <div className={navStyles.navbar_links}>
            <div className={navStyles.navbar_links_logo}>
                <Link href="/" passHref><h1> CITA NFT</h1></Link>
            </div>
            <div className={navStyles.navbar_links_container}>
              <a href="#Mint"><p>Mint CT</p></a>
              <p>Opensea</p>
              <p>About</p>
              <a href='https://github.com/innbuld'><p>GitHub</p></a>
            </div>
        </div>
        {renderButton()}
        <div className={navStyles.navbar_menu}>
          {toggleMenu 
          ? <RiCloseLine color="#fff" size={26} onClick ={() => (setToggleMenu(false))}/>
          : <RiMenu3Line color="#fff" size={26} onClick ={() => (setToggleMenu(true))}/>
          }

          {toggleMenu && (
            <div className={navStyles.navbar_menu_container}>
              <div className={navStyles.navbar_menu_links}>
                  <>
                  <a href="#Mint"><p>Mint CT</p></a>
                    <p>Opensea</p>
                    <p>About</p>
                    <a href='https://github.com/innbuld'><p>GitHub</p></a>
                  </>
                  {renderMenuButton()}
              </div>
            </div>
          )}
        </div>
    </div>
  </div>

    <div className={styles.main} id="home">
      <div className={styles.main_content}>
          <h1 className={styles.main_text}>Join the Cita NFT Mint today !</h1>
            
          <p>Cita Nft is a collection of free 333 epic NFT's, which provides access to the Cita Dao community, a total supply of 333 would be given out for free FCFS</p>
        <div className={styles.mint_button}>
           {/* {renderButton()} */}
          <p>Scroll Down To Mint Your CT Nft And Be Part Of The Community</p>
        </div>
      </div>
      <div className={styles.mainImage}>
          <img src='./ddd.svg' ></img> 
        </div>
    </div>

    <div className={styles.mintpage} id="Mint">
      <div className={styles.mintPage_content}>
        <h1> Below Is The Mint Button To Mint Your free Cita Nft,FcFS 333 supply available</h1>

        {renderMint()}
        <h3>{tokenIdsMinted}/333 Minted</h3>
      </div>
    </div>
    <footer className={styles.footer}>
      @2022 Made by Abdulmuizz. All rights reserved.
      </footer>
    
  </div>
)
}