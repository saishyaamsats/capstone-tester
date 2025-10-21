"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useWallet } from "@/hooks/use-wallet";
import { useToast } from "@/hooks/use-toast";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Atom, 
  Cpu, 
  Zap, 
  Clock, 
  DollarSign, 
  Activity, 
  Code, 
  MessageSquare, 
  Lightbulb,
  Loader2,
  Terminal,
  AlertTriangle,
  Rocket,
  Brain,
  Sparkles
} from "lucide-react";
import QuantumResultsDisplay from "@/components/quantum-results-display";
import AIChatWidget from "@/components/ai-chat-widget";
import { blockchainIntegration } from "@/lib/blockchain-integration";

const formSchema = z.object({
  jobType: z.string().min(1, { message: "Please select a quantum provider." }),
  description: z.string().min(10, { message: "Description must be at least 10 characters." }),
  submissionType: z.enum(["prompt", "qasm", "preset"]),
  priority: z.enum(["low", "medium", "high"]),
});

const quantumProviders = [
  { 
    id: "Google Willow", 
    name: "Google Willow", 
    qubits: 105, 
    description: "Error-corrected quantum processor",
    icon: "🔵",
    latency: "< 50ms"
  },
  { 
    id: "IBM Condor", 
    name: "IBM Condor", 
    qubits: 1121, 
    description: "Large-scale quantum system",
    icon: "🔷",
    latency: "< 100ms"
  },
  { 
    id: "Amazon Braket", 
    name: "Amazon Braket", 
    qubits: 256, 
    description: "Multi-provider quantum cloud",
    icon: "🟠",
    latency: "< 75ms"
  },
];

const presetAlgorithms = [
  {
    id: "bell-state",
    name: "Bell State Creation",
    description: "Create quantum entanglement between two qubits",
    difficulty: "Beginner",
    qubits: 2,
    icon: "🔗",
    qasm: `OPENQASM 2.0;
include "qelib1.inc";
qreg q[2];
creg c[2];
h q[0];
cx q[0],q[1];
measure q -> c;`
  },
  {
    id: "grover-search",
    name: "Grover's Search",
    description: "Quantum database search algorithm",
    difficulty: "Intermediate",
    qubits: 2,
    icon: "🔍",
    qasm: `OPENQASM 2.0;
include "qelib1.inc";
qreg q[2];
creg c[2];
h q[0];
h q[1];
cz q[0],q[1];
h q[0];
h q[1];
measure q -> c;`
  },
  {
    id: "superposition",
    name: "Quantum Superposition",
    description: "Put qubits in multiple states simultaneously",
    difficulty: "Beginner",
    qubits: 3,
    icon: "🌊",
    qasm: `OPENQASM 2.0;
include "qelib1.inc";
qreg q[3];
creg c[3];
h q[0];
h q[1];
h q[2];
measure q -> c;`
  }
];

export default function CreatePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [showAIHelp, setShowAIHelp] = useState(false);
  const [aiHelpMessage, setAIHelpMessage] = useState<string>("");
  const { isConnected, signer, provider, error, clearError } = useWallet();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      jobType: "",
      description: "",
      submissionType: "preset",
      priority: "medium",
    },
  });

  const selectedJobType = form.watch("jobType");
  const descriptionValue = form.watch("description");
  const priority = form.watch("priority");

  const handlePresetSelect = (presetId: string) => {
    const preset = presetAlgorithms.find(p => p.id === presetId);
    if (preset) {
      setSelectedPreset(presetId);
      form.setValue("description", preset.qasm);
      form.setValue("submissionType", "qasm");
      form.setValue("jobType", "Google Willow"); // Default provider
    }
  };

  const getAIHelp = (topic: string) => {
    const helpMessages = {
      'bell-state': 'Explain Bell state creation and what results to expect',
      'grover-search': 'How does Grover\'s algorithm work and why is it faster?',
      'superposition': 'What is quantum superposition and how do I create it?',
      'providers': 'Compare quantum providers and help me choose the best one',
      'qasm': 'Help me understand QASM quantum programming language',
      'natural': 'How do I describe quantum algorithms in natural language?'
    };
    
    const message = helpMessages[topic as keyof typeof helpMessages] || 
                   'Help me understand quantum computing concepts';
    
    setAIHelpMessage(message);
    setShowAIHelp(true);
  };
  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!signer) {
      toast({
        variant: "destructive",
        title: "Wallet Required",
        description: "Please connect your wallet to submit quantum jobs.",
      });
      return;
    }

    setIsLoading(true);
    clearError();
    
    try {
      toast({
        title: "Submitting Job 🚀",
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
        title: "Success! 🎉",
        description: "Your quantum job has been submitted and logged on the blockchain.",
      });

      form.reset({
        jobType: "",
        description: "",
        submissionType: "preset",
        priority: "medium",
      });
      setSelectedPreset(null);
      
    } catch (error: any) {
      
      let errorMessage = "Job submission failed.";
      
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
        title: "Submission Error",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold font-headline bg-gradient-to-r from-primary via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
          Quantum Computing Studio
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Create and execute quantum algorithms on real quantum computers with blockchain verification
        </p>
      </motion.div>

      {/* Main Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <Card className="quantum-card shadow-2xl max-w-4xl mx-auto">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-purple-500/5">
            <CardTitle className="text-2xl flex items-center gap-3">
              <Rocket className="h-6 w-6 text-primary" />
              Create Quantum Job
            </CardTitle>
            <CardDescription>
              Choose your quantum provider and algorithm to execute on real quantum hardware
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
                
                {/* Provider Selection */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Cpu className="h-5 w-5 text-primary" />
                    Select Quantum Provider
                  </h3>
                  <FormField
                    control={form.control}
                    name="jobType"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="grid gap-4 md:grid-cols-3">
                            {quantumProviders.map((provider) => (
                              <motion.div
                                key={provider.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <Card 
                                  className={`cursor-pointer transition-all duration-300 ${
                                    field.value === provider.id 
                                      ? 'border-primary bg-primary/10' 
                                      : 'border-border hover:border-primary/50'
                                  }`}
                                  onClick={() => field.onChange(provider.id)}
                                >
                                  <CardContent className="p-4 text-center">
                                    <div className="text-3xl mb-2">{provider.icon}</div>
                                    <h4 className="font-semibold text-foreground">{provider.name}</h4>
                                    <p className="text-xs text-muted-foreground mb-2">{provider.description}</p>
                                    <div className="space-y-1">
                                      <Badge variant="outline" className="text-blue-400 border-blue-400/50">
                                        {provider.qubits} qubits
                                      </Badge>
                                      <div className="text-xs text-green-400">{provider.latency}</div>
                                    </div>
                                  </CardContent>
                                </Card>
                              </motion.div>
                            ))}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Algorithm Input */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Code className="h-5 w-5 text-primary" />
                    Define Your Algorithm
                  </h3>
                  
                  <Tabs 
                    defaultValue="preset" 
                    onValueChange={(value) => {
                      form.setValue('submissionType', value as "prompt" | "qasm" | "preset");
                      if (value !== "preset") {
                        setSelectedPreset(null);
                      }
                    }}
                  >
                    <TabsList className="grid w-full grid-cols-3 bg-muted/30 h-12">
                      <TabsTrigger value="preset" className="flex items-center gap-2">
                        <Lightbulb className="h-4 w-4" />
                        Quick Start
                      </TabsTrigger>
                      <TabsTrigger value="prompt" className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Describe
                      </TabsTrigger>
                      <TabsTrigger value="qasm" className="flex items-center gap-2">
                        <Code className="h-4 w-4" />
                        Code
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="preset" className="mt-6">
                      <div className="space-y-4">
                        <p className="text-center text-muted-foreground">
                          Choose from ready-to-use quantum algorithms
                        </p>
                        
                        <div className="grid gap-4 md:grid-cols-3">
                          {presetAlgorithms.map((preset) => (
                            <motion.div
                              key={preset.id}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <Card
                                className={`cursor-pointer transition-all duration-300 ${
                                  selectedPreset === preset.id 
                                    ? 'border-primary bg-primary/10' 
                                    : 'border-border hover:border-primary/50'
                                }`}
                                onClick={() => handlePresetSelect(preset.id)}
                              >
                                <CardContent className="p-4 text-center">
                                  <div className="text-3xl mb-2">{preset.icon}</div>
                                  <h4 className="font-semibold text-foreground mb-1">{preset.name}</h4>
                                  <p className="text-xs text-muted-foreground mb-3">{preset.description}</p>
                                  <div className="flex justify-center gap-2">
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
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      getAIHelp(preset.id);
                                    }}
                                    className="mt-2 w-full"
                                  >
                                    <Brain className="h-3 w-3 mr-1" />
                                    AI Explain
                                  </Button>
                                </CardContent>
                              </Card>
                            </motion.div>
                          ))}
                        </div>
                        
                        {selectedPreset && (
                          <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Generated Quantum Circuit</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    className="quantum-input min-h-[120px] font-mono text-sm bg-muted/20" 
                                    readOnly
                                    {...field} 
                                  />
                                </FormControl>
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
                            <FormLabel>Describe Your Quantum Algorithm</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Example: Create a Bell state circuit with Hadamard and CNOT gates to demonstrate quantum entanglement" 
                                className="quantum-input min-h-[120px]" 
                                {...field} 
                              />
                            </FormControl>
                            <div className="text-xs text-muted-foreground">
                              Describe what you want your quantum algorithm to do in plain English
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
                            <FormLabel>QASM Circuit Code</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder={`OPENQASM 2.0;
include "qelib1.inc";
qreg q[2];
creg c[2];
h q[0];
cx q[0],q[1];
measure q -> c;`} 
                                className="quantum-input min-h-[120px] font-mono text-sm" 
                                {...field} 
                              />
                            </FormControl>
                            <div className="text-xs text-muted-foreground">
                              Write your quantum circuit in OpenQASM format
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </TabsContent>
                  </Tabs>
                </div>

                {/* Priority Selection */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    Execution Priority
                  </h3>
                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="grid gap-4 md:grid-cols-3">
                            {[
                              { value: "low", label: "Standard", desc: "Normal queue processing", color: "green" },
                              { value: "medium", label: "Priority", desc: "Faster execution", color: "yellow" },
                              { value: "high", label: "Express", desc: "Immediate processing", color: "red" }
                            ].map((option) => (
                              <Card 
                                key={option.value}
                                className={`cursor-pointer transition-all duration-300 ${
                                  field.value === option.value 
                                    ? 'border-primary bg-primary/10' 
                                    : 'border-border hover:border-primary/50'
                                }`}
                                onClick={() => field.onChange(option.value)}
                              >
                                <CardContent className="p-4 text-center">
                                  <Badge variant="outline" className={`text-${option.color}-400 border-${option.color}-400/50 mb-2`}>
                                    {option.label}
                                  </Badge>
                                  <p className="text-sm text-muted-foreground">{option.desc}</p>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Execution Estimates */}
                {selectedJobType && descriptionValue && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 rounded-xl bg-gradient-to-r from-primary/5 to-purple-500/5 border border-primary/20"
                  >
                    <h4 className="font-semibold text-primary mb-4 flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      Execution Estimates
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <Clock className="h-6 w-6 text-blue-400 mx-auto mb-2" />
                        <div className="text-sm text-muted-foreground">Estimated Time</div>
                        <div className="text-lg font-bold text-blue-400">5-15 seconds</div>
                      </div>
                      <div className="text-center">
                        <DollarSign className="h-6 w-6 text-green-400 mx-auto mb-2" />
                        <div className="text-sm text-muted-foreground">Compute Cost</div>
                        <div className="text-lg font-bold text-green-400">0.001 ETH</div>
                      </div>
                      <div className="text-center">
                        <Atom className="h-6 w-6 text-purple-400 mx-auto mb-2" />
                        <div className="text-sm text-muted-foreground">Qubits Used</div>
                        <div className="text-lg font-bold text-purple-400">2-5</div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Submit Button */}
                <div className="space-y-4">
                  <Button 
                    type="submit" 
                    disabled={isLoading || !isConnected || !selectedJobType || !descriptionValue} 
                    className="w-full h-14 quantum-button font-semibold text-lg"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-3 h-5 w-5 animate-spin" /> 
                        Submitting to Blockchain...
                      </>
                    ) : (
                      <>
                        <Terminal className="mr-3 h-5 w-5" />
                        Execute Quantum Algorithm
                      </>
                    )}
                  </Button>

                  {/* AI Help Button */}
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => getAIHelp('providers')}
                      className="flex-1"
                    >
                      <Brain className="mr-2 h-4 w-4" />
                      AI Provider Guide
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => getAIHelp('qasm')}
                      className="flex-1"
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                      AI QASM Help
                    </Button>
                  </div>
                  {!isConnected && (
                    <Alert className="border-yellow-500/30 bg-yellow-500/10">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      <AlertDescription className="text-foreground">
                        <div className="font-semibold text-yellow-400 mb-1">Wallet Connection Required</div>
                        Connect your wallet to submit quantum jobs and record results on the MegaETH blockchain.
                      </AlertDescription>
                    </Alert>
                  )}
                  
                  {error && isConnected && (
                    <Alert className="border-red-500/30 bg-red-500/10">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <AlertDescription className="text-foreground">
                        <div className="font-semibold text-red-400 mb-1">Connection Issue</div>
                        {error}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Quantum Results Display */}
      <QuantumResultsDisplay 
        jobId={currentJobId} 
        onClose={() => setCurrentJobId(null)} 
      />
      
      {/* AI Help Widget */}
      <AIChatWidget
        isOpen={showAIHelp}
        onToggle={() => setShowAIHelp(!showAIHelp)}
        initialMessage={aiHelpMessage}
      />
    </div>
  );
}