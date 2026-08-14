# 🤖 AI Office Avatar — Intelligent AI Receptionist & Visitor Management Platform

[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109-green.svg)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)](https://nextjs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue.svg)](https://postgresql.org)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://docker.com)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A production-grade AI-powered virtual receptionist platform that combines computer vision, conversational AI, and visitor management into a unified system displayed on a physical kiosk at office reception.

![Architecture Overview](docs/architecture/SYSTEM_ARCHITECTURE.md)

---

## 🎯 Key Features

### Computer Vision (Edge)
- **Real-time person detection** using YOLOv8
- **Object discrimination** — only triggers for real humans, ignores chairs, bags, posters, etc.
- **Multi-frame temporal validation** — prevents false triggers
- **Person tracking** with session management
- **Liveness detection** — rejects photos, videos, and screen displays
- **Privacy-first** — no raw video transmitted to cloud

### AI Avatar
- **Animated 3D avatar** with facial expressions
- **Lip synchronization** during speech
- **State-based animations** — idle, greeting, listening, thinking, speaking, goodbye
- **Natural conversational behavior**
- **Voice input/output** with Web Speech API

### Intelligent Conversation
- **Multi-mode AI** — automatically switches between client, student, parent, job, internship modes
- **RAG-powered knowledge base** — answers from approved company information only
- **Intent detection** — understands visitor purpose dynamically
- **Multi-language support** — English, Hindi, Kannada
- **Context-aware** — remembers conversation within session

### Visitor Management
- **Consent-based identity** — never secretly identifies visitors
- **Two-stage approach** — detection without identification for unknown visitors
- **Returning visitor recognition** (for enrolled, consented users)
- **Visitor registration** with privacy controls
- **Session tracking** — one interaction per physical visit

### Business Intelligence
- **Lead generation** from every relevant interaction
- **CRM dashboard** with analytics
- **Employee notifications** for visitor arrivals
- **Appointment management**
- **Course/job/internship enquiry processing**

### Security & Privacy
- **RBAC** with fine-grained permissions (9 roles)
- **JWT authentication** with MFA for admins
- **Consent management** with withdrawal mechanisms
- **Data retention policies** with automated cleanup
- **Prompt injection protection**
- **Audit logging** for all sensitive operations

---

## 🏗️ Architecture

```
┌─────────────────────────────┐
│     Physical Layer          │
│  Camera | Mic | Speaker     │
│  Display/Kiosk             │
└──────────┬──────────────────┘
           │
┌──────────▼──────────────────┐
│     Edge Layer              │
│  CV Service (YOLOv8)        │
│  Person Detection + Track   │
│  Liveness Detection         │
│  Next.js Kiosk UI           │
└──────────┬──────────────────┘
           │
┌──────────▼──────────────────┐
│     Cloud/Server Layer      │
│  FastAPI Backend            │
│  AI Agent (LLM + RAG)      │
│  PostgreSQL + pgvector      │
│  Redis Cache                │
│  S3 Storage                 │
└─────────────────────────────┘
```

---

## 📁 Project Structure

```
avatartracking/
├── backend/                    # FastAPI Backend API
│   ├── app/
│   │   ├── api/v1/endpoints/  # API route handlers
│   │   ├── core/              # Config, security, database
│   │   ├── models/            # SQLAlchemy database models
│   │   ├── schemas/           # Pydantic request/response schemas
│   │   ├── services/          # Business logic services
│   │   │   ├── ai_agent.py   # AI conversation engine
│   │   │   ├── cv_service.py # CV event handler
│   │   │   └── knowledge_service.py  # RAG knowledge base
│   │   └── main.py           # FastAPI application entry
│   └── requirements.txt
│
├── frontend/                   # Next.js Frontend
│   └── src/
│       ├── app/
│       │   ├── page.tsx       # Kiosk display (avatar)
│       │   ├── admin/         # Admin dashboard pages
│       │   └── auth/          # Authentication pages
│       ├── components/
│       │   └── avatar/        # Avatar & kiosk components
│       ├── lib/               # API client, utilities
│       └── store/             # Zustand state management
│
├── cv-service/                 # Edge Computer Vision Service
│   └── app/
│       ├── detection/         # YOLOv8 person detector
│       ├── tracking/          # Multi-person tracker
│       ├── liveness/          # Liveness detection
│       └── main.py           # CV pipeline entry
│
├── docker/                     # Docker configuration
│   ├── docker-compose.yml     # All services
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   └── Dockerfile.cv
│
├── docs/                       # Documentation
│   └── architecture/
│       ├── SYSTEM_ARCHITECTURE.md
│       ├── DATABASE_SCHEMA.md
│       ├── API_ARCHITECTURE.md
│       ├── AI_AGENT_ARCHITECTURE.md
│       ├── CV_ARCHITECTURE.md
│       └── AVATAR_ARCHITECTURE.md
│
├── .env.example               # Environment variables template
└── README.md                  # This file
```

---

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 20+ (for local frontend development)
- Python 3.11+ (for local backend development)
- Camera (for CV service)

### 1. Clone & Configure

```bash
git clone https://github.com/your-org/avatartracking.git
cd avatartracking

# Copy and configure environment
cp .env.example .env
# Edit .env with your API keys (OpenAI, Deepgram, etc.)
```

### 2. Start with Docker (Recommended)

```bash
cd docker
docker-compose up -d
```

This starts:
- PostgreSQL with pgvector on port 5432
- Redis on port 6379
- Backend API on port 8000
- Frontend on port 3000

### 3. Access the Application

| Service | URL | Description |
|---------|-----|-------------|
| Kiosk Display | http://localhost:3000 | Avatar reception interface |
| Admin Dashboard | http://localhost:3000/admin | Management dashboard |
| API Docs | http://localhost:8000/docs | Swagger API documentation |
| Login | http://localhost:3000/auth/login | Admin login |

**Default Admin Credentials:**
- Email: `admin@company.com`
- Password: `admin123456` (change immediately in production)

### 4. Start CV Service (with camera)

```bash
cd docker
docker-compose --profile with-camera up cv-service
```

---

## 🔧 Local Development

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Run with hot reload
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### CV Service

```bash
cd cv-service
pip install -r requirements.txt
python -m app.main
```

---

## ⚙️ Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql+asyncpg://avatar:avatar_password@localhost:5432/avatar_db` |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379/0` |
| `SECRET_KEY` | JWT signing key | (must change) |
| `OPENAI_API_KEY` | OpenAI API key for LLM | - |
| `PERSON_CONFIDENCE_THRESHOLD` | Detection confidence (0-1) | `0.75` |
| `STABLE_DETECTION_SECONDS` | Duration before triggering | `1.5` |
| `LIVENESS_CONFIDENCE_THRESHOLD` | Liveness threshold (0-1) | `0.8` |
| `SESSION_TIMEOUT_SECONDS` | Idle session timeout | `300` |
| `COMPANY_NAME` | Your company name | `AI Solutions Pvt Ltd` |

See `.env.example` for all available options.

---

## 🔐 Security

- **Authentication**: JWT with refresh token rotation
- **Authorization**: Role-based access control (9 roles)
- **Encryption**: TLS in transit, AES-256 at rest
- **API Security**: Rate limiting, CORS, input validation
- **AI Security**: Prompt injection protection, output validation
- **Data**: Consent management, retention policies, deletion mechanisms
- **Audit**: Complete audit trail for sensitive operations

### RBAC Roles

| Role | Access Level |
|------|-------------|
| Super Admin | Full system access |
| Admin | System configuration, user management |
| HR | Job/internship applications, employees |
| Reception | Visitor management, sessions |
| Admissions | Course enquiries, leads |
| Trainer | Course and batch info |
| Counsellor | Leads, course enquiries |
| Manager | Team visitors, analytics |
| Employee | Own profile and appointments |

---

## 📊 API Overview

The backend exposes a comprehensive REST API:

- **Auth**: Login, refresh, MFA, user management
- **Visitors**: CRUD, sessions, consent, data export
- **Employees**: Profiles, availability
- **Courses**: Catalog, batches, enquiries
- **Leads**: CRM, followups, assignment
- **Appointments**: Scheduling, calendar sync
- **AI**: Chat, intent detection, TTS/STT
- **CV**: Detection events, session management
- **Knowledge**: RAG document management, search
- **Analytics**: Visitor, lead, conversion statistics
- **Settings**: System configuration
- **Audit**: Activity logs

Full API documentation available at `/docs` when running in development mode.

---

## 🗺️ Development Phases

| Phase | Status | Description |
|-------|--------|-------------|
| Phase 1 | ✅ | Avatar, camera, human detection, greeting, voice |
| Phase 2 | ✅ | Visitor management, registration, sessions |
| Phase 3 | ✅ | Consent-based identity, privacy controls |
| Phase 4 | ✅ | Business AI: courses, jobs, internships, RAG |
| Phase 5 | ✅ | CRM: leads, notifications, appointments |
| Phase 6 | 🔄 | Multilingual, advanced analytics, calendar |
| Phase 7 | 📋 | Production security, monitoring, testing |

---

## 🧪 Testing

```bash
# Backend tests
cd backend
pytest tests/ -v

# Frontend tests
cd frontend
npm run test
```

### Test Scenarios

- Person detection accuracy (humans vs objects)
- Liveness detection (photos, videos, screens)
- Multi-person tracking
- Conversation flow (all modes)
- Intent detection accuracy
- Security (auth, RBAC, injection)
- Performance (detection latency, response time)

---

## 📈 Production Deployment

### AWS Architecture

```
Route 53 → CloudFront → ALB → ECS Fargate (Backend)
                              → S3 (Frontend Static)
                              → RDS PostgreSQL (Multi-AZ)
                              → ElastiCache Redis
                              → S3 (File Storage)
                              → Secrets Manager
                              → CloudWatch (Monitoring)
                              → WAF (Security)
```

### Edge Deployment

The CV service runs locally on a Mini PC at reception:
- Docker container with auto-restart
- Connects to cloud backend via HTTPS
- Local fallback mode when internet unavailable
- OTA updates for model and configuration

---

## 📝 License

MIT License - See [LICENSE](LICENSE) for details.

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📞 Support

For questions or issues, please open a GitHub issue or contact the development team.
