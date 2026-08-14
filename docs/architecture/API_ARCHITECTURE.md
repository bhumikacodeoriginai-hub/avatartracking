# API Architecture

## Base URL
```
Production: https://api.avatar.company.com/v1
Development: http://localhost:8000/api/v1
```

## Authentication
- JWT Bearer tokens
- Refresh token rotation
- MFA for admin endpoints
- API keys for service-to-service

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/login | User login |
| POST | /auth/refresh | Refresh token |
| POST | /auth/logout | Invalidate session |
| POST | /auth/mfa/setup | Setup MFA |
| POST | /auth/mfa/verify | Verify MFA code |

### Visitors
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /visitors | List visitors (paginated) |
| GET | /visitors/{id} | Get visitor details |
| POST | /visitors | Create visitor |
| PUT | /visitors/{id} | Update visitor |
| DELETE | /visitors/{id} | Soft delete visitor |
| GET | /visitors/{id}/sessions | Visitor sessions |
| GET | /visitors/{id}/interactions | Visitor interactions |
| POST | /visitors/{id}/consent | Record consent |
| DELETE | /visitors/{id}/consent/{type} | Withdraw consent |
| GET | /visitors/{id}/export | Export visitor data |

### Visitor Sessions
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /sessions | Create session |
| PUT | /sessions/{id} | Update session |
| PUT | /sessions/{id}/end | End session |
| GET | /sessions/active | Get active sessions |
| POST | /sessions/{id}/handoff | Human handoff |

### Employees
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /employees | List employees |
| GET | /employees/{id} | Get employee |
| POST | /employees | Create employee |
| PUT | /employees/{id} | Update employee |
| PUT | /employees/{id}/availability | Set availability |
| GET | /employees/{id}/visitors | Employee's visitors |

### Departments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /departments | List departments |
| GET | /departments/{id} | Get department |
| POST | /departments | Create department |
| PUT | /departments/{id} | Update department |

### Courses
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /courses | List courses |
| GET | /courses/{id} | Get course details |
| POST | /courses | Create course |
| PUT | /courses/{id} | Update course |
| GET | /courses/{id}/batches | Course batches |
| POST | /courses/{id}/batches | Create batch |

### Leads
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /leads | List leads (filtered) |
| GET | /leads/{id} | Get lead |
| POST | /leads | Create lead |
| PUT | /leads/{id} | Update lead |
| PUT | /leads/{id}/assign | Assign lead |
| POST | /leads/{id}/followup | Add followup |
| GET | /leads/stats | Lead statistics |

### Appointments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /appointments | List appointments |
| POST | /appointments | Create appointment |
| PUT | /appointments/{id} | Update appointment |
| PUT | /appointments/{id}/status | Update status |
| GET | /appointments/today | Today's appointments |

### Job Applications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /jobs/applications | List applications |
| POST | /jobs/applications | Create application |
| PUT | /jobs/applications/{id} | Update application |

### Internship Applications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /internships/applications | List applications |
| POST | /internships/applications | Create application |
| PUT | /internships/applications/{id} | Update application |

### Knowledge Base
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /knowledge/documents | List documents |
| POST | /knowledge/documents | Upload document |
| DELETE | /knowledge/documents/{id} | Remove document |
| POST | /knowledge/search | Semantic search |
| GET | /knowledge/categories | List categories |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /notifications | List notifications |
| PUT | /notifications/{id}/read | Mark as read |
| POST | /notifications/send | Send notification |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /analytics/visitors | Visitor analytics |
| GET | /analytics/leads | Lead analytics |
| GET | /analytics/courses | Course analytics |
| GET | /analytics/overview | Dashboard overview |

### AI / Conversation
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /ai/chat | Send message to AI |
| POST | /ai/detect-intent | Detect visitor intent |
| POST | /ai/tts | Text to speech |
| POST | /ai/stt | Speech to text |

### Computer Vision
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /cv/detect | Person detection result |
| POST | /cv/session/start | Start tracking session |
| POST | /cv/session/end | End tracking session |
| POST | /cv/liveness | Liveness check result |
| POST | /cv/identify | Identity match (consented) |

### System Settings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /settings | Get all settings |
| PUT | /settings/{key} | Update setting |
| GET | /settings/avatar | Avatar configuration |
| PUT | /settings/avatar | Update avatar config |
| GET | /settings/detection | Detection thresholds |
| PUT | /settings/detection | Update thresholds |

### Audit
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /audit/logs | Get audit logs |

## WebSocket Endpoints

| Endpoint | Description |
|----------|-------------|
| /ws/reception | Real-time reception updates |
| /ws/notifications | Real-time notifications |
| /ws/avatar | Avatar state updates |
| /ws/cv | CV detection stream |

## Error Response Format
```json
{
    "error": {
        "code": "VALIDATION_ERROR",
        "message": "Human readable message",
        "details": [
            {
                "field": "email",
                "message": "Invalid email format"
            }
        ]
    }
}
```

## Rate Limiting
| Endpoint Group | Limit |
|---------------|-------|
| Auth | 5 req/min |
| AI/Chat | 30 req/min |
| General API | 100 req/min |
| CV Detection | 60 req/min |
| File Upload | 10 req/min |

## Pagination
```json
{
    "data": [...],
    "pagination": {
        "page": 1,
        "per_page": 20,
        "total": 150,
        "total_pages": 8
    }
}
```
