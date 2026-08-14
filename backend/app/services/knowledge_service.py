"""Knowledge Base Service - RAG-powered document retrieval."""

import hashlib
from typing import Optional, List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.knowledge import KnowledgeDocument, KnowledgeChunk


class KnowledgeService:
    """Manages the company knowledge base with semantic search."""

    def __init__(self, db: Optional[AsyncSession] = None):
        self.db = db
        self.chunk_size = 512  # tokens per chunk
        self.chunk_overlap = 50

    async def process_document(
        self,
        title: str,
        category: str,
        content: bytes,
        filename: str,
        content_type: str,
        uploaded_by: str,
    ) -> KnowledgeDocument:
        """Process and store a document in the knowledge base."""
        # Decode content
        text_content = content.decode("utf-8", errors="ignore")
        
        # Create document record
        content_hash = hashlib.sha256(content).hexdigest()
        
        document = KnowledgeDocument(
            title=title,
            category=category,
            document_type=content_type.split("/")[-1],
            content_hash=content_hash,
            uploaded_by=uploaded_by,
            file_url=f"/documents/{filename}",
        )
        self.db.add(document)
        await self.db.flush()
        
        # Chunk the document
        chunks = self._chunk_text(text_content)
        
        for i, chunk_text in enumerate(chunks):
            chunk = KnowledgeChunk(
                document_id=document.id,
                content=chunk_text,
                chunk_index=i,
                embedding_text=chunk_text,  # Placeholder for vector
                metadata={"source": filename, "chunk_index": i},
            )
            self.db.add(chunk)
        
        document.chunk_count = len(chunks)
        await self.db.commit()
        await self.db.refresh(document)
        
        return document

    async def search(
        self,
        query: str,
        category: Optional[str] = None,
        top_k: int = 5,
    ) -> List[Dict[str, Any]]:
        """Search the knowledge base using text matching (fallback for non-vector mode)."""
        if not self.db:
            return []
        
        try:
            # Simple text search fallback (in production, use pgvector similarity)
            search_query = select(KnowledgeChunk).join(KnowledgeDocument)
            search_query = search_query.where(
                KnowledgeDocument.is_active == True,
                KnowledgeChunk.content.ilike(f"%{query}%"),
            )
            
            if category:
                search_query = search_query.where(KnowledgeDocument.category == category)
            
            search_query = search_query.limit(top_k)
            
            result = await self.db.execute(search_query)
            chunks = result.scalars().all()
            
            return [
                {
                    "content": chunk.content,
                    "metadata": chunk.metadata,
                    "document_id": str(chunk.document_id),
                    "score": 0.8,  # Placeholder score
                }
                for chunk in chunks
            ]
        except Exception:
            return []

    def _chunk_text(self, text: str, chunk_size: int = 500) -> List[str]:
        """Split text into overlapping chunks."""
        words = text.split()
        chunks = []
        
        for i in range(0, len(words), chunk_size - self.chunk_overlap):
            chunk = " ".join(words[i:i + chunk_size])
            if chunk.strip():
                chunks.append(chunk.strip())
        
        return chunks if chunks else [text[:2000]]  # Fallback for very short docs
