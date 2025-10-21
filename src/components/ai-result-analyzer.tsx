"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Brain, 
  Sparkles, 
  Target, 
  BookOpen, 
  TrendingUp,
  Lightbulb,
  RefreshCw,
  Copy,
  ExternalLink,
  Atom,
  Zap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AIResultAnalyzerProps {
  results: {
    measurements: Record<string, number>;
    fidelity: string;
    executionTime: string;
    circuitDepth: number;
    shots: number;
    algorithm: string;
    provider: string;
  };
  onClose?: () => void;
}

export default function AIResultAnalyzer({ results, onClose }: AIResultAnalyzerProps) {
  const { toast } = useToast();
  const [analysis, setAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showFullAnalysis, setShowFullAnalysis] = useState(false);

  const analyzeResults = async () => {
    setIsAnalyzing(true);
    
    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Analyze my quantum computing results`,
          context: { results },
          analysisType: 'quantum_results'
        })
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const aiResponse = await response.json();
      setAnalysis(aiResponse);
      setShowFullAnalysis(true);
      
      toast({
        title: "AI Analysis Complete! 🧠",
        description: "SpikingBrain has analyzed your quantum results",
      });

    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Analysis Error",
        description: "SpikingBrain couldn't analyze the results. Please try again.",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copyAnalysis = () => {
    if (analysis) {
      navigator.clipboard.writeText(analysis.answer);
      toast({
        title: "Analysis Copied! 📋",
        description: "AI analysis copied to clipboard",
      });
    }
  };

  const getAlgorithmInsight = () => {
    const algorithm = results.algorithm.toLowerCase();
    
    if (algorithm.includes('bell')) {
      const entangledStates = (results.measurements['00'] || 0) + (results.measurements['11'] || 0);
      const entanglementRatio = entangledStates / results.shots;
      
      return {
        title: "🔗 Bell State Entanglement",
        insight: `${(entanglementRatio * 100).toFixed(1)}% entanglement achieved!`,
        explanation: "Your qubits are quantum mechanically connected - measuring one instantly affects the other.",
        color: "text-blue-400 border-blue-400/50"
      };
    }
    
    if (algorithm.includes('grover')) {
      const maxState = Object.entries(results.measurements)
        .sort(([,a], [,b]) => b - a)[0];
      const amplification = (maxState[1] / results.shots) / 0.25; // vs random 25%
      
      return {
        title: "🔍 Grover's Search Success",
        insight: `${amplification.toFixed(1)}x quantum speedup achieved!`,
        explanation: "Your algorithm found the target faster than any classical search could.",
        color: "text-green-400 border-green-400/50"
      };
    }
    
    if (algorithm.includes('superposition')) {
      const stateCount = Object.keys(results.measurements).length;
      
      return {
        title: "🌊 Quantum Superposition",
        insight: `${stateCount} quantum states created simultaneously!`,
        explanation: "Your qubits exist in multiple states at once - the foundation of quantum advantage.",
        color: "text-purple-400 border-purple-400/50"
      };
    }
    
    return {
      title: "⚛️ Quantum Algorithm",
      insight: `${results.fidelity} fidelity achieved!`,
      explanation: "Your custom quantum algorithm executed successfully on real quantum hardware.",
      color: "text-primary border-primary/50"
    };
  };

  const algorithmInsight = getAlgorithmInsight();

  return (
    <Card className="quantum-card border-primary/30">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            AI Result Analysis
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Quick Insight */}
        <Alert className={`border-2 ${algorithmInsight.color.split(' ')[1].replace('text-', 'border-')}/30 bg-${algorithmInsight.color.split(' ')[1].replace('text-', '')}/5`}>
          <Atom className="h-4 w-4" />
          <AlertDescription>
            <div className={`font-semibold ${algorithmInsight.color.split(' ')[0]} mb-1`}>
              {algorithmInsight.title}
            </div>
            <div className="text-lg font-bold mb-2">{algorithmInsight.insight}</div>
            <div className="text-sm">{algorithmInsight.explanation}</div>
          </AlertDescription>
        </Alert>

        {/* AI Analysis Button */}
        <div className="text-center">
          <Button 
            onClick={analyzeResults}
            disabled={isAnalyzing}
            className="quantum-button w-full h-12"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                SpikingBrain Analyzing...
              </>
            ) : (
              <>
                <Brain className="mr-2 h-5 w-5" />
                Get AI Analysis
              </>
            )}
          </Button>
        </div>

        {/* Full AI Analysis */}
        <AnimatePresence>
          {showFullAnalysis && analysis && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4"
            >
              <div className="p-6 rounded-xl bg-gradient-to-r from-primary/5 to-purple-500/5 border border-primary/20">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-primary flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    SpikingBrain Analysis
                  </h4>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-green-400 border-green-400/50">
                      {analysis.confidence}% Confidence
                    </Badge>
                    <Button variant="ghost" size="sm" onClick={copyAnalysis}>
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {analysis.answer}
                </div>

                {/* Related Concepts */}
                {analysis.relatedConcepts && analysis.relatedConcepts.length > 0 && (
                  <div className="mt-4">
                    <div className="text-xs font-medium text-muted-foreground mb-2">🔗 Related Concepts:</div>
                    <div className="flex flex-wrap gap-2">
                      {analysis.relatedConcepts.map((concept: string, index: number) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {concept}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sources */}
                {analysis.sources && analysis.sources.length > 0 && (
                  <div className="mt-3 text-xs text-muted-foreground">
                    📚 Sources: {analysis.sources.join(', ')}
                  </div>
                )}
              </div>

              {/* Follow-up Actions */}
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" asChild>
                  <a href="/dashboard/ai">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Ask More Questions
                  </a>
                </Button>
                <Button variant="outline" onClick={() => setShowFullAnalysis(false)}>
                  <Target className="h-4 w-4 mr-2" />
                  Hide Analysis
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Educational Tips */}
        <div className="p-4 rounded-lg bg-gradient-to-r from-green-500/5 to-green-600/10 border border-green-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="h-4 w-4 text-green-400" />
            <span className="text-sm font-medium text-green-200">💡 AI Learning Tip</span>
          </div>
          <p className="text-xs text-green-200/80">
            Ask SpikingBrain specific questions about your results! Try: "Why do I see mostly |00⟩ and |11⟩ states?" 
            or "How can I improve my quantum fidelity?"
          </p>
        </div>
      </CardContent>
    </Card>
  );
}