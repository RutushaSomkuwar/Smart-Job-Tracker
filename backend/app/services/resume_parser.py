import io
import re
from fastapi import UploadFile, HTTPException, status
from pypdf import PdfReader

MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB

def clean_extracted_text(text: str) -> str:
    """Normalize extracted text by removing non-printable characters and extra whitespace."""
    if not text:
        return ""
    
    # Replace non-breaking spaces and unusual whitespace
    text = text.replace("\xa0", " ").replace("\r", "\n")
    
    # Replace 3 or more consecutive newlines with 2
    text = re.sub(r"\n{3,}", "\n\n", text)
    
    # Replace multiple spaces with single space
    text = re.sub(r"[ \t]+", " ", text)
    
    # Strip leading and trailing whitespace
    return text.strip()

async def extract_text_from_pdf(file: UploadFile) -> str:
    """
    Extract readable text from an uploaded PDF file safely.
    Validates file extension, MIME type, size limit, and PDF validity.
    """
    # Check filename extension
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file format. Only PDF files are supported."
        )

    # Read content into memory
    content = await file.read()
    
    # Validate size
    if len(content) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File exceeds maximum allowed size of {MAX_FILE_SIZE_BYTES // (1024 * 1024)}MB."
        )
        
    if len(content) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The uploaded PDF file is empty."
        )

    # Attempt PDF text extraction
    try:
        pdf_stream = io.BytesIO(content)
        reader = PdfReader(pdf_stream)
        
        extracted_pages = []
        for index, page in enumerate(reader.pages):
            page_text = page.extract_text()
            if page_text:
                extracted_pages.append(page_text)
                
        full_text = "\n".join(extracted_pages)
        cleaned_text = clean_extracted_text(full_text)
        
        if not cleaned_text:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Could not extract text from this PDF. It may be scanned or image-based."
            )
            
        return cleaned_text

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to parse PDF document: {str(e)}"
        )
