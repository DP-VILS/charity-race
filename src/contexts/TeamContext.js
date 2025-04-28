import React, { createContext, useState, useContext, useEffect } from 'react';

// Create context
const TeamContext = createContext();

// Storage keys
const TEAMS_STORAGE_KEY = 'charity_race_teams';

// Provider component
export const TeamProvider = ({ children }) => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load teams from localStorage on mount
  useEffect(() => {
    const storedTeams = localStorage.getItem(TEAMS_STORAGE_KEY);
    if (storedTeams) {
      setTeams(JSON.parse(storedTeams));
    }
    setLoading(false);
  }, []);

  // Save teams to localStorage whenever they change
  useEffect(() => {
    if (!loading) {
      localStorage.setItem(TEAMS_STORAGE_KEY, JSON.stringify(teams));
    }
  }, [teams, loading]);

  // Create a new team
  const createTeam = (teamData) => {
    const newTeam = {
      ...teamData,
      id: `team_${Date.now()}`,
      createdAt: new Date().toISOString(),
      totalRaised: 0,
      members: [],
    };

    setTeams(prevTeams => [...prevTeams, newTeam]);
    return newTeam;
  };

  // Get a team by ID
  const getTeamById = (teamId) => {
    return teams.find(team => team.id === teamId) || null;
  };

  // Add a member to a team
  const addTeamMember = (teamId, memberData) => {
    const newMember = {
      ...memberData,
      id: `member_${Date.now()}`,
      joinedAt: new Date().toISOString(),
      amountRaised: 0,
    };
    
    setTeams(prevTeams => {
      return prevTeams.map(team => {
        if (team.id === teamId) {
          return {
            ...team,
            members: [...team.members, newMember]
          };
        }
        return team;
      });
    });
    
    return newMember;
  };

  // Record a donation from a team member
  const recordDonation = (teamId, memberId, amount) => {
    setTeams(prevTeams => {
      return prevTeams.map(team => {
        if (team.id === teamId) {
          // Update team total
          const updatedTeam = {
            ...team,
            totalRaised: team.totalRaised + amount
          };
          
          // If member ID is provided, update member amount
          if (memberId) {
            updatedTeam.members = team.members.map(member => {
              if (member.id === memberId) {
                return {
                  ...member,
                  amountRaised: member.amountRaised + amount
                };
              }
              return member;
            });
          }
          
          return updatedTeam;
        }
        return team;
      });
    });
  };

  // Send email notification (simulated)
  const sendEmailNotification = (email, subject, message, link) => {
    // In a real application, this would connect to an email service
    console.log(`Email to: ${email}`);
    console.log(`Subject: ${subject}`);
    console.log(`Message: ${message}`);
    console.log(`Link: ${link}`);
    
    // Simulate successful email sending
    return Promise.resolve({ success: true });
  };

  // Exposed context value
  const contextValue = {
    teams,
    loading,
    createTeam,
    getTeamById,
    addTeamMember,
    recordDonation,
    sendEmailNotification
  };

  return (
    <TeamContext.Provider value={contextValue}>
      {children}
    </TeamContext.Provider>
  );
};

// Custom hook to use the team context
export const useTeam = () => {
  const context = useContext(TeamContext);
  if (!context) {
    throw new Error('useTeam must be used within a TeamProvider');
  }
  return context;
};