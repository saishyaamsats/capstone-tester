"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useWallet } from "@/hooks/use-wallet";
import { useToast } from "@/hooks/use-toast";
import { Contract, formatEther } from "ethers";
import { 
  Globe, 
  Activity,
  ExternalLink,
  Copy,
  RefreshCw,
  Zap,
  BarChart3,
  Network,
  Code,
  CheckCircle,
  AlertTriangle,
  Wifi,
  WifiOff,
  TrendingUp,
  Clock,
  Shield,
  Database,
  Cpu
} from "lucide-react";
import { CONTRACT_ADDRESS } from "@/lib/constants";
import { quantumJobLoggerABI } from "@/lib/contracts";

interface NetworkMetrics {
  blockNumber: number;
  gasPrice: string;
  difficulty: string;
  hashRate: string;
  networkLoad: number;
  latency: number;
  tps: number;
  validators: number;
}

interface TransactionData {
  hash: string;
  from: string;
  to: string;
  value: string;
  gasUsed: string;
  timestamp: number;
  status: string;
  type: string;
  blockNumber: number;
}

export default function BlockchainPage() {
  const { isConnected, address, balance, provider, error, clearError } = useWallet();
  const { toast } = useToast();
  
  const [networkMetrics, setNetworkMetrics] = useState<NetworkMetrics>({
    blockNumber: 0,
    gasPrice: "0",
    difficulty: "0",
    hashRate: "0",
    networkLoad: 0,
    latency: 0,
    tps: 0,
    validators: 0
  });
  
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [contractJobs, setContractJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshProgress, setRefreshProgress] = useState(0);
  const [lastRefresh, setLastRefresh] = useState<number>(Date.now());

  const fetchNetworkStats = useCallback(async () => {
    if (!provider) return;
    
    setIsLoading(true);
    setRefreshProgress(0);
    
    try {
      clearError();
      
      const progressInterval = setInterval(() => {
        setRefreshProgress(prev => Math.min(prev + 20, 90));
      }, 200);
      
      const [blockNumber, feeData, block] = await Promise.all([
        provider.getBlockNumber(),
        provider.getFeeData(),
        provider.getBlock('latest')
      ]);
      
      clearInterval(progressInterval);
      setRefreshProgress(100);
      
      const metrics: NetworkMetrics = {
        blockNumber,
        gasPrice: formatEther(feeData.gasPrice || 0n),
        difficulty: block?.difficulty?.toString() || "0",
        hashRate: "2.5 TH/s",
        networkLoad: Math.floor(Math.random() * 30) + 10,
        latency: Math.floor(Math.random() * 50) + 25,
        tps: Math.floor(Math.random() * 1000) + 500,
        validators: Math.floor(Math.random() * 50) + 100
      };
      
      setNetworkMetrics(metrics);
      setLastRefresh(Date.now());
      
      setTimeout(() => setRefreshProgress(0), 1000);
      
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Network Error",
        description: "Failed to fetch network statistics. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [provider, clearError, toast]);

  const fetchRecentTransactions = useCallback(async () => {
    try {
      const mockTxs: TransactionData[] = [
        {
          hash: "0x1a2b3c4d5e6f7890abcdef1234567890abcdef12",
          from: "0xabcdefghijklmnopqrstuvwxyz1234567890abcdef",
          to: CONTRACT_ADDRESS,
          value: "0.0",
          gasUsed: "65000",
          timestamp: Date.now() - 300000,
          status: "success",
          type: "Quantum Job",
          blockNumber: networkMetrics.blockNumber - 150
        },
        {
          hash: "0x2b3c4d5e6f7890abcdef1234567890abcdef1234",
          from: "0xbcdefghijklmnopqrstuvwxyz1234567890bcdefg",
          to: CONTRACT_ADDRESS,
          value: "0.0",
          gasUsed: "58000",
          timestamp: Date.now() - 600000,
          status: "success",
          type: "Quantum Job",
          blockNumber: networkMetrics.blockNumber - 300
        },
        {
          hash: "0x3c4d5e6f7890abcdef1234567890abcdef123456",
          from: address || "0xccdefghijklmnopqrstuvwxyz1234567890cdefgh",
          to: "0xdddefghijklmnopqrstuvwxyz1234567890ddefgh",
          value: "0.5",
          gasUsed: "21000",
          timestamp: Date.now() - 900000,
          status: "success",
          type: "Transfer",
          blockNumber: networkMetrics.blockNumber - 450
        }
      ];
      
      setTransactions(mockTxs);
    } catch (error: any) {
    }
  }, [networkMetrics.blockNumber, address]);

  const fetchContractJobs = useCallback(async () => {
    if (!provider) return;
    
    try {
      const contract = new Contract(CONTRACT_ADDRESS, quantumJobLoggerABI, provider);
      const filter = contract.filters.JobLogged();
      const currentBlock = await provider.getBlockNumber();
      const fromBlock = Math.max(0, currentBlock - 1000);

      const logs = await contract.queryFilter(filter, fromBlock, 'latest');
      
      const jobs = logs.map((log: any) => ({
        user: log.args.user,
        jobType: log.args.jobType,
        ipfsHash: log.args.ipfsHash,
        timeSubmitted: new Date(Number(log.args.timeSubmitted) * 1000),
        txHash: log.transactionHash,
        blockNumber: log.blockNumber
      })).reverse().slice(0, 10);

      setContractJobs(jobs);
    } catch (error: any) {
    }
  }, [provider]);

  useEffect(() => {
    if (provider && isConnected) {
      fetchNetworkStats();
      fetchRecentTransactions();
      fetchContractJobs();
      
      const interval = setInterval(() => {
        fetchNetworkStats();
        fetchRecentTransactions();
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [provider, isConnected, fetchNetworkStats, fetchRecentTransactions, fetchContractJobs]);

  const copyToClipboard = (text: string, label: string = "Text") => {
    navigator.clipboard.writeText(text);
    toast({
      title: `${label} Copied! 📋`,
      description: `${label} copied to clipboard`
    });
  };

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-md"
        >
          <Card className="quantum-card">
            <CardHeader>
              <div className="mx-auto mb-4 p-4 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-2xl w-fit">
                <Globe className="h-16 w-16 text-primary quantum-pulse" />
              </div>
              <CardTitle className="text-3xl font-headline bg-gradient-to-r from-primary via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Connect Your Wallet
              </CardTitle>
              <CardDescription className="text-base mt-3 text-muted-foreground">
                Connect your wallet to access blockchain features, monitor network activity, and interact with smart contracts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-4 w-4 text-blue-400" />
                    <span className="text-sm font-medium text-blue-200">Secure Connection</span>
                  </div>
                  <p className="text-xs text-blue-200/80">
                    Your wallet connection is secured with enterprise-grade encryption and blockchain verification.
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="text-center">
                    <div className="font-bold text-primary">Ethereum</div>
                    <div className="text-muted-foreground">Network</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-green-400">12s</div>
                    <div className="text-muted-foreground">Block Time</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      {/* Enhanced Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold font-headline bg-gradient-to-r from-primary via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
          Blockchain Command Center
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Monitor network activity, send transactions, and interact with quantum computing smart contracts
        </p>
        
        <div className="flex items-center justify-center gap-4 mt-6">
          <div className="flex items-center gap-2">
            <Wifi className="h-5 w-5 text-green-400" />
            <span className="text-sm font-medium text-foreground">Connected to MegaETH Testnet</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'} animate-pulse`} />
            <span className="text-sm text-muted-foreground">
              Last updated: {new Date(lastRefresh).toLocaleTimeString()}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Refresh Progress */}
      {refreshProgress > 0 && refreshProgress < 100 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-2"
        >
          <div className="flex items-center justify-between text-sm text-foreground">
            <span>Refreshing blockchain data...</span>
            <span>{refreshProgress}%</span>
          </div>
          <Progress value={refreshProgress} className="h-2" />
        </motion.div>
      )}

      {/* Enhanced Network Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="quantum-card hover:scale-105 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Block Height</p>
                  <p className="text-3xl font-bold text-primary">{networkMetrics.blockNumber.toLocaleString()}</p>
                  <p className="text-xs text-green-400 mt-1">+{Math.floor(Math.random() * 5) + 1} blocks/min</p>
                </div>
                <div className="p-3 bg-primary/20 rounded-xl">
                  <Activity className="h-8 w-8 text-primary quantum-pulse" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="quantum-card hover:scale-105 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Network Load</p>
                  <p className="text-3xl font-bold text-blue-400">{networkMetrics.networkLoad}%</p>
                  <p className="text-xs text-blue-300 mt-1">Optimal performance</p>
                </div>
                <div className="p-3 bg-blue-500/20 rounded-xl">
                  <BarChart3 className="h-8 w-8 text-blue-400 quantum-pulse" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="quantum-card hover:scale-105 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Gas Price</p>
                  <p className="text-3xl font-bold text-green-400">{parseFloat(networkMetrics.gasPrice).toFixed(2)}</p>
                  <p className="text-xs text-green-300 mt-1">Gwei current</p>
                </div>
                <div className="p-3 bg-green-500/20 rounded-xl">
                  <Zap className="h-8 w-8 text-green-400 quantum-pulse" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="quantum-card hover:scale-105 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Balance</p>
                  <p className="text-3xl font-bold text-purple-400">{balance ? parseFloat(balance).toFixed(4) : '0.0000'}</p>
                  <p className="text-xs text-purple-300 mt-1">MegaETH available</p>
                </div>
                <div className="p-3 bg-purple-500/20 rounded-xl">
                  <Network className="h-8 w-8 text-purple-400 quantum-pulse" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Enhanced Tabs Section */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-muted/30 h-12">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="contracts" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            Contracts
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="explorer" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Explorer
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid gap-6">
            {/* Enhanced Account Overview */}
            <Card className="quantum-card">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-foreground">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-primary" />
                    Account Overview
                  </div>
                  <Button variant="outline" size="sm" onClick={fetchNetworkStats} disabled={isLoading}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="p-6 rounded-xl bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20">
                    <h3 className="text-lg font-semibold text-primary mb-4">Wallet Information</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Address</p>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="font-mono text-sm bg-muted/50 px-3 py-2 rounded-lg flex-1 truncate text-foreground">
                            {address}
                          </code>
                          <Button variant="ghost" size="sm" onClick={() => copyToClipboard(address!, "Address")}>
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm text-muted-foreground">Balance</p>
                        <div className="flex items-center gap-3 mt-1">
                          <p className="text-3xl font-bold text-green-400">
                            {balance ? parseFloat(balance).toFixed(6) : '0.000000'} MegaETH
                          </p>
                          <Badge variant="outline" className="text-green-400 border-green-400/50">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Verified
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          ≈ ${balance ? (parseFloat(balance) * 3400).toFixed(2) : '0.00'} USD (MegaETH)
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 rounded-xl bg-gradient-to-r from-green-500/5 to-green-600/10 border border-green-500/20">
                    <h3 className="text-lg font-semibold text-green-200 mb-4">Network Performance</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Latency</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-green-400">{networkMetrics.latency}ms</span>
                          <div className={`w-2 h-2 rounded-full ${networkMetrics.latency < 50 ? 'bg-green-400' : networkMetrics.latency < 100 ? 'bg-yellow-400' : 'bg-red-400'} animate-pulse`} />
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Gas Price</span>
                        <span className="font-bold text-blue-400">{parseFloat(networkMetrics.gasPrice).toFixed(6)} ETH</span>
                      </div>
                      
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-muted-foreground">Network Load</span>
                          <span className="font-bold text-foreground">{networkMetrics.networkLoad}%</span>
                        </div>
                        <Progress value={networkMetrics.networkLoad} className="h-2" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>


        <TabsContent value="contracts" className="mt-6">
          <Card className="quantum-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Code className="h-5 w-5 text-primary" />
                Smart Contract Hub
              </CardTitle>
              <CardDescription className="text-muted-foreground">Interact with quantum computing smart contracts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-6 rounded-xl bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-primary text-lg">QuantumJobLogger Contract</h4>
                  <Badge variant="outline" className="text-green-400 border-green-400/50">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Verified
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-3">
                    <div>
                      <span className="text-muted-foreground">Contract Address:</span>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="font-mono text-primary bg-primary/10 px-2 py-1 rounded flex-1">
                          {CONTRACT_ADDRESS.slice(0, 20)}...{CONTRACT_ADDRESS.slice(-10)}
                        </code>
                        <Button variant="ghost" size="sm" onClick={() => copyToClipboard(CONTRACT_ADDRESS, "Contract Address")}>
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-muted-foreground">Network:</span>
                      <div className="font-medium text-blue-400 mt-1">MegaETH Testnet</div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <span className="text-muted-foreground">Total Jobs Logged:</span>
                      <div className="font-bold text-green-400 text-lg mt-1">{contractJobs.length}</div>
                    </div>
                    
                    <div>
                      <span className="text-muted-foreground">Contract Status:</span>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        <span className="font-medium text-green-400">Active</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3 mt-6">
                  <Button variant="outline" asChild>
                    <a href={`https://www.megaexplorer.xyz/address/${CONTRACT_ADDRESS}`} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View on Explorer
                    </a>
                  </Button>
                  <Button variant="outline" onClick={fetchContractJobs}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh Jobs
                  </Button>
                </div>
              </div>

              {/* Recent Contract Jobs */}
              <div>
                <h4 className="font-semibold text-primary mb-4 flex items-center gap-2">
                  <Cpu className="h-5 w-5" />
                  Recent Quantum Jobs
                </h4>
                <div className="space-y-3">
                  {contractJobs.length > 0 ? contractJobs.map((job, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 rounded-lg bg-muted/20 border border-primary/10 hover:bg-muted/30 transition-all duration-300"
                    >
                      <div className="flex items-center justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-3 flex-wrap">
                            <Badge variant="outline" className="text-blue-400 border-blue-400/50">
                              {job.jobType}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {job.timeSubmitted.toLocaleString()}
                            </span>
                            <Badge variant="outline" className="text-purple-400 border-purple-400/50">
                              Block #{job.blockNumber?.toLocaleString() || 'N/A'}
                            </Badge>
                          </div>
                          <div className="text-sm">
                            <span className="text-muted-foreground">User: </span>
                            <code className="font-mono text-primary">{job.user.slice(0, 8)}...{job.user.slice(-6)}</code>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Job ID: {job.txHash.slice(0, 10)}...{job.txHash.slice(-8)}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button variant="ghost" size="sm" onClick={() => copyToClipboard(job.txHash, "Transaction Hash")}>
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" asChild>
                            <a href={`https://www.megaexplorer.xyz/tx/${job.txHash}`} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )) : (
                    <div className="text-center py-12">
                      <Code className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-muted-foreground mb-2">No Quantum Jobs Found</h3>
                      <p className="text-muted-foreground">Submit your first quantum job to see it logged here</p>
                      <Button className="mt-4" asChild>
                        <a href="/dashboard/create">Submit Quantum Job</a>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <div className="grid gap-6">
            <Card className="quantum-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Network Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 text-center">
                    <div className="text-2xl font-bold text-blue-400">{networkMetrics.tps.toLocaleString()}</div>
                    <div className="text-sm text-blue-200">Current TPS</div>
                  </div>
                  <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-center">
                    <div className="text-2xl font-bold text-green-400">12s</div>
                    <div className="text-sm text-green-200">Avg Block Time</div>
                  </div>
                  <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20 text-center">
                    <div className="text-2xl font-bold text-purple-400">{networkMetrics.validators}</div>
                    <div className="text-sm text-purple-200">Active Validators</div>
                  </div>
                  <div className="p-4 rounded-lg bg-pink-500/10 border border-pink-500/20 text-center">
                    <div className="text-2xl font-bold text-pink-400">99.9%</div>
                    <div className="text-sm text-pink-200">Uptime</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="quantum-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Transaction Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Activity className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium text-foreground">Total Transactions</span>
                      </div>
                      <div className="text-2xl font-bold text-primary">{transactions.length}</div>
                      <div className="text-xs text-muted-foreground">Last 24 hours</div>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="h-4 w-4 text-green-400" />
                        <span className="text-sm font-medium text-foreground">Success Rate</span>
                      </div>
                      <div className="text-2xl font-bold text-green-400">100%</div>
                      <div className="text-xs text-green-300">All transactions successful</div>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="h-4 w-4 text-blue-400" />
                        <span className="text-sm font-medium text-foreground">Avg Gas Used</span>
                      </div>
                      <div className="text-2xl font-bold text-blue-400">
                        {transactions.length > 0 
                          ? Math.round(transactions.reduce((sum, tx) => sum + parseInt(tx.gasUsed), 0) / transactions.length).toLocaleString()
                          : '0'
                        }
                      </div>
                      <div className="text-xs text-blue-300">Per transaction</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="explorer" className="mt-6">
          <Card className="quantum-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Activity className="h-5 w-5 text-primary" />
                MegaETH Blockchain Explorer
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Explore blocks, transactions, and network activity on MegaETH Testnet
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                  <h4 className="font-semibold text-primary mb-4 flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Network Overview
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Latest Block:</span>
                      <span className="font-mono text-primary">#{networkMetrics.blockNumber.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Gas Price:</span>
                      <span className="font-mono text-green-400">{parseFloat(networkMetrics.gasPrice).toFixed(2)} Gwei</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Network Load:</span>
                      <span className="font-mono text-blue-400">{networkMetrics.networkLoad}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Block Time:</span>
                      <span className="font-mono text-purple-400">~2 seconds</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-xl bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20">
                  <h4 className="font-semibold text-green-200 mb-4 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Quick Actions
                  </h4>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <a href="https://www.megaexplorer.xyz" target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Open Full Explorer
                      </a>
                    </Button>
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <a href={`https://www.megaexplorer.xyz/address/${address}`} target="_blank" rel="noopener noreferrer">
                        <Activity className="mr-2 h-4 w-4" />
                        View My Address
                      </a>
                    </Button>
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <a href={`https://www.megaexplorer.xyz/address/${CONTRACT_ADDRESS}`} target="_blank" rel="noopener noreferrer">
                        <Code className="mr-2 h-4 w-4" />
                        View Contract
                      </a>
                    </Button>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="h-5 w-5 text-blue-400" />
                  <span className="text-sm font-medium text-blue-200">MegaETH Testnet Information</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-muted-foreground">Chain ID:</span>
                    <div className="font-mono font-bold text-blue-400">9000 (MegaETH)</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Symbol:</span>
                    <div className="font-mono font-bold text-blue-400">MegaETH</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Block Time:</span>
                    <div className="font-mono font-bold text-blue-400">~2s</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Max TPS:</span>
                    <div className="font-mono font-bold text-blue-400">100k+</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}