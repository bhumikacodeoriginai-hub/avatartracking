"""Knowledge base endpoints."""

import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.security import require_permission
from app.models.knowledge import KnowledgeDocument, KnowledgeChunk
from app.services.knowledge_service import KnowledgeService

router = APIRouter()


@router.get("/documents")
async def list_documents(
    category: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_permission("manage_knowledge")),
):
    """List knowledge base documents."""
    query = select(KnowledgeDocument).where(KnowledgeDocument.is_active == True)
    if category:
        query = query.where(KnowledgeDocument.category == category)
    query = query.order_by(KnowledgeDocument.created_at.desc())
    
    result = await db.execute(query)
    documents = result.scalars().all()
    return [{
        "id": str(d.id),
        "title": d.title,
        "document_type": d.document_type,
        "category": d.category,
        "chunk_count": d.chunk_count,
        "is_active": d.is_active,
        "created_at": d.created_at,
    } for d in documents]


@router.post("/documents")
async def upload_document(
    title: str = Form(...),
    category: str = Form(...),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_permission("manage_knowledge")),
):
    """Upload and process a knowledge base document."""
    # Validate file type
    allowed_types = ["application/pdf", "text/plain", "text/markdown", "text/html"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail=f"Unsupported file type: {file.content_type}")
    
    # Validate file size (10MB max)
    contents = await file.read()
    if len(contents) > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 10MB)")
    
    ks = KnowledgeService(db)
    document = await ks.process_document(
        title=title,
        category=category,
        content=contents,
        filename=file.filename,
        content_type=file.content_type,
        uploaded_by=current_user["user_id"],
    )
    
    return {
        "id": str(document.id),
        "title": document.title,
        "chunk_count": document.chunk_count,
        "message": "Document processed successfully",
    }


@router.delete("/documents/{document_id}")
async def delete_document(
    document_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(require_permission("manage_knowledge")),
):
    """Remove a knowledge base document."""
    result = await db.execute(
        select(KnowledgeDocument).where(KnowledgeDocument.id == document_id)
    )
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    doc.is_active = False
    await db.commit()
    return {"message": "Document removed from knowledge base"}


@router.post("/search")
async def search_knowledge(
    query: str,
    category: Optional[str] = None,
    top_k: int = 5,
    db: AsyncSession = Depends(get_db),
):
    """Search the knowledge base using semantic search."""
    ks = KnowledgeService(db)
    results = await ks.search(query=query, category=category, top_k=top_k)
    return {"results": results}


@router.get("/categories")
async def list_categories(db: AsyncSession = Depends(get_db)):
    """List knowledge base categories."""
    return {
        "categories": [
            "company", "courses", "fees", "syllabus",
            "policies", "faq", "internship", "jobs",
            "trainers", "office", "admission",
        ]
    }
