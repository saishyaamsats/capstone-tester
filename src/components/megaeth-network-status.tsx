"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Network, 
  Activity, 
  Zap, 
  Clock, 
  TrendingUp, 
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  ExternalLink
} from "lucide-react";
import { MEGAETH_TESTNET_CONFIG } from "@/lib/megaeth-config";

interface NetworkStatus {
  isOnline: boolean;
  blockNumber: number;
  gasPrice: string;
  networkLoad: string;
  latency: number;
  blockTime: number;
  tps: number;
}

export default function MegaETHNetworkStatus() {
  const [status, setStatus] = useState<NetworkStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<number>(Date.now());

  const fetchNetworkStatus = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/megaeth?action=network-status');
      const data = await response.json();
      setStatus(data);
      setLastUpdated(Date.now());
    } catch (error) {
      setStatus({
        isOnline: false,
        blockNumber: 0,
        gasPrice: '0 gwei',
        networkLoad: 'Unknown',
        latency: -1,
        blockTime: 0,
        tps: 0
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNetworkStatus();
    const interval = setInterval(fetchNetworkStatus, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (!status) {
    return (
      <Card className="quantum-card">
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            <span>Loading MegaETH status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="quantum-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Network className="h-5 w-5 text-primary" />
            MegaETH Network Status
          </div>
          <Button variant="ghost" size="sm" onClick={fetchNetworkStatus} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Network Health */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${status.isOnline ? 'bg-green-400' : 'bg-red-400'} animate-pulse`} />
            <span className="font-medium">Network Status</span>
          </div>
          <Badge variant="outline" className={status.isOnline ? "text-green-400 border-green-400/50" : "text-red-400 border-red-400/50"}>
            {status.isOnline ? (
              <>
                <CheckCircle className="mr-1 h-3 w-3" />
                Online
              </>
            ) : (
              <>
                <AlertTriangle className="mr-1 h-3 w-3" />
                Offline
              </>
            )}
          </Badge>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="h-4 w-4 text-blue-400" />
              <span className="text-xs text-blue-200">Block Height</span>
            </div>
            <p className="text-lg font-bold text-blue-100">{status.blockNumber.toLocaleString()}</p>
          </div>
          
          <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="h-4 w-4 text-green-400" />
              <span className="text-xs text-green-200">Gas Price</span>
            </div>
            <p className="text-lg font-bold text-green-100">{status.gasPrice}</p>
          </div>
          
          <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-purple-400" />
              <span className="text-xs text-purple-200">Block Time</span>
            </div>
            <p className="text-lg font-bold text-purple-100">{status.blockTime}s</p>
          </div>
          
          <div className="p-3 rounded-lg bg-pink-500/10 border border-pink-500/20">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-pink-400" />
              <span className="text-xs text-pink-200">Max TPS</span>
            </div>
            <p className="text-lg font-bold text-pink-100">{status.tps.toLocaleString()}</p>
          </div>
        </div>

        {/* Network Info */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Chain ID:</span>
            <span className="font-mono font-medium">{MEGAETH_TESTNET_CONFIG.chainId}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Network Load:</span>
            <Badge variant="outline" className="text-green-400 border-green-400/50">
              {status.networkLoad}
            </Badge>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Latency:</span>
            <span className="font-medium">{status.latency > 0 ? `${status.latency.toFixed(0)}ms` : 'N/A'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Last Updated:</span>
            <span className="font-medium">{new Date(lastUpdated).toLocaleTimeString()}</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild className="flex-1">
            <a href={MEGAETH_TESTNET_CONFIG.tools.faucetUrl} target="_blank" rel="noopener noreferrer">
              <Zap className="mr-2 h-4 w-4" />
              Get MegaETH Tokens
            </a>
          </Button>
          <Button variant="outline" size="sm" asChild className="flex-1">
            <a href={MEGAETH_TESTNET_CONFIG.blockExplorerUrls[0]} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              Explorer
            </a>
          </Button>
        </div>

        {/* Network Warning */}
        {!status.isOnline && (
          <Alert className="border-red-500/20 bg-red-500/5">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-red-200/80">
              MegaETH network appears to be offline. Please check your connection or try again later.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}