from openai import OpenAI
import os
import json

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

async def extract_job_info(job_text: str) -> dict:
    """
    Extract structured job information from raw text.
    """
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": """Extract job information from the text. Return JSON with:
                - company: company name
                - role: job title
                - location: job location
                - requirements: list of key requirements
                - keywords: list of important skills/technologies mentioned"""
            },
            {"role": "user", "content": job_text[:8000]}  # Limit text length
        ],
        response_format={"type": "json_object"}
    )
    
    try:
        return json.loads(response.choices[0].message.content)
    except:
        return {"company": "Unknown", "role": "Unknown", "requirements": [], "keywords": []}

async def calculate_ats_score(resume_text: str, job_keywords: list[str], job_requirements: list[str]) -> dict:
    """
    Calculate ATS match score and identify matched keywords.
    """
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": """Analyze resume against job requirements. Return JSON with:
                - score: integer 0-100 representing match percentage
                - matchedKeywords: list of keywords found in resume
                - missingKeywords: list of important keywords not in resume
                - analysis: brief explanation of the score"""
            },
            {
                "role": "user",
                "content": f"""Resume:\n{resume_text[:4000] if resume_text else 'No resume provided'}

Job Keywords: {', '.join(job_keywords)}
Job Requirements: {', '.join(job_requirements)}"""
            }
        ],
        response_format={"type": "json_object"}
    )
    
    try:
        return json.loads(response.choices[0].message.content)
    except:
        return {"score": 50, "matchedKeywords": [], "missingKeywords": job_keywords, "analysis": "Unable to analyze"}

async def analyze_gaps(resume_text: str, job_requirements: list[str], user_profile: dict) -> list[str]:
    """
    Identify gaps between candidate profile and job requirements.
    """
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": "Identify 3-5 specific gaps between the candidate and job requirements. Be constructive and actionable."
            },
            {
                "role": "user",
                "content": f"""Resume: {resume_text[:3000] if resume_text else 'Not provided'}

User Profile:
- School: {user_profile.get('school', 'Not specified')}
- Major: {user_profile.get('major', 'Not specified')}
- Target Roles: {user_profile.get('targetRoles', [])}

Job Requirements: {', '.join(job_requirements)}

List the gaps as a JSON array of strings."""
            }
        ],
        response_format={"type": "json_object"}
    )
    
    try:
        result = json.loads(response.choices[0].message.content)
        return result.get("gaps", [])
    except:
        return ["Unable to analyze gaps"]

async def generate_resume_suggestions(resume_text: str, job_info: dict) -> list[dict]:
    """
    Generate resume bullet point improvements.
    """
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": """Suggest resume improvements tailored to the job. Return JSON with:
                - suggestions: array of objects with "original" (current bullet or area) and "improved" (suggested rewrite)
                Provide 3-5 specific, actionable suggestions."""
            },
            {
                "role": "user",
                "content": f"""Resume: {resume_text[:3000] if resume_text else 'No resume provided - suggest general bullets'}

Job: {job_info.get('role', 'Unknown')} at {job_info.get('company', 'Unknown')}
Key Requirements: {', '.join(job_info.get('requirements', [])[:5])}
Important Keywords: {', '.join(job_info.get('keywords', [])[:10])}"""
            }
        ],
        response_format={"type": "json_object"}
    )
    
    try:
        result = json.loads(response.choices[0].message.content)
        return result.get("suggestions", [])
    except:
        return []

async def generate_outreach_email(contact: dict, user_profile: dict, job_info: dict) -> dict:
    """
    Generate personalized outreach email.
    """
    school = user_profile.get('school', 'your school')
    
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": f"""Write a personalized, professional outreach email. The sender is a student from {school}.
                Keep it concise (under 150 words), genuine, and mention the shared connection.
                Return JSON with: subject, body"""
            },
            {
                "role": "user",
                "content": f"""Contact: {contact.get('name', 'Unknown')} - {contact.get('title', 'Unknown')} at {job_info.get('company', 'Unknown')}
Connection: {contact.get('connection', 'None')}

Sender Profile:
- School: {school}
- Major: {user_profile.get('major', 'Not specified')}
- Clubs: {user_profile.get('clubs', [])}

Applying for: {job_info.get('role', 'a position')}"""
            }
        ],
        response_format={"type": "json_object"}
    )
    
    try:
        result = json.loads(response.choices[0].message.content)
        return {
            "to": contact.get('name', 'Unknown'),
            "subject": result.get("subject", "Reaching out"),
            "body": result.get("body", "")
        }
    except:
        return {"to": contact.get('name'), "subject": "Reaching out", "body": ""}

