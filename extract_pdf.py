#!/usr/bin/env python3
"""
PDF Text Extraction Script
Extracts text from PDF files for exam question parsing
"""

import sys
import os

try:
    import PyPDF2
    PDF_LIBRARY = 'PyPDF2'
except ImportError:
    try:
        import pdfplumber
        PDF_LIBRARY = 'pdfplumber'
    except ImportError:
        print("Error: No PDF library found. Please install PyPDF2 or pdfplumber:")
        print("  pip3 install PyPDF2")
        print("  or")
        print("  pip3 install pdfplumber")
        sys.exit(1)

def extract_text_pypdf2(pdf_path):
    """Extract text using PyPDF2"""
    text = []
    with open(pdf_path, 'rb') as file:
        pdf_reader = PyPDF2.PdfReader(file)
        print(f"Total pages: {len(pdf_reader.pages)}")
        for page_num, page in enumerate(pdf_reader.pages, 1):
            page_text = page.extract_text()
            text.append(f"\n{'='*80}\nPAGE {page_num}\n{'='*80}\n{page_text}")
    return '\n'.join(text)

def extract_text_pdfplumber(pdf_path):
    """Extract text using pdfplumber"""
    import pdfplumber
    text = []
    with pdfplumber.open(pdf_path) as pdf:
        print(f"Total pages: {len(pdf.pages)}")
        for page_num, page in enumerate(pdf.pages, 1):
            page_text = page.extract_text()
            text.append(f"\n{'='*80}\nPAGE {page_num}\n{'='*80}\n{page_text}")
    return '\n'.join(text)

def extract_pdf(pdf_path, output_path):
    """Extract text from PDF and save to file"""
    print(f"Extracting text from: {pdf_path}")
    print(f"Using library: {PDF_LIBRARY}")
    
    try:
        if PDF_LIBRARY == 'PyPDF2':
            text = extract_text_pypdf2(pdf_path)
        else:
            text = extract_text_pdfplumber(pdf_path)
        
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(text)
        
        print(f"✓ Successfully extracted text to: {output_path}")
        print(f"  Text length: {len(text)} characters")
        return True
    except Exception as e:
        print(f"✗ Error extracting PDF: {e}")
        return False

if __name__ == '__main__':
    if len(sys.argv) != 3:
        print("Usage: python3 extract_pdf.py <input.pdf> <output.txt>")
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    output_path = sys.argv[2]
    
    if not os.path.exists(pdf_path):
        print(f"Error: PDF file not found: {pdf_path}")
        sys.exit(1)
    
    success = extract_pdf(pdf_path, output_path)
    sys.exit(0 if success else 1)
