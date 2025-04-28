import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTeam } from '../contexts/TeamContext';

const CreateTeamPage = () => {
  const navigate = useNavigate();
  const { createTeam, addTeamMember, sendEmailNotification } = useTeam();
  
  // Team data state
  const [teamData, setTeamData] = useState({
    name: '',
    description: '',
    charityId: 'americanredcross', // Default charity
    charityName: 'American Red Cross', // Default charity name
    goalAmount: '',
    organizerName: '',
    organizerEmail: '',
  });
  
  // Member data state - array to hold multiple members
  const [members, setMembers] = useState([
    { fullName: '', email: '' } // Start with one empty member
  ]);
  
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Handle team data changes
  const handleTeamChange = (e) => {
    const { name, value } = e.target;
    setTeamData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle charity selection
  const handleCharityChange = (e) => {
    const { value } = e.target;
    const charityName = e.target.options[e.target.selectedIndex].text;
    
    setTeamData(prev => ({
      ...prev,
      charityId: value,
      charityName: charityName
    }));
  };
  
  // Handle member data changes
  const handleMemberChange = (index, e) => {
    const { name, value } = e.target;
    
    setMembers(prev => {
      const newMembers = [...prev];
      newMembers[index] = {
        ...newMembers[index],
        [name]: value
      };
      return newMembers;
    });
  };
  
  // Add new member field
  const addMemberField = () => {
    setMembers(prev => [...prev, { fullName: '', email: '' }]);
  };
  
  // Remove a member field
  const removeMemberField = (index) => {
    if (members.length === 1) {
      // Don't remove if it's the only member
      return;
    }
    
    setMembers(prev => prev.filter((_, i) => i !== index));
  };
  
  // Validate the form
  const validateForm = () => {
    // Validate team data
    if (!teamData.name.trim()) {
      setError('Team name is required');
      return false;
    }
    
    if (!teamData.goalAmount || teamData.goalAmount <= 0) {
      setError('Please set a valid fundraising goal');
      return false;
    }
    
    if (!teamData.organizerName.trim()) {
      setError('Organizer name is required');
      return false;
    }
    
    if (!teamData.organizerEmail.trim() || !teamData.organizerEmail.includes('@')) {
      setError('Valid organizer email is required');
      return false;
    }
    
    // Validate member data
    let isValid = true;
    members.forEach((member, index) => {
      if (!member.fullName.trim()) {
        setError(`Member ${index + 1} name is required`);
        isValid = false;
      }
      
      if (!member.email.trim() || !member.email.includes('@')) {
        setError(`Member ${index + 1} email is required and must be valid`);
        isValid = false;
      }
    });
    
    return isValid;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Create the team
      const newTeam = createTeam({
        name: teamData.name,
        description: teamData.description,
        charityId: teamData.charityId,
        charityName: teamData.charityName,
        goalAmount: Number(teamData.goalAmount),
        organizer: {
          name: teamData.organizerName,
          email: teamData.organizerEmail
        }
      });
      
      // Add each team member and send email notification
      for (const member of members) {
        const newMember = addTeamMember(newTeam.id, {
          fullName: member.fullName,
          email: member.email
        });
        
        // Generate team page URL
        const teamUrl = `${window.location.origin}/team/${newTeam.id}`;
        const donateUrl = `${window.location.origin}/donate/${newTeam.id}/${newMember.id}`;
        
        // Send email notification (simulated)
        await sendEmailNotification(
          member.email,
          `You've been added to ${teamData.name} charity team!`,
          `${teamData.organizerName} has added you to their charity team supporting ${teamData.charityName}. You can view the team's progress and make donations at the link below.`,
          teamUrl
        );
      }
      
      // Send notification to organizer
      await sendEmailNotification(
        teamData.organizerEmail,
        `Your team ${teamData.name} has been created!`,
        `Your charity team has been created successfully. You can view your team's progress at the link below.`,
        `${window.location.origin}/team/${newTeam.id}`
      );
      
      // Navigate to team page
      navigate(`/team/${newTeam.id}`);
    } catch (err) {
      setError('Failed to create team. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // List of available charities
  const CHARITY_OPTIONS = [
    { id: 'americanredcross', name: 'American Red Cross' },
    { id: 'stjude', name: 'St. Jude Children\'s Research Hospital' },
    { id: 'doctorswithoutborders', name: 'Doctors Without Borders' },
    { id: 'feedingamerica', name: 'Feeding America' },
    { id: 'worldwildlife', name: 'World Wildlife Fund' },
    { id: 'habitat', name: 'Habitat for Humanity' },
    { id: 'unicef', name: 'UNICEF' },
    { id: 'aclu', name: 'American Civil Liberties Union' },
    { id: 'savethechildren', name: 'Save the Children' },
  ];
  
  return (
    <div className="create-team-container">
      <h1>Create a Fundraising Team</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} className="create-team-form">
        <div className="form-section">
          <h2>Team Information</h2>
          
          <div className="form-group">
            <label htmlFor="name">Team Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={teamData.name}
              onChange={handleTeamChange}
              placeholder="Enter your team name"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Description (Optional)</label>
            <textarea
              id="description"
              name="description"
              value={teamData.description}
              onChange={handleTeamChange}
              placeholder="Tell us about your team and why you're fundraising"
              rows={3}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="charityId">Select Charity</label>
            <select
              id="charityId"
              name="charityId"
              value={teamData.charityId}
              onChange={handleCharityChange}
            >
              {CHARITY_OPTIONS.map(charity => (
                <option key={charity.id} value={charity.id}>
                  {charity.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="goalAmount">Fundraising Goal ($)</label>
            <input
              type="number"
              id="goalAmount"
              name="goalAmount"
              value={teamData.goalAmount}
              onChange={handleTeamChange}
              min="1"
              placeholder="Set your fundraising goal"
            />
          </div>
        </div>
        
        <div className="form-section">
          <h2>Team Organizer Information</h2>
          
          <div className="form-group">
            <label htmlFor="organizerName">Your Name</label>
            <input
              type="text"
              id="organizerName"
              name="organizerName"
              value={teamData.organizerName}
              onChange={handleTeamChange}
              placeholder="Enter your full name"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="organizerEmail">Your Email</label>
            <input
              type="email"
              id="organizerEmail"
              name="organizerEmail"
              value={teamData.organizerEmail}
              onChange={handleTeamChange}
              placeholder="Enter your email address"
            />
          </div>
        </div>
        
        <div className="form-section">
          <h2>Team Members</h2>
          <p className="form-description">
            Add team members who will receive an email with a link to donate and view the team's progress.
          </p>
          
          {members.map((member, index) => (
            <div key={index} className="member-input-row">
              <div className="form-group">
                <label htmlFor={`member-name-${index}`}>Name</label>
                <input
                  type="text"
                  id={`member-name-${index}`}
                  name="fullName"
                  value={member.fullName}
                  onChange={(e) => handleMemberChange(index, e)}
                  placeholder="Enter member's full name"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor={`member-email-${index}`}>Email</label>
                <input
                  type="email"
                  id={`member-email-${index}`}
                  name="email"
                  value={member.email}
                  onChange={(e) => handleMemberChange(index, e)}
                  placeholder="Enter member's email address"
                />
              </div>
              
              <button
                type="button"
                className="remove-member-button"
                onClick={() => removeMemberField(index)}
                disabled={members.length === 1}
              >
                Remove
              </button>
            </div>
          ))}
          
          <button
            type="button"
            className="add-member-button"
            onClick={addMemberField}
          >
            + Add Another Member
          </button>
        </div>
        
        <div className="form-actions">
          <button 
            type="submit" 
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating Team...' : 'Create Team'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTeamPage;