"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Wallet, 
  Download, 
  CheckCircle, 
  AlertTriangle,
  ExternalLink,
  Shield,
  Zap,
  Globe
} from "lucide-react";
import { SUPPORTED_WALLETS, detectWallets, type WalletProvider } from "@/lib/wallet-providers";
import { useToast } from "@/hooks/use-toast";

interface WalletSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWalletSelect: (wallet: WalletProvider) => Promise<void>;
  isConnecting: boolean;
  selectedWallet: string | null;
}

export default function WalletSelectionModal({
  isOpen,
  onClose,
  onWalletSelect,
  isConnecting,
  selectedWallet
}: WalletSelectionModalProps) {
  const { toast } = useToast();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingWallet, setPendingWallet] = useState<WalletProvider | null>(null);
  
  const { installed, notInstalled } = detectWallets();

  const handleWalletClick = async (wallet: WalletProvider) => {
    if (!wallet.isInstalled()) {
      toast({
        variant: "destructive",
        title: "Wallet Not Installed",
        description: `${wallet.name} is not installed. Please install it first.`,
        action: (
          <Button asChild variant="link" size="sm">
            <a href={wallet.downloadUrl} target="_blank" rel="noopener noreferrer">
              Download
            </a>
          </Button>
        ),
      });
      return;
    }

    setPendingWallet(wallet);
    setShowConfirmation(true);
  };

  const confirmConnection = async () => {
    if (!pendingWallet) return;

    try {
      await onWalletSelect(pendingWallet);
      setShowConfirmation(false);
      setPendingWallet(null);
      onClose();
    } catch (error: any) {
      setShowConfirmation(false);
      setPendingWallet(null);
    }
  };

  const cancelConnection = () => {
    setShowConfirmation(false);
    setPendingWallet(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-background/95 backdrop-blur-sm border-primary/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-headline flex items-center gap-3">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Wallet className="h-6 w-6 text-primary" />
            </div>
            Link MegaETH Tokens
          </DialogTitle>
          <DialogDescription className="text-base">
            Choose your preferred wallet to link MegaETH tokens for quantum computing
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* MegaETH Network Info */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20">
            <div className="flex items-center gap-3 mb-3">
              <Globe className="h-5 w-5 text-primary" />
              <h3 className="font-semibold text-primary">🚀 MegaETH Token Network</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Chain ID:</span>
                <div className="font-mono font-bold text-primary">9000</div>
              </div>
              <div>
                <span className="text-muted-foreground">Block Time:</span>
                <div className="font-mono font-bold text-green-400">~2s</div>
              </div>
              <div>
                <span className="text-muted-foreground">Max TPS:</span>
                <div className="font-mono font-bold text-blue-400">100k+</div>
              </div>
              <div>
                <span className="text-muted-foreground">Gas Fees:</span>
                <div className="font-mono font-bold text-purple-400">Ultra Low</div>
              </div>
            </div>
          </div>

          {/* Installed Wallets */}
          {installed.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                Available Wallets
              </h3>
              <div className="grid gap-3">
                {installed.map((wallet) => (
                  <motion.div
                    key={wallet.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card 
                      className={`cursor-pointer transition-all duration-300 hover:shadow-lg border-2 ${
                        selectedWallet === wallet.id 
                          ? 'border-primary bg-primary/10' 
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => handleWalletClick(wallet)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="text-3xl">{wallet.icon}</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-lg">{wallet.name}</h4>
                              <Badge variant="outline" className="text-green-400 border-green-400/50">
                                <CheckCircle className="mr-1 h-3 w-3" />
                                Installed
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{wallet.description}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {isConnecting && selectedWallet === wallet.id ? (
                              <div className="flex items-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                                <span className="text-sm text-primary">Connecting...</span>
                              </div>
                            ) : (
                              <Button variant="outline" size="sm">
                                Connect
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Not Installed Wallets */}
          {notInstalled.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Download className="h-5 w-5 text-yellow-400" />
                Install Additional Wallets
              </h3>
              <div className="grid gap-3">
                {notInstalled.map((wallet) => (
                  <motion.div
                    key={wallet.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className="border-dashed border-2 border-muted-foreground/30">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="text-3xl opacity-50">{wallet.icon}</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-lg text-muted-foreground">{wallet.name}</h4>
                              <Badge variant="outline" className="text-yellow-400 border-yellow-400/50">
                                <Download className="mr-1 h-3 w-3" />
                                Not Installed
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{wallet.description}</p>
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <a href={wallet.downloadUrl} target="_blank" rel="noopener noreferrer">
                              <Download className="mr-2 h-4 w-4" />
                              Install
                            </a>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* No Wallets Available */}
          {installed.length === 0 && (
            <Alert className="border-yellow-500/20 bg-yellow-500/5">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="font-semibold text-yellow-400 mb-2">No Wallets Detected</div>
                <p className="text-yellow-200/80 mb-3">
                  You need a Web3 wallet to interact with the MegaETH blockchain. 
                  Please install one of the supported wallets above.
                </p>
                <div className="flex items-center gap-2 text-xs text-yellow-300/60">
                  <Shield className="h-3 w-3" />
                  <div className="font-mono font-bold text-purple-400">Minimal MegaETH</div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Security Notice */}
          <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-medium text-blue-200">🛡️ Security Notice</span>
            </div>
            <p className="text-xs text-blue-200/80">
              Your wallet connection is secured with enterprise-grade encryption. 
              QuantumChain never stores your private keys or seed phrases.
            </p>
          </div>
        </div>

        {/* Wallet Connection Confirmation Modal */}
        <AnimatePresence>
          {showConfirmation && pendingWallet && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="w-full max-w-md"
              >
                <Card className="quantum-card shadow-2xl">
                  <CardHeader className="text-center">
                    <div className="mx-auto mb-4 p-4 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-2xl w-fit">
                      <div className="text-4xl">{pendingWallet.icon}</div>
                    </div>
                    <CardTitle className="text-xl font-headline">
                      Connect {pendingWallet.name}?
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="p-4 rounded-lg bg-gradient-to-r from-green-500/5 to-green-600/10 border border-green-500/20">
                      <h4 className="font-semibold text-green-200 mb-2 flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        🔗 Connection Permissions
                      </h4>
                      <div className="space-y-2 text-sm text-green-200/80">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-400" />
                          <span>View your wallet address</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-400" />
                          <span>Check your MegaETH token balance</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-400" />
                          <span>Request transaction signatures</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-400" />
                          <span>Use MegaETH tokens for quantum computing</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <div className="flex items-center gap-2 mb-1">
                        <Shield className="h-4 w-4 text-blue-400" />
                        <span className="text-sm font-medium text-blue-200">🔒 Privacy & Security</span>
                      </div>
                      <p className="text-xs text-blue-200/80">
                        QuantumChain will never access your private keys or move MegaETH tokens without your explicit approval.
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <Button 
                        variant="outline" 
                        onClick={cancelConnection}
                        className="flex-1"
                        disabled={isConnecting}
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={confirmConnection}
                        className="flex-1 quantum-button"
                        disabled={isConnecting}
                      >
                        {isConnecting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                            Connecting...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Confirm Connection
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}