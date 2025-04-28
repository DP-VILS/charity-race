// src/pages/HomePage.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useTeam } from '../contexts/TeamContext';

const HomePage = () => {
  const { teams } = useTeam();
  
  return (
    <div className="home-container">
      <section className="racer">
        <div className="racer-content">
          <h1>Charity Race</h1>
          <p>Create teams to raise money for your favorite charities!</p>
          <Link to="/create-team" className="cta-button">
            Create a Team
          </Link>
        </div>
      </section>
      
      {teams.length > 0 && (
        <section className="active-teams">
          <h2>Active Fundraising Teams</h2>
          
          <div className="teams-grid">
            {teams.map(team => (
              <div key={team.id} className="team-card">
                <h3>{team.name}</h3>
                <p>Supporting: {team.charityName}</p>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${Math.min(100, (team.totalRaised / team.goalAmount) * 100)}%` }} 
                  />
                </div>
                <p>
                  ${team.totalRaised} raised of ${team.goalAmount} goal
                </p>
                <Link to={`/team/${team.id}`} className="view-button">
                  View Team
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;