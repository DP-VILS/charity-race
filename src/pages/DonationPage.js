import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTeam } from '../contexts/TeamContext';

const DonationPage = () => {
  const { teamId, memberId } = useParams();
  const navigate = useNavigate();
  const { getTeamById, recordDonation, sendEmailNotification } = useTeam();
  
  const [team, setTeam] = useState(null);
  const [member, setMember] = useState(null);
  const [error, setError] = useState('');
  const [donationAmount, setDonationAmount] = useState(25);
  const [isProcessing, setIsProcessing] = useState(false);
  const [donationComplete, setDonationComplete] = useState(false);
  
  const donateButtonRef = useRef(null);
  
  // Load team and member data
  useEffect(() => {
    const loadData = () => {
      try {
        const teamData = getTeamById(teamId);
        if (!teamData) {
          setError('Team not found');
          return;
        }
        
        setTeam(teamData);
        
        if (memberId) {
          const memberData = teamData.members.find(m => m.id === memberId);
          if (!memberData) {
            setError('Team member not found');
            return;
          }
          
          setMember(memberData);
        }
      } catch (err) {
        setError('Error loading data');
        console.error(err);
      }
    };
    
    loadData();
  }, [teamId, memberId, getTeamById]);
  
  // Load Every.org donate button script
  useEffect(() => {
    if (!team) return;
    
    const loadScript = () => {
      // Check if script already exists
      if (document.getElementById('every-donate-btn-js')) {
        initializeDonateButton();
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://embeds.every.org/0.4/button.js?explicit=1';
      script.async = true;
      script.defer = true;
      script.id = 'every-donate-btn-js';
      
      script.onload = initializeDonateButton;
      script.onerror = () => setError('Failed to load donation button script');
      
      document.body.appendChild(script);
      
      // Cleanup on unmount
      return () => {
        if (document.getElementById('every-donate-btn-js')) {
          document.body.removeChild(script);
        }
      };
    };
    
    const initializeDonateButton = () => {
      if (!window.everyDotOrgDonateButton || !donateButtonRef.current) return;
      
      // Create button
      window.everyDotOrgDonateButton.createButton({
        selector: '#donate-button-container',
        nonprofitSlug: team.charityId,
        withLogo: true,
        bgColor: '#00a37f',
        textColor: 'white',
        borderRadius: '4px',
        fontSize: '18px',
        padding: '12px 24px',
        label: `Donate $${donationAmount}`
      });
      
      // Create widget
      window.everyDotOrgDonateButton.createWidget({
        selector: '#donate-button-container',
        nonprofitSlug: team.charityId,
        defaultDonationAmount: donationAmount,
        showInitialAmount: true,
        primaryColor: '#00a37f',
        defaultFrequency: 'once',
        addAmounts: [10, 25, 50, 100, 250],
        showGiftCardOption: false,
        completeDonationInNewTab: false,
        noExit: false,
        apiKey: 'pk_live_a8a05c6b5358a1066e1e85507ac28ec6'
      });
      
      // Add click listener to simulate donation processing
      const buttonElement = donateButtonRef.current.querySelector('a');
      if (buttonElement) {
        const originalOnClick = buttonElement.onclick;
        
        buttonElement.onclick = (e) => {
          if (originalOnClick) {
            originalOnClick.call(buttonElement, e);
          }
          
          // Simulate donation processing
          setTimeout(() => {
            handleDonationComplete();
          }, 2000);
        };
      }
    };
    
    loadScript();
  }, [team, donationAmount]);
  
  // Handle donation amount change
  const handleAmountChange = (amount) => {
    setDonationAmount(amount);
    
    // Reinitialize button with new amount
    if (window.everyDotOrgDonateButton) {
      window.everyDotOrgDonateButton.setOptions({
        defaultDonationAmount: amount
      });
      
      // Update button label
      const buttonContainer = document.getElementById('donate-button-container');
      if (buttonContainer) {
        const buttonElement = buttonContainer.querySelector('a');
        if (buttonElement) {
          buttonElement.textContent = `Donate $${amount}`;
        }
      }
    }
  };
  
  // Handle donation completion
  const handleDonationComplete = async () => {
    try {
      setIsProcessing(true);
      
      // Record donation in team data
      recordDonation(teamId, memberId, donationAmount);
      
      // Send email notifications
      if (member) {
        // Thank the donor
        await sendEmailNotification(
          member.email,
          `Thank you for your donation to ${team.name}!`,
          `Thank you for your donation of $${donationAmount} to support ${team.charityName} through the ${team.name} team. Your contribution helps make a difference!`,
          `${window.location.origin}/team/${teamId}`
        );
        
        // Notify team organizer
        await sendEmailNotification(
          team.organizer.email,
          `New donation from ${member.fullName}!`,
          `${member.fullName} has donated $${donationAmount} to your team fundraiser for ${team.charityName}. Your team has now raised $${team.totalRaised + donationAmount} toward your goal of $${team.goalAmount}.`,
          `${window.location.origin}/team/${teamId}`
        );
      }
      
      setDonationComplete(true);
    } catch (err) {
      setError('Error processing donation');
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Render error state
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
  
  // Render loading state
  if (!team || (memberId && !member)) {
    return <div className="loading">Loading donation page...</div>;
  }
  
  // Render donation complete state
  if (donationComplete) {
    return (
        <div className="donation-complete">
        <div className="success-message">
          <h2>Thank You for Your Donation!</h2>
          <p>Your donation of ${donationAmount} to support {team.charityName} has been processed successfully.</p>
          
          <div className="donation-details">
            <p>Team: {team.name}</p>
            {member && <p>Team Member: {member.fullName}</p>}
            <p>Charity: {team.charityName}</p>
            <p>Amount: ${donationAmount}</p>
          </div>
          
          <p>A confirmation email has been sent to {member ? member.email : 'your email address'}.</p>
          
          <div className="action-buttons">
            <Link to={`/team/${teamId}`} className="primary-button">
              View Team Page
            </Link>
            <Link to="/" className="secondary-button">
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  // Render donation form
  return (
    <div className="donation-page-container">
      <div className="donation-header">
        <h1>Make a Donation</h1>
        <p>
          Supporting: <strong>{team.charityName}</strong> through <strong>{team.name}</strong>
          {member && <span> (Team member: {member.fullName})</span>}
        </p>
      </div>
      
      <div className="donation-content">
        <section className="donation-form">
          <div className="amount-selector">
            <h3>Select Donation Amount</h3>
            <div className="amount-buttons">
              {[10, 25, 50, 100, 250].map(amount => (
                <button
                  key={amount}
                  className={`amount-button ${amount === donationAmount ? 'selected' : ''}`}
                  onClick={() => handleAmountChange(amount)}
                >
                  ${amount}
                </button>
              ))}
            </div>
          </div>
          
          <div className="donate-button-section">
            <div ref={donateButtonRef} id="donate-button-container">
              <a href={`https://www.every.org/${team.charityId}#/donate`} target="_blank" rel="noopener noreferrer">
                Donate ${donationAmount}
              </a>
            </div>
            
            {isProcessing && <div className="processing-message">Processing donation...</div>}
          </div>
          
          <div className="donation-note">
            <p>Your donation will be processed securely through Every.org.</p>
          </div>
        </section>
        
        <aside className="team-info">
          <h3>About This Team</h3>
          <p>{team.description || `${team.name} is raising money for ${team.charityName}.`}</p>
          
          <div className="progress-section">
            <h4>Fundraising Progress</h4>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${Math.min(100, (team.totalRaised / team.goalAmount) * 100)}%` }} 
              />
            </div>
            <p>${team.totalRaised} raised of ${team.goalAmount} goal</p>
          </div>
          
          <Link to={`/team/${teamId}`} className="view-team-link">
            View Team Page
          </Link>
        </aside>
      </div>
    </div>
  );
};

export default DonationPage;