"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";

import { useWallet } from "@/hooks/use-wallet";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Terminal, Zap, Clock, DollarSign, Activity, Cpu, Atom, Code, MessageSquare, AlertTriangle, Lightbulb } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Alert, AlertDescription } from "./ui/alert";
import { Badge } from "./ui/badge";
import QuantumResultsDisplay from "./quantum-results-display";
import { blockchainIntegration } from "@/lib/blockchain-integration";

const formSchema = z.object({
  jobType: z.string().min(1, { message: "Job type cannot be empty." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  submissionType: z.enum(["prompt", "qasm", "preset"]),
  priority: z.enum(["low", "medium", "high"]),
});

const computerTimeFactors: Record<string, { base: number; factor: number; cost: number; qubits: number }> = {
  "Google Willow": { base: 15, factor: 0.08, cost: 0.0018, qubits: 105 },
  "IBM Condor": { base: 20, factor: 0.12, cost: 0.0015, qubits: 1121 },
  "Amazon Braket": { base: 18, factor: 0.15, cost: 0.0012, qubits: 256 },
};

const priorityMultipliers = {
  low: 1,
  medium: 1.5,
  high: 2.5,
};

const priorityConfig = {
  low: { color: "text-green-400 border-green-400/50", label: "Standard", desc: "Normal queue processing" },
  medium: { color: "text-yellow-400 border-yellow-400/50", label: "Priority", desc: "Faster execution" },
  high: { color: "text-red-400 border-red-400/50", label: "Express", desc: "Immediate processing" },
};

// Pre-existing quantum algorithms for testing
const presetAlgorithms = [
  {
    id: "bell-state",
    name: "🔗 Bell State Creation",
    description: "Create quantum entanglement between two qubits - the foundation of quantum computing!",
    qasm: `OPENQASM 2.0;
include "qelib1.inc";

qreg q[2];
creg c[2];

h q[0];
cx q[0],q[1];
measure q -> c;`,
    explanation: "This creates 'spooky action at a distance' - measuring one qubit instantly affects the other! You'll see equal chances of |00⟩ and |11⟩ states, proving entanglement.",
    difficulty: "Beginner",
    qubits: 2
  },
  {
    id: "grover-search",
    name: "🔍 Grover's Search Algorithm",
    description: "Find a needle in a haystack quadratically faster than any classical computer!",
    qasm: `OPENQASM 2.0;
include "qelib1.inc";

qreg q[2];
creg c[2];

// Initialize superposition
h q[0];
h q[1];

// Oracle for |11⟩
cz q[0],q[1];

// Diffusion operator
h q[0];
h q[1];
x q[0];
x q[1];
cz q[0],q[1];
x q[0];
x q[1];
h q[0];
h q[1];

measure q -> c;`,
    explanation: "This quantum algorithm can search unsorted databases much faster than classical computers. Watch how it amplifies the probability of finding the target |11⟩ state!",
    difficulty: "Intermediate",
    qubits: 2
  },
  {
    id: "quantum-teleportation",
    name: "📡 Quantum Teleportation",
    description: "Beam quantum information from one place to another using entanglement - like Star Trek!",
    qasm: `OPENQASM 2.0;
include "qelib1.inc";

qreg q[3];
creg c[3];

// Prepare state to teleport (|1⟩)
x q[0];

// Create Bell pair
h q[1];
cx q[1],q[2];

// Bell measurement
cx q[0],q[1];
h q[0];
measure q[0] -> c[0];
measure q[1] -> c[1];

// Conditional operations
if(c[1]==1) x q[2];
if(c[0]==1) z q[2];

measure q[2] -> c[2];`,
    explanation: "This recreates the famous quantum teleportation protocol! The quantum state of the first qubit magically appears on the third qubit, while the original is destroyed.",
    difficulty: "Advanced",
    qubits: 3
  },
  {
    id: "superposition",
    name: "🌊 Quantum Superposition",
    description: "Put qubits in multiple states simultaneously - the heart of quantum advantage!",
    qasm: `OPENQASM 2.0;
include "qelib1.inc";

qreg q[3];
creg c[3];

h q[0];
h q[1];
h q[2];

measure q -> c;`,
    explanation: "This puts each qubit in a 'superposition' - existing in both |0⟩ and |1⟩ states at once! You'll see equal probabilities for all 8 possible outcomes.",
    difficulty: "Beginner",
    qubits: 3
  },
  {
    id: "quantum-fourier",
    name: "🎵 Quantum Fourier Transform",
    description: "The quantum version of signal processing - essential for breaking encryption!",
    qasm: `OPENQASM 2.0;
include "qelib1.inc";

qreg q[3];
creg c[3];

// Input state preparation
x q[0];

// QFT implementation
h q[2];
cu1(pi/2) q[1],q[2];
cu1(pi/4) q[0],q[2];
h q[1];
cu1(pi/2) q[0],q[1];
h q[0];

// Swap qubits
swap q[0],q[2];

measure q -> c;`,
    explanation: "This is the quantum equivalent of signal processing! It's the secret sauce in Shor's algorithm for breaking RSA encryption and finding hidden patterns.",
    difficulty: "Advanced",
    qubits: 3
  },
  {
    id: "random-number",
    name: "🎲 Quantum Random Generator",
    description: "Generate truly random numbers that even Einstein couldn't predict!",
    qasm: `OPENQASM 2.0;
include "qelib1.inc";

qreg q[4];
creg c[4];

h q[0];
h q[1];
h q[2];
h q[3];

measure q -> c;`,
    explanation: "Unlike computer 'random' numbers, these are truly unpredictable thanks to quantum mechanics! Each run gives you a genuinely random 4-bit number from the universe itself.",
    difficulty: "Beginner",
    qubits: 4
  }
];

interface JobSubmissionFormProps {
  onJobLogged: () => void;
}

export default function JobSubmissionForm({ onJobLogged }: JobSubmissionFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const { isConnected, signer, provider, error, clearError } = useWallet();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      jobType: "Google Willow",
      description: "",
      submissionType: "preset",
      priority: "medium",
    },
  });

  const selectedJobType = form.watch("jobType");
  const descriptionValue = form.watch("description");
  const priority = form.watch("priority");
  const submissionType = form.watch("submissionType");
  
  const { estimatedTime, estimatedCost, qubitCount } = useMemo(() => {
    if (!selectedJobType || !descriptionValue) return { 
      estimatedTime: "5 - 10 seconds", 
      estimatedCost: "0.001 ETH",
      qubitCount: "2-5"
    };
    
    const { base, factor, cost, qubits } = computerTimeFactors[selectedJobType];
    const length = descriptionValue.length;
    const baseTime = base + length * factor;
    const priorityMultiplier = priorityMultipliers[priority];
    
    const timeInSeconds = baseTime / priorityMultiplier;
    const highTimeInSeconds = timeInSeconds * 1.5;
    const totalCost = cost * priorityMultiplier;

    const complexityFactor = Math.min(length / 100, 1);
    const estimatedQubits = Math.ceil(2 + (qubits * 0.1 * complexityFactor));

    const formatDisplayTime = (seconds: number) => {
      if (seconds < 60) return `${Math.round(seconds)} sec`;
      return `${(seconds / 60).toFixed(1)} min`;
    };
    
    const timeRange = highTimeInSeconds < 60 
      ? `${Math.round(timeInSeconds)} - ${Math.round(highTimeInSeconds)} seconds`
      : `${formatDisplayTime(timeInSeconds)} - ${formatDisplayTime(highTimeInSeconds)}`;

    return {
      estimatedTime: timeRange,
      estimatedCost: `${totalCost.toFixed(4)} ETH`,
      qubitCount: `${Math.max(2, estimatedQubits - 2)} - ${estimatedQubits}`
    };
  }, [selectedJobType, descriptionValue, priority]);

  const handlePresetSelect = (presetId: string) => {
    const preset = presetAlgorithms.find(p => p.id === presetId);
    if (preset) {
      setSelectedPreset(presetId);
      form.setValue("description", preset.qasm);
      form.setValue("submissionType", "qasm");
    }
  };

  const handleLogJob = async (values: z.infer<typeof formSchema>) => {
    if (!signer) {
      toast({
        variant: "destructive",
        title: "Wallet Required",
        description: "Please connect your wallet to submit quantum jobs.",
      });
      return;
    }

    if (error) {
      toast({
        variant: "destructive",
        title: "Wallet Error",
        description: "Please check your wallet connection and try again.",
      });
      return;
    }

    setIsLoading(true);
    clearError();
    
    try {
      toast({
        title: "Transaction Initiated 🚀",
        description: "Please confirm the blockchain transaction in your wallet.",
      });

      const { txHash, jobId } = await blockchainIntegration.logQuantumJob(
        provider,
        signer,
        values.jobType,
        values.description
      );

      // Submit job for execution
      const jobResponse = await fetch('/api/submit-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobType: values.jobType,
          description: values.description,
          provider: values.jobType,
          priority: values.priority,
          submissionType: values.submissionType,
          txHash,
          userId: await signer.getAddress()
        })
      });

      const jobData = await jobResponse.json();
      if (jobData.jobId) {
        setCurrentJobId(jobData.jobId);
      }

      toast({
        title: "Success! Job Logged 🎉",
        description: "Your job has been securely recorded on the blockchain.",
        action: (
          <Button asChild variant="link" size="sm">
            <a href={`https://www.megaexplorer.xyz/tx/${txHash}`} target="_blank" rel="noopener noreferrer">
              View Transaction
            </a>
          </Button>
        ),
      });

      form.reset({
        jobType: values.jobType,
        description: "",
        submissionType: "preset",
        priority: "medium",
      });
      setSelectedPreset(null);
      
      onJobLogged();
      
    } catch (error: any) {
      
      let errorMessage = "Transaction failed.";
      
      if (error.code === 4001) {
        errorMessage = "Transaction cancelled by user.";
      } else if (error.code === -32603) {
        errorMessage = "Insufficient funds for gas fees.";
      } else if (error.reason) {
        errorMessage = error.reason;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        variant: "destructive",
        title: "Transaction Error",
        description: errorMessage.length > 120 ? `${errorMessage.substring(0, 120)}...` : errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="quantum-card shadow-2xl">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleLogJob)}>
          <CardHeader className="pb-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <CardTitle className="font-headline text-3xl flex items-center gap-3 text-foreground">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <Terminal className="h-7 w-7 text-primary" />
                </div>
                Quantum Lab
              </CardTitle>
              <CardDescription className="text-base mt-2 text-muted-foreground">
                Execute quantum algorithms on leading providers and log results immutably on the blockchain
              </CardDescription>
            </motion.div>
          </CardHeader>
          
          <CardContent className="space-y-8">
            {/* Provider and Priority Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="jobType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-base font-medium text-foreground">
                      <Cpu className="h-5 w-5 text-primary" />
                      Quantum Provider
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="quantum-input h-12">
                          <SelectValue placeholder="Select quantum computer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-background/95 backdrop-blur-sm border-primary/20">
                        <SelectItem value="Google Willow">
                          <div className="flex items-center gap-3 py-1">
                            <div className="w-3 h-3 bg-blue-500 rounded-full quantum-pulse"></div>
                            <div>
                              <div className="font-medium text-foreground">Google Willow</div>
                              <div className="text-xs text-muted-foreground">105 qubits • Error correction</div>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="IBM Condor">
                          <div className="flex items-center gap-3 py-1">
                            <div className="w-3 h-3 bg-indigo-500 rounded-full quantum-pulse"></div>
                            <div>
                              <div className="font-medium text-foreground">IBM Condor</div>
                              <div className="text-xs text-muted-foreground">1,121 qubits • Enterprise grade</div>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="Amazon Braket">
                          <div className="flex items-center gap-3 py-1">
                            <div className="w-3 h-3 bg-orange-500 rounded-full quantum-pulse"></div>
                            <div>
                              <div className="font-medium text-foreground">Amazon Braket</div>
                              <div className="text-xs text-muted-foreground">256 qubits • Multi-provider</div>
                            </div>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-base font-medium text-foreground">
                      <Activity className="h-5 w-5 text-primary" />
                      Execution Priority
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="quantum-input h-12">
                          <SelectValue placeholder="Select priority level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-background/95 backdrop-blur-sm border-primary/20">
                        {Object.entries(priorityConfig).map(([key, config]) => (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center gap-3 py-1">
                              <Badge variant="outline" className={config.color}>
                                {config.label}
                              </Badge>
                              <div className="text-sm text-foreground">{config.desc}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Job Input Tabs */}
            <Tabs 
              defaultValue="preset" 
              onValueChange={(value) => {
                form.setValue('submissionType', value as "prompt" | "qasm" | "preset");
                form.trigger('submissionType');
                if (value !== "preset") {
                  setSelectedPreset(null);
                }
              }}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3 bg-muted/30 h-12">
                <TabsTrigger 
                  value="preset" 
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-2"
                >
                  <Lightbulb className="h-4 w-4" />
                  Presets
                </TabsTrigger>
                <TabsTrigger 
                  value="prompt" 
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  Natural Language
                </TabsTrigger>
                <TabsTrigger 
                  value="qasm" 
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground flex items-center gap-2"
                >
                  <Code className="h-4 w-4" />
                  QASM Code
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="preset" className="mt-6">
                <div className="space-y-4">
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-semibold text-foreground mb-2">🧪 Ready-to-Use Quantum Algorithms</h3>
                    <p className="text-sm text-muted-foreground">
                      Select from expertly crafted quantum algorithms - perfect for learning and experimentation
                    </p>
                  </div>
                  
                  <div className="grid gap-4">
                    {presetAlgorithms.map((preset) => (
                      <motion.div
                        key={preset.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-4 rounded-lg border cursor-pointer transition-all duration-300 ${
                          selectedPreset === preset.id 
                            ? 'border-primary bg-primary/10' 
                            : 'border-border hover:border-primary/50 hover:bg-muted/50'
                        }`}
                        onClick={() => handlePresetSelect(preset.id)}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-semibold text-foreground mb-1">{preset.name}</h4>
                            <p className="text-sm text-muted-foreground mb-2">{preset.description}</p>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <Badge variant="outline" className={
                              preset.difficulty === 'Beginner' ? 'text-green-400 border-green-400/50' :
                              preset.difficulty === 'Intermediate' ? 'text-yellow-400 border-yellow-400/50' :
                              'text-red-400 border-red-400/50'
                            }>
                              {preset.difficulty}
                            </Badge>
                            <Badge variant="outline" className="text-blue-400 border-blue-400/50">
                              {preset.qubits} qubits
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded">
                          💡 <strong>What it does:</strong> {preset.explanation}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  
                  {selectedPreset && (
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-medium text-foreground">Generated QASM Code</FormLabel>
                          <FormControl>
                            <Textarea 
                              className="quantum-input min-h-[150px] font-mono text-sm resize-none bg-muted/20" 
                              readOnly
                              {...field} 
                            />
                          </FormControl>
                          <div className="text-xs text-muted-foreground mt-2">
                            ✨ <strong>Ready to execute!</strong> This quantum circuit will run on {selectedJobType} with {computerTimeFactors[selectedJobType]?.qubits} qubits available
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="prompt" className="mt-6">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium text-foreground">Quantum Algorithm Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="🌟 Try this: 'Create a Bell state circuit with Hadamard and CNOT gates to demonstrate quantum entanglement between two qubits'" 
                          className="quantum-input min-h-[100px] resize-none" 
                          {...field} 
                        />
                      </FormControl>
                      <div className="text-xs text-muted-foreground mt-2">
                        💡 <strong>Speak naturally!</strong> Describe what you want your quantum algorithm to do - our AI will translate it into quantum circuits
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
              
              <TabsContent value="qasm" className="mt-6">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-medium text-foreground">QASM Circuit Code</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder={`// 🚀 Example Bell State Circuit
OPENQASM 2.0;
include "qelib1.inc";

qreg q[2];
creg c[2];

h q[0];
cx q[0],q[1];
measure q -> c;

// This creates quantum entanglement!`} 
                          className="quantum-input min-h-[100px] font-mono text-sm resize-none" 
                          {...field} 
                        />
                      </FormControl>
                      <div className="text-xs text-muted-foreground mt-2">
                        💡 <strong>For experts:</strong> Write your quantum circuit in OpenQASM 2.0/3.0 - the standard quantum assembly language
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>

            {/* Real-time Estimates */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-5 w-5 text-blue-400" />
                  <span className="text-sm font-medium text-blue-200">Execution Time</span>
                </div>
                <p className="text-xl font-bold text-blue-100">{estimatedTime}</p>
              </div>
              
              <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-5 w-5 text-green-400" />
                  <span className="text-sm font-medium text-green-200">Compute Cost</span>
                </div>
                <p className="text-xl font-bold text-green-100">{estimatedCost}</p>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Atom className="h-5 w-5 text-purple-400" />
                  <span className="text-sm font-medium text-purple-200">Qubits Used</span>
                </div>
                <p className="text-xl font-bold text-purple-100">{qubitCount}</p>
              </div>
            </motion.div>

            {/* Provider Info */}
            {selectedJobType && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="p-4 rounded-xl bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20"
              >
                <div className="flex items-center gap-3 mb-3">
                  <Cpu className="h-5 w-5 text-primary" />
                  <h4 className="font-semibold text-primary">🔬 Quantum Hardware Details</h4>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">🎯 Available Qubits:</span>
                    <div className="font-bold text-primary">{computerTimeFactors[selectedJobType].qubits}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">⚡ Response Time:</span>
                    <div className="font-bold text-green-400">{computerTimeFactors[selectedJobType].base}ms</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">💰 Base Cost:</span>
                    <div className="font-bold text-yellow-400">{computerTimeFactors[selectedJobType].cost} ETH/job</div>
                  </div>
                </div>
              </motion.div>
            )}
          </CardContent>
          
          <CardFooter className="flex-col items-stretch gap-4 pt-6">
            <Button 
              type="submit" 
              disabled={isLoading || !isConnected} 
              className="w-full h-14 quantum-button font-semibold text-base"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-3 h-5 w-5 animate-spin" /> 
                  Processing Transaction...
                </>
              ) : (
                <>
                  <Terminal className="mr-3 h-5 w-5" />
                  Submit Job to Blockchain
                </>
              )}
            </Button>

            <AnimatePresence>
              {!isConnected && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Alert className="border-yellow-500/20 bg-yellow-500/5">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    <AlertDescription className="text-foreground">
                      <div className="font-semibold text-yellow-500 mb-1">🔐 Wallet Connection Required</div>
                      Connect your wallet to submit quantum jobs and record results on the ultra-fast MegaETH blockchain for permanent verification.
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}
              
              {error && isConnected && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Alert className="border-red-500/20 bg-red-500/5">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <AlertDescription className="text-foreground">
                      <div className="font-semibold text-red-500 mb-1">⚠️ Wallet Connection Issue</div>
                      {error}
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>
          </CardFooter>
        </form>
      </Form>
      
      {/* Quantum Results Display */}
      <QuantumResultsDisplay 
        jobId={currentJobId} 
        onClose={() => setCurrentJobId(null)} 
      />
    </Card>
  );
}