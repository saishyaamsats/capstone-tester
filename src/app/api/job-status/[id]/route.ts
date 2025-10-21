import { NextRequest, NextResponse } from 'next/server';
import { jobs } from '../../submit-job/route';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const jobId = params.id;
    
    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }
    
    const job = jobs.get(jobId);
    
    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }
    
    // Add additional metadata for response
    const response = {
      ...job,
      duration: job.completedAt ? job.completedAt - job.submittedAt : Date.now() - job.submittedAt,
      isComplete: job.status === 'completed' || job.status === 'failed'
    };
    
    return NextResponse.json(response);
    
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get job status', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}