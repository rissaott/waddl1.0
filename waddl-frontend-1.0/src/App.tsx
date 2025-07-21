import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import HomePage from './HomePage';
import ParsePage from './ParsePage';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/parse" element={<ParsePage />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
