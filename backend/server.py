import os
import uuid
import time
import asyncio
import json
from typing import Dict, Optional, Any
from collections import deque
import threading

from fastapi import FastAPI, HTTPException, Depends, Security, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import APIKeyHeader
from pydantic import BaseModel, Field
from dotenv import load_dotenv

from graph import graph
from state import ReportStateInput

# Load environment variables
load_dotenv()

# Create FastAPI app
app = FastAPI(
    title="DeeRes API",
    description="Simple API for deep research and report generation",
    version="0.1.0"
)

# Add CORS middleware to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS").split(","),
    allow_credentials=True,
    allow_methods=os.getenv("ALLOWED_METHODS").split(","),
    allow_headers=os.getenv("ALLOWED_HEADERS").split(","),
)

# API Key security
API_KEY_NAME = "X-API-Key"
api_key_header = APIKeyHeader(name=API_KEY_NAME, auto_error=False)

async def get_api_key(api_key_header: str = Security(api_key_header)):
    if api_key_header == os.getenv("API_KEY"):
        return api_key_header
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or missing API Key",
    )

# Models for API requests and responses
class ReportRequest(BaseModel):
    topic: str = Field(..., description="The topic for the report")
    config_overrides: Optional[Dict[str, Any]] = Field(None, description="Optional configuration overrides")

class ReportResponse(BaseModel):
    topic: str = Field(..., description="The topic of the report")
    content: str = Field(..., description="The generated report content")

# In-memory job store (replace with Redis or database in production)
JOBS = {}
ACTIVE_JOBS_QUEUE = deque(maxlen=10)  # Limit concurrent jobs
MAX_JOB_AGE_SECONDS = 3600  # 1 hour

class JobStatus:
    QUEUED = "queued"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class JobResult(BaseModel):
    job_id: str
    status: str
    progress: float = 0.0
    message: str = ""
    report: Optional[ReportResponse] = None
    position_in_queue: Optional[int] = None
    estimated_time: Optional[int] = None
    error: Optional[str] = None

# Check server readiness
@app.get("/health")
async def health_check():
    """Health check endpoint with server load information."""
    current_load = len(ACTIVE_JOBS_QUEUE)
    server_status = "busy" if current_load >= ACTIVE_JOBS_QUEUE.maxlen else "ready"
    
    # Check for cold start
    is_cold_start = time.time() - app.state.startup_time < 30 if hasattr(app.state, "startup_time") else True
    
    return {
        "status": "ok",
        "server_status": server_status,
        "current_load": current_load,
        "max_capacity": ACTIVE_JOBS_QUEUE.maxlen,
        "is_warming_up": is_cold_start
    }

@app.on_event("startup")
async def startup_event():
    app.state.startup_time = time.time()
    # Start background task to clean up old jobs
    asyncio.create_task(cleanup_old_jobs())

async def cleanup_old_jobs():
    while True:
        try:
            current_time = time.time()
            job_ids_to_remove = []
            
            for job_id, job_data in JOBS.items():
                if current_time - job_data["created_at"] > MAX_JOB_AGE_SECONDS:
                    job_ids_to_remove.append(job_id)
            
            for job_id in job_ids_to_remove:
                del JOBS[job_id]
                
            await asyncio.sleep(300)  # Check every 5 minutes
        except Exception as e:
            print(f"Error cleaning up jobs: {str(e)}")
            await asyncio.sleep(300)

# Modified endpoint to start report generation
@app.post("/generate-report", response_model=JobResult)
async def start_report_generation(request: ReportRequest, api_key: str = Depends(get_api_key)):
    """
    Start generating a report asynchronously and return a job ID immediately.
    """
    job_id = str(uuid.uuid4())
    
    # Check server load
    if len(ACTIVE_JOBS_QUEUE) >= ACTIVE_JOBS_QUEUE.maxlen:
        position = len(ACTIVE_JOBS_QUEUE) + 1
        JOBS[job_id] = {
            "status": JobStatus.QUEUED,
            "progress": 0.0,
            "message": f"Queued (position {position})",
            "created_at": time.time(),
            "request": request.dict(),
            "position_in_queue": position,
            "estimated_time": position * 60  # Rough estimate: 1 minute per job
        }
        return JobResult(
            job_id=job_id,
            status=JobStatus.QUEUED,
            message=f"Your request is queued (position {position})",
            position_in_queue=position,
            estimated_time=position * 60
        )
    
    # Create job record
    JOBS[job_id] = {
        "status": JobStatus.PROCESSING,
        "progress": 0.0,
        "message": "Starting research...",
        "created_at": time.time(),
        "request": request.dict()
    }
    
    # Start processing in background thread
    threading.Thread(
        target=process_report_job,
        args=(job_id, request)
    ).start()
    
    # Return immediately with job ID
    return JobResult(
        job_id=job_id,
        status=JobStatus.PROCESSING,
        message="Research started. Please check job status to monitor progress."
    )

def process_report_job(job_id: str, request: ReportRequest):
    """Process report generation in background thread"""
    try:
        ACTIVE_JOBS_QUEUE.append(job_id)
        
        # Update job status
        JOBS[job_id]["status"] = JobStatus.PROCESSING
        JOBS[job_id]["progress"] = 0.1
        JOBS[job_id]["message"] = "Planning report structure..."
        
        # Set up config like in the original function
        thread_id = str(uuid.uuid4())
        config_base = {
            "configurable": {
                "search_api": os.getenv("SEARCH_API"),
                "planner_provider": os.getenv("PLANNER_PROVIDER"),
                "planner_model": os.getenv("PLANNER_MODEL"),
                "writer_provider": os.getenv("WRITER_PROVIDER"),
                "writer_model": os.getenv("WRITER_MODEL"),
                "thread_id": thread_id,
            }
        }
        
        # Apply overrides
        if request.config_overrides:
            for key, value in request.config_overrides.items():
                config_base["configurable"][key] = value
        
        # For each major step, update progress
        topic_input = ReportStateInput(topic=request.topic)
        
        # Run the graph synchronously in this thread
        # Mock progress updates (in production, these would come from actual graph progress)
        progress_steps = [
            (0.2, "Generating search queries..."),
            (0.3, "Searching for relevant information..."),
            (0.5, "Analyzing search results..."),
            (0.7, "Writing report sections..."),
            (0.9, "Reviewing and refining content...")
        ]
        
        for progress, message in progress_steps:
            # In a real implementation, these updates would be interspersed with actual processing
            JOBS[job_id]["progress"] = progress
            JOBS[job_id]["message"] = message
            time.sleep(2)  # Simulate work happening
        
        # Run the actual graph
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        result = loop.run_until_complete(graph.ainvoke(topic_input, config=config_base))
        loop.close()
        
        # Check for the final report in the result
        if isinstance(result, dict) and "final_report" in result:
            # Store the completed report
            JOBS[job_id]["status"] = JobStatus.COMPLETED
            JOBS[job_id]["progress"] = 1.0
            JOBS[job_id]["message"] = "Report completed"
            JOBS[job_id]["report"] = {
                "topic": request.topic,
                "content": result["final_report"]
            }
        else:
            # If no final report was returned
            JOBS[job_id]["status"] = JobStatus.FAILED
            JOBS[job_id]["message"] = "Failed to generate report"
            JOBS[job_id]["error"] = "Graph finished but did not return a final report"
    
    except Exception as e:
        # Handle exceptions
        print(f"Error generating report: {str(e)}")
        JOBS[job_id]["status"] = JobStatus.FAILED
        JOBS[job_id]["message"] = "Error occurred during report generation"
        JOBS[job_id]["error"] = str(e)
    
    finally:
        # Remove from active jobs queue
        if job_id in ACTIVE_JOBS_QUEUE:
            ACTIVE_JOBS_QUEUE.remove(job_id)

# Add endpoint to check job status
@app.get("/job-status/{job_id}", response_model=JobResult)
async def get_job_status(job_id: str, api_key: str = Depends(get_api_key)):
    """
    Check the status of a report generation job.
    """
    if job_id not in JOBS:
        raise HTTPException(
            status_code=404,
            detail=f"Job with ID {job_id} not found"
        )
    
    job_data = JOBS[job_id]
    result = JobResult(
        job_id=job_id,
        status=job_data["status"],
        progress=job_data["progress"],
        message=job_data["message"]
    )
    
    # Add optional fields if they exist
    if "position_in_queue" in job_data:
        result.position_in_queue = job_data["position_in_queue"]
    
    if "estimated_time" in job_data:
        result.estimated_time = job_data["estimated_time"]
    
    if "error" in job_data:
        result.error = job_data["error"]
    
    if "report" in job_data and job_data["report"]:
        result.report = ReportResponse(**job_data["report"])
    
    return result

if __name__ == "__main__":
    import uvicorn
    # Run the server with Uvicorn
    uvicorn.run("server:app", host="localhost", port=8000, reload=True)