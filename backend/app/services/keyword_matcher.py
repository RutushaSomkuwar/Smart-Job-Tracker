import re
from typing import List, Dict, Tuple, Set

# Comprehensive canonical skills dictionary with regex aliases
TECH_SKILLS_TAXONOMY: Dict[str, List[str]] = {
    "Python": [r"\bpython\d?\b", r"\bpy\b"],
    "FastAPI": [r"\bfastapi\b", r"\bfast[\s\-_]api\b"],
    "Django": [r"\bdjango\b", r"\bdrf\b", r"\bdjango[\s\-_]rest\b"],
    "Flask": [r"\bflask\b"],
    "JavaScript": [r"\bjavascript\b", r"\bjs\b", r"\becmascript\b"],
    "TypeScript": [r"\btypescript\b", r"\bts\b"],
    "React": [r"\breact\b", r"\breact\.?js\b", r"\breactjs\b"],
    "Node.js": [r"\bnode\b", r"\bnode\.?js\b", r"\bnodejs\b"],
    "Express": [r"\bexpress\b", r"\bexpress\.?js\b", r"\bexpressjs\b"],
    "Next.js": [r"\bnext\.?js\b", r"\bnextjs\b"],
    "Vue.js": [r"\bvue\b", r"\bvue\.?js\b", r"\bvuejs\b"],
    "Angular": [r"\bangular\b", r"\bangularjs\b"],
    "HTML": [r"\bhtml5?\b"],
    "CSS": [r"\bcss3?\b"],
    "Tailwind CSS": [r"\btailwind\b", r"\btailwind[\s\-_]css\b", r"\btailwindcss\b"],
    "PostgreSQL": [r"\bpostgres\b", r"\bpostgresql\b", r"\bpsql\b"],
    "MySQL": [r"\bmysql\b"],
    "MongoDB": [r"\bmongodb\b", r"\bmongo\b"],
    "Redis": [r"\bredis\b"],
    "SQL": [r"\bsql\b", r"\brdbms\b", r"\brelational database\b"],
    "SQLite": [r"\bsqlite\b", r"\bsqlite3\b"],
    "Git": [r"\bgit\b", r"\bversion control\b"],
    "GitHub": [r"\bgithub\b", r"\bgitlab\b", r"\bbitbucket\b"],
    "Docker": [r"\bdocker\b", r"\bcontainers?\b", r"\bcontainerization\b"],
    "Kubernetes": [r"\bkubernetes\b", r"\bk8s\b"],
    "AWS": [r"\baws\b", r"\bamazon web services\b", r"\bec2\b", r"\bs3\b", r"\blambda\b"],
    "Azure": [r"\bazure\b", r"\bmicrosoft azure\b"],
    "GCP": [r"\bgcp\b", r"\bgoogle cloud\b", r"\bgoogle cloud platform\b"],
    "REST API": [r"\brest[\s\-_]?apis?\b", r"\brestful[\s\-_]?apis?\b", r"\brestful\b", r"\brest\b"],
    "GraphQL": [r"\bgraphql\b"],
    "Java": [r"\bjava\b", r"\bspring\b", r"\bspringboot\b", r"\bspring[\s\-_]boot\b"],
    "C++": [r"\bc\+\+\b", r"\bcpp\b"],
    "C#": [r"\bc#\b", r"\bcsharp\b", r"\b\.net\b", r"\bdotnet\b"],
    "Go": [r"\bgolang\b", r"\bgo language\b"],
    "Rust": [r"\brust\b", r"\brustlang\b"],
    "Linux": [r"\blinux\b", r"\bunix\b", r"\bbash\b", r"\bshell scripting\b"],
    "CI/CD": [r"\bci[\/\-_]cd\b", r"\bcontinuous integration\b", r"\bgithub actions\b", r"\bjenkins\b"],
    "Pandas": [r"\bpandas\b"],
    "NumPy": [r"\bnumpy\b"],
    "Machine Learning": [r"\bmachine learning\b", r"\bml\b", r"\bdeep learning\b", r"\bai\b", r"\bartificial intelligence\b"],
    "Data Analysis": [r"\bdata analysis\b", r"\bdata analytics\b", r"\beda\b", r"\bdata visualization\b"],
    "Power BI": [r"\bpower bi\b", r"\bpowerbi\b"],
    "Tableau": [r"\btableau\b"],
    "Excel": [r"\bexcel\b", r"\bms excel\b", r"\bmicrosoft excel\b"],
    "OpenCV": [r"\bopencv\b"],
    "YOLO": [r"\byolo\b"],
    "Firebase": [r"\bfirebase\b", r"\bfirestore\b"],
    "Kafka": [r"\bkafka\b", r"\brabbitmq\b", r"\bmessage queues?\b"],
    "Microservices": [r"\bmicroservices?\b", r"\bmicroservice architecture\b"],
    "System Design": [r"\bsystem design\b", r"\bdistributed systems?\b", r"\bscalability\b"],
    "Testing": [r"\bunit testing\b", r"\bpytest\b", r"\bjest\b", r"\bcypress\b", r"\bselenium\b", r"\bintegration testing\b"],
    "Security / Auth": [r"\bjwt\b", r"\boauth\b", r"\bauthentication\b", r"\bauthorization\b", r"\bbcrypt\b"]
}

def extract_matched_skills(text: str) -> Set[str]:
    """Scan text against the taxonomy and return a set of canonical skill names."""
    found_skills = set()
    normalized_text = text.lower()
    
    for canonical_name, patterns in TECH_SKILLS_TAXONOMY.items():
        for pattern in patterns:
            if re.search(pattern, normalized_text, re.IGNORECASE):
                found_skills.add(canonical_name)
                break
                
    return found_skills

def generate_recommendations(matched: List[str], missing: List[str], match_percentage: int) -> List[str]:
    """Generate constructive, rule-based recommendations without hallucinating experience."""
    recommendations = []
    
    if match_percentage >= 85:
        recommendations.append("Strong keyword alignment! Your resume closely reflects the technical requirements of this position.")
    elif match_percentage >= 60:
        recommendations.append("Good foundation with relevant core skills, but consider addressing key missing requirements.")
    else:
        recommendations.append("Moderate overlap detected. Customize your resume to highlight relevant transferable projects and tech stack experience.")

    # High-impact skills recommendations
    if "PostgreSQL" in missing or "SQL" in missing:
        recommendations.append("Highlight database design, SQL query optimization, or ORM experience in your project descriptions.")
    
    if "Docker" in missing or "Kubernetes" in missing or "CI/CD" in missing:
        recommendations.append("If you have deployment or containerization experience (Docker, CI/CD pipelines), explicitly include them in your technical skills or project summaries.")
        
    if "AWS" in missing or "Azure" in missing or "GCP" in missing:
        recommendations.append("Mention specific cloud services (e.g. S3, EC2, Cloud Run) if you have deployed or hosted applications on cloud platforms.")

    if "REST API" in missing or "FastAPI" in missing or "Node.js" in missing:
        recommendations.append("Clearly detail API endpoints, authentication flows (JWT/OAuth), and backend architectures you have built.")
        
    if missing:
        top_missing = missing[:4]
        recommendations.append(f"Consider integrating experience or academic/portfolio coursework with: {', '.join(top_missing)}.")

    if matched:
        top_matched = matched[:4]
        recommendations.append(f"Great match on key terms: {', '.join(top_matched)}. Ensure your bullet points quantify your impact using these technologies.")

    return recommendations

def analyze_resume_against_job(resume_text: str, job_description: str) -> Dict:
    """
    Core rule-based matching engine.
    1. Extracts target skills from the Job Description.
    2. Extracts candidate skills from the Resume.
    3. Calculates match percentage based on matched vs total job requirements.
    4. Categorizes matched & missing keywords and generates targeted recommendations.
    """
    jd_skills = extract_matched_skills(job_description)
    resume_skills = extract_matched_skills(resume_text)
    
    # If no recognized taxonomy skills found in JD, fallback to frequent technical noun tokens
    if not jd_skills:
        # Extract alphanumeric words of length >= 3
        words = re.findall(r"\b[A-Za-z0-9#\+\.]{3,}\b", job_description.lower())
        stopwords = {"with", "that", "this", "from", "have", "will", "your", "work", "team", "role", "must", "able", "plus", "years", "experience", "looking", "developer", "engineer"}
        candidate_words = set(w for w in words if w not in stopwords)
        
        matched_tokens = [w for w in candidate_words if w in resume_text.lower()]
        missing_tokens = [w for w in candidate_words if w not in resume_text.lower()]
        
        total_req = max(len(candidate_words), 1)
        match_percentage = min(100, max(0, int(round((len(matched_tokens) / total_req) * 100))))
        
        matched_list = sorted(list(matched_tokens))[:10]
        missing_list = sorted(list(missing_tokens))[:10]
        
        return {
            "match_percentage": match_percentage,
            "matched_keywords": matched_list,
            "missing_keywords": missing_list,
            "recommendations": generate_recommendations(matched_list, missing_list, match_percentage)
        }

    matched_skills = sorted(list(jd_skills.intersection(resume_skills)))
    missing_skills = sorted(list(jd_skills.difference(resume_skills)))
    
    total_jd_skills = len(jd_skills)
    match_percentage = int(round((len(matched_skills) / total_jd_skills) * 100)) if total_jd_skills > 0 else 0
    
    recommendations = generate_recommendations(matched_skills, missing_skills, match_percentage)
    
    return {
        "match_percentage": match_percentage,
        "matched_keywords": matched_skills,
        "missing_keywords": missing_skills,
        "recommendations": recommendations
    }
