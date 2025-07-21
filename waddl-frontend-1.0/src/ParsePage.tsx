import { useNavigate } from 'react-router-dom';
import ThemeToggle from './components/ThemeToggle';
import './ParsePage.css';

function ParsePage() {
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate('/');
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
          <div className="workspace-placeholder">
            <div className="placeholder-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                <polyline points="14,2 14,8 20,8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10,9 9,9 8,9"/>
              </svg>
            </div>
            <h3 className="placeholder-title">Ready to Parse</h3>
            <p className="placeholder-text">Your parsing functionality will appear here</p>
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