from exa_py import Exa
import os

exa = Exa(api_key=os.getenv("EXA_API_KEY"))

async def scrape_job_posting(job_url: str) -> dict:
    """
    Use Exa to scrape and extract job posting content.
    """
    try:
        result = exa.get_contents(
            [job_url],
            text=True
        )
        
        if result.results and len(result.results) > 0:
            content = result.results[0]
            return {
                "url": job_url,
                "title": content.title or "Unknown Title",
                "text": content.text or "",
            }
        
        return {"url": job_url, "title": "Unknown", "text": ""}
    except Exception as e:
        print(f"Error scraping job: {e}")
        return {"url": job_url, "title": "Error", "text": str(e)}

async def search_linkedin_alumni(company: str, school: str) -> list[dict]:
    """
    Use Exa to find LinkedIn profiles of alumni at a company.
    """
    try:
        query = f"{school} alumni at {company} site:linkedin.com/in"
        
        result = exa.search(
            query,
            num_results=5,
            type="neural",
            use_autoprompt=True
        )
        
        contacts = []
        for r in result.results:
            # Extract name from title (usually "Name - Title | LinkedIn")
            title_parts = r.title.split(" - ") if r.title else ["Unknown"]
            name = title_parts[0].strip()
            role = title_parts[1].split("|")[0].strip() if len(title_parts) > 1 else "Unknown"
            
            contacts.append({
                "name": name,
                "title": role,
                "url": r.url,
                "connection": f"{school} Alumni"
            })
        
        return contacts
    except Exception as e:
        print(f"Error searching LinkedIn: {e}")
        return []

