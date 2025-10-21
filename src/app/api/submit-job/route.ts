import { NextRequest, NextResponse } from 'next/server';

interface JobSubmission {
  jobType: string;
  description: string;
  provider: string;
  priority: string;
  submissionType: string;
  txHash: string;
  userId?: string;
  metadata?: any;
}

interface JobResult {
  jobId: string;
  status: "running" | "completed" | "failed";
  progress: number;
  submittedAt: number;
  completedAt?: number;
  userId?: string;
  results?: {
    measurements: Record<string, number>;
    fidelity: string;
    executionTime: string;
    circuitDepth: number;
    shots: number;
    algorithm: string;
    provider: string;
  };
  error?: string;
}

// In-memory job storage (in production, use a database)
const jobs = new Map<string, JobResult>();

// Add job cleanup for memory management
setInterval(() => {
  const now = Date.now();
  const oneHour = 60 * 60 * 1000;
  
  for (const [jobId, job] of jobs.entries()) {
    if (now - job.submittedAt > oneHour && job.status === 'completed') {
      jobs.delete(jobId);
    }
  }
}, 10 * 60 * 1000); // Clean up every 10 minutes
export async function POST(request: NextRequest) {
  try {
    const jobData: JobSubmission = await request.json();
    
    // Validate input data
    if (!jobData.jobType || !jobData.description) {
      return NextResponse.json(
        { error: 'Missing required fields: jobType and description' },
        { status: 400 }
      );
    }

    // Generate unique job ID
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Initialize job
    const job: JobResult = {
      jobId,
      status: "running",
      progress: 0,
      submittedAt: Date.now(),
      userId: jobData.userId
    };
    
    jobs.set(jobId, job);
    
    // Start quantum execution simulation
    executeQuantumJob(jobId, jobData).catch(error => {
      const failedJob = jobs.get(jobId);
      if (failedJob) {
        failedJob.status = "failed";
        failedJob.error = error.message;
        failedJob.completedAt = Date.now();
        jobs.set(jobId, failedJob);
      }
    });
    
    return NextResponse.json({ 
      jobId, 
      status: "submitted",
      estimatedCompletion: Date.now() + 30000 // 30 seconds
    });
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to submit job', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function executeQuantumJob(jobId: string, jobData: JobSubmission) {
  const job = jobs.get(jobId);
  if (!job) return;
  
  try {
    // Simulate quantum execution with progress updates
    const totalSteps = 8;
    const stepDelay = jobData.priority === 'high' ? 300 : jobData.priority === 'medium' ? 500 : 800;
    
    for (let step = 1; step <= totalSteps; step++) {
      await new Promise(resolve => setTimeout(resolve, stepDelay));
      
      const progress = (step / totalSteps) * 100;
      job.progress = progress;
      jobs.set(jobId, { ...job });
    }
    
    // Generate mock quantum results
    const mockResults = {
      measurements: generateMockMeasurements(jobData.description),
      fidelity: getFidelityForAlgorithm(jobData.description),
      executionTime: getExecutionTimeForAlgorithm(jobData.description),
      circuitDepth: getCircuitDepthForAlgorithm(jobData.description),
      shots: 1024,
      algorithm: extractAlgorithmName(jobData.description),
      provider: jobData.provider
    };
    
    // Complete the job
    job.status = "completed";
    job.completedAt = Date.now();
    job.results = mockResults;
    jobs.set(jobId, { ...job });
    
  } catch (error) {
    job.status = "failed";
    job.error = error instanceof Error ? error.message : "Quantum execution failed";
    job.completedAt = Date.now();
    jobs.set(jobId, { ...job });
  }
}

function extractAlgorithmName(description: string): string {
  const lowerDesc = description.toLowerCase();
  
  if (lowerDesc.includes('bell')) return 'Bell State';
  if (lowerDesc.includes('grover')) return "Grover's Search";
  if (lowerDesc.includes('shor')) return "Shor's Algorithm";
  if (lowerDesc.includes('teleport')) return 'Quantum Teleportation';
  if (lowerDesc.includes('superposition')) return 'Superposition';
  if (lowerDesc.includes('vqe')) return 'VQE';
  if (lowerDesc.includes('qaoa')) return 'QAOA';
  
  return 'Custom Algorithm';
}

function generateMockMeasurements(description: string): Record<string, number> {
  const lowerDesc = description.toLowerCase();
  
  // Bell state pattern
  if (lowerDesc.includes('bell') || (lowerDesc.includes('h') && lowerDesc.includes('cx'))) {
    return {
      "00": 487,
      "01": 13,
      "10": 12,
      "11": 488
    };
  }
  
  // Grover's algorithm pattern
  if (lowerDesc.includes('grover') || lowerDesc.includes('search')) {
    return {
      "00": 125,
      "01": 125,
      "10": 125,
      "11": 625  // Target state has higher probability
    };
  }
  
  // Shor's algorithm pattern
  if (lowerDesc.includes('shor') || lowerDesc.includes('factor')) {
    return {
      "000": 62,
      "001": 63,
      "010": 187,
      "011": 188,
      "100": 187,
      "101": 188,
      "110": 62,
      "111": 63
    };
  }
  
  // Superposition pattern (equal distribution)
  if (lowerDesc.includes('superposition') || lowerDesc.includes('hadamard')) {
    return {
      "00": 250,
      "01": 250,
      "10": 250,
      "11": 250
    };
  }
  
  // VQE/optimization pattern
  if (lowerDesc.includes('vqe') || lowerDesc.includes('optimization') || lowerDesc.includes('qaoa')) {
    return {
      "00": 150,
      "01": 200,
      "10": 350,
      "11": 300
    };
  }
  
  // Teleportation pattern
  if (lowerDesc.includes('teleport')) {
    return {
      "000": 500,
      "001": 0,
      "010": 0,
      "011": 0,
      "100": 0,
      "101": 0,
      "110": 0,
      "111": 500
    };
  }
  
  // Random distribution
  return {
    "00": 245,
    "01": 255,
    "10": 248,
    "11": 252
  };
}

// Export the jobs map for the status endpoint
export { jobs };
function getFidelityForAlgorithm(description: string): string {
  const lowerDesc = description.toLowerCase();
  
  if (lowerDesc.includes('bell') || lowerDesc.includes('entangl')) {
    return "97.8%";
  }
  if (lowerDesc.includes('grover')) {
    return "94.2%";
  }
  if (lowerDesc.includes('shor')) {
    return "91.5%";
  }
  if (lowerDesc.includes('superposition')) {
    return "98.5%";
  }
  if (lowerDesc.includes('vqe') || lowerDesc.includes('optimization')) {
    return "89.3%";
  }
  if (lowerDesc.includes('teleport')) {
    return "93.7%";
  }
  
  return "95.1%";
}

function getExecutionTimeForAlgorithm(description: string): string {
  const lowerDesc = description.toLowerCase();
  
  if (lowerDesc.includes('bell') || lowerDesc.includes('superposition')) {
    return "23.4ms"; // Fast for simple circuits
  }
  if (lowerDesc.includes('grover')) {
    return "156.7ms"; // Moderate for Grover's
  }
  if (lowerDesc.includes('shor')) {
    return "2.3s"; // Slow for Shor's algorithm
  }
  if (lowerDesc.includes('vqe') || lowerDesc.includes('optimization')) {
    return "847ms"; // Variable for optimization
  }
  if (lowerDesc.includes('teleport')) {
    return "78.9ms"; // Moderate for teleportation
  }
  
  return "67.2ms"; // Default moderate time
}

function getCircuitDepthForAlgorithm(description: string): number {
  const lowerDesc = description.toLowerCase();
  
  if (lowerDesc.includes('bell') || lowerDesc.includes('superposition')) {
    return 2; // Simple circuits
  }
  if (lowerDesc.includes('grover')) {
    return 8; // Moderate depth
  }
  if (lowerDesc.includes('shor')) {
    return 24; // Deep circuits
  }
  if (lowerDesc.includes('vqe') || lowerDesc.includes('optimization')) {
    return 15; // Variable depth
  }
  if (lowerDesc.includes('teleport')) {
    return 6; // Moderate depth
  }
  
  return 4; // Default depth
}