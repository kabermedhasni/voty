function getVotes(){
    const voteData = new FormData();
    voteData.append('action', 'getResults');

    fetch('../apis/hedera-bridge.php', {
        method: "POST",
        body: voteData
    })
    .then(res => res.json())
    .then(votesPercentages => {
        for (let positionId in votesPercentages) {
            if (positionId === null || positionId === '') {
                continue;
            }
            for (let candidateId in votesPercentages[positionId]) {
                const spanResult = document.querySelector(`.percentage[data-id="${candidateId}"]`);
                spanResult.textContent = `${votesPercentages[positionId][candidateId]} %`;
            }
        }
    })
    .catch(err => console.error('Error:', err));
}
document.addEventListener('DOMContentLoaded', () => {
    getVotes();
})