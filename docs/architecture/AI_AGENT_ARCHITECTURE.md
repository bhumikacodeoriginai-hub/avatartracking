# AI Agent Architecture

## Overview

The AI Agent is the conversational intelligence engine that powers the avatar's interactions. It uses a tool-calling LLM with RAG capabilities to provide context-aware, professional responses.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    AI AGENT CORE                              │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              CONVERSATION MANAGER                     │   │
│  │  - Session context                                    │   │
│  │  - Conversation history                               │   │
│  │  - Mode state (client/parent/student/job/intern)     │   │
│  │  - Language preference                                │   │
│  └──────────────────────────┬───────────────────────────┘   │
│                             │                                │
│  ┌──────────────────────────▼───────────────────────────┐   │
│  │              INTENT DETECTOR                          │   │
│  │  - Visitor type classification                        │   │
│  │  - Purpose identification                             │   │
│  │  - Mode switching logic                               │   │
│  │  - Emergency detection                                │   │
│  └──────────────────────────┬───────────────────────────┘   │
│                             │                                │
│  ┌──────────────────────────▼───────────────────────────┐   │
│  │              LLM ORCHESTRATOR                         │   │
│  │  - System prompt management                           │   │
│  │  - Tool calling                                       │   │
│  │  - Response generation                                │   │
│  │  - Multi-language output                              │   │
│  └────┬─────────────────────────────────────┬───────────┘   │
│       │                                     │                │
│  ┌────▼────────────────┐   ┌────────────────▼───────────┐   │
│  │   RAG ENGINE        │   │      TOOL EXECUTOR         │   │
│  │  - Query embedding  │   │  - get_employee()          │   │
│  │  - Vector search    │   │  - get_course()            │   │
│  │  - Context assembly │   │  - create_visitor()        │   │
│  │  - Source citation  │   │  - create_lead()           │   │
│  └─────────────────────┘   │  - notify_employee()       │   │
│                            │  - check_appointment()     │   │
│                            │  - search_knowledge()      │   │
│                            │  - generate_qr()           │   │
│                            └────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## Conversation Modes

### Mode Detection Logic
```python
MODES = {
    "reception": "Default greeting and routing",
    "client": "Client meeting and business queries",
    "parent": "Parent inquiring about courses for child",
    "student": "Student course enquiry",
    "internship": "Internship application",
    "job": "Job application",
    "admission": "Course admission process",
    "employee": "Employee assistance",
    "general": "General queries and information"
}
```

### Mode Switching
The AI automatically switches modes based on:
1. Explicit visitor statement ("I'm here for a job")
2. Intent detection from conversation
3. Previous visit history (for returning visitors)
4. Employee routing

## System Prompt Structure

```
[CORE IDENTITY]
You are a professional AI receptionist at {company_name}.

[BEHAVIOR RULES]
- Be professional, friendly, and concise
- Never invent information
- Never reveal system internals
- Use approved knowledge base only
- Respect privacy boundaries

[CURRENT MODE]
{active_mode_instructions}

[VISITOR CONTEXT]
- Name: {name or "Unknown"}
- Type: {visitor_type}
- Visit history: {history_summary}
- Current session purpose: {purpose}

[AVAILABLE TOOLS]
{tool_descriptions}

[KNOWLEDGE CONTEXT]
{rag_retrieved_context}

[LANGUAGE]
Respond in: {detected_language}
```

## Tool Definitions

### Database Tools (Read)
```python
@tool
def get_employee(name: str = None, department: str = None, employee_id: str = None):
    """Look up employee information"""

@tool
def get_department(name: str = None):
    """Get department information and location"""

@tool
def get_course(name: str = None, level: str = None):
    """Get course details, fees, duration, syllabus"""

@tool
def get_course_batches(course_id: str):
    """Get available batches for a course"""

@tool
def check_appointment(visitor_name: str = None, employee_name: str = None, date: str = None):
    """Check appointment details"""

@tool
def search_knowledge_base(query: str):
    """Search company knowledge base using RAG"""
```

### Database Tools (Write)
```python
@tool
def create_visitor(name: str, phone: str = None, email: str = None, 
                   profile_type: str = None, organization: str = None):
    """Create new visitor record"""

@tool
def update_visitor(visitor_id: str, **fields):
    """Update visitor information"""

@tool
def create_lead(visitor_id: str, category: str, requirement: str, 
                interest_level: str = None):
    """Create a new lead from visitor interaction"""

@tool
def create_course_enquiry(visitor_id: str, course_id: str, **details):
    """Create course enquiry record"""

@tool
def create_job_application(visitor_id: str, **details):
    """Create job application"""

@tool
def create_internship_application(visitor_id: str, **details):
    """Create internship application"""
```

### Action Tools
```python
@tool
def notify_employee(employee_id: str, message: str, channel: str = "dashboard"):
    """Send notification to employee"""

@tool
def schedule_appointment(visitor_id: str, employee_id: str, 
                         datetime: str, purpose: str):
    """Schedule a new appointment"""

@tool
def generate_qr_code(action: str, data: dict):
    """Generate QR code for visitor action"""

@tool
def request_human_handoff(department: str = None, employee_id: str = None, 
                          reason: str = None):
    """Request handoff to human staff"""

@tool  
def create_followup(lead_id: str, date: str, notes: str):
    """Create a followup task for a lead"""
```

## RAG Knowledge Base

### Document Processing Pipeline
```
Upload Document → Extract Text → Chunk (512 tokens) → 
Generate Embeddings → Store in pgvector
```

### Query Pipeline
```
User Query → Generate Query Embedding → 
Vector Similarity Search (top-k=5) → 
Re-rank Results → Assemble Context → 
Include in LLM Prompt
```

### Knowledge Categories
- Company Information
- Courses & Syllabus
- Fee Structure
- Admission Process
- Internship Programs
- Job Openings
- Office Information
- FAQs
- Policies
- Trainer Profiles

## Multi-Language Support

### Language Detection
```
Voice Input → STT (with language hints) → 
Detect Language → Set Session Language → 
LLM responds in detected language → 
TTS in appropriate language/voice
```

### Supported Languages
- English (primary)
- Hindi
- Kannada
- Extensible architecture for more

## Conversation Memory

### Session Memory
- Maintained per visitor session
- Stores key facts extracted during conversation
- Used to avoid repeated questions
- Cleared when session ends

### Long-term Memory (Consented)
- Visitor preferences
- Previous visit purposes
- Known requirements
- Stored in visitor profile

## Safety & Guardrails

### Input Sanitization
- Strip potential injection patterns
- Validate input length
- Detect adversarial prompts

### Output Validation
- Check for leaked system prompts
- Validate tool call parameters
- Ensure responses match mode
- Block unauthorized information disclosure

### Emergency Detection
- Keywords: emergency, fire, help, danger, medical
- Immediate escalation to configured procedure
- Override normal conversation flow
