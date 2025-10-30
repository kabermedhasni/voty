document.addEventListener('DOMContentLoaded', async function () {
  const electionSelectHidden = document.getElementById('electionSelect');
  const electionDropdownMenu = document.getElementById('electionDropdownMenu');
  const electionDropdownButton = document.querySelector('#electionDropdown .dropdown-text');
  const resultsContent = document.getElementById('resultsContent');

  let elections = [];
  let currentElectionData = null;

  // Fetch all elections
  async function fetchElections() {
    try {
      console.log('[Admin Results] Fetching elections...');
      const response = await fetch(`../apis/api.php?action=getAllElections`);
      console.log('[Admin Results] Elections response status:', response.status);
      if (!response.ok) throw new Error('Failed to fetch elections');
      const data = await response.json();
      console.log('[Admin Results] Elections data:', data);
      return data;
    } catch (error) {
      console.error('[Admin Results] Error fetching elections:', error);
      return [];
    }
  }

  // Fetch candidates by election
  async function fetchCandidatesByElection(electionId) {
    try {
      console.log('[Admin Results] Fetching candidates for election:', electionId);
      const response = await fetch(`../apis/api.php?action=getCandidatesByElection&id_election=${electionId}`);
      console.log('[Admin Results] Candidates response status:', response.status);
      if (!response.ok) throw new Error('Failed to fetch candidates');
      const data = await response.json();
      console.log('[Admin Results] Candidates data:', data);
      return data;
    } catch (error) {
      console.error('[Admin Results] Error fetching candidates:', error);
      return [];
    }
  }

  // Fetch votes from Hedera API via Node.js server
  async function fetchVotesFromHedera(electionId) {
    try {
      console.log('[Admin Results] Fetching votes from Hedera for election:', electionId);
      const response = await fetch('http://localhost:3000/api/get-votes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });
      
      console.log('[Admin Results] Votes response status:', response.status);
      if (!response.ok) throw new Error('Failed to fetch votes');
      const result = await response.json();
      console.log('[Admin Results] Votes result:', result);
      
      // The response has format: { data: [ { positionId, voterId, candidateId }, ... ] }
      const votes = result.data || [];
      console.log('[Admin Results] Total votes retrieved:', votes.length);
      return votes;
    } catch (error) {
      console.error('[Admin Results] Error fetching votes from Hedera:', error);
      return [];
    }
  }

  // Calculate results
  function calculateResults(candidates, votes) {
    const results = {};
    
    // Initialize vote counts
    candidates.forEach(candidate => {
      if (!results[candidate.id_position]) {
        results[candidate.id_position] = {
          position: candidate.position_name,
          position_ar: candidate.position_name_ar,
          position_fr: candidate.position_name_fr,
          candidates: []
        };
      }
      
      results[candidate.id_position].candidates.push({
        id: candidate.id,
        name: candidate.name,
        ar_name: candidate.ar_name,
        photo: candidate.photo_path,
        party: candidate.Supporting_party,
        votes: 0,
        percentage: 0
      });
    });

    // Count votes
    votes.forEach(vote => {
      const candidateId = vote.candidate_id || vote.candidateId;
      const positionId = vote.position_id || vote.positionId;
      
      if (results[positionId]) {
        const candidate = results[positionId].candidates.find(c => c.id == candidateId);
        if (candidate) {
          candidate.votes++;
        }
      }
    });

    // Calculate percentages
    Object.keys(results).forEach(positionId => {
      const position = results[positionId];
      const totalVotes = position.candidates.reduce((sum, c) => sum + c.votes, 0);
      
      position.totalVotes = totalVotes;
      position.candidates.forEach(candidate => {
        candidate.percentage = totalVotes > 0 ? ((candidate.votes / totalVotes) * 100).toFixed(1) : 0;
      });
      
      // Sort by votes descending
      position.candidates.sort((a, b) => b.votes - a.votes);
    });

    return results;
  }

  // Render results
  function renderResults(results) {
    if (!results || Object.keys(results).length === 0) {
      resultsContent.innerHTML = `
        <div class="empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
          </svg>
          <h3>No Results Available</h3>
          <p>No voting data found for this election</p>
        </div>
      `;
      return;
    }

    const lang = document.documentElement.lang || 'en';
    let html = '';

    Object.keys(results).forEach(positionId => {
      const position = results[positionId];
      const positionName = lang === 'ar' ? position.position_ar : (lang === 'fr' ? position.position_fr : position.position);

      html += `
        <div class="position-results">
          <div class="position-results-header">
            <h3>${positionName}</h3>
            <span class="total-votes">${position.totalVotes} Total Votes</span>
          </div>
          <div class="candidates-results">
      `;

      position.candidates.forEach((candidate, index) => {
        const candidateName = lang === 'ar' && candidate.ar_name ? candidate.ar_name : candidate.name;
        const isWinner = index === 0 && candidate.votes > 0;

        html += `
          <div class="candidate-result ${isWinner ? 'winner' : ''}">
            <div class="candidate-result-info">
              <div class="candidate-result-rank">${index + 1}</div>
              <img src="../${candidate.photo}" alt="${candidateName}" class="candidate-result-photo" onerror="this.src='../assets/images/candidates/default-avatar.jpg'">
              <div class="candidate-result-details">
                <h4>${candidateName}</h4>
                ${candidate.party ? `<p class="candidate-party">${candidate.party}</p>` : ''}
              </div>
            </div>
            <div class="candidate-result-stats">
              <div class="vote-count">${candidate.votes} votes</div>
              <div class="vote-percentage">${candidate.percentage}%</div>
            </div>
            <div class="vote-bar">
              <div class="vote-bar-fill" style="width: ${candidate.percentage}%"></div>
            </div>
          </div>
        `;
      });

      html += `
          </div>
        </div>
      `;
    });

    resultsContent.innerHTML = html;
  }

  // Load election results
  async function loadElectionResults(electionId) {
    if (!electionId) return;

    resultsContent.innerHTML = `
      <div class="loading-state">
        <div class="spinner"></div>
        <p>Loading results...</p>
      </div>
    `;

    try {
      const [candidates, votes] = await Promise.all([
        fetchCandidatesByElection(electionId),
        fetchVotesFromHedera(electionId)
      ]);

      const results = calculateResults(candidates, votes);
      renderResults(results);
    } catch (error) {
      console.error('Error loading results:', error);
      resultsContent.innerHTML = `
        <div class="empty-state error">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <h3>Error Loading Results</h3>
          <p>Failed to load election results. Please try again.</p>
        </div>
      `;
    }
  }

  // Initialize
  async function init() {
    console.log('[Admin Results] Initializing...');
    console.log('[Admin Results] Dropdown elements:', {
      electionSelectHidden,
      electionDropdownMenu,
      electionDropdownButton,
      resultsContent
    });
    
    elections = await fetchElections();
    console.log('[Admin Results] Elections loaded:', elections.length);
    
    if (elections.length === 0) {
      console.warn('[Admin Results] No elections available');
      if (electionDropdownMenu) {
        electionDropdownMenu.innerHTML = '<div class="dropdown-item" style="pointer-events: none; opacity: 0.6;"><span>No elections available</span></div>';
      }
      if (electionDropdownButton) {
        electionDropdownButton.textContent = 'No elections available';
      }
      return;
    }

    const lang = document.documentElement.lang || 'en';
    const organizerField = `${lang}_organizer`;
    console.log('[Admin Results] Language:', lang, 'Organizer field:', organizerField);
    
    // Populate custom dropdown
    if (electionDropdownMenu) {
      console.log('[Admin Results] Populating dropdown menu...');
      electionDropdownMenu.innerHTML = elections.map(election => {
        const organizer = election[organizerField] || election.en_organizer;
        return `<div class="dropdown-item" data-value="${election.id}">
          <span>${election.year} - ${organizer}</span>
        </div>`;
      }).join('');
      console.log('[Admin Results] Dropdown menu populated with', elections.length, 'items');
      
      // Manually attach click handlers to dropdown items since they were dynamically added
      const dropdownContainer = document.getElementById('electionDropdown');
      const dropdownButton = dropdownContainer?.querySelector('.dropdown-button');
      const dropdownMenu = dropdownContainer?.querySelector('.dropdown-menu');
      const dropdownItems = dropdownContainer?.querySelectorAll('.dropdown-item');
      
      console.log('[Admin Results] Attaching click handlers to', dropdownItems.length, 'items');
      
      dropdownItems.forEach((item, index) => {
        console.log('[Admin Results] Item', index, ':', {
          value: item.getAttribute('data-value'),
          text: item.textContent.trim(),
          classList: Array.from(item.classList),
          style: item.getAttribute('style')
        });
        
        // Add mouseenter event for debugging
        item.addEventListener('mouseenter', () => {
          console.log('[Admin Results] Mouse entered item:', index);
        });
        
        item.addEventListener('click', (e) => {
          console.log('[Admin Results] Click event fired on item:', index);
          e.stopPropagation();
          e.preventDefault();
          const value = item.getAttribute('data-value');
          console.log('[Admin Results] Item clicked directly:', { index, value });
          
          // Close dropdown
          if (dropdownButton && dropdownMenu) {
            dropdownButton.classList.remove('active');
            dropdownMenu.classList.remove('active');
          }
          
          // Dispatch custom event
          const event = new CustomEvent('dropdown:select', {
            bubbles: true,
            detail: { container: dropdownContainer, button: dropdownButton, menu: dropdownMenu, item, value }
          });
          console.log('[Admin Results] Dispatching dropdown:select event with value:', value);
          document.dispatchEvent(event);
        });
      });
    }
    
    if (electionDropdownButton) {
      electionDropdownButton.textContent = 'Select an election...';
      console.log('[Admin Results] Dropdown button text set');
    }

    // Check URL parameter
    const params = new URLSearchParams(window.location.search);
    const electionId = params.get('id_election');
    console.log('[Admin Results] URL election ID:', electionId);
    
    if (electionId && electionSelectHidden) {
      electionSelectHidden.value = electionId;
      
      // Update button text
      const selectedElection = elections.find(e => String(e.id) === String(electionId));
      if (selectedElection && electionDropdownButton) {
        const organizer = selectedElection[organizerField] || selectedElection.en_organizer;
        electionDropdownButton.textContent = `${selectedElection.year} - ${organizer}`;
        console.log('[Admin Results] Selected election:', selectedElection);
      }
      
      loadElectionResults(electionId);
    }
  }

  // Handle dropdown selection via event delegation
  document.addEventListener('dropdown:select', (e) => {
    console.log('[Admin Results] Dropdown select event received:', e.detail);
    const { container, value, button } = e.detail;
    
    if (container && container.id === 'electionDropdown' && value) {
      console.log('[Admin Results] Election selected:', value);
      
      // Update hidden input
      if (electionSelectHidden) {
        electionSelectHidden.value = value;
        console.log('[Admin Results] Hidden input updated');
      }
      
      // Update button text
      const selectedElection = elections.find(e => String(e.id) === String(value));
      if (selectedElection && electionDropdownButton) {
        const lang = document.documentElement.lang || 'en';
        const organizerField = `${lang}_organizer`;
        const organizer = selectedElection[organizerField] || selectedElection.en_organizer;
        electionDropdownButton.textContent = `${selectedElection.year} - ${organizer}`;
        console.log('[Admin Results] Button text updated to:', electionDropdownButton.textContent);
      }
      
      // Update URL
      const url = new URL(window.location);
      url.searchParams.set('id_election', value);
      window.history.pushState({}, '', url);
      console.log('[Admin Results] URL updated');
      
      loadElectionResults(value);
    } else {
      console.warn('[Admin Results] Invalid dropdown selection:', { container: container?.id, value });
    }
  });

  init();
});
