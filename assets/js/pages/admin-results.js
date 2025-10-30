document.addEventListener('DOMContentLoaded', async function () {
  const electionSelect = document.getElementById('electionSelect');
  const resultsContent = document.getElementById('resultsContent');

  let elections = [];
  let currentElectionData = null;

  // Fetch all elections
  async function fetchElections() {
    try {
      const response = await fetch(`../apis/api.php?action=getAllElections`);
      if (!response.ok) throw new Error('Failed to fetch elections');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching elections:', error);
      return [];
    }
  }

  // Fetch candidates by election
  async function fetchCandidatesByElection(electionId) {
    try {
      const response = await fetch(`../apis/api.php?action=getCandidatesByElection&id_election=${electionId}`);
      if (!response.ok) throw new Error('Failed to fetch candidates');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching candidates:', error);
      return [];
    }
  }

  // Fetch votes from Hedera API via Node.js server
  async function fetchVotesFromHedera(electionId) {
    try {
      const response = await fetch('http://localhost:3000/api/get-votes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });
      
      if (!response.ok) throw new Error('Failed to fetch votes');
      const result = await response.json();
      
      // The response has format: { data: [ { positionId, voterId, candidateId }, ... ] }
      const votes = result.data || [];
      return votes;
    } catch (error) {
      console.error('Error fetching votes from Hedera:', error);
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
    elections = await fetchElections();
    
    if (elections.length === 0) {
      electionSelect.innerHTML = '<option value="">No elections available</option>';
      return;
    }

    const lang = document.documentElement.lang || 'en';
    const organizerField = `${lang}_organizer`;
    
    electionSelect.innerHTML = '<option value="">Select an election...</option>' +
      elections.map(election => {
        const organizer = election[organizerField] || election.en_organizer;
        return `<option value="${election.id}">${election.year} - ${organizer}</option>`;
      }).join('');

    // Check URL parameter
    const params = new URLSearchParams(window.location.search);
    const electionId = params.get('id_election');
    if (electionId) {
      electionSelect.value = electionId;
      loadElectionResults(electionId);
    }
  }

  // Event listeners
  electionSelect.addEventListener('change', (e) => {
    const electionId = e.target.value;
    if (electionId) {
      // Update URL
      const url = new URL(window.location);
      url.searchParams.set('id_election', electionId);
      window.history.pushState({}, '', url);
      
      loadElectionResults(electionId);
    } else {
      resultsContent.innerHTML = `
        <div class="empty-state">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
          </svg>
          <h3>No Election Selected</h3>
          <p>Please select an election to view its results</p>
        </div>
      `;
    }
  });

  init();
});
