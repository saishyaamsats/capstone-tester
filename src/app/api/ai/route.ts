import { NextRequest, NextResponse } from 'next/server';
import { spikingBrain, SpikingBrain } from '@/lib/spiking-brain';
import { performanceMonitor } from '@/lib/performance-monitor';
import { advancedErrorHandler, ErrorCategory } from '@/lib/advanced-error-handler';

export async function POST(request: NextRequest) {
  const startTime = performance.now();
  
  try {
    const { message, context, analysisType } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 }
      );
    }

    performanceMonitor.startTimer('ai_query_processing', { 
      messageLength: message.length,
      hasContext: !!context,
      analysisType 
    });

    let response;

    // Handle different types of AI requests
    switch (analysisType) {
      case 'quantum_results':
        if (!context?.results) {
          return NextResponse.json(
            { error: 'Quantum results context required for analysis' },
            { status: 400 }
          );
        }
        response = await spikingBrain.analyzeQuantumResults(context.results);
        break;

      case 'quick_answer':
        const quickAnswer = spikingBrain.getQuickAnswer(message.toLowerCase());
        response = {
          answer: quickAnswer,
          confidence: 90,
          sources: ['SpikingBrain Quick Answers'],
          relatedConcepts: [],
          followUpQuestions: [],
          difficulty: 'beginner'
        };
        break;

      case 'learning_path':
        const userLevel = context?.userLevel || 'beginner';
        const learningPath = spikingBrain.generateLearningPath(userLevel);
        response = {
          answer: `📚 **Your ${userLevel.charAt(0).toUpperCase() + userLevel.slice(1)} Learning Path:**\n\n${learningPath.map((step, i) => `${i + 1}. ${step}`).join('\n')}`,
          confidence: 95,
          sources: ['Educational Curriculum', 'SpikingBrain Learning System'],
          relatedConcepts: ['Quantum Education', 'Progressive Learning', 'Skill Development'],
          followUpQuestions: [
            'How do I start with the first step?',
            'What resources do you recommend?',
            'How long does each step take?'
          ],
          difficulty: userLevel as any
        };
        break;

      default:
        response = await spikingBrain.askQuestion(message, context);
    }

    performanceMonitor.endTimer('ai_query_processing');

    return NextResponse.json({
      ...response,
      timestamp: Date.now(),
      responseTime: performance.now() - startTime,
      spikingBrainVersion: '1.0',
      conversationId: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    });

  } catch (error: any) {
    performanceMonitor.endTimer('ai_query_processing');
    
    const enhancedError = advancedErrorHandler.enhanceError(error, ErrorCategory.SYSTEM, {
      component: 'SpikingBrainAI',
      action: 'POST',
      endpoint: request.url
    });

    return NextResponse.json(
      { 
        error: 'SpikingBrain AI processing failed',
        details: enhancedError.userMessage,
        errorId: enhancedError.id,
        timestamp: Date.now(),
        responseTime: performance.now() - startTime
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'status':
        return NextResponse.json({
          status: 'operational',
          version: '1.0',
          capabilities: [
            'Quantum result analysis',
            'Educational explanations',
            'Algorithm guidance',
            'Blockchain concepts',
            'Platform assistance'
          ],
          knowledgeDomains: [
            'Quantum Computing',
            'Blockchain Technology',
            'QuantumChain Platform',
            'Quantum Algorithms',
            'Quantum Hardware'
          ],
          timestamp: Date.now()
        });

      case 'conversation':
        const conversationHistory = spikingBrain.getConversationContext();
        return NextResponse.json({
          history: conversationHistory,
          totalInteractions: conversationHistory.length,
          timestamp: Date.now()
        });

      case 'quick-help':
        const topic = searchParams.get('topic') || 'general';
        const quickAnswer = spikingBrain.getQuickAnswer(topic);
        return NextResponse.json({
          answer: quickAnswer,
          topic,
          timestamp: Date.now()
        });

      default:
        return NextResponse.json({
          message: 'SpikingBrain 1.0 AI Assistant',
          description: 'Open-source AI specialized in quantum computing and blockchain technology',
          version: '1.0',
          endpoints: {
            'POST /api/ai': 'Ask questions and get AI responses',
            'GET /api/ai?action=status': 'Get AI system status',
            'GET /api/ai?action=conversation': 'Get conversation history',
            'GET /api/ai?action=quick-help&topic=<topic>': 'Get quick help on specific topics'
          },
          timestamp: Date.now()
        });
    }

  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to process AI request' },
      { status: 500 }
    );
  }
}