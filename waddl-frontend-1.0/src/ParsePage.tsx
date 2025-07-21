import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import ThemeToggle from './components/ThemeToggle';
import './ParsePage.css';

function ParsePage() {
  const navigate = useNavigate();
  const [code, setCode] = useState('// Enter your code here...\n\nfunction example() {\n  console.log("Hello, Waddl!");\n}');

  const handleBackClick = () => {
    navigate('/');
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCode(e.target.value);
  };

  const handleRunCode = () => {
    // TODO: Implement code parsing logic
    console.log('Running code:', code);
  };

  return (
    <div className="parse-page">
      <ThemeToggle />
      <div className="parse-content">
        <div className="parse-header">
          <h1 className="parse-title">Waddl</h1>
          <p className="parse-subtitle">Code parsing and analysis workspace</p>
        </div>
        <div className="parse-workspace">
          <div className="workspace-split">
            <div className="code-editor-section">
              <div className="editor-header">
                <span className="editor-title">Code Editor</span>
                <button className="run-button" onClick={handleRunCode}>
                  <svg className="run-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="5,3 19,12 5,21"/>
                  </svg>
                  <span>Run</span>
                </button>
              </div>
              <textarea
                className="code-editor"
                value={code}
                onChange={handleCodeChange}
                placeholder="Enter your code here..."
                spellCheck={false}
              />
            </div>
            <div className="parse-results-section">
              <div className="results-header">
                <span className="results-title">Parse Results</span>
              </div>
              <div className="results-content">
                <div className="ready-state">
                  <div className="ready-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M9 12l2 2 4-4"/>
                      <path d="M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"/>
                    </svg>
                  </div>
                  <h3 className="ready-title">Ready to Parse</h3>
                  <p className="ready-text">Your parsed code will appear here</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="parse-actions">
          <button className="back-button" onClick={handleBackClick}>
            <svg className="back-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            <span>Back to Home</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ParsePage; 