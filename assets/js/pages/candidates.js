  // Search functionality
  document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchCandidatesInput');
    if (searchInput) {
      searchInput.addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase().trim();
        const candidateCards = document.querySelectorAll('.candidate-card');
        
        candidateCards.forEach(card => {
          const name = card.querySelector('.candidate-name')?.textContent.toLowerCase() || '';
          const organization = card.querySelector('.organization')?.textContent.toLowerCase() || '';
          const bio = card.querySelector('.candidate-bio')?.textContent.toLowerCase() || '';
          
          const matches = name.includes(searchTerm) || 
                         organization.includes(searchTerm) || 
                         bio.includes(searchTerm);
          
          card.style.display = matches ? '' : 'none';
        });
      });
    }
  });

  function toggleCandidate(card) {
      const allCards = document.querySelectorAll('.candidate-card');
      allCards.forEach(c => {
        if (c !== card) {
          c.classList.remove('expanded');
        }
      });
      card.classList.toggle('expanded');
    }