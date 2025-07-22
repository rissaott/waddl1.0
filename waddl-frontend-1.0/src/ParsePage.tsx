import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import ThemeToggle from './components/ThemeToggle';
import CodeEditor from './components/CodeEditor';
import CodeDiagram from './components/CodeDiagram';
import './ParsePage.css';

function ParsePage() {
  const navigate = useNavigate();
  const [code, setCode] = useState(`# Welcome to Waddl!
# Enter your Python code here

def greet(name):
    """A simple greeting function"""
    return f"Hello, {name}!"

# Example usage
result = greet("Waddl")
print(result)

# You can add more Python code here
for i in range(3):
    print(f"Count: {i}")`);

  const [parsedData, setParsedData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleBackClick = () => {
    navigate('/');
  };

  const handleCodeChange = (value: string) => {
    setCode(value);
  };

  const handleRunCode = async () => {
    setParsedData(null);
    setError(null);
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:8000/parse', { code });
      const result = response.data.parsed || response.data.error;
      setParsedData(result);
    } catch (err) {
      setError('Failed to connect to backend');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="parse-page">
      <ThemeToggle />
      <button className="back-button-top" onClick={handleBackClick}>
        <svg className="back-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        <span>Back to Home</span>
      </button>
      <div className="parse-content">
        <div className="parse-header">
          <h1 className="parse-title">waddl</h1>
          <p className="parse-subtitle">Code parsing and analysis workspace</p>
        </div>
        <div className="parse-workspace">
          <div className="workspace-split">
            <div className="code-editor-section">
              <div className="editor-header">
                <span className="editor-title">Code Editor</span>
                <button className="run-button" onClick={handleRunCode} disabled={isLoading}>
                  <svg className="run-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="5,3 19,12 5,21"/>
                  </svg>
                  <span>{isLoading ? 'Parsing...' : 'Run'}</span>
                </button>
              </div>
              <div className="editor-container">
                <CodeEditor
                  value={code}
                  onChange={handleCodeChange}
                  placeholder="Enter your Python code here..."
                />
              </div>
            </div>
            <div className="parse-results-section">
              <div className="results-content">
                {isLoading ? (
                  <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Parsing your code...</p>
                  </div>
                ) : parsedData ? (
                  <CodeDiagram parsedData={parsedData} />
                ) : error ? (
                  <div className="error-message">
                    <div className="error-icon">⚠️</div>
                    <p>{error}</p>
                  </div>
                ) : (
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
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ParsePage;
