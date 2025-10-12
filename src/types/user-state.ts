import { BrowserProvider, JsonRpcSigner } from "ethers";

export type UserRole = "admin" | "user";

export interface AuthUser {
  name: string;
  email: string;
  role: UserRole;
  country?: string;
}

export interface WalletState {
  provider: BrowserProvider | null;
  signer: JsonRpcSigner | null;
  address: string | null;
  balance: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  connectedWalletType: string | null;
  error: string | null;
}

export interface UserState {
  auth: {
    user: AuthUser | null;
    isAuthenticated: boolean;
    loading: boolean;
  };
  wallet: WalletState;
  session: {
    createdAt: Date | null;
    lastActivity: Date | null;
  };
}

export const initialUserState: UserState = {
  auth: {
    user: null,
    isAuthenticated: false,
    loading: true,
  },
  wallet: {
    provider: null,
    signer: null,
    address: null,
    balance: null,
    isConnected: false,
    isConnecting: false,
    connectedWalletType: null,
    error: null,
  },
  session: {
    createdAt: null,
    lastActivity: null,
  },
};
