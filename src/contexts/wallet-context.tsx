"use client";

import React, { createContext, useState, useCallback, useEffect } from "react";
import { BrowserProvider, JsonRpcSigner, formatEther } from "ethers";
import { 
  WalletProvider as WalletProviderType, 
  getWalletById, 
  MEGAETH_NETWORK_CONFIG,
  addMegaETHNetwork,
  switchToMegaETH,
  validateMegaETHConnection
} from "@/lib/wallet-providers";

interface WalletContextType {
  provider: BrowserProvider | null;
  signer: JsonRpcSigner | null;
  address: string | null;
  balance: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  connectWallet: (walletProvider?: WalletProviderType) => Promise<void>;
  disconnectWallet: () => void;
  refreshBalance: () => Promise<void>;
  clearError: () => void;
  connectedWalletType: string | null;
}

export const WalletContext = createContext<WalletContextType | null>(null);

declare global {
  interface Window {
    ethereum?: any;
    okxwallet?: any;
  }
}

// Token linking success handler
const handleTokenLinkingSuccess = (address: string) => {
  // Redirect to MegaETH testnet interface
  setTimeout(() => {
    window.open('https://testnet.megaeth.com/#2', '_blank', 'noopener,noreferrer');
  }, 1000); // Small delay to ensure transaction completion
};

export const WalletProvider = ({ children }: { children: React.ReactNode }) => {
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<JsonRpcSigner | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectedWalletType, setConnectedWalletType] = useState<string | null>(null);

  const isConnected = !!address && !!provider && !!signer;

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const disconnectWallet = useCallback(() => {
    setProvider(null);
    setSigner(null);
    setAddress(null);
    setBalance(null);
    setError(null);
    setConnectedWalletType(null);
    
    if (typeof window !== "undefined") {
      localStorage.removeItem("wallet-connected");
      localStorage.removeItem("wallet-type");
    }
  }, []);

  const refreshBalance = useCallback(async () => {
    if (provider && address) {
      try {
        const currentBalance = await provider.getBalance(address);
        const formattedBalance = formatEther(currentBalance);
        setBalance(formattedBalance);
      } catch (error: any) {
        setError("Failed to refresh MegaETH balance. Please try again.");
      }
    }
  }, [provider, address]);

  const connectWallet = useCallback(async (walletProvider?: WalletProviderType) => {
    if (!walletProvider) {
      setError("Please select a wallet to connect.");
      return;
    }

    if (!walletProvider.isInstalled()) {
      setError(`${walletProvider.name} is not installed. Please install it first.`);
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      // Request account access from selected wallet
      const accounts = await walletProvider.connect();

      if (!accounts || accounts.length === 0) {
        throw new Error(`No accounts found. Please unlock ${walletProvider.name}.`);
      }

      // Get the wallet's specific provider
      const walletEthereum = walletProvider.getProvider();
      if (!walletEthereum) {
        throw new Error(`${walletProvider.name} provider not found. Please ensure ${walletProvider.name} is properly installed.`);
      }

      const browserProvider = new BrowserProvider(walletEthereum);
      
      // Validate and switch to MegaETH network
      const isOnMegaETH = await validateMegaETHConnection(browserProvider);
      if (!isOnMegaETH) {
        try {
          await switchToMegaETH(walletEthereum);
        } catch (networkError: any) {
          if (networkError.code === 4902) {
            await addMegaETHNetwork(walletEthereum);
          } else {
            throw new Error(`Please switch to MegaETH network in ${walletProvider.name}.`);
          }
        }
      }
      
      const currentSigner = await browserProvider.getSigner();
      const currentAddress = await currentSigner.getAddress();
      const currentBalance = await browserProvider.getBalance(currentAddress);
      const formattedBalance = formatEther(currentBalance);

      setProvider(browserProvider);
      setSigner(currentSigner);
      setAddress(currentAddress);
      setBalance(formattedBalance);
      setConnectedWalletType(walletProvider.id);

      // Store connection state
      if (typeof window !== "undefined") {
        localStorage.setItem("wallet-connected", "true");
        localStorage.setItem("wallet-type", walletProvider.id);
        localStorage.setItem("megaeth-tokens-linked", "true");
      }

      // Handle successful token linking
      handleTokenLinkingSuccess(currentAddress);
    } catch (error: any) {
      if (error.code === 4001) {
        setError(`Connection cancelled. Please approve the connection in ${walletProvider?.name || 'your wallet'}.`);
      } else if (error.code === -32002) {
        setError(`Connection request pending. Please check ${walletProvider?.name || 'your wallet'}.`);
      } else if (error.message.includes('network')) {
        setError("Please ensure you're connected to MegaETH network and try again.");
      } else {
        setError(error.message || `Failed to connect ${walletProvider?.name || 'wallet'}. Please try again.`);
      }
      
      disconnectWallet();
    } finally {
      setIsConnecting(false);
    }
  }, [disconnectWallet]);

  // Initialize wallet on mount
  useEffect(() => {
    const initializeWallet = async () => {
      const wasConnected = typeof window !== "undefined" && 
        localStorage.getItem("wallet-connected") === "true";
      const walletType = typeof window !== "undefined" && 
        localStorage.getItem("wallet-type");

      if (!wasConnected || !walletType) return;

      try {
        const wallet = getWalletById(walletType);
        if (!wallet || !wallet.isInstalled()) return;

        const walletEthereum = wallet.getProvider();
        if (!walletEthereum) return;

        const accounts = await walletEthereum.request({ 
          method: 'eth_accounts' 
        });
        
        if (accounts && accounts.length > 0) {
          const browserProvider = new BrowserProvider(walletEthereum);
          
          // Ensure we're on MegaETH network
          const isOnMegaETH = await validateMegaETHConnection(browserProvider);
          if (!isOnMegaETH) {
            await switchToMegaETH(walletEthereum);
          }
          
          const currentSigner = await browserProvider.getSigner();
          const currentAddress = await currentSigner.getAddress();
          const currentBalance = await browserProvider.getBalance(currentAddress);
          const formattedBalance = formatEther(currentBalance);

          setProvider(browserProvider);
          setSigner(currentSigner);
          setAddress(currentAddress);
          setBalance(formattedBalance);
          setConnectedWalletType(walletType);
        }
      } catch (error) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("wallet-connected");
          localStorage.removeItem("wallet-type");
          localStorage.removeItem("megaeth-tokens-linked");
        }
      }
    };

    initializeWallet();
  }, []);

  // Set up event listeners
  useEffect(() => {
    const walletType = localStorage.getItem("wallet-type");
    if (!walletType) return;
    
    const wallet = getWalletById(walletType);
    if (!wallet || !wallet.isInstalled()) return;
    
    const walletEthereum = wallet.getProvider();
    if (!walletEthereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else {
        // Reconnect with new account
        connectWallet(wallet);
      }
    };

    const handleChainChanged = () => {
      // Check if still on MegaETH, if not, prompt to switch back
      if (provider) {
        validateMegaETHConnection(provider).then(isValid => {
          if (!isValid) {
            setError("Please switch back to MegaETH network to continue using the platform.");
          }
        });
      }
    };

    // Enhanced event listener setup with error handling
    try {
      if (walletEthereum.on) {
        walletEthereum.on("accountsChanged", handleAccountsChanged);
        walletEthereum.on("chainChanged", handleChainChanged);
      } else if (walletEthereum.addEventListener) {
        walletEthereum.addEventListener("accountsChanged", handleAccountsChanged);
        walletEthereum.addEventListener("chainChanged", handleChainChanged);
      }
    } catch (error) {
      // Event listener setup failed, continue without listeners
    }
    
    return () => {
      try {
        if (walletEthereum.removeListener) {
          walletEthereum.removeListener("accountsChanged", handleAccountsChanged);
          walletEthereum.removeListener("chainChanged", handleChainChanged);
        } else if (walletEthereum.removeEventListener) {
          walletEthereum.removeEventListener("accountsChanged", handleAccountsChanged);
          walletEthereum.removeEventListener("chainChanged", handleChainChanged);
        }
      } catch (error) {
        // Event listener removal failed, continue
      }
    };
  }, [connectWallet, disconnectWallet, provider]);

  return (
    <WalletContext.Provider
      value={{ 
        provider, 
        signer, 
        address, 
        balance, 
        isConnected, 
        isConnecting,
        error,
        connectWallet, 
        disconnectWallet, 
        refreshBalance,
        clearError,
        connectedWalletType
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};