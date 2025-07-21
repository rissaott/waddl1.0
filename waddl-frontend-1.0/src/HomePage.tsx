import { useNavigate } from 'react-router-dom';
import ThemeToggle from './components/ThemeToggle';
import './HomePage.css';

function HomePage() {
  const navigate = useNavigate();

  const handleParseClick = () => {
    navigate('/parse');
  };

  return (
    <div className="home-page">
      <ThemeToggle />
      <div className="home-content">
        <div className="home-header">
          <h1 className="home-title">waddl</h1>
          <p className="home-subtitle">Welcome to your code parsing workspace</p>
        </div>
        <div className="action-section">
          <button className="parse-button" onClick={handleParseClick}>
            <span className="button-text">Parse</span>
            <svg className="button-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default HomePage; 