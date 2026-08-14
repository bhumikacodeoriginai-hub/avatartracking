# AI Office Avatar — System Architecture Document

## 1. Executive Summary

The AI Office Avatar is a production-grade intelligent virtual receptionist platform that combines computer vision, conversational AI, and visitor management into a unified system displayed on a physical kiosk at office reception.

## 2. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        PHYSICAL LAYER                                │
│  ┌──────────┐  ┌───────────┐  ┌──────────┐  ┌───────────────────┐  │
│  │  Camera  │  │ Microphone│  │ Speaker  │  │ Display/Kiosk     │  │
│  └────┬─────┘  └─────┬─────┘  └────▲─────┘  └────────▲──────────┘  │
│       │               │              │                 │             │
└───────┼───────────────┼──────────────┼─────────────────┼─────────────┘
        │               │              │                 │
┌───────▼───────────────▼──────────────┼─────────────────┼─────────────┐
│                     EDGE LAYER                                        │
│  ┌─────────────────────┐  ┌──────────┴─────────────────┴──────────┐  │
│  │  CV Service (Local) │  │       Kiosk Frontend (Next.js)        │  │
│  │  - Person Detection │  │  - 3D Avatar (Three.js/WebGL)         │  │
│  │  - Object Filtering │  │  - Voice Interface (Web Speech API)   │  │
│  │  - Tracking         │  │  - Visitor Registration UI            │  │
│  │  - Liveness         │  │  - QR Code Display                    │  │
│  └──────────┬──────────┘  └──────────────────┬────────────────────┘  │
│             │                                 │                        │
└─────────────┼─────────────────────────────────┼────────────────────────┘
              │                                 │
┌─────────────▼─────────────────────────────────▼────────────────────────┐
│                        CLOUD / SERVER LAYER                             │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    API Gateway / Load Balancer                    │  │
│  └──────────────────────────────┬───────────────────────────────────┘  │
│                                 │                                       │
│  ┌──────────────────────────────▼───────────────────────────────────┐  │
│  │                   Backend API (FastAPI)                           │  │
│  │                                                                   │  │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌──────────────┐  │  │
│  │  │  Auth &    │ │  Visitor   │ │    AI      │ │  Notification│  │  │
│  │  │  RBAC      │ │  Mgmt      │ │   Agent    │ │  Service     │  │  │
│  │  └────────────┘ └────────────┘ └────────────┘ └──────────────┘  │  │
│  │                                                                   │  │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌──────────────┐  │  │
│  │  │  Lead      │ │ Appointment│ │  Knowledge │ │  Analytics   │  │  │
│  │  │  Mgmt      │ │  System    │ │  Base/RAG  │ │  Engine      │  │  │
│  │  └────────────┘ └────────────┘ └────────────┘ └──────────────┘  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                      DATA LAYER                                   │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────────┐  │  │
│  │  │PostgreSQL│  │  Redis   │  │ pgvector │  │  S3 Storage    │  │  │
│  │  │ (Primary)│  │ (Cache)  │  │ (Vectors)│  │  (Files/Docs)  │  │  │
│  │  └──────────┘  └──────────┘  └──────────┘  └────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    EXTERNAL SERVICES                              │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────────┐  │  │
│  │  │  LLM API │  │  STT API │  │  TTS API │  │  Calendar API  │  │  │
│  │  │(OpenAI/  │  │(Whisper/ │  │(ElevenLabs│  │(Google/Outlook)│  │  │
│  │  │ Claude)  │  │ Deepgram)│  │ /Azure)  │  │                │  │  │
│  │  └──────────┘  └──────────┘  └──────────┘  └────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
```

## 3. Component Architecture

### 3.1 Computer Vision Service (Edge)
- **Technology**: Python, YOLOv8, OpenCV, MediaPipe
- **Deployment**: Local edge device (Mini PC)
- **Responsibilities**:
  - Frame capture from camera
  - Person detection with confidence scoring
  - Object classification (human vs non-human)
  - Multi-frame temporal validation
  - Person tracking with session IDs
  - Liveness detection
  - Privacy-first: no raw video transmitted to cloud

### 3.2 Backend API (Cloud/Server)
- **Technology**: Python FastAPI, SQLAlchemy, Pydantic
- **Deployment**: Docker containers on cloud (AWS ECS/EC2)
- **Responsibilities**:
  - RESTful API for all operations
  - WebSocket for real-time communication
  - Authentication & RBAC
  - Visitor management
  - AI agent orchestration
  - Lead management
  - Notification dispatch
  - Knowledge base management

### 3.3 AI Agent
- **Technology**: LangChain/custom agent framework
- **LLM**: OpenAI GPT-4 / Anthropic Claude (configurable)
- **Responsibilities**:
  - Intent detection & mode switching
  - Conversation management
  - Tool calling (database operations)
  - RAG-based knowledge retrieval
  - Multi-language support
  - Context-aware responses

### 3.4 Frontend - Kiosk UI
- **Technology**: Next.js 14, React, TypeScript, Three.js, Tailwind CSS
- **Deployment**: Runs on kiosk display
- **Responsibilities**:
  - 3D avatar rendering & animation
  - Voice input/output interface
  - Visitor registration forms
  - QR code generation/display
  - Real-time status display

### 3.5 Admin Dashboard
- **Technology**: Next.js 14, React, TypeScript, Tailwind CSS, shadcn/ui
- **Deployment**: Web application
- **Responsibilities**:
  - Visitor management
  - Employee management
  - Lead management
  - Analytics & reporting
  - System configuration
  - Knowledge base management

## 4. Data Flow Architecture

### 4.1 Person Detection Flow
```
Camera → Frame Capture → YOLO Detection → Confidence Filter → 
Temporal Validation (1-3s) → Person Confirmed → Session Created → 
Avatar Activation
```

### 4.2 Conversation Flow
```
Microphone → VAD (Voice Activity Detection) → STT → 
AI Agent (LLM + RAG + Tools) → Response Text → 
TTS → Speaker + Avatar Lip Sync
```

### 4.3 Visitor Registration Flow
```
Person Detected → Liveness Check → Identity Check →
[Known: Greet by name] / [Unknown: Ask name + purpose] →
Intent Classification → Mode Switch → 
Conversation → Lead/Record Creation → 
Employee Notification → Session Close
```

## 5. Security Architecture

### 5.1 Network Security
- TLS 1.3 for all communications
- VPN/private network for edge-to-cloud
- WAF for API protection
- DDoS mitigation

### 5.2 Application Security
- JWT + refresh tokens for authentication
- RBAC with fine-grained permissions
- Input validation on all endpoints
- Rate limiting per endpoint
- CORS configuration
- SQL injection prevention (ORM)
- XSS prevention (CSP headers)
- CSRF protection

### 5.3 Data Security
- AES-256 encryption at rest
- TLS in transit
- Secrets in AWS Secrets Manager / env vars
- Biometric data isolation
- Audit logging for all sensitive operations
- Automated data retention enforcement

### 5.4 AI Security
- System prompt protection
- Input sanitization before LLM
- Output validation
- Tool authorization controls
- Prompt injection detection

## 6. Privacy & Consent Architecture

### 6.1 Two-Stage Approach
- **Stage 1 (Detection)**: Anonymous person detection — no identification
- **Stage 2 (Identity)**: Only for enrolled, consented users

### 6.2 Consent Management
- Explicit opt-in for biometric enrollment
- Granular consent options
- Easy consent withdrawal
- Data export on request
- Configurable retention periods
- Automated data deletion

### 6.3 Data Minimization
- Collect only necessary data
- No continuous surveillance storage
- Minimal biometric templates (not raw images)
- Purpose-limited data usage

## 7. Deployment Architecture

### 7.1 Development
- Docker Compose (all services)
- Hot reload for development
- Local PostgreSQL + Redis

### 7.2 Production (AWS)
- ECS Fargate for backend containers
- RDS PostgreSQL (Multi-AZ)
- ElastiCache Redis
- S3 for file storage
- CloudFront CDN for frontend
- ALB for load balancing
- Route 53 for DNS
- Secrets Manager
- CloudWatch for monitoring
- WAF for security

### 7.3 Edge Deployment
- Docker container on Mini PC
- Auto-reconnect to cloud
- Local fallback mode
- OTA updates

## 8. Scalability

- Horizontal scaling via container orchestration
- Database read replicas for analytics
- Redis caching for frequent queries
- CDN for static assets
- Async processing for notifications
- Queue-based job processing

## 9. Monitoring & Observability

- Application metrics (Prometheus/CloudWatch)
- Distributed tracing
- Error tracking (Sentry)
- Log aggregation (CloudWatch Logs)
- Uptime monitoring
- Performance dashboards
- Alert rules for anomalies
