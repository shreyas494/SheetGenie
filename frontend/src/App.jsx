import { useState, useEffect, useRef } from 'react';

// Custom SVG Icons for Premium Interface
const UploadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-secondary" style={{ filter: 'drop-shadow(0 0 8px var(--secondary-glow))' }}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const ExcelIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
    <path d="M8 13h8" />
    <path d="M8 17h8" />
    <path d="M10 9h2" />
  </svg>
);

const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const SendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const CodeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
);

const TerminalIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="4 17 10 11 4 5" />
    <line x1="12" y1="19" x2="20" y2="19" />
  </svg>
);

const RobotIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="10" rx="2" />
    <circle cx="12" cy="5" r="2" />
    <path d="M12 7v4" />
    <line x1="8" y1="16" x2="8" y2="16.01" />
    <line x1="16" y1="16" x2="16" y2="16.01" />
  </svg>
);

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function App() {
  const [file, setFile] = useState(null);
  const [activeSheetName, setActiveSheetName] = useState('');
  const [userInput, setUserInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [agentLogs, setAgentLogs] = useState([]);
  const [latestCode, setLatestCode] = useState('');
  const [showLogs, setShowLogs] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('gemini_api_key') || '');
  const [showSettings, setShowSettings] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorStatus, setErrorStatus] = useState('');
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printOptions, setPrintOptions] = useState({
    orientation: 'landscape',
    pageSize: 'letter',
    fitToPage: 'fit_width',
    margins: 'normal',
    showGridlines: true,
    copies: 1
  });
  
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Auto-scroll chat history
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isLoading]);

  // File drag & drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      await uploadFile(droppedFile);
    }
  };

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      await uploadFile(selectedFile);
    }
  };

  // Upload excel spreadsheet
  const uploadFile = async (fileObj) => {
    const formData = new FormData();
    formData.append('file', fileObj);
    
    setIsLoading(true);
    setErrorStatus('');
    try {
      const response = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to upload spreadsheet.');
      }
      
      setFile({
        filePath: data.filePath,
        fileId: data.fileId,
        filename: data.filename,
        metadata: data.metadata
      });
      
      // Auto-select first sheet
      if (data.metadata?.sheets?.length > 0) {
        setActiveSheetName(data.metadata.sheets[0].name);
      }
      
      // Reset chat and code inspector states for new file
      setChatHistory([
        {
          role: 'agent',
          content: `Successfully uploaded **${data.filename}**! I parsed the columns and structure. Let me know what edits you want me to perform.`
        }
      ]);
      setLatestCode('');
      setAgentLogs([]);
      
    } catch (err) {
      setErrorStatus(err.message);
      setChatHistory([
        {
          role: 'agent',
          content: `⚠️ Upload error: ${err.message}`
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger chat request to agent loop
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!userInput.trim() || isLoading || !file) return;

    const userPrompt = userInput;
    setUserInput('');
    
    // Append user message to chat history
    const updatedHistory = [...chatHistory, { role: 'user', content: userPrompt }];
    setChatHistory(updatedHistory);
    setIsLoading(true);
    setErrorStatus('');
    setShowLogs(true); // Open the logs panel to show agent actions in real time

    try {
      const response = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(apiKey ? { 'X-Api-Key': apiKey } : {})
        },
        body: JSON.stringify({
          prompt: userPrompt,
          filePath: file.filePath,
          fileId: file.fileId,
          chatHistory: updatedHistory.slice(-5) // Send short recent context
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Internal server error during processing.');
      }

      if (data.success) {
        // Update local workbook data state
        setFile(prev => ({
          ...prev,
          metadata: data.metadata
        }));
        
        // Ensure active sheet is still valid or defaults to first
        const sheetExists = data.metadata.sheets.some(s => s.name === activeSheetName);
        if (!sheetExists && data.metadata.sheets.length > 0) {
          setActiveSheetName(data.metadata.sheets[0].name);
        }

        setLatestCode(data.code || '');
        setAgentLogs(data.logs || []);

        setChatHistory(prev => [
          ...prev,
          {
            role: 'agent',
            content: data.message,
            success: true
          }
        ]);
      } else {
        setAgentLogs(data.logs || []);
        throw new Error(data.error || 'The agent could not successfully apply the requested edits.');
      }

    } catch (err) {
      setErrorStatus(err.message);
      setChatHistory(prev => [
        ...prev,
        {
          role: 'agent',
          content: `❌ Error: ${err.message}`,
          success: false
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Save custom Gemini API Key
  const handleSaveSettings = (e) => {
    e.preventDefault();
    localStorage.setItem('gemini_api_key', apiKey);
    setShowSettings(false);
  };

  const handleDownload = async () => {
    if (!file) return;
    try {
      setIsLoading(true);
      const url = `${API_BASE}/api/download?fileId=${encodeURIComponent(file.fileId || '')}&filePath=${encodeURIComponent(file.filePath || '')}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Download failed");
      const blob = await response.blob();
      
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', file.filename || 'sheet.xlsx');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl);
      }, 200);
    } catch (err) {
      console.error("Failed to download spreadsheet:", err);
      alert("Failed to download spreadsheet file: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!file) return;
    try {
      setIsLoading(true);
      setShowPrintModal(false);
      
      const queryParams = new URLSearchParams({
        filePath: file.filePath || '',
        fileId: file.fileId || '',
        sheetName: activeSheetName,
        orientation: printOptions.orientation,
        pageSize: printOptions.pageSize,
        fitToPage: printOptions.fitToPage,
        margins: printOptions.margins,
        showGridlines: printOptions.showGridlines.toString()
      });
      
      const url = `${API_BASE}/api/export-pdf?${queryParams.toString()}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("PDF export failed");
      const blob = await response.blob();
      
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      const baseFilename = file.filename.substring(0, file.filename.lastIndexOf('.')) || file.filename;
      link.setAttribute('download', `${baseFilename}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl);
      }, 200);
    } catch (err) {
      console.error("Failed to export PDF:", err);
      alert("Failed to export PDF: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const activeSheet = file?.metadata?.sheets?.find(s => s.name === activeSheetName);

  // Print Preview Math & Scale Calculations
  const getPageDimensions = () => {
    const isLandscape = printOptions.orientation === 'landscape';
    const isA4 = printOptions.pageSize === 'a4';
    const ratio = isA4 ? 1.414 : 1.294;
    const base = 480; // base height/width
    
    if (isLandscape) {
      return { width: base, height: Math.round(base / ratio) };
    } else {
      return { width: Math.round(base / ratio), height: base };
    }
  };

  const getMarginPadding = () => {
    switch (printOptions.margins) {
      case 'narrow': return 12; // 0.25 in
      case 'wide': return 40;   // 1.0 in
      case 'normal':
      default:
        return 28; // 0.75 in
    }
  };

  const paperDim = getPageDimensions();
  const marginPadding = getMarginPadding();
  const printableWidth = paperDim.width - (marginPadding * 2);
  const printableHeight = paperDim.height - (marginPadding * 2);
  
  const colCount = activeSheet?.columns?.length || 5;
  const rowCount = Math.min(12, activeSheet?.rows?.length || 8);
  const colWidth = 72; // estimated width in pixels
  const rowHeight = 18; // estimated row height in pixels
  
  const totalTableWidth = colCount * colWidth;
  const totalTableHeight = (rowCount + 1) * rowHeight;
  
  let scale = 1;
  if (printOptions.fitToPage === 'fit_width') {
    scale = Math.min(1, printableWidth / totalTableWidth);
  } else if (printOptions.fitToPage === 'fit_height') {
    scale = Math.min(1, printableHeight / totalTableHeight);
  } else if (printOptions.fitToPage === 'fit_sheet') {
    const scaleX = printableWidth / totalTableWidth;
    const scaleY = printableHeight / totalTableHeight;
    scale = Math.min(1, scaleX, scaleY);
  }
  
  const hasHorizontalOverflow = totalTableWidth * scale > printableWidth + 2;
  const hasVerticalOverflow = totalTableHeight * scale > printableHeight + 2;

  return (
    <div className="app-container">
      {/* 1. Sidebar Panel */}
      <aside className="sidebar">
        <div className="brand-section">
          <div className="brand-logo">🪄</div>
          <div>
            <h1 className="brand-name" style={{ margin: 0, fontSize: '20px' }}>SheetGenie AI</h1>
            <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Excel Agent Copilot</div>
          </div>
        </div>

        {/* Upload Trigger Area */}
        <div 
          className={`upload-area ${isDragOver ? 'active' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current.click()}
        >
          <UploadIcon />
          <h4 style={{ margin: '12px 0 6px 0', fontSize: '14px' }}>Upload spreadsheet</h4>
          <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)' }}>
            Drag and drop `.xlsx`, `.xls`, `.csv` or `.pdf` files
          </p>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept=".xlsx,.xls,.csv,.pdf" 
            style={{ display: 'none' }} 
          />
        </div>

        {/* Sheet tab list in active workbook */}
        <div className="sheets-list">
          {file && (
            <>
              <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
                Workbook Sheets ({file.metadata?.sheets?.length || 0})
              </div>
              {file.metadata?.sheets?.map((s, idx) => (
                <button 
                  key={idx}
                  className={`sheet-tab ${activeSheetName === s.name ? 'active' : ''}`}
                  onClick={() => setActiveSheetName(s.name)}
                >
                  <ExcelIcon />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {s.name}
                  </span>
                </button>
              ))}
            </>
          )}
        </div>

        {/* Action Controls & Settings */}
        {file && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '8px' }}>
            <button 
              className="btn-primary" 
              onClick={handleDownload} 
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <DownloadIcon /> Download Sheet
            </button>
            <button 
              className="btn-primary" 
              onClick={() => setShowPrintModal(true)} 
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'linear-gradient(135deg, var(--error), var(--primary))', boxShadow: '0 4px 12px var(--error-glow)' }}
            >
              <DownloadIcon /> Export PDF
            </button>
          </div>
        )}

        <button className="settings-btn" onClick={() => setShowSettings(true)}>
          <SettingsIcon /> Settings & API Key
        </button>
      </aside>

      {/* 2. Main Workspace & Data Grid & Conversational Chat */}
      <main className="main-content">
        {/* Header toolbar */}
        <header className="top-bar">
          <div>
            {file ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '15px', fontWeight: 600 }}>{file.filename}</span>
                <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '12px', background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)' }}>
                  Active Working Copy
                </span>
              </div>
            ) : (
              <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No Spreadsheet Active</span>
            )}
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            {file && (
              <button 
                className="btn-secondary" 
                onClick={() => setShowLogs(!showLogs)}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', padding: '6px 12px' }}
              >
                <TerminalIcon /> {showLogs ? 'Hide Agent Logs' : 'Show Agent Logs'}
              </button>
            )}
          </div>
        </header>

        {/* Data Grid Viewer */}
        <div className="grid-container">
          {activeSheet ? (
            <table className="excel-grid">
              <thead>
                <tr>
                  <th className="row-num-header">#</th>
                  {activeSheet.columns.map((col, idx) => (
                    <th key={idx}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {activeSheet.preview?.length > 0 ? (
                  activeSheet.preview.map((row, rIdx) => (
                    <tr key={rIdx}>
                      <td className="row-num">{rIdx + 1}</td>
                      {activeSheet.columns.map((col, cIdx) => (
                        <td key={cIdx}>
                          {row[col] !== null && row[col] !== undefined ? String(row[col]) : ''}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={activeSheet.columns.length + 1} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                      Sheet is empty or has no visible preview rows.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📊</div>
              <h3 style={{ margin: '0 0 6px 0', color: '#fff' }}>No Active Spreadsheet</h3>
              <p style={{ margin: 0, maxWidth: '400px', textAlign: 'center', fontSize: '13px' }}>
                Upload an Excel workbook or CSV sheet to begin. You can write commands to style headers, add complex arithmetic formula columns, make summary tables, and format specific cells.
              </p>
            </div>
          )}
        </div>

        {/* Floating Conversational Chat Interface */}
        <section className="chat-section">
          <div className="chat-history">
            {chatHistory.map((msg, idx) => (
              <div key={idx} className={`message-bubble ${msg.role}`}>
                <div className="avatar">
                  {msg.role === 'user' ? 'U' : <RobotIcon />}
                </div>
                <div className="message-content">
                  <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="message-bubble agent">
                <div className="avatar pulse"><RobotIcon /></div>
                <div className="message-content" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div className="pulse" style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }} />
                  <span>Agent is thinking & running operations...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="chat-input-area">
            <input 
              type="text" 
              className="chat-input"
              placeholder={file ? "Tell the agent what to do (e.g. 'Format headers blue and bold, add a Total row')" : "Upload a spreadsheet first to begin chatting..."}
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              disabled={isLoading || !file}
            />
            <button type="submit" className="send-btn" disabled={isLoading || !userInput.trim() || !file}>
              <SendIcon />
            </button>
          </form>
        </section>
      </main>

      {/* 3. Right Side Panel: Agent Inspector (Logs & Code) */}
      {showLogs && file && (
        <aside className="inspector-panel">
          <div className="inspector-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}>
              <TerminalIcon /> Agent Inspector Logs
            </div>
            <button 
              onClick={() => setShowLogs(false)} 
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '18px' }}
            >
              ×
            </button>
          </div>
          <div className="inspector-body">
            {agentLogs.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', marginTop: '40px' }}>
                No active execution logs. Tell the agent to make a change to inspect code.
              </div>
            ) : (
              <div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '12px' }}>
                  Execution Step Details
                </div>
                <div className="steps-list">
                  {agentLogs.map((log, lIdx) => (
                    <div 
                      key={lIdx} 
                      className={`step-item ${log.status === 'Success' ? 'success' : log.status === 'Failed' ? 'failed' : 'running'}`}
                    >
                      <div className="step-indicator">{log.attempt}</div>
                      <div className="step-details">
                        <div className="step-title">{log.status}</div>
                        <div className="step-status">{log.message || log.error || 'Execution step log.'}</div>
                        
                        {log.stdout && (
                          <div className="terminal-box" style={{ marginTop: '8px' }}>
                            <div className="terminal-title">Console Output:</div>
                            <div className="terminal-stdout">{log.stdout}</div>
                          </div>
                        )}

                        {log.error && (
                          <div className="terminal-box" style={{ marginTop: '8px', borderColor: 'rgba(239, 68, 68, 0.3)' }}>
                            <div className="terminal-title" style={{ color: 'var(--error)' }}>Error Message:</div>
                            <div className="terminal-stderr">{log.error}</div>
                          </div>
                        )}
                        
                        {log.stderr && !log.error && (
                          <div className="terminal-box" style={{ marginTop: '8px' }}>
                            <div className="terminal-title" style={{ color: 'var(--text-muted)' }}>Stderr Logs:</div>
                            <div className="terminal-stderr">{log.stderr}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {latestCode && (
                  <div style={{ marginTop: '24px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '10px' }}>
                      Generated Agent Code
                    </div>
                    <div className="code-container">
                      <div className="code-header">
                        <span>openpyxl_automation.py</span>
                        <button 
                          onClick={() => navigator.clipboard.writeText(latestCode)}
                          style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '4px', color: '#fff', fontSize: '10px', padding: '4px 8px', cursor: 'pointer' }}
                        >
                          Copy Code
                        </button>
                      </div>
                      <div className="code-body">
                        {latestCode}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </aside>
      )}

      {/* 5. Print Settings & Page Layout Hub */}
      {showPrintModal && (
        <div className="modal-overlay">
          <div className="print-hub-content glass-panel">
            
            {/* Left settings pane */}
            <div className="print-hub-settings">
              <div className="modal-header">
                <h3 className="modal-title">🖨️ Print Setup</h3>
                <button className="modal-close" onClick={() => setShowPrintModal(false)}>×</button>
              </div>

              <div className="form-group">
                <label className="form-label">Copies</label>
                <input 
                  type="number" 
                  min="1" 
                  max="99"
                  className="form-input" 
                  value={printOptions.copies}
                  onChange={(e) => setPrintOptions(prev => ({ ...prev, copies: parseInt(e.target.value) || 1 }))}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Orientation</label>
                <select 
                  className="form-select" 
                  value={printOptions.orientation} 
                  onChange={(e) => setPrintOptions(prev => ({ ...prev, orientation: e.target.value }))}
                >
                  <option value="landscape">Landscape Orientation</option>
                  <option value="portrait">Portrait Orientation</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Paper Size</label>
                <select 
                  className="form-select" 
                  value={printOptions.pageSize} 
                  onChange={(e) => setPrintOptions(prev => ({ ...prev, pageSize: e.target.value }))}
                >
                  <option value="letter">Letter (8.5" x 11")</option>
                  <option value="a4">A4 (21 cm x 29.7 cm)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Scaling Settings</label>
                <select 
                  className="form-select" 
                  value={printOptions.fitToPage} 
                  onChange={(e) => setPrintOptions(prev => ({ ...prev, fitToPage: e.target.value }))}
                >
                  <option value="fit_width">Fit All Columns on 1 Page</option>
                  <option value="none">No Scaling (Actual Size)</option>
                  <option value="fit_height">Fit All Rows on 1 Page</option>
                  <option value="fit_sheet">Fit Sheet on 1 Page</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Margins</label>
                <select 
                  className="form-select" 
                  value={printOptions.margins} 
                  onChange={(e) => setPrintOptions(prev => ({ ...prev, margins: e.target.value }))}
                >
                  <option value="normal">Normal Margins (0.75")</option>
                  <option value="narrow">Narrow Margins (0.25")</option>
                  <option value="wide">Wide Margins (1.0")</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-checkbox-label">
                  <input 
                    type="checkbox" 
                    className="form-checkbox"
                    checked={printOptions.showGridlines}
                    onChange={(e) => setPrintOptions(prev => ({ ...prev, showGridlines: e.target.checked }))}
                  />
                  Print Gridlines
                </label>
              </div>

              <div className="modal-footer">
                <button className="btn-secondary" onClick={() => setShowPrintModal(false)}>
                  Cancel
                </button>
                <button 
                  className="btn-primary" 
                  onClick={handleDownloadPdf}
                  style={{ background: 'linear-gradient(135deg, var(--error), var(--primary))', boxShadow: '0 4px 12px var(--error-glow)', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  Print to PDF
                </button>
              </div>
            </div>

            {/* Right Stage: Visual Page Canvas Simulator */}
            <div className="print-hub-preview">
              {/* Overflow warning badge if content clips */}
              {!printOptions.fitToPage.includes('fit') && (hasHorizontalOverflow || hasVerticalOverflow) && (
                <div className="page-overflow-warning">
                  ⚠️ <span>Warning: Content overflows page breaks and will split.</span>
                </div>
              )}

              <div 
                className="preview-paper" 
                style={{ 
                  width: `${paperDim.width}px`, 
                  height: `${paperDim.height}px`,
                  padding: `${marginPadding}px`
                }}
              >
                <div className="preview-margins">
                  <div className="preview-table-container">
                    {/* Visual Page Break Lines */}
                    {!printOptions.fitToPage.includes('fit') && hasHorizontalOverflow && (
                      <div 
                        className="page-break-line-y" 
                        style={{ left: `${printableWidth}px` }} 
                        title="Horizontal Page Break"
                      />
                    )}
                    {!printOptions.fitToPage.includes('fit') && hasVerticalOverflow && (
                      <div 
                        className="page-break-line-x" 
                        style={{ top: `${printableHeight}px` }} 
                        title="Vertical Page Break"
                      />
                    )}
                    
                    {/* Micro grid data preview */}
                    <table 
                      className={`preview-table ${printOptions.showGridlines ? 'gridlines' : ''}`}
                      style={{ 
                        width: `${totalTableWidth}px`,
                        transform: `scale(${scale})`
                      }}
                    >
                      <thead>
                        <tr>
                          {activeSheet?.columns?.map((col, idx) => (
                            <th key={idx} style={{ width: `${colWidth}px` }}>{col}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {activeSheet?.rows?.slice(0, rowCount).map((row, rIdx) => (
                          <tr key={rIdx}>
                            {activeSheet.columns.map((col, cIdx) => (
                              <td key={cIdx} style={{ width: `${colWidth}px` }}>
                                {row[col] !== undefined ? String(row[col]) : ''}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              
              {/* Micro Page Info Indicator */}
              <div style={{ position: 'absolute', bottom: '12px', left: '50%', transform: 'translateX(-50%)', fontSize: '11px', color: 'var(--text-muted)' }}>
                Page 1 of {!printOptions.fitToPage.includes('fit') && (hasHorizontalOverflow || hasVerticalOverflow) ? '2' : '1'}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 4. Configuration settings Modal */}
      {showSettings && (
        <div className="modal-overlay">
          <form onSubmit={handleSaveSettings} className="modal-content glass-panel">
            <h3 style={{ margin: '0 0 8px 0', color: '#fff' }}>Configure Agent Copilot</h3>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>
              To execute edits, SheetGenie requires connection to the Google Gemini API. Enter your API key below.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>Gemini API Key</label>
              <input 
                type="password" 
                className="chat-input"
                placeholder="AIzaSy..." 
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                style={{ borderRadius: '8px' }}
              />
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Your API key is saved locally in your browser. Leave blank if your local backend has `GEMINI_API_KEY` set in the environment variables.
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
              <button type="button" className="btn-secondary" onClick={() => setShowSettings(false)}>
                Cancel
              </button>
              <button type="submit" className="btn-primary">
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default App;
