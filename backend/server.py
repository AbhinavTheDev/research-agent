import asyncio
import os
import uuid
from typing import Dict, Optional, Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
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
    allow_origins=["*"],  # In production, restrict this to your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models for API requests and responses
class ReportRequest(BaseModel):
    topic: str = Field(..., description="The topic for the report")
    config_overrides: Optional[Dict[str, Any]] = Field(None, description="Optional configuration overrides")

class ReportResponse(BaseModel):
    topic: str = Field(..., description="The topic of the report")
    content: str = Field(..., description="The generated report content")

@app.post("/generate-report", response_model=ReportResponse)
async def generate_report(request: ReportRequest):
    """
    Generate a report on the specified topic.
    This endpoint works synchronously - it will return the report when complete.
    """
    try:
        # Set up input exactly like in main.py
        topic_input = ReportStateInput(topic=request.topic)
        
        # Generate a unique thread ID
        thread_id = str(uuid.uuid4())
        
        # Create base config similar to main.py
        config_base = {
        "configurable": {
            "search_api": "duckduckgo",  # or "exa"
            "planner_provider": "groq",
            "planner_model": "llama3-70b-8192",
            "writer_provider": "groq",
            "writer_model": "llama3-8b-8192",
            "thread_id": thread_id,
        }
        }
        
        # Apply any config overrides from the request
        if request.config_overrides:
            for key, value in request.config_overrides.items():
                config_base["configurable"][key] = value
        
        # Invoke the graph just like in main.py
        print(f"Generating report on topic: {request.topic}")
        result = await graph.ainvoke(topic_input, config=config_base)
        
        # Check for the final report in the result
        if isinstance(result, dict) and "final_report" in result:
            return ReportResponse(
                topic=request.topic, 
                content=result["final_report"]
            )
        else:
            # If no final report was returned
            raise HTTPException(
                status_code=500, 
                detail="Graph finished but did not return a final report"
            )
            
    except Exception as e:
        # Handle exceptions and return an appropriate error
        print(f"Error generating report: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate report: {str(e)}"
        )

@app.get("/health")
async def health_check():
    """Simple health check endpoint."""
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    # Run the server with Uvicorn
    uvicorn.run("server:app", host="localhost", port=8000, reload=True)