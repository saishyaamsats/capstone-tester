"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Brain, 
  Send, 
  Sparkles, 
  BookOpen, 
  Lightbulb,
  Atom,
  MessageSquare,
  Zap,
  Target,
  TrendingUp,
  Clock,
  RefreshCw,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Star,
  Cpu,
  Globe
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

interface AIMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: number;
  confidence?: number;
  sources?: string[];
  relatedConcepts?: string[];
  followUpQuestions?: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

interface QuickAction {
  id: string;
  label: string;
  icon: any;
  prompt: string;
  category: 'quantum' | 'blockchain' | 'platform';
}

const quickActions: QuickAction[] = [
  {
    id: 'explain-superposition',
    label: 'Explain Superposition',
    icon: Atom,
    prompt: 'What is quantum superposition and how does it work?',
    category: 'quantum'
  },
  {
    id: 'explain-entanglement',
    label: 'Quantum Entanglement',
    icon: Zap,
    prompt: 'Explain quantum entanglement in simple terms',
    category: 'quantum'
  },
  {
    id: 'bell-state-help',
    label: 'Bell State Results',
    icon: Target,
    prompt: 'Help me understand my Bell state experiment results',
    category: 'quantum'
  },
  {
    id: 'blockchain-basics',
    label: 'Blockchain Basics',
    icon: Globe,
    prompt: 'How does blockchain verification work in QuantumChain?',
    category: 'blockchain'
  },
  {
    id: 'provider-comparison',
    label: 'Provider Guide',
    icon: Cpu,
    prompt: 'Compare quantum providers and help me choose the best one',
    category: 'platform'
  },
  {
    id: 'learning-path',
    label: 'Learning Path',
    icon: BookOpen,
    prompt: 'Create a personalized quantum computing learning path for me',
    category: 'platform'
  }
];

export default function AIPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'quantum' | 'blockchain' | 'platform'>('all');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Add welcome message
    const welcomeMessage: AIMessage = {
      id: 'welcome',
      type: 'ai',
      content: `🧠 **Welcome to SpikingBrain 1.0!**\n\nI'm your open-source AI assistant specialized in quantum computing and blockchain technology! I'm here to help you:\n\n🔬 **Understand Quantum Results:** I can analyze your quantum experiments and explain what they mean\n⚛️ **Learn Quantum Concepts:** From superposition to entanglement, I'll make quantum physics accessible\n⛓️ **Master Blockchain:** Understand how blockchain verification protects your quantum experiments\n🚀 **Navigate QuantumChain:** Get the most out of every platform feature\n\n**Quick Start:** Try clicking one of the quick action buttons below, or ask me anything about quantum computing!\n\n*I'm completely open-source and designed to make quantum computing accessible to everyone.*`,
      timestamp: Date.now(),
      confidence: 100,
      sources: ['SpikingBrain 1.0 Knowledge Base'],
      relatedConcepts: ['Quantum Computing', 'Blockchain Technology', 'AI Education'],
      followUpQuestions: [
        'How do quantum computers work?',
        'What makes QuantumChain special?',
        'How do I interpret quantum results?',
        'What should I learn first?'
      ],
      difficulty: 'beginner'
    };
    
    setMessages([welcomeMessage]);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = async (messageText?: string) => {
    const text = messageText || inputMessage.trim();
    if (!text || isLoading) return;

    const userMessage: AIMessage = {
      id: `user_${Date.now()}`,
      type: 'user',
      content: text,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          context: {
            userLevel: user?.role === 'admin' ? 'advanced' : 'intermediate',
            conversationHistory: messages.slice(-3)
          }
        })
      });

      if (!response.ok) {
        throw new Error('AI service temporarily unavailable');
      }

      const aiResponse = await response.json();
      
      const aiMessage: AIMessage = {
        id: `ai_${Date.now()}`,
        type: 'ai',
        content: aiResponse.answer,
        timestamp: Date.now(),
        confidence: aiResponse.confidence,
        sources: aiResponse.sources,
        relatedConcepts: aiResponse.relatedConcepts,
        followUpQuestions: aiResponse.followUpQuestions,
        difficulty: aiResponse.difficulty
      };

      setMessages(prev => [...prev, aiMessage]);

    } catch (error: any) {
      
      const errorMessage: AIMessage = {
        id: `error_${Date.now()}`,
        type: 'ai',
        content: `🤖 **SpikingBrain Temporarily Unavailable**\n\nI'm experiencing some technical difficulties right now. Here are some things you can try:\n\n• Check your internet connection\n• Refresh the page and try again\n• Use the quick action buttons below\n• Explore the quantum computing presets in the Create section\n\nI'll be back online shortly to help you with quantum computing and blockchain questions!`,
        timestamp: Date.now(),
        confidence: 0
      };

      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        variant: "destructive",
        title: "AI Assistant Error",
        description: "SpikingBrain is temporarily unavailable. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action: QuickAction) => {
    sendMessage(action.prompt);
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Message Copied! 📋",
      description: "AI response copied to clipboard",
    });
  };

  const filteredQuickActions = selectedCategory === 'all' 
    ? quickActions 
    : quickActions.filter(action => action.category === selectedCategory);

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
          SpikingBrain 1.0 AI Assistant
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Open-source AI specialized in quantum computing and blockchain technology. 
          Get instant explanations, analyze quantum results, and accelerate your learning journey.
        </p>
        
        <div className="flex items-center justify-center gap-4 mt-6">
          <Badge variant="outline" className="text-green-400 border-green-400/50 px-4 py-2">
            <Brain className="mr-2 h-4 w-4" />
            SpikingBrain 1.0
          </Badge>
          <Badge variant="outline" className="text-blue-400 border-blue-400/50 px-4 py-2">
            <Sparkles className="mr-2 h-4 w-4" />
            Open Source
          </Badge>
          <Badge variant="outline" className="text-purple-400 border-purple-400/50 px-4 py-2">
            <Atom className="mr-2 h-4 w-4" />
            Quantum Specialized
          </Badge>
        </div>
      </motion.div>

      {/* Main AI Interface */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Chat Interface */}
        <div className="lg:col-span-2">
          <Card className="quantum-card h-[600px] flex flex-col">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-6 w-6 text-primary" />
                AI Conversation
              </CardTitle>
              <CardDescription>
                Ask me anything about quantum computing, blockchain, or the QuantumChain platform
              </CardDescription>
            </CardHeader>
            
            <CardContent className="flex-1 flex flex-col p-0">
              {/* Messages */}
              <ScrollArea className="flex-1 p-6">
                <div className="space-y-6">
                  <AnimatePresence>
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`flex gap-4 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        {message.type === 'ai' && (
                          <div className="p-2 bg-primary/20 rounded-xl">
                            <Brain className="h-6 w-6 text-primary" />
                          </div>
                        )}
                        
                        <div className={`max-w-[80%] ${message.type === 'user' ? 'order-first' : ''}`}>
                          <div className={`p-4 rounded-xl ${
                            message.type === 'user' 
                              ? 'bg-primary text-primary-foreground ml-auto' 
                              : 'bg-muted/50 border border-primary/20'
                          }`}>
                            <div className="whitespace-pre-wrap text-sm leading-relaxed">
                              {message.content}
                            </div>
                            
                            {message.type === 'ai' && (
                              <div className="mt-4 space-y-3">
                                {/* Confidence and Sources */}
                                {message.confidence && (
                                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                      <Target className="h-3 w-3" />
                                      <span>Confidence: {message.confidence}%</span>
                                    </div>
                                    {message.sources && (
                                      <div className="flex items-center gap-1">
                                        <BookOpen className="h-3 w-3" />
                                        <span>Sources: {message.sources.join(', ')}</span>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Related Concepts */}
                                {message.relatedConcepts && message.relatedConcepts.length > 0 && (
                                  <div className="flex flex-wrap gap-2">
                                    {message.relatedConcepts.map((concept, index) => (
                                      <Badge 
                                        key={index} 
                                        variant="outline" 
                                        className="text-xs cursor-pointer hover:bg-primary/10"
                                        onClick={() => sendMessage(`Tell me about ${concept}`)}
                                      >
                                        {concept}
                                      </Badge>
                                    ))}
                                  </div>
                                )}

                                {/* Follow-up Questions */}
                                {message.followUpQuestions && message.followUpQuestions.length > 0 && (
                                  <div className="space-y-2">
                                    <div className="text-xs font-medium text-muted-foreground">💡 Follow-up questions:</div>
                                    <div className="space-y-1">
                                      {message.followUpQuestions.map((question, index) => (
                                        <Button
                                          key={index}
                                          variant="ghost"
                                          size="sm"
                                          className="h-auto p-2 text-xs text-left justify-start hover:bg-primary/10 w-full"
                                          onClick={() => sendMessage(question)}
                                        >
                                          <MessageSquare className="h-3 w-3 mr-2 flex-shrink-0" />
                                          {question}
                                        </Button>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {/* Message Actions */}
                                <div className="flex items-center gap-2 pt-2 border-t border-primary/10">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => copyMessage(message.content)}
                                  >
                                    <Copy className="h-3 w-3 mr-1" />
                                    Copy
                                  </Button>
                                  <Button variant="ghost" size="sm">
                                    <ThumbsUp className="h-3 w-3 mr-1" />
                                    Helpful
                                  </Button>
                                  <Button variant="ghost" size="sm">
                                    <ThumbsDown className="h-3 w-3 mr-1" />
                                    Improve
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          <div className="text-xs text-muted-foreground mt-1 px-2">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </div>
                        </div>

                        {message.type === 'user' && (
                          <div className="p-2 bg-blue-500/20 rounded-xl">
                            <MessageSquare className="h-6 w-6 text-blue-400" />
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-4"
                    >
                      <div className="p-2 bg-primary/20 rounded-xl">
                        <Brain className="h-6 w-6 text-primary animate-pulse" />
                      </div>
                      <div className="bg-muted/50 border border-primary/20 p-4 rounded-xl">
                        <div className="flex items-center gap-2">
                          <RefreshCw className="h-4 w-4 animate-spin text-primary" />
                          <span className="text-sm">SpikingBrain is thinking...</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Input Area */}
              <div className="p-6 border-t border-primary/20">
                <div className="flex gap-3">
                  <Input
                    placeholder="Ask me about quantum computing, blockchain, or QuantumChain..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    className="quantum-input flex-1"
                    disabled={isLoading}
                  />
                  <Button 
                    onClick={() => sendMessage()} 
                    disabled={!inputMessage.trim() || isLoading}
                    className="quantum-button"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="quantum-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary" />
                Quick Actions
              </CardTitle>
              <CardDescription>
                Get instant AI help with common quantum computing topics
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Category Filter */}
              <Tabs value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as any)}>
                <TabsList className="grid w-full grid-cols-2 bg-muted/30">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="quantum">Quantum</TabsTrigger>
                </TabsList>
              </Tabs>

              {/* Quick Action Buttons */}
              <div className="space-y-2">
                {filteredQuickActions.map((action) => (
                  <motion.div
                    key={action.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      variant="outline"
                      className="w-full justify-start h-auto p-3 text-left hover:bg-primary/10"
                      onClick={() => handleQuickAction(action)}
                      disabled={isLoading}
                    >
                      <action.icon className="h-4 w-4 mr-3 text-primary" />
                      <div>
                        <div className="font-medium text-sm">{action.label}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {action.prompt}
                        </div>
                      </div>
                    </Button>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI Status */}
          <Card className="quantum-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                SpikingBrain Status
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">AI Model:</span>
                  <Badge variant="outline" className="text-green-400 border-green-400/50">
                    SpikingBrain 1.0
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status:</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-sm font-medium text-green-400">Online</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Specialization:</span>
                  <span className="text-sm font-medium">Quantum + Blockchain</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Conversations:</span>
                  <span className="text-sm font-medium">{Math.max(0, messages.length - 1)}</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="h-4 w-4 text-blue-400" />
                  <span className="text-sm font-medium text-blue-200">Open Source</span>
                </div>
                <p className="text-xs text-blue-200/80">
                  SpikingBrain is completely open-source and designed to democratize quantum computing education.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Learning Resources */}
          <Card className="quantum-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Learning Resources
              </CardTitle>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => sendMessage('Create a beginner learning path for quantum computing')}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Beginner's Path
              </Button>
              
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => sendMessage('Explain quantum algorithms step by step')}
              >
                <Cpu className="h-4 w-4 mr-2" />
                Algorithm Guide
              </Button>
              
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => sendMessage('How do I interpret quantum measurement results?')}
              >
                <Target className="h-4 w-4 mr-2" />
                Result Analysis
              </Button>
              
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => sendMessage('Compare quantum providers and their strengths')}
              >
                <Globe className="h-4 w-4 mr-2" />
                Provider Guide
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}