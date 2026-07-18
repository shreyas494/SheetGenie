import os
import shutil
import uuid
from typing import Optional, List
from dotenv import load_dotenv

# Load .env file
load_dotenv()
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel

# Import agent functions
from agent import run_agent_loop, get_excel_metadata, convert_pdf_to_xlsx, convert_excel_to_pdf

app = FastAPI(title="SheetGenie AI API")

# Configure CORS so Vite React app can easily connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"],
)

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

class ChatRequest(BaseModel):
    prompt: str
    filePath: Optional[str] = None
    fileId: Optional[str] = None
    chatHistory: Optional[List[dict]] = []

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "message": "SheetGenie backend is running"}

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...), x_api_key: Optional[str] = Header(None)):
    # Verify extension
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in [".xlsx", ".xls", ".csv", ".pdf"]:
        raise HTTPException(status_code=400, detail="Only Excel (.xlsx, .xls), CSV (.csv), and PDF (.pdf) files are supported.")
        
    # Generate unique filename to avoid conflict
    file_id = uuid.uuid4().hex
    filename = f"{file_id}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # Convert CSV to Excel if needed so openpyxl works on it consistently
    if ext == ".csv":
        try:
            import pandas as pd
            df = pd.read_csv(file_path)
            xlsx_filename = f"{file_id}_{os.path.splitext(file.filename)[0]}.xlsx"
            xlsx_path = os.path.join(UPLOAD_DIR, xlsx_filename)
            df.to_excel(xlsx_path, index=False)
            # Remove CSV, work with XLSX
            os.remove(file_path)
            filename = xlsx_filename
            file_path = xlsx_path
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to convert CSV to Excel: {str(e)}")

    # Convert PDF to Excel using Gemini
    elif ext == ".pdf":
        try:
            xlsx_filename = f"{file_id}_{os.path.splitext(file.filename)[0]}.xlsx"
            xlsx_path = os.path.join(UPLOAD_DIR, xlsx_filename)
            
            # API key is either from headers or backend env
            api_key = x_api_key or os.environ.get("GEMINI_API_KEY")
            
            # Convert PDF to Excel
            conv_res = convert_pdf_to_xlsx(file_path, xlsx_path, api_key)
            if not conv_res["success"]:
                raise Exception(conv_res["error"])
                
            # Remove PDF from uploads, work with XLSX
            os.remove(file_path)
            filename = xlsx_filename
            file_path = xlsx_path
        except Exception as e:
            # Cleanup PDF if conversion failed
            if os.path.exists(file_path):
                try:
                    os.remove(file_path)
                except:
                    pass
            raise HTTPException(status_code=500, detail=f"Failed to extract PDF data: {str(e)}")

    # Extract metadata
    metadata = get_excel_metadata(file_path)
    if "error" in metadata:
        # Cleanup
        try:
            os.remove(file_path)
        except:
            pass
        raise HTTPException(status_code=400, detail=metadata["error"])
        
    # Return user-friendly filename ending in .xlsx
    user_filename = os.path.splitext(file.filename)[0] + ".xlsx"
    return {
        "fileId": filename,
        "filePath": file_path,
        "filename": user_filename,
        "metadata": metadata
    }

@app.post("/api/chat")
async def chat(request: ChatRequest, x_api_key: Optional[str] = Header(None)):
    file_id = request.fileId
    if file_id:
        file_path = os.path.join(UPLOAD_DIR, os.path.basename(file_id))
    else:
        file_path = request.filePath
        
    if not file_path or not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Excel file not found. Please upload again.")
        
    # Create an output file path (we modify in place by saving to a new temp file,
    # then overwriting the original if successful, so that if it fails,
    # the original file is preserved).
    dir_name = os.path.dirname(file_path)
    base_name = os.path.basename(file_path)
    temp_out_name = f"temp_{uuid.uuid4().hex}_{base_name}"
    temp_out_path = os.path.join(dir_name, temp_out_name)
    
    # Use headers API key or local environment API key
    api_key = x_api_key or os.environ.get("GEMINI_API_KEY")
    
    res = run_agent_loop(
        file_path=file_path,
        output_path=temp_out_path,
        prompt=request.prompt,
        api_key=api_key,
        chat_history=request.chatHistory
    )
    
    if res["success"]:
        # Overwrite the original working file with the successful changes
        try:
            shutil.move(temp_out_path, file_path)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to update Excel file: {str(e)}")
            
        return {
            "success": True,
            "message": res["message"],
            "data": res.get("data", {}),
            "code": res["code"],
            "logs": res["logs"],
            "metadata": res["metadata"]
        }
    else:
        # Cleanup temp output if any
        if os.path.exists(temp_out_path):
            try:
                os.remove(temp_out_path)
            except:
                pass
        return {
            "success": False,
            "error": res["error"],
            "logs": res["logs"]
        }

@app.get("/api/download")
async def download_file(filePath: Optional[str] = None, fileId: Optional[str] = None):
    if fileId:
        file_path = os.path.join(UPLOAD_DIR, os.path.basename(fileId))
    else:
        file_path = filePath
        
    if not file_path or not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
        
    # Get original filename by stripping the UUID prefix (32 chars of uuid + 1 char underscore)
    base_name = os.path.basename(file_path)
    if len(base_name) > 33 and base_name[32] == "_":
        original_name = base_name[33:]
    elif base_name.startswith("temp_"):
        original_name = base_name.split("_", 2)[-1]
    else:
        original_name = base_name
        
    return FileResponse(
        file_path,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        filename=original_name
    )

@app.get("/api/export-pdf")
async def export_pdf(
    filePath: Optional[str] = None, 
    fileId: Optional[str] = None,
    sheetName: Optional[str] = None,
    orientation: str = "landscape",
    pageSize: str = "letter",
    fitToPage: str = "none",
    margins: str = "normal",
    showGridlines: bool = True
):
    if fileId:
        file_path = os.path.join(UPLOAD_DIR, os.path.basename(fileId))
    else:
        file_path = filePath
        
    if not file_path or not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
        
    # Generate unique PDF filename
    dir_name = os.path.dirname(file_path)
    base_name = os.path.basename(file_path)
    pdf_filename = os.path.splitext(base_name)[0] + ".pdf"
    pdf_path = os.path.join(dir_name, pdf_filename)
    
    try:
        # Convert Excel to PDF
        success = convert_excel_to_pdf(
            excel_path=file_path,
            pdf_path=pdf_path,
            active_sheet_name=sheetName,
            orientation=orientation,
            page_size=pageSize,
            fit_to_page=fitToPage,
            margins=margins,
            show_gridlines=show_gridlines
        )
        if not success or not os.path.exists(pdf_path):
            raise Exception("PDF printer failed to output a file.")
            
        # Get original filename by stripping the UUID prefix
        if len(pdf_filename) > 33 and pdf_filename[32] == "_":
            original_pdf_name = pdf_filename[33:]
        else:
            original_pdf_name = pdf_filename
            
        return FileResponse(
            pdf_path,
            media_type="application/pdf",
            filename=original_pdf_name
        )
    except Exception as e:
        # Cleanup if failed
        if os.path.exists(pdf_path):
            try:
                os.remove(pdf_path)
            except:
                pass
        raise HTTPException(status_code=500, detail=f"Failed to export PDF: {str(e)}")

