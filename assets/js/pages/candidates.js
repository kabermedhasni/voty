  function toggleCandidate(card) {
      const allCards = document.querySelectorAll('.candidate-card');
      allCards.forEach(c => {
        if (c !== card) {
          c.classList.remove('expanded');
        }
      });
      card.classList.toggle('expanded');
    }