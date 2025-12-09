from fastapi import APIRouter, BackgroundTasks
from pydantic import BaseModel
from typing import Optional
import os

from app.graphs.job_analysis import run_analysis

router = APIRouter()

class UserProfile(BaseModel):
    school: Optional[str] = None
    graduationYear: Optional[int] = None
    major: Optional[str] = None
    resumeText: Optional[str] = None
    linkedinUrl: Optional[str] = None
    targetRoles: Optional[list[str]] = None
    clubs: Optional[list[str]] = None
    activities: Optional[list[str]] = None
    extraInfo: Optional[str] = None

class AnalyzeRequest(BaseModel):
    threadId: int
    jobUrl: str
    userProfile: UserProfile

@router.post("/analyze")
async def analyze_job(request: AnalyzeRequest, background_tasks: BackgroundTasks):
    """
    Trigger job analysis. Runs in background and updates messages in DB.
    """
    # Run analysis in background
    background_tasks.add_task(
        run_analysis,
        thread_id=request.threadId,
        job_url=request.jobUrl,
        user_profile=request.userProfile.model_dump()
    )
    
    return {"status": "analysis_started", "threadId": request.threadId}

