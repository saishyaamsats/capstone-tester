import { NextRequest, NextResponse } from 'next/server';
import { blockchainIntegration } from '@/lib/blockchain-integration';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userAddress = searchParams.get('user');
    
    // For now, return mock data since we need provider access
    const mockJobs = [
      {
        id: 'job_1',
        user: '0x1234567890123456789012345678901234567890',
        jobType: 'Google Willow',
        description: 'Bell state creation with Hadamard and CNOT gates',
        txHash: '0xabcdef1234567890abcdef1234567890abcdef12',
        timestamp: Date.now() - 300000,
        status: 'confirmed'
      },
      {
        id: 'job_2',
        user: '0x2345678901234567890123456789012345678901',
        jobType: 'IBM Condor',
        description: 'Grover search algorithm implementation',
        txHash: '0xbcdef1234567890abcdef1234567890abcdef123',
        timestamp: Date.now() - 600000,
        status: 'confirmed'
      }
    ];

    let filteredJobs = mockJobs;
    if (userAddress) {
      filteredJobs = mockJobs.filter(job => 
        job.user.toLowerCase() === userAddress.toLowerCase()
      );
    }

    return NextResponse.json({
      jobs: filteredJobs,
      total: filteredJobs.length,
      timestamp: Date.now()
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch quantum jobs' },
      { status: 500 }
    );
  }
}