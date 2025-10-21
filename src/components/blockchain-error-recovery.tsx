"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useWallet } from "@/hooks/use-wallet";
import { useToast } from "@/hooks/use-toast";
import { 
  RefreshCw, 
  Wifi, 
  WifiOff, 
  AlertTriangle, 
  CheckCircle,
  ExternalLink,
  Zap,
  Globe,
  Settings
} from "lucide-react";
import { MEGAETH_TESTNET_CONFIG } from "@/lib/megaeth-config";

interface BlockchainErrorRecoveryProps {
  error: string;
  onRecovery?: () => void;
}

export default function BlockchainErrorRecovery({ error, onRecovery }: BlockchainErrorRecoveryProps) {
  const { provider, connectWallet, refreshBalance, isConnected } = useWallet();
  const { toast } = useToast();
  const [isRecovering, setIsRecovering] = useState(false);
  const [networkStatus, setNetworkStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [recoverySteps, setRecoverySteps] = useState<Array<{
    id: string;
    label: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    action?: () => Promise<void>;
  }>>([]);

  useEffect(() => {
    initializeRecoverySteps();
    checkNetworkStatus();
  }, [error]);

  const initializeRecoverySteps = () => {
    const steps = [
      {
        id: 'network-check',
        label: 'Check MegaETH network connectivity',
        status: 'pending' as const,
        action: checkNetworkConnectivity
      },
      {
        id: 'wallet-reconnect',
        label: 'Reconnect wallet if needed',
        status: 'pending' as const,
        action: reconnectWallet
      },
      {
        id: 'balance-refresh',
        label: 'Refresh wallet balance',
        status: 'pending' as const,
        action: refreshWalletBalance
      },
      {
        id: 'contract-verify',
        label: 'Verify smart contract accessibility',
        status: 'pending' as const,
        action: verifyContract
      }
    ];
    
    setRecoverySteps(steps);
  };

  const checkNetworkStatus = async () => {
    try {
      const response = await fetch('/api/megaeth?action=network-status');
      const data = await response.json();
      setNetworkStatus(data.isOnline ? 'online' : 'offline');
    } catch {
      setNetworkStatus('offline');
    }
  };

  const checkNetworkConnectivity = async () => {
    try {
      const response = await fetch('https://testnet.megaeth.io', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_blockNumber',
          params: [],
          id: 1
        }),
        signal: AbortSignal.timeout(5000)
      });
      
      if (response.ok) {
        setNetworkStatus('online');
        return;
      }
      throw new Error('Network unreachable');
    } catch (error) {
      setNetworkStatus('offline');
      throw error;
    }
  };

  const reconnectWallet = async () => {
    if (!isConnected) {
      await connectWallet();
    }
  };

  const refreshWalletBalance = async () => {
    await refreshBalance();
  };

  const verifyContract = async () => {
    if (!provider) throw new Error('Provider not available');
    
    try {
      const code = await provider.getCode(MEGAETH_TESTNET_CONFIG.contracts.quantumJobLogger);
      if (code === '0x') {
        throw new Error('Contract not found');
      }
    } catch (error) {
      throw new Error('Contract verification failed');
    }
  };

  const runRecoveryStep = async (stepId: string) => {
    const step = recoverySteps.find(s => s.id === stepId);
    if (!step || !step.action) return;

    setRecoverySteps(prev => prev.map(s => 
      s.id === stepId ? { ...s, status: 'running' } : s
    ));

    try {
      await step.action();
      setRecoverySteps(prev => prev.map(s => 
        s.id === stepId ? { ...s, status: 'completed' } : s
      ));
    } catch (error) {
      setRecoverySteps(prev => prev.map(s => 
        s.id === stepId ? { ...s, status: 'failed' } : s
      ));
      throw error;
    }
  };

  const runFullRecovery = async () => {
    setIsRecovering(true);
    
    try {
      for (const step of recoverySteps) {
        if (step.action) {
          await runRecoveryStep(step.id);
          await new Promise(resolve => setTimeout(resolve, 500)); // Brief delay between steps
        }
      }
      
      toast({
        title: "Recovery Complete! 🎉",
        description: "All recovery steps completed successfully.",
      });
      
      onRecovery?.();
      
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Recovery Failed",
        description: "Some recovery steps failed. Please try manual troubleshooting.",
      });
    } finally {
      setIsRecovering(false);
    }
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'running': return RefreshCw;
      case 'failed': return XCircle;
      default: return Clock;
    }
  };

  const getStepColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'running': return 'text-blue-400';
      case 'failed': return 'text-red-400';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <Card className="quantum-card border-orange-500/30 bg-orange-500/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-400">
          <AlertTriangle className="h-5 w-5" />
          Blockchain Error Recovery
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Network Status */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-primary/10">
          <div className="flex items-center gap-3">
            {networkStatus === 'online' ? (
              <Wifi className="h-5 w-5 text-green-400" />
            ) : networkStatus === 'offline' ? (
              <WifiOff className="h-5 w-5 text-red-400" />
            ) : (
              <RefreshCw className="h-5 w-5 text-yellow-400 animate-spin" />
            )}
            <span className="font-medium">MegaETH Network Status</span>
          </div>
          <Badge variant="outline" className={
            networkStatus === 'online' ? "text-green-400 border-green-400/50" :
            networkStatus === 'offline' ? "text-red-400 border-red-400/50" :
            "text-yellow-400 border-yellow-400/50"
          }>
            {networkStatus === 'checking' ? 'Checking...' : networkStatus}
          </Badge>
        </div>

        {/* Error Details */}
        <Alert className="border-red-500/20 bg-red-500/5">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="font-semibold text-red-400 mb-1">Blockchain Error</div>
            {error}
          </AlertDescription>
        </Alert>

        {/* Recovery Steps */}
        <div className="space-y-3">
          <h4 className="font-semibold text-primary flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Automated Recovery Steps
          </h4>
          
          <div className="space-y-2">
            {recoverySteps.map((step, index) => {
              const StepIcon = getStepIcon(step.status);
              const stepColor = getStepColor(step.status);
              
              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/10 border border-primary/10"
                >
                  <StepIcon className={`h-4 w-4 ${stepColor} ${step.status === 'running' ? 'animate-spin' : ''}`} />
                  <span className="flex-1 text-sm">{step.label}</span>
                  <Badge variant="outline" className={`${stepColor} border-current/50 text-xs`}>
                    {step.status}
                  </Badge>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Recovery Actions */}
        <div className="flex flex-col gap-3">
          <Button 
            onClick={runFullRecovery}
            disabled={isRecovering}
            className="w-full quantum-button"
          >
            {isRecovering ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Running Recovery...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-4 w-4" />
                Start Automated Recovery
              </>
            )}
          </Button>
          
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" onClick={checkNetworkStatus}>
              <Globe className="mr-2 h-4 w-4" />
              Check Network
            </Button>
            <Button variant="outline" asChild>
              <a 
                href={MEGAETH_TESTNET_CONFIG.tools.faucetUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Get Testnet ETH
              </a>
            </Button>
          </div>
        </div>

        {/* Help Resources */}
        <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Info className="h-4 w-4 text-blue-400" />
            <span className="text-sm font-medium text-blue-200">Need Additional Help?</span>
          </div>
          <div className="space-y-1 text-xs text-blue-200/80">
            <p>• Check the MegaETH network status page</p>
            <p>• Ensure MetaMask is unlocked and connected</p>
            <p>• Verify you have sufficient testnet ETH for gas fees</p>
            <p>• Try switching to a different RPC endpoint</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}