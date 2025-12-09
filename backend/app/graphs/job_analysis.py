"""
LangGraph workflow for job analysis pipeline.

This orchestrates the multi-step analysis:
1. Scrape job posting
2. Extract job info
3. Calculate ATS score
4. Analyze gaps
5. Find LinkedIn contacts
6. Generate outreach emails
7. Generate resume suggestions
"""

from langgraph.graph import StateGraph, END
from typing import TypedDict, Optional, Any
import asyncio

from app.services.exa_client import scrape_job_posting, search_linkedin_alumni
from app.services.openai_client import (
    extract_job_info,
    calculate_ats_score,
    analyze_gaps,
    generate_resume_suggestions,
    generate_outreach_email
)
from app.services.database import add_message, update_thread


class AnalysisState(TypedDict):
    thread_id: int
    job_url: str
    user_profile: dict
    job_raw_text: Optional[str]
    job_info: Optional[dict]
    ats_result: Optional[dict]
    gaps: Optional[list]
    contacts: Optional[list]
    emails: Optional[list]
    suggestions: Optional[list]
    error: Optional[str]


def scrape_job_node(state: AnalysisState) -> AnalysisState:
    """Scrape job posting using Exa."""
    try:
        result = asyncio.run(scrape_job_posting(state["job_url"]))
        state["job_raw_text"] = result.get("text", "")
        
        add_message(
            state["thread_id"],
            "assistant",
            f"Found the job posting! Extracting details...",
            "text"
        )
        
        return state
    except Exception as e:
        state["error"] = str(e)
        return state


def extract_info_node(state: AnalysisState) -> AnalysisState:
    """Extract structured info from job posting."""
    if state.get("error"):
        return state
    
    try:
        job_info = asyncio.run(extract_job_info(state.get("job_raw_text", "")))
        state["job_info"] = job_info
        
        # Update thread with company/role
        update_thread(
            state["thread_id"],
            company=job_info.get("company"),
            role=job_info.get("role")
        )
        
        # Add job info message
        add_message(
            state["thread_id"],
            "assistant",
            f"Here's what I found about this position:",
            "job_info",
            {
                "company": job_info.get("company"),
                "role": job_info.get("role"),
                "location": job_info.get("location"),
                "requirements": job_info.get("requirements", [])[:5]
            }
        )
        
        return state
    except Exception as e:
        state["error"] = str(e)
        return state


def ats_score_node(state: AnalysisState) -> AnalysisState:
    """Calculate ATS match score."""
    if state.get("error"):
        return state
    
    try:
        job_info = state.get("job_info", {})
        resume_text = state.get("user_profile", {}).get("resumeText", "")
        
        result = asyncio.run(calculate_ats_score(
            resume_text,
            job_info.get("keywords", []),
            job_info.get("requirements", [])
        ))
        state["ats_result"] = result
        
        add_message(
            state["thread_id"],
            "assistant",
            result.get("analysis", "Analysis complete."),
            "ats_score",
            {
                "score": result.get("score", 0),
                "matchedKeywords": result.get("matchedKeywords", []),
                "missingKeywords": result.get("missingKeywords", [])
            }
        )
        
        return state
    except Exception as e:
        state["error"] = str(e)
        return state


def gap_analysis_node(state: AnalysisState) -> AnalysisState:
    """Analyze gaps between candidate and requirements."""
    if state.get("error"):
        return state
    
    try:
        job_info = state.get("job_info", {})
        resume_text = state.get("user_profile", {}).get("resumeText", "")
        
        gaps = asyncio.run(analyze_gaps(
            resume_text,
            job_info.get("requirements", []),
            state.get("user_profile", {})
        ))
        state["gaps"] = gaps
        
        add_message(
            state["thread_id"],
            "assistant",
            "Here are some areas to address:",
            "gaps",
            {"gaps": gaps}
        )
        
        return state
    except Exception as e:
        state["error"] = str(e)
        return state


def find_contacts_node(state: AnalysisState) -> AnalysisState:
    """Find LinkedIn alumni connections."""
    if state.get("error"):
        return state
    
    try:
        job_info = state.get("job_info", {})
        user_profile = state.get("user_profile", {})
        school = user_profile.get("school", "")
        company = job_info.get("company", "")
        
        if school and company:
            contacts = asyncio.run(search_linkedin_alumni(company, school))
            state["contacts"] = contacts
            
            if contacts:
                add_message(
                    state["thread_id"],
                    "assistant",
                    f"Found {len(contacts)} potential connections from {school} at {company}!",
                    "contacts",
                    {"contacts": contacts}
                )
            else:
                add_message(
                    state["thread_id"],
                    "assistant",
                    f"Couldn't find alumni connections at {company}. Try reaching out to recruiters directly.",
                    "text"
                )
        else:
            state["contacts"] = []
            add_message(
                state["thread_id"],
                "assistant",
                "Add your school in settings to find alumni connections!",
                "text"
            )
        
        return state
    except Exception as e:
        state["error"] = str(e)
        return state


def generate_emails_node(state: AnalysisState) -> AnalysisState:
    """Generate personalized outreach emails."""
    if state.get("error"):
        return state
    
    try:
        contacts = state.get("contacts", [])
        job_info = state.get("job_info", {})
        user_profile = state.get("user_profile", {})
        
        emails = []
        for contact in contacts[:3]:  # Limit to top 3
            email = asyncio.run(generate_outreach_email(contact, user_profile, job_info))
            emails.append(email)
            
            add_message(
                state["thread_id"],
                "assistant",
                email.get("body", ""),
                "email",
                {
                    "to": email.get("to"),
                    "subject": email.get("subject")
                }
            )
        
        state["emails"] = emails
        return state
    except Exception as e:
        state["error"] = str(e)
        return state


def resume_suggestions_node(state: AnalysisState) -> AnalysisState:
    """Generate resume improvement suggestions."""
    if state.get("error"):
        return state
    
    try:
        job_info = state.get("job_info", {})
        resume_text = state.get("user_profile", {}).get("resumeText", "")
        
        suggestions = asyncio.run(generate_resume_suggestions(resume_text, job_info))
        state["suggestions"] = suggestions
        
        if suggestions:
            add_message(
                state["thread_id"],
                "assistant",
                "Here are some resume improvements tailored for this role:",
                "resume_rewrite",
                {"suggestions": suggestions}
            )
        
        return state
    except Exception as e:
        state["error"] = str(e)
        return state


def complete_node(state: AnalysisState) -> AnalysisState:
    """Mark analysis as complete."""
    if state.get("error"):
        add_message(
            state["thread_id"],
            "assistant",
            f"Sorry, I encountered an error: {state['error']}",
            "text"
        )
        update_thread(state["thread_id"], status="error")
    else:
        add_message(
            state["thread_id"],
            "assistant",
            "Analysis complete! Good luck with your application! 🍀",
            "text"
        )
        update_thread(state["thread_id"], status="complete")
    
    return state


# Build the graph
def build_analysis_graph():
    workflow = StateGraph(AnalysisState)
    
    # Add nodes
    workflow.add_node("scrape_job", scrape_job_node)
    workflow.add_node("extract_info", extract_info_node)
    workflow.add_node("ats_score", ats_score_node)
    workflow.add_node("gap_analysis", gap_analysis_node)
    workflow.add_node("find_contacts", find_contacts_node)
    workflow.add_node("generate_emails", generate_emails_node)
    workflow.add_node("resume_suggestions", resume_suggestions_node)
    workflow.add_node("complete", complete_node)
    
    # Add edges (sequential flow)
    workflow.set_entry_point("scrape_job")
    workflow.add_edge("scrape_job", "extract_info")
    workflow.add_edge("extract_info", "ats_score")
    workflow.add_edge("ats_score", "gap_analysis")
    workflow.add_edge("gap_analysis", "find_contacts")
    workflow.add_edge("find_contacts", "generate_emails")
    workflow.add_edge("generate_emails", "resume_suggestions")
    workflow.add_edge("resume_suggestions", "complete")
    workflow.add_edge("complete", END)
    
    return workflow.compile()


# Create the compiled graph
analysis_graph = build_analysis_graph()


def run_analysis(thread_id: int, job_url: str, user_profile: dict):
    """
    Run the full analysis pipeline.
    Called as a background task from the API.
    """
    initial_state: AnalysisState = {
        "thread_id": thread_id,
        "job_url": job_url,
        "user_profile": user_profile,
        "job_raw_text": None,
        "job_info": None,
        "ats_result": None,
        "gaps": None,
        "contacts": None,
        "emails": None,
        "suggestions": None,
        "error": None,
    }
    
    # Run the graph
    analysis_graph.invoke(initial_state)

