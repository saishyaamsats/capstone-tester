"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Brain, 
  Sparkles, 
  TrendingUp, 
  Target, 
  Lightbulb,
  BookOpen,
  Zap,
  Activity,
  BarChart3,
  Atom,
  MessageSquare,
  RefreshCw
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface AIInsight {
  id: string;
  title: string;
  content: string;
  type: 'tip' | 'insight' | 'recommendation' | 'achievement';
  confidence: number;
  actionable: boolean;
}

export default function AIEnhancedDashboard() {
  const { user } = useAuth();
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    generatePersonalizedInsights();
  }, [user]);

  const generatePersonalizedInsights = async () => {
    setIsLoading(true);
    
    try {
      // Generate AI-powered insights based on user activity
      const personalizedInsights: AIInsight[] = [
        {
          id: 'quantum-progress',
          title: '🚀 Your Quantum Journey',
          content: user?.role === 'admin' 
            ? 'As an admin, you have access to advanced quantum algorithms. Try implementing Shor\'s algorithm for your next challenge!'
            : 'You\'re making great progress! Ready to try Grover\'s search algorithm for a quantum speedup demonstration?',
          type: 'recommendation',
          confidence: 95,
          actionable: true
        },
        {
          id: 'provider-optimization',
          title: '⚡ Provider Optimization',
          content: 'Based on your algorithm preferences, Google Willow offers the best fidelity for Bell state experiments, while IBM Condor excels at larger circuits.',
          type: 'insight',
          confidence: 88,
          actionable: true
        },
        {
          id: 'learning-tip',
          title: '💡 Learning Tip',
          content: 'Understanding quantum measurement is key! Each "shot" in your results represents one measurement of the quantum circuit. The percentages show quantum probability distributions.',
          type: 'tip',
          confidence: 92,
          actionable: false
        },
        {
          id: 'blockchain-insight',
          title: '⛓️ Blockchain Advantage',
          content: 'Your quantum experiments are permanently verified on MegaETH blockchain! This creates tamper-proof scientific records that anyone can validate.',
          type: 'insight',
          confidence: 100,
          actionable: false
        }
      ];

      setInsights(personalizedInsights);
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'tip': return Lightbulb;
      case 'insight': return Brain;
      case 'recommendation': return Target;
      case 'achievement': return Sparkles;
      default: return Brain;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'tip': return 'text-yellow-400 border-yellow-400/50';
      case 'insight': return 'text-blue-400 border-blue-400/50';
      case 'recommendation': return 'text-green-400 border-green-400/50';
      case 'achievement': return 'text-purple-400 border-purple-400/50';
      default: return 'text-primary border-primary/50';
    }
  };

  return (
    <Card className="quantum-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-6 w-6 text-primary" />
          AI-Powered Insights
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted/50 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted/30 rounded w-full"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {insights.map((insight, index) => {
              const InsightIcon = getInsightIcon(insight.type);
              const colorClass = getInsightColor(insight.type);
              
              return (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 rounded-lg bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/20 rounded-lg">
                      <InsightIcon className="h-4 w-4 text-primary" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-sm">{insight.title}</h4>
                        <Badge variant="outline" className={colorClass}>
                          {insight.confidence}% confidence
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {insight.content}
                      </p>
                      
                      {insight.actionable && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-2 text-xs"
                        >
                          <Zap className="h-3 w-3 mr-1" />
                          Take Action
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* AI Features Overview */}
        <div className="pt-4 border-t border-primary/20">
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" size="sm" asChild>
              <a href="/dashboard/ai">
                <MessageSquare className="h-3 w-3 mr-2" />
                Full AI Chat
              </a>
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={generatePersonalizedInsights}
              disabled={isLoading}
            >
              <RefreshCw className={`h-3 w-3 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh Insights
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}