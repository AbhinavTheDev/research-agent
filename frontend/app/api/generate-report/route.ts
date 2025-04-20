import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Add validation
    if (!body?.topic) {
      return NextResponse.json(
        { detail: 'Topic is required' }, 
        { status: 400 }
      );
    }
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (process.env.API_KEY) {
      headers['X-API-Key'] = process.env.API_KEY;
    }
    
    // Get backend status first
    const healthResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/health`, {
      headers
    });
    
    if (!healthResponse.ok) {
      return NextResponse.json(
        { 
          detail: 'Backend service unavailable',
          serverStatus: 'unavailable'
        }, 
        { status: 503 }
      );
    }
    
    const healthData = await healthResponse.json();
    
    // Check if server is too busy
    if (healthData.server_status === 'busy') {
      return NextResponse.json(
        { 
          detail: 'Server is currently at maximum capacity. Please try again later.',
          serverStatus: 'busy',
          currentLoad: healthData.current_load,
          maxCapacity: healthData.max_capacity
        }, 
        { status: 429 }
      );
    }
    
    // Check if server is still warming up
    if (healthData.is_warming_up) {
      return NextResponse.json(
        { 
          detail: 'Server is currently warming up. Please try again in 30 seconds.',
          serverStatus: 'warming' 
        }, 
        { status: 503 }
      );
    }
    
    // Start the report generation job
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/generate-report`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { detail: errorData.detail || 'Failed to start report generation' }, 
        { status: response.status }
      );
    }
    
    // Return the job data
    const jobData = await response.json();
    return NextResponse.json(jobData);
    
  } catch (error) {
    console.error('Error in generate-report API route:', error);
    return NextResponse.json(
      { detail: error instanceof Error ? error.message : 'An unknown error occurred' }, 
      { status: 500 }
    );
  }
}

// Add a new endpoint to check job status
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const jobId = url.searchParams.get('jobId');
    
    if (!jobId) {
      return NextResponse.json(
        { detail: 'Job ID is required' }, 
        { status: 400 }
      );
    }
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (process.env.API_KEY) {
      headers['X-API-Key'] = process.env.API_KEY;
    }
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/job-status/${jobId}`, {
      headers
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { detail: errorData.detail || 'Failed to get job status' }, 
        { status: response.status }
      );
    }
    
    const jobStatus = await response.json();
    return NextResponse.json(jobStatus);
    
  } catch (error) {
    console.error('Error in job-status API route:', error);
    return NextResponse.json(
      { detail: error instanceof Error ? error.message : 'An unknown error occurred' }, 
      { status: 500 }
    );
  }
}