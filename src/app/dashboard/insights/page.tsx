"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Brain, 
  TrendingUp, 
  Target, 
  BarChart3,
  Atom,
  Zap,
  Clock,
  DollarSign,
  Activity,
  Lightbulb,
  RefreshCw,
  Sparkles,
  BookOpen
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import AIQuantumExplainer from "@/components/ai-quantum-explainer";

interface ExecutionInsight {
  algorithmName: string;
  provider: string;
  executionTime: {
    simulated: number;
    real: number;
    improvement: number;
  };
  resourceUsage: {
    qubits: number;
    gates: number;
    circuitDepth: number;
    fidelity: number;
  };
  performance: {
    efficiency: number;
    accuracy: number;
    scalability: number;
    complexity: string;
  };
  costAnalysis: {
    megaethCost: number;
    computeCost: number;
    totalCost: number;
  };
  runCount: number;
  lastRun: number;
}

interface AIInsights {
  fastest: string;
  mostEfficient: string;
  mostAccurate: string;
  recommendation: string;
  trends: {
    averageImprovement: number;
    totalExecutions: number;
    averageFidelity: number;
  };
}

export default function InsightsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [insights, setInsights] = useState<{
    metrics: ExecutionInsight[];
    insights: AIInsights;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [aiAnalysis, setAIAnalysis] = useState<string>("");

  useEffect(() => {
    fetchExecutionInsights();
  }, [selectedTimeRange]);

  const fetchExecutionInsights = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/execution-insights?timeRange=${selectedTimeRange}`);
      const data = await response.json();
      setInsights(data);
      
      // Generate AI analysis
      generateAIAnalysis(data);
      
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Insights Error",
        description: "Failed to load execution insights. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateAIAnalysis = async (data: any) => {
    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: 'Analyze my quantum computing performance and provide insights',
          context: { 
            insights: data,
            userLevel: user?.role === 'admin' ? 'advanced' : 'intermediate'
          }
        })
      });

      if (response.ok) {
        const aiResponse = await response.json();
        setAIAnalysis(aiResponse.answer);
      }
    } catch (error) {
    }
  };

  const getPerformanceColor = (value: number) => {
    if (value >= 95) return 'text-green-400';
    if (value >= 85) return 'text-yellow-400';
    if (value >= 70) return 'text-orange-400';
    return 'text-red-400';
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
          AI-Powered Quantum Insights
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          SpikingBrain analyzes your quantum experiments to provide personalized insights, performance optimization, and learning recommendations
        </p>
      </motion.div>

      {/* Time Range Selector */}
      <div className="flex justify-center">
        <div className="flex gap-2 p-1 bg-muted/30 rounded-lg">
          {['1d', '7d', '30d', '90d'].map((range) => (
            <Button
              key={range}
              variant={selectedTimeRange === range ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setSelectedTimeRange(range)}
            >
              {range}
            </Button>
          ))}
        </div>
      </div>

      <Tabs defaultValue="performance" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-muted/30 h-12">
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="learning" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Learning
          </TabsTrigger>
          <TabsTrigger value="concepts" className="flex items-center gap-2">
            <Atom className="h-4 w-4" />
            Concepts
          </TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="mt-6">
          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="quantum-card">
                  <CardContent className="p-6">
                    <div className="animate-pulse space-y-4">
                      <div className="h-4 bg-muted/50 rounded w-3/4"></div>
                      <div className="h-8 bg-muted/50 rounded"></div>
                      <div className="h-4 bg-muted/50 rounded w-1/2"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : insights ? (
            <div className="space-y-8">
              {/* AI Analysis Summary */}
              {aiAnalysis && (
                <Card className="quantum-card border-primary/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-6 w-6 text-primary" />
                      SpikingBrain Performance Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="p-4 rounded-lg bg-gradient-to-r from-primary/5 to-purple-500/5 border border-primary/20">
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {aiAnalysis}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Performance Metrics Grid */}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {insights.metrics.map((metric, index) => (
                  <motion.div
                    key={metric.algorithmName}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="quantum-card hover:scale-105 transition-all duration-300 h-full">
                      <CardHeader className="pb-4">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Atom className="h-5 w-5 text-primary" />
                          {metric.algorithmName}
                        </CardTitle>
                        <CardDescription>{metric.provider}</CardDescription>
                      </CardHeader>
                      
                      <CardContent className="space-y-4">
                        {/* Performance Scores */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="text-center">
                            <div className={`text-2xl font-bold ${getPerformanceColor(metric.performance.efficiency)}`}>
                              {metric.performance.efficiency}%
                            </div>
                            <div className="text-xs text-muted-foreground">Efficiency</div>
                          </div>
                          <div className="text-center">
                            <div className={`text-2xl font-bold ${getPerformanceColor(metric.resourceUsage.fidelity)}`}>
                              {metric.resourceUsage.fidelity.toFixed(1)}%
                            </div>
                            <div className="text-xs text-muted-foreground">Fidelity</div>
                          </div>
                        </div>

                        {/* Execution Metrics */}
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Execution Time:</span>
                            <span className="font-medium text-green-400">{metric.executionTime.real.toFixed(1)}ms</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Qubits Used:</span>
                            <span className="font-medium text-blue-400">{metric.resourceUsage.qubits}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Total Cost:</span>
                            <span className="font-medium text-purple-400">{metric.costAnalysis.totalCost.toFixed(4)} ETH</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Runs:</span>
                            <span className="font-medium">{metric.runCount}</span>
                          </div>
                        </div>

                        {/* Complexity Badge */}
                        <Badge variant="outline" className={
                          metric.performance.complexity === 'Low' ? 'text-green-400 border-green-400/50' :
                          metric.performance.complexity === 'Medium' ? 'text-yellow-400 border-yellow-400/50' :
                          'text-red-400 border-red-400/50'
                        }>
                          {metric.performance.complexity} Complexity
                        </Badge>

                        {/* AI Insight Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => getAIHelp(`Explain ${metric.algorithmName} performance and optimization tips`)}
                        >
                          <Brain className="h-3 w-3 mr-2" />
                          AI Insights
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* AI Recommendations */}
              <Card className="quantum-card border-green-500/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-400">
                    <Lightbulb className="h-6 w-6" />
                    SpikingBrain Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Alert className="border-green-500/20 bg-green-500/5">
                    <Sparkles className="h-4 w-4" />
                    <AlertDescription>
                      <div className="font-semibold text-green-400 mb-2">AI Recommendation</div>
                      <div className="text-green-200/90">{insights.insights.recommendation}</div>
                    </AlertDescription>
                  </Alert>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 text-center">
                      <Target className="h-6 w-6 text-blue-400 mx-auto mb-2" />
                      <div className="text-sm text-blue-200 mb-1">Fastest Algorithm</div>
                      <div className="font-bold text-blue-100">{insights.insights.fastest}</div>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-center">
                      <Zap className="h-6 w-6 text-green-400 mx-auto mb-2" />
                      <div className="text-sm text-green-200 mb-1">Most Efficient</div>
                      <div className="font-bold text-green-100">{insights.insights.mostEfficient}</div>
                    </div>
                    
                    <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20 text-center">
                      <Activity className="h-6 w-6 text-purple-400 mx-auto mb-2" />
                      <div className="text-sm text-purple-200 mb-1">Most Accurate</div>
                      <div className="font-bold text-purple-100">{insights.insights.mostAccurate}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="quantum-card">
              <CardContent className="p-12 text-center">
                <Brain className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-muted-foreground mb-2">No Insights Available</h3>
                <p className="text-muted-foreground">
                  Submit some quantum jobs to see AI-powered performance insights and recommendations.
                </p>
                <Button className="mt-4" asChild>
                  <a href="/dashboard/create">Submit Your First Job</a>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="learning" className="mt-6">
          <div className="space-y-6">
            {/* AI Learning Assistant */}
            <Card className="quantum-card border-primary/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-6 w-6 text-primary" />
                  Personalized Learning Path
                </CardTitle>
                <CardDescription>
                  SpikingBrain creates a custom learning journey based on your progress
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <Alert className="border-blue-500/30 bg-blue-500/5">
                  <BookOpen className="h-4 w-4" />
                  <AlertDescription>
                    <div className="font-semibold text-blue-400 mb-2">
                      📚 Your Learning Level: {user?.role === 'admin' ? 'Advanced' : 'Intermediate'}
                    </div>
                    <div className="text-blue-200/90">
                      {user?.role === 'admin' 
                        ? 'As an advanced user, focus on quantum error correction, hybrid algorithms, and optimization techniques.'
                        : 'You\'re ready for intermediate concepts! Try Grover\'s algorithm and quantum Fourier transforms next.'
                      }
                    </div>
                  </AlertDescription>
                </Alert>

                <div className="grid gap-4">
                  {[
                    { title: 'Next Challenge', desc: 'Grover\'s Search Algorithm', difficulty: 'Intermediate', icon: Target },
                    { title: 'Skill Building', desc: 'Quantum Error Correction', difficulty: 'Advanced', icon: Zap },
                    { title: 'Deep Dive', desc: 'Quantum Fourier Transform', difficulty: 'Advanced', icon: Activity }
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 border border-primary/10"
                    >
                      <item.icon className="h-5 w-5 text-primary" />
                      <div className="flex-1">
                        <div className="font-medium text-sm">{item.title}</div>
                        <div className="text-xs text-muted-foreground">{item.desc}</div>
                      </div>
                      <Badge variant="outline" className={
                        item.difficulty === 'Beginner' ? 'text-green-400 border-green-400/50' :
                        item.difficulty === 'Intermediate' ? 'text-yellow-400 border-yellow-400/50' :
                        'text-red-400 border-red-400/50'
                      }>
                        {item.difficulty}
                      </Badge>
                    </motion.div>
                  ))}
                </div>

                <Button className="w-full quantum-button" asChild>
                  <a href="/dashboard/ai">
                    <Brain className="h-4 w-4 mr-2" />
                    Get Personalized AI Guidance
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="concepts" className="mt-6">
          <AIQuantumExplainer />
        </TabsContent>
      </Tabs>
    </div>
  );
}