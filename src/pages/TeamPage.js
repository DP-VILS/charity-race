import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTeam } from '../contexts/TeamContext';

const TeamPage = () => {
  const { teamId } = useParams();
  const { getTeamById } = useTeam();
  
  const [team, setTeam] = useState(null);
  const [error, setError] = useState('');
  
  // Load team data
  useEffect(() => {
    const loadTeam = () => {
      try {
        const teamData = getTeamById(teamId);
        if (teamData) {
          setTeam(teamData);
        } else {
          setError('Team not found');
        }
      } catch (err) {
        setError('Error loading team details');
        console.error(err);
      }
    };
    
    loadTeam();
  }, [teamId, getTeamById]);
  
  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <Link to="/" className="back-button">
          Back to Home
        </Link>
      </div>
    );
  }
  
  if (!team) {
    return <div className="loading">Loading team details...</div>;
  }
  
  const progressPercentage = Math.min(100, (team.totalRaised / team.goalAmount) * 100);
  
  return (
    <div className="team-page-container">
      <div className="team-header">
        <h1>{team.name}</h1>
        <p className="charity-name">Supporting: {team.charityName}</p>
      </div>
      
      <div className="team-content">
        <section className="team-progress">
          <h2>Fundraising Progress</h2>
          <div className="progress-card">
            <div className="raised-amount">
              <span className="amount-value">${team.totalRaised}</span>
              <span className="amount-label">raised so far</span>
            </div>
            
            <div className="goal-amount">
              <span className="amount-value">${team.goalAmount}</span>
              <span className="amount-label">goal</span>
            </div>
            
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${progressPercentage}%` }} 
              />
            </div>
            
            <p className="progress-percentage">{progressPercentage.toFixed(1)}% Complete</p>
          </div>
          
          {team.description && (
            <div className="team-description">
              <h3>About Our Campaign</h3>
              <p>{team.description}</p>
            </div>
          )}
        </section>
        
        <section className="team-members">
          <h2>Team Members</h2>
          
          {team.members.length === 0 ? (
            <p className="no-members">No team members yet.</p>
          ) : (
            <div className="members-table">
              <div className="table-header">
                <div className="member-name-col">Name</div>
                <div className="member-email-col">Email</div>
                <div className="member-raised-col">Amount Raised</div>
                <div className="member-actions-col">Donate</div>
              </div>
              
              <div className="table-body">
                {team.members.map(member => (
                  <div key={member.id} className="table-row">
                    <div className="member-name-col">{member.fullName}</div>
                    <div className="member-email-col">{member.email}</div>
                    <div className="member-raised-col">${member.amountRaised}</div>
                    <div className="member-actions-col">
                      <Link 
                        to={`/donate/${team.id}/${member.id}`} 
                        className="donate-button"
                      >
                        Donate
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
        
        <section className="team-organizer">
          <h3>Team Organizer</h3>
          <p>
            <strong>{team.organizer?.name || 'Team Organizer'}</strong>
            <br />
            <span className="organizer-email">{team.organizer?.email}</span>
          </p>
        </section>
      </div>
    </div>
  );
};

export default TeamPage;