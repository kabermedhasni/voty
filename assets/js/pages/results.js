function getVotes(){
    // Set all percentages to "No votes yet" initially
    const allPercentageSpans = document.querySelectorAll('.percentage');
    allPercentageSpans.forEach(span => {
        span.textContent = '0%';
    });

    const voteData = new FormData();
    voteData.append('action', 'getResults');

    fetch('apis/hedera-bridge.php', {
        method: "POST",
        body: voteData
    })
    .then(res => res.json())
    .then(votesPercentages => {
        console.log('Received vote percentages:', votesPercentages);
        
        for (let positionId in votesPercentages) {
            if (positionId === null || positionId === '') {
                continue;
            }
            for (let candidateId in votesPercentages[positionId]) {
                const spanResult = document.querySelector(`.percentage[data-id="${candidateId}"]`);
                if (spanResult) {
                    let percentage = votesPercentages[positionId][candidateId];
                    // Limit to 3 decimal places
                    percentage = Math.round(percentage * 1000) / 1000;
                    
                    if (percentage === 0) {
                        spanResult.textContent = '0%';
                    } else {
                        spanResult.textContent = `${percentage}%`;
                    }
                    console.log(`Set candidate ${candidateId} to ${percentage}%`);
                } else {
                    console.warn(`No element found for candidate ${candidateId}`);
                }
            }
        }
    })
    .catch(err => console.error('Error fetching results:', err));
}
getVotes();