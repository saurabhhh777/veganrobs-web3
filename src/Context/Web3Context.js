import React from "react";
import {
  RPC,
  vrtAddress,
  vrtABI,
  daoABI,
  daoAddress,
} from "../Constants/config";
import Web3 from "web3";
import toast from "react-hot-toast";

const web3 = new Web3(new Web3.providers.HttpProvider(RPC));
const vrtContract = new web3.eth.Contract(vrtABI, vrtAddress);
const daoContract = new web3.eth.Contract(daoABI, daoAddress);

const initialState = {
  web3: web3,
  account: "",
  daoContract: daoContract,
  vrtContract: vrtContract,
};

const Web3Context = React.createContext({
  ...initialState,
});

export const Web3Provider = ({ children }) => {
  const [data, setData] = React.useState({ ...initialState });

  React.useEffect(() => {}, []);

  const walletConnect = async () => {
    // Check if wallet is available
    if (!window.ethereum && !window.web3) {
      toast.error("No wallet found. Please install MetaMask or another Web3 wallet.");
      return;
    }

    try {
      // Only try to switch chain if ethereum is available
      if (window.ethereum) {
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: web3.utils.toHex(1666600000) }],
          });
        } catch (switchError) {
          // This error code indicates that the chain has not been added to MetaMask.
          if (switchError.code === 4902) {
            try {
              await window.ethereum.request({
                method: "wallet_addEthereumChain",
                params: [
                  {
                    chainId: web3.utils.toHex(1666600000),
                    chainName: "Harmony Mainnet",
                    rpcUrls: ["https://api.harmony.one"],
                    nativeCurrency: {
                      name: "ONE",
                      symbol: "ONE", // 2-6 characters long
                      decimals: 18,
                    },
                    blockExplorerUrls: "https://explorer.harmony.one/",
                  },
                ],
              });
              await window.ethereum.request({
                method: "wallet_switchEthereumChain",
                params: [{ chainId: web3.utils.toHex(1666600000) }],
              });
            } catch (addError) {
              console.error("Failed to add chain:", addError);
            }
          }
        }
      }

      if (window.ethereum) {
        window.web3 = new Web3(window.ethereum);
        await window.ethereum.enable();
        const clientWeb3 = window.web3;
        const accounts = await clientWeb3.eth.getAccounts();
        setData({ ...data, account: accounts[0] });
        await getPosition(accounts[0]);
      } else if (window.web3) {
        window.web3 = new Web3(window.web3.currentProvider);
        const clientWeb3 = window.web3;
        const accounts = await clientWeb3.eth.getAccounts();
        setData({ ...data, account: accounts[0] });
        await getPosition(accounts[0]);
      }

      // Only set up event listeners if ethereum is available
      if (window.ethereum) {
        const { ethereum } = window;
        ethereum.on("accountsChanged", async (accounts) => {
          try {
            accounts = web3.utils.toChecksumAddress(accounts + "");
          } catch (err) {}

          setData({ ...data, account: accounts });
        });

        ethereum.on("chainChanged", async (chainId) => {
          try {
            await window.ethereum.request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: web3.utils.toHex(1666600000) }],
            });
          } catch (error) {
            console.error("Failed to switch chain:", error);
          }
        });
      }

      // this.checkDashBoard(this.state.linkedAccount)
    } catch (error) {
      console.error("Wallet connection error:", error);
      toast.error("Failed to connect wallet. Please try again.");
    }
  };

  const getPosition = async (address) => {
    try {
      const balance = await vrtContract.methods.balanceOf(address).call();
      const owner = await daoContract.methods.owner().call();
      const admin = await daoContract.methods.admin().call();

      if (address === owner) {
        // Note: This context doesn't manage position state, so we'll just log it
        console.log("User position: OWNER");
      } else if (address === admin) {
        console.log("User position: ADMIN");
      } else {
        if (balance > 0) {
          console.log("User position: MEMBER");
        } else {
          console.log("User position: GUEST");
        }
      }
    } catch (error) {
      console.error("Error getting position:", error);
    }
  };

  return (
    <Web3Context.Provider value={{ ...data, walletConnect }}>
      {children}
    </Web3Context.Provider>
  );
};

export default Web3Context;
