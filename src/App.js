import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { TeamProvider } from './contexts/TeamContext';

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import CreateTeamPage from './pages/CreateTeamPage';
import TeamPage from './pages/TeamPage';
import DonationPage from './pages/DonationPage';

function App() {
  return (
    <TeamProvider>
      <Router>
        <div className="app-container">
          <Header />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/create-team" element={<CreateTeamPage />} />
              <Route path="/team/:teamId" element={<TeamPage />} />
              <Route path="/donate/:teamId/:memberId" element={<DonationPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </TeamProvider>
  );
}

export default App;