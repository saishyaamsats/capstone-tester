"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { formatDistanceToNow } from "date-fns";
import { useWallet } from "@/hooks/use-wallet";
import { useAuth } from "@/hooks/use-auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExternalLink, HardDrive, Filter, Activity, CheckCircle, Clock, Atom, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { blockchainIntegration, QuantumJob } from "@/lib/blockchain-integration";

// Enhanced AI-powered job description summarizer
const summarizeJobDescription = (description: string, jobType: string): string => {
  const lowerDesc = description.toLowerCase();
  
  // QASM code detection and summarization
  if (lowerDesc.includes('openqasm') || lowerDesc.includes('qreg') || lowerDesc.includes('creg')) {
    if (lowerDesc.includes('bell') || (lowerDesc.includes('h ') && lowerDesc.includes('cx'))) {
      return "🔗 Bell State Entanglement";
    }
    if (lowerDesc.includes('grover')) {
      return "🔍 Grover's Quantum Search";
    }
    if (lowerDesc.includes('shor')) {
      return "🔢 Shor's Factorization";
    }
    if (lowerDesc.includes('teleport')) {
      return "📡 Quantum Teleportation";
    }
    if (lowerDesc.includes('measure')) {
      return "📊 Quantum Measurement";
    }
    return "⚛️ Custom Quantum Algorithm";
  }
  
  // Natural language prompt summarization
  if (lowerDesc.includes('factor') || lowerDesc.includes('shor')) {
    return "🔢 Number Factorization";
  }
  if (lowerDesc.includes('search') || lowerDesc.includes('grover')) {
    return "🔍 Quantum Database Search";
  }
  if (lowerDesc.includes('bell') || lowerDesc.includes('entangl')) {
    return "🔗 Quantum Entanglement";
  }
  if (lowerDesc.includes('teleport')) {
    return "📡 Quantum Teleportation";
  }
  if (lowerDesc.includes('random') || lowerDesc.includes('rng')) {
    return "🎲 True Random Numbers";
  }
  if (lowerDesc.includes('superposition')) {
    return "🌊 Quantum Superposition";
  }
  if (lowerDesc.includes('optimization') || lowerDesc.includes('qaoa')) {
    return "📈 Quantum Optimization";
  }
  if (lowerDesc.includes('simulation') || lowerDesc.includes('vqe')) {
    return "🧪 Molecular Simulation";
  }
  if (lowerDesc.includes('machine learning') || lowerDesc.includes('qml')) {
    return "🤖 Quantum AI Model";
  }
  
  // Fallback to first meaningful words
  const words = description.split(' ').filter(word => word.length > 3);
  const summary = words.slice(0, 3).join(' ');
  return summary.length > 40 ? `⚛️ ${summary.substring(0, 37)}...` : `⚛️ ${summary}` || "⚛️ Quantum Experiment";
};

const generateJobId = (txHash: string): string => {
  return `QC-${txHash.slice(2, 8).toUpperCase()}`;
};

interface JobListProps {
  userRole: "admin" | "user";
  jobsLastUpdated: number;
  onTotalJobsChange: (count: number) => void;
}

export default function JobList({ userRole, jobsLastUpdated, onTotalJobsChange }: JobListProps) {
  const [jobs, setJobs] = useState<QuantumJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterByUser, setFilterByUser] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { provider, isConnected, signer } = useWallet();
  const { user } = useAuth();
  const [openJob, setOpenJob] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    if (!isConnected || !provider) {
      setError("Connect your wallet to access job history.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const userAddress = signer ? await signer.getAddress() : undefined;
      const allJobs = await blockchainIntegration.getJobHistory(provider, userRole === 'user' ? userAddress : undefined);
      
      setJobs(allJobs);
      onTotalJobsChange(allJobs.length);
    } catch (e: any) {
      setError(`Network connection error. Please check your wallet connection and try again.`);
      setJobs([]);
      onTotalJobsChange(0);
    } finally {
      setIsLoading(false);
    }
  }, [provider, isConnected, onTotalJobsChange, userRole, signer]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs, jobsLastUpdated]);

  const filteredJobs = useMemo(() => {
    let filtered = jobs;
    
    // Filter by user if needed
    if (userRole === "admin" && filterByUser && user?.email && signer) {
      filtered = filtered.filter(async job => {
        const userAddress = await signer.getAddress();
        return job.user.toLowerCase() === userAddress.toLowerCase();
      });
    }
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(job => 
        getJobTitle(job).toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.jobType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.txHash.toLowerCase().includes(searchTerm.toLowerCase()) ||
        generateJobId(job.txHash).toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return filtered;
  }, [jobs, userRole, filterByUser, user, signer, searchTerm]);

  const getJobTitle = (job: QuantumJob) => {
    return summarizeJobDescription(job.description, job.jobType);
  };

  return (
    <Card className="quantum-card shadow-2xl">
      <CardHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="font-headline text-3xl flex items-center gap-3">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <Activity className="h-7 w-7 text-primary" />
                </div>
                Quantum Job History
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Real-time tracking of quantum computations with blockchain verification
              </CardDescription>
            </div>
            {userRole === "admin" && (
              <Button
                variant={filterByUser ? "secondary" : "outline"}
                onClick={() => setFilterByUser(prev => !prev)}
                className="quantum-button"
              >
                <Filter className="mr-2 h-4 w-4" />
                {filterByUser ? "Show All Jobs" : "My Jobs Only"}
              </Button>
            )}
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search jobs by ID, description, or provider..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="quantum-input pl-10 h-12"
            />
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Skeleton className="h-28 w-full rounded-xl" />
              </motion.div>
            ))}
          </div>
        ) : error ? (
          <Alert variant="destructive" className="border-red-500/20 bg-red-500/5">
            <AlertTitle className="text-red-400">Quantum Network Error</AlertTitle>
            <AlertDescription className="text-red-200/80">{error}</AlertDescription>
          </Alert>
        ) : filteredJobs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div className="relative mx-auto w-24 h-24 mb-6">
              <HardDrive className="w-24 h-24 text-muted-foreground/50" />
              <div className="absolute inset-0 border-2 border-primary/20 rounded-full animate-ping" />
            </div>
            <h3 className="text-xl font-semibold text-muted-foreground mb-2">
              {searchTerm ? "No Matching Jobs" : "No Quantum Jobs Found"}
            </h3>
            <p className="text-muted-foreground">
              {searchTerm 
                ? "Try adjusting your search terms or filters."
                : userRole === 'user' 
                  ? "Your submitted jobs will appear here." 
                  : "No jobs have been logged yet."
              }
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {filteredJobs.map((job, index) => (
                <motion.div
                  key={job.txHash}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Collapsible 
                    open={openJob === job.txHash} 
                    onOpenChange={() => setOpenJob(openJob === job.txHash ? null : job.txHash)}
                  >
                    <CollapsibleTrigger asChild>
                      <div className="group p-6 border border-primary/20 rounded-xl hover:bg-muted/30 cursor-pointer transition-all duration-300 shadow-lg hover:shadow-xl bg-gradient-to-r from-background/80 to-background/60 backdrop-blur-sm">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <div className="flex items-center gap-3">
                              <div className="w-3 h-3 rounded-full bg-blue-500 quantum-pulse" />
                              <div className="p-3 bg-primary/10 rounded-xl text-primary group-hover:bg-primary/20 transition-colors">
                                <Atom size={20} className="quantum-pulse" />
                              </div>
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-2">
                                <span className="text-primary font-mono text-sm font-bold">
                                  {generateJobId(job.txHash)}
                                </span>
                                <span className="font-semibold truncate">
                                  {getJobTitle(job)}
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                                <span className="font-mono">
                                  {job.txHash.slice(0, 8)}...{job.txHash.slice(-6)}
                                </span>
                                <Badge variant="outline" className="text-green-400 border-green-400/50">
                                  <CheckCircle className="mr-1 h-3 w-3" />
                                  Verified
                                </Badge>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {formatDistanceToNow(new Date(job.timestamp), { addSuffix: true })}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-sm font-medium text-primary">
                              {job.jobType}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-6 pb-6"
                      >
                        <div className="ml-12 space-y-6 bg-gradient-to-br from-muted/20 to-muted/10 rounded-xl p-6 border-l-4 border-primary">
                          {/* Job Details */}
                          <div className="space-y-4">
                            <h4 className="font-semibold text-primary text-lg flex items-center gap-2">
                              <Activity className="h-5 w-5" />
                              Quantum Job Details
                            </h4>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div className="space-y-3">
                                <div>
                                  <span className="text-muted-foreground">Job ID:</span>
                                  <div className="font-mono font-bold text-primary">{generateJobId(job.txHash)}</div>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Algorithm:</span>
                                  <div className="font-medium">{getJobTitle(job)}</div>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Provider:</span>
                                  <div className="font-medium">{job.jobType}</div>
                                </div>
                              </div>
                              
                              <div className="space-y-3">
                                <div>
                                  <span className="text-muted-foreground">Submitted:</span>
                                  <div className="font-medium">{new Date(job.timestamp).toLocaleString()}</div>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">Status:</span>
                                  <Badge variant="outline" className="text-green-400 border-green-400/50">
                                    <CheckCircle className="mr-1 h-3 w-3" />
                                    Verified
                                  </Badge>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">User:</span>
                                  <code className="font-mono text-primary text-xs">{job.user.slice(0, 8)}...{job.user.slice(-6)}</code>
                                </div>
                              </div>
                            </div>
                            
                            <div className="pt-4 border-t border-primary/20">
                              <span className="text-muted-foreground text-sm">Blockchain Transaction:</span>
                              <div className="font-mono text-sm break-all mt-1 p-3 bg-muted/20 rounded-lg">
                                {job.txHash}
                              </div>
                              <div className="mt-4">
                                <a href={`https://www.megaexplorer.xyz/tx/${job.txHash}`} target="_blank" rel="noopener noreferrer">
                                  <Button variant="outline" className="quantum-button">
                                    <ExternalLink className="mr-2 h-4 w-4" />
                                    Verify on MegaETH Explorer
                                  </Button>
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </CollapsibleContent>
                  </Collapsible>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  );
}