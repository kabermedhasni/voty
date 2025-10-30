// Vote Page JavaScript
import { showToast } from './auth/toast.js';

document.addEventListener('DOMContentLoaded', () => {
  // State management
  const state = {
    currentStep: 'election-selection',
    selectedElection: null,
    selectedPosition: null,
    selectedCandidate: null,
    elections: [],
    positions: [],
    candidates: [],
    userVotes: new Set() // Track positions user has already voted for
  };

  // DOM Elements
  const steps = {
    electionSelection: document.getElementById('election-selection-step'),
    positionSelection: document.getElementById('position-selection-step'),
    candidateSelection: document.getElementById('candidate-selection-step'),
    confirmation: document.getElementById('confirmation-step')
  };

  const containers = {
    electionsGrid: document.getElementById('elections-grid'),
    positionsList: document.getElementById('positions-list'),
    candidatesGrid: document.getElementById('candidates-grid')
  };

  const buttons = {
    backToElections: document.getElementById('back-to-elections'),
    backToPositions: document.getElementById('back-to-positions'),
    submitVote: document.getElementById('submit-vote-btn'),
    voteAnotherPosition: document.getElementById('vote-another-position')
  };

  const titles = {
    election: document.getElementById('election-title'),
    position: document.getElementById('position-title')
  };

  // Utility Functions
  function showStep(stepName) {
    Object.values(steps).forEach(step => step.classList.add('hidden'));
    steps[stepName].classList.remove('hidden');
    state.currentStep = stepName;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }

  function getElectionStatus(startDate, endDate) {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) return 'upcoming';
    if (now > end) return 'ended';
    return 'active';
  }

  function getStatusText(status) {
    const statusTexts = {
      active: 'Active',
      upcoming: 'Upcoming',
      ended: 'Ended'
    };
    return statusTexts[status] || status;
  }

  // API Functions
  async function fetchElections() {
    try {
      const response = await fetch(`apis/api.php?action=getActiveElections`);
      if (!response.ok) throw new Error('Failed to fetch elections');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching elections:', error);
      showToast('Failed to load elections. Please refresh the page', 'error');
      return [];
    }
  }

  async function fetchPositionsByElection(electionId) {
    try {
      const response = await fetch(`apis/api.php?action=getPositionByElection&id_election=${electionId}`);
      if (!response.ok) throw new Error('Failed to fetch positions');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching positions:', error);
      showToast('Failed to load positions. Please try again', 'error');
      return [];
    }
  }

  async function fetchCandidatesByPosition(positionId) {
    try {
      const response = await fetch(`apis/api.php?action=getCandidatesByPosition&id_position=${positionId}`);
      if (!response.ok) throw new Error('Failed to fetch candidates');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching candidates:', error);
      showToast('Failed to load candidates. Please try again', 'error');
      return [];
    }
  }

  async function submitVoteToHedera(candidateId, positionId) {
    try {
      // Get user ID from session
      const voterId = document.body.dataset.userId;
      
      if (!voterId) {
        throw new Error('User ID not found');
      }
      
      // Create form data to match PHP expectations
      const formData = new FormData();
      formData.append('action', 'sendVote');
      formData.append('id_candidate', candidateId);
      formData.append('id_voter', voterId);
      formData.append('id_position', positionId);
      
      const response = await fetch('apis/hedera-bridge.php', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit vote');
      }
      
      const result = await response.json();
      
      // Check if the response indicates an error
      if (result.status === 'error') {
        console.error('Server returned error:', result.message);
        
        // Check if it's a Hedera API connection error
        if (result.message && result.message.includes('Connection refused')) {
          return { 
            status: 'error', 
            message: 'Hedera blockchain service is currently unavailable. Please try again later.' 
          };
        }
        
        throw new Error(result.message || 'Vote submission failed');
      }
      
      return result;
    } catch (error) {
      console.error('Error submitting vote:', error);
      throw error;
    }
  }

  // Render Functions
  function renderElections(elections) {
    if (!elections || elections.length === 0) {
      containers.electionsGrid.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
          </div>
          <h3>No Elections Available</h3>
          <p>There are currently no active elections to vote in.</p>
        </div>
      `;
      return;
    }

    const html = elections.map(election => {
      const status = getElectionStatus(election.start_date, election.end_date);
      const lang = document.documentElement.lang || 'en';
      const organizerField = `${lang}_organizer`;
      const organizer = election[organizerField] || election.en_organizer;

      return `
        <div class="election-card" data-election-id="${election.id}" data-status="${status}">
          <div class="election-card-header">
            <div class="election-icon">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
              </svg>
            </div>
            <span class="election-status ${status}">${getStatusText(status)}</span>
          </div>
          <div class="election-card-body">
            <h3>${election.year} ${election.election_type || 'Election'}</h3>
            <div class="election-organizer">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
              </svg>
              ${organizer}
            </div>
            <div class="election-meta">
              <div class="election-meta-item">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
                <span>Starts: <strong>${formatDate(election.start_date)}</strong></span>
              </div>
              <div class="election-meta-item">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
                <span>Ends: <strong>${formatDate(election.end_date)}</strong></span>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    containers.electionsGrid.innerHTML = html;

    // Add click handlers
    document.querySelectorAll('.election-card').forEach(card => {
      card.addEventListener('click', () => {
        const electionId = card.dataset.electionId;
        const status = card.dataset.status;
        
        if (status !== 'active') {
          showToast('This election is not currently active for voting', 'gray');
          return;
        }

        selectElection(electionId);
      });
    });
  }

  function renderPositions(positions) {
    if (!positions || positions.length === 0) {
      containers.positionsList.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </div>
          <h3>No Positions Available</h3>
          <p>There are no positions to vote for in this election.</p>
        </div>
      `;
      return;
    }

    const lang = document.documentElement.lang || 'en';
    const nameField = `${lang}_name`;

    const html = positions.map(position => {
      const positionName = position[nameField] || position.en_name;
      const hasVoted = state.userVotes.has(position.id);

      return `
        <div class="position-card" data-position-id="${position.id}" ${hasVoted ? 'style="pointer-events: none; opacity: 0.6;"' : ''}>
          <div class="position-card-content">
            <h3>${positionName}</h3>
            <div class="position-card-meta">
              <span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
                Candidates available
              </span>
            </div>
          </div>
          ${hasVoted ? `
            <div class="position-voted">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Voted
            </div>
          ` : `
            <svg class="position-card-arrow" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          `}
        </div>
      `;
    }).join('');

    containers.positionsList.innerHTML = html;

    // Add click handlers
    document.querySelectorAll('.position-card').forEach(card => {
      card.addEventListener('click', () => {
        const positionId = card.dataset.positionId;
        selectPosition(positionId);
      });
    });
  }

  function renderCandidates(candidates) {
    if (!candidates || candidates.length === 0) {
      containers.candidatesGrid.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </div>
          <h3>No Candidates Available</h3>
          <p>There are no candidates for this position yet.</p>
        </div>
      `;
      return;
    }

    const lang = document.documentElement.lang || 'en';
    const nameField = lang === 'ar' ? 'ar_name' : 'name';
    const descriptionField = `${lang}_description`;

    const html = candidates.map(candidate => {
      const candidateName = candidate[nameField] || candidate.name;
      const description = candidate[descriptionField] || candidate.en_description || '';

      return `
        <div class="candidate-card-index" data-candidate-id="${candidate.id}">
          <div class="candidate-image-wrapper">
            <img src="${candidate.photo_path}" alt="${candidateName}" class="candidate-image" onerror="this.src='assets/images/candidates/default-avatar.jpg'">
            <div class="candidate-selected-badge">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="3" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            ${candidate.path_supporting_party_logo ? `
              <div class="candidate-party-logo">
                <img src="${candidate.path_supporting_party_logo}" alt="${candidate.Supporting_party}">
              </div>
            ` : ''}
          </div>
          <div class="candidate-card-index-body candidate-card-text-index">
            <h3>${candidateName}</h3>
            ${candidate.Supporting_party ? `
              <div class="candidate-party">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a9 9 0 016.208.682l.108.054a9 9 0 006.086.71l3.114-.732a48.524 48.524 0 01-.005-10.499l-3.11.732a9 9 0 01-6.085-.711l-.108-.054a9 9 0 00-6.208-.682L3 4.5M3 15V4.5" />
                </svg>
                ${candidate.Supporting_party}
              </div>
            ` : ''}
            <p class="candidate-description">${description}</p>
          </div>
        </div>
      `;
    }).join('');

    containers.candidatesGrid.innerHTML = html;

    // Add click handlers
    document.querySelectorAll('.candidate-card-index').forEach(card => {
      card.addEventListener('click', () => {
        // Remove selection from all cards
        document.querySelectorAll('.candidate-card-index').forEach(c => c.classList.remove('selected'));
        
        // Select this card
        card.classList.add('selected');
        state.selectedCandidate = card.dataset.candidateId;
        
        // Enable submit button
        buttons.submitVote.disabled = false;
      });
    });
  }

  // Navigation Functions
  async function selectElection(electionId) {
    const election = state.elections.find(e => e.id == electionId);
    if (!election) return;

    state.selectedElection = election;
    
    const lang = document.documentElement.lang || 'en';
    const organizerField = `${lang}_organizer`;
    const organizer = election[organizerField] || election.en_organizer;
    
    titles.election.textContent = `${election.year} ${organizer}`;

    // Load positions
    containers.positionsList.innerHTML = '<div class="loading-spinner"><svg class="spinner-svg" viewBox="25 25 50 50"><circle r="20" cy="50" cx="50"></circle></svg><p>Loading positions...</p></div>';
    
    const positions = await fetchPositionsByElection(electionId);
    state.positions = positions;
    
    renderPositions(positions);
    showStep('positionSelection');
  }

  async function selectPosition(positionId) {
    const position = state.positions.find(p => p.id == positionId);
    if (!position) return;

    state.selectedPosition = position;
    state.selectedCandidate = null;
    
    const lang = document.documentElement.lang || 'en';
    const nameField = `${lang}_name`;
    const positionName = position[nameField] || position.en_name;
    
    titles.position.textContent = positionName;

    // Load candidates
    containers.candidatesGrid.innerHTML = '<div class="loading-spinner"><svg class="spinner-svg" viewBox="25 25 50 50"><circle r="20" cy="50" cx="50"></circle></svg><p>Loading candidates...</p></div>';
    
    const candidates = await fetchCandidatesByPosition(positionId);
    state.candidates = candidates;
    
    renderCandidates(candidates);
    buttons.submitVote.disabled = true;
    showStep('candidateSelection');
  }

  async function handleVoteSubmission() {
    if (!state.selectedCandidate || !state.selectedPosition) {
      showToast('Please select a candidate before submitting your vote', 'error');
      return;
    }

    // Disable button and show loading
    buttons.submitVote.disabled = true;
    buttons.submitVote.classList.add('loading');

    try {
      const result = await submitVoteToHedera(
        state.selectedCandidate,
        state.selectedPosition.id
      );

      if (result.status === 'success') {
        // Mark position as voted
        state.userVotes.add(state.selectedPosition.id);
        
        // Show success toast
        showToast('Your vote has been securely recorded on the blockchain', 'success');
        
        // Show confirmation step
        showStep('confirmation');
      } else if (result.status === 'alreadyVoted') {
        // Show already voted toast
        showToast('You have already cast your vote for this position', 'gray');
        state.userVotes.add(state.selectedPosition.id);
        // Go back to positions
        setTimeout(() => {
          renderPositions(state.positions);
          showStep('positionSelection');
        }, 1500);
      } else if (result.status === 'error') {
        // Show specific error message from server
        showToast(result.message || 'Unable to submit your vote. Please try again', 'error');
      } else {
        // Unknown status
        showToast('Unexpected response from server. Please try again', 'error');
      }
    } catch (error) {
      console.error('Vote submission error:', error);
      
      // Show more specific error message
      let errorMessage = 'An error occurred during submission. ';
      
      if (error.message === 'User ID not found') {
        errorMessage = 'Session expired. Please refresh the page and log in again.';
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += 'Please check your network connection and try again.';
      }
      
      showToast(errorMessage, 'error');
    } finally {
      buttons.submitVote.disabled = false;
      buttons.submitVote.classList.remove('loading');
    }
  }

  // Event Listeners
  buttons.backToElections.addEventListener('click', () => {
    showStep('electionSelection');
  });

  buttons.backToPositions.addEventListener('click', () => {
    renderPositions(state.positions);
    showStep('positionSelection');
  });

  buttons.submitVote.addEventListener('click', handleVoteSubmission);

  buttons.voteAnotherPosition.addEventListener('click', () => {
    renderPositions(state.positions);
    showStep('positionSelection');
  });

  // Back to home button - reload elections
  const backToHomeBtn = document.getElementById('back-to-home');
  if (backToHomeBtn) {
    backToHomeBtn.addEventListener('click', () => {
      // Reset state and show elections
      state.selectedElection = null;
      state.selectedPosition = null;
      state.selectedCandidate = null;
      renderElections(state.elections);
      showStep('electionSelection');
    });
  }

  // Initialize
  async function init() {
    const elections = await fetchElections();
    state.elections = elections;
    renderElections(elections);
  }

  init();
});
