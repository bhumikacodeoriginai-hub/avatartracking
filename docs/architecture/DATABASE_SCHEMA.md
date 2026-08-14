# Database Schema — Entity Relationship Design

## Overview

PostgreSQL database with pgvector extension for knowledge embeddings.

## ER Diagram (Textual)

```
┌────────────────┐     ┌─────────────────────┐     ┌──────────────────┐
│     users      │     │     employees       │     │   departments    │
├────────────────┤     ├─────────────────────┤     ├──────────────────┤
│ id (PK)        │◄────│ user_id (FK)        │     │ id (PK)          │
│ email          │     │ id (PK)             │────►│ name             │
│ password_hash  │     │ employee_id         │     │ description      │
│ role           │     │ department_id (FK)  │     │ location         │
│ is_active      │     │ designation         │     │ head_employee_id │
│ mfa_enabled    │     │ skills              │     │ contact_email    │
│ created_at     │     │ working_hours       │     │ created_at       │
│ updated_at     │     │ contact_info        │     └──────────────────┘
└────────────────┘     │ manager_id (FK)     │
                       │ is_available        │
                       │ created_at          │
                       └─────────────────────┘

┌────────────────────┐     ┌──────────────────────┐
│     visitors       │     │   visitor_sessions   │
├────────────────────┤     ├──────────────────────┤
│ id (PK)            │◄────│ visitor_id (FK)      │
│ name               │     │ id (PK)              │
│ email              │     │ session_token        │
│ phone              │     │ started_at           │
│ organization       │     │ ended_at             │
│ profile_type       │     │ status               │
│ first_visit        │     │ detection_confidence │
│ last_visit         │     │ purpose              │
│ visit_count        │     │ mode                 │
│ consent_status     │     │ employee_to_meet     │
│ is_enrolled        │     │ department_routed    │
│ privacy_prefs      │     │ conversation_summary │
│ created_at         │     │ created_at           │
│ updated_at         │     └──────────────────────┘
│ deleted_at         │
└────────────────────┘
        │
        │     ┌──────────────────────────┐
        ├────►│    visitor_consents      │
        │     ├──────────────────────────┤
        │     │ id (PK)                  │
        │     │ visitor_id (FK)          │
        │     │ consent_type             │
        │     │ granted                  │
        │     │ granted_at               │
        │     │ withdrawn_at             │
        │     │ ip_address               │
        │     │ consent_text_version     │
        │     └──────────────────────────┘
        │
        │     ┌──────────────────────────┐
        └────►│  visitor_interactions    │
              ├──────────────────────────┤
              │ id (PK)                  │
              │ session_id (FK)          │
              │ visitor_id (FK)          │
              │ message_role             │
              │ message_content          │
              │ intent_detected          │
              │ language                 │
              │ timestamp                │
              └──────────────────────────┘

┌────────────────────┐     ┌──────────────────────┐
│   appointments     │     │      courses         │
├────────────────────┤     ├──────────────────────┤
│ id (PK)            │     │ id (PK)              │
│ visitor_id (FK)    │     │ name                 │
│ employee_id (FK)   │     │ description          │
│ scheduled_at       │     │ duration             │
│ duration_minutes   │     │ fee                  │
│ status             │     │ level                │
│ purpose            │     │ syllabus             │
│ notes              │     │ mode (online/offline)│
│ calendar_event_id  │     │ is_active            │
│ created_at         │     │ created_at           │
└────────────────────┘     └──────────────────────┘

┌──────────────────────┐     ┌──────────────────────┐
│   course_batches     │     │  course_enquiries    │
├──────────────────────┤     ├──────────────────────┤
│ id (PK)              │     │ id (PK)              │
│ course_id (FK)       │     │ visitor_id (FK)      │
│ batch_name           │     │ course_id (FK)       │
│ start_date           │     │ session_id (FK)      │
│ end_date             │     │ education_level      │
│ timing               │     │ experience           │
│ max_students         │     │ preferred_mode       │
│ enrolled_count       │     │ preferred_timing     │
│ status               │     │ status               │
│ trainer_id (FK)      │     │ notes                │
│ created_at           │     │ created_at           │
└──────────────────────┘     └──────────────────────┘

┌──────────────────────────┐     ┌──────────────────────────┐
│  internship_applications │     │    job_applications      │
├──────────────────────────┤     ├──────────────────────────┤
│ id (PK)                  │     │ id (PK)                  │
│ visitor_id (FK)          │     │ visitor_id (FK)          │
│ session_id (FK)          │     │ session_id (FK)          │
│ education                │     │ experience_years         │
│ degree                   │     │ skills                   │
│ skills                   │     │ qualification            │
│ graduation_year          │     │ preferred_role           │
│ internship_area          │     │ location_preference      │
│ preferred_duration       │     │ notice_period            │
│ resume_url               │     │ resume_url               │
│ status                   │     │ status                   │
│ assigned_to (FK)         │     │ assigned_to (FK)         │
│ created_at               │     │ created_at               │
└──────────────────────────┘     └──────────────────────────┘

┌────────────────────┐     ┌──────────────────────┐
│      leads         │     │   lead_followups     │
├────────────────────┤     ├──────────────────────┤
│ id (PK)            │◄────│ lead_id (FK)         │
│ visitor_id (FK)    │     │ id (PK)              │
│ session_id (FK)    │     │ assigned_to (FK)     │
│ category           │     │ followup_date        │
│ requirement        │     │ notes                │
│ interest_level     │     │ status               │
│ conversation_summ  │     │ completed_at         │
│ source             │     │ created_at           │
│ assigned_to (FK)   │     └──────────────────────┘
│ status             │
│ priority           │
│ followup_date      │
│ created_at         │
│ updated_at         │
└────────────────────┘

┌──────────────────────────┐     ┌──────────────────────────┐
│   knowledge_documents    │     │    knowledge_chunks      │
├──────────────────────────┤     ├──────────────────────────┤
│ id (PK)                  │◄────│ document_id (FK)         │
│ title                    │     │ id (PK)                  │
│ document_type            │     │ content                  │
│ file_url                 │     │ embedding (vector)       │
│ category                 │     │ metadata                 │
│ uploaded_by (FK)         │     │ chunk_index              │
│ is_active                │     │ created_at               │
│ created_at               │     └──────────────────────────┘
│ updated_at               │
└──────────────────────────┘

┌──────────────────────────┐     ┌──────────────────────────┐
│     notifications        │     │      audit_logs          │
├──────────────────────────┤     ├──────────────────────────┤
│ id (PK)                  │     │ id (PK)                  │
│ recipient_id (FK)        │     │ user_id (FK)             │
│ type                     │     │ action                   │
│ channel                  │     │ resource_type            │
│ title                    │     │ resource_id              │
│ message                  │     │ details (JSONB)          │
│ metadata (JSONB)         │     │ ip_address               │
│ is_read                  │     │ user_agent               │
│ sent_at                  │     │ created_at               │
│ created_at               │     └──────────────────────────┘
└──────────────────────────┘

┌──────────────────────────┐     ┌──────────────────────────┐
│    system_settings       │     │   biometric_profiles     │
├──────────────────────────┤     ├──────────────────────────┤
│ id (PK)                  │     │ id (PK)                  │
│ key                      │     │ person_id (FK)           │
│ value (JSONB)            │     │ person_type              │
│ category                 │     │ template_data (encrypted)│
│ description              │     │ quality_score            │
│ updated_by (FK)          │     │ consent_id (FK)          │
│ updated_at               │     │ is_active                │
│ created_at               │     │ created_at               │
└──────────────────────────┘     │ updated_at               │
                                 └──────────────────────────┘
```

## Table Details

### Enums

```sql
-- User roles
CREATE TYPE user_role AS ENUM (
    'super_admin', 'admin', 'hr', 'reception',
    'admissions', 'trainer', 'counsellor', 'manager', 'employee'
);

-- Visitor profile types
CREATE TYPE profile_type AS ENUM (
    'client', 'parent', 'student', 'job_applicant',
    'intern', 'vendor', 'partner', 'guest', 'other'
);

-- Session status
CREATE TYPE session_status AS ENUM (
    'active', 'idle', 'completed', 'abandoned', 'handed_off'
);

-- Lead categories
CREATE TYPE lead_category AS ENUM (
    'course', 'internship', 'job', 'client', 'parent',
    'student', 'corporate', 'partnership', 'general'
);

-- Lead status
CREATE TYPE lead_status AS ENUM (
    'new', 'contacted', 'qualified', 'converted', 'lost', 'archived'
);

-- Consent types
CREATE TYPE consent_type AS ENUM (
    'data_collection', 'biometric_enrollment', 'communication',
    'data_sharing', 'analytics'
);

-- Notification channels
CREATE TYPE notification_channel AS ENUM (
    'dashboard', 'email', 'sms', 'teams', 'slack', 'whatsapp'
);

-- Appointment status
CREATE TYPE appointment_status AS ENUM (
    'scheduled', 'confirmed', 'in_progress', 'completed',
    'cancelled', 'no_show'
);
```

## Indexes

```sql
-- Performance indexes
CREATE INDEX idx_visitors_email ON visitors(email);
CREATE INDEX idx_visitors_phone ON visitors(phone);
CREATE INDEX idx_visitors_consent ON visitors(consent_status);
CREATE INDEX idx_sessions_visitor ON visitor_sessions(visitor_id);
CREATE INDEX idx_sessions_status ON visitor_sessions(status);
CREATE INDEX idx_sessions_date ON visitor_sessions(started_at);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_category ON leads(category);
CREATE INDEX idx_leads_assigned ON leads(assigned_to);
CREATE INDEX idx_appointments_date ON appointments(scheduled_at);
CREATE INDEX idx_appointments_employee ON appointments(employee_id);
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_date ON audit_logs(created_at);
CREATE INDEX idx_notifications_recipient ON notifications(recipient_id);
CREATE INDEX idx_knowledge_chunks_embedding ON knowledge_chunks 
    USING ivfflat (embedding vector_cosine_ops);
```

## Data Retention

| Data Type | Default Retention | Configurable |
|-----------|------------------|--------------|
| Visitor contact data | 2 years | Yes |
| Conversation logs | 90 days | Yes |
| Camera frames | Not stored | N/A |
| Biometric templates | Until consent withdrawn | Yes |
| Audit logs | 7 years | Yes |
| Analytics (aggregated) | Indefinite | Yes |
| Session data | 1 year | Yes |
| Lead data | 3 years | Yes |
