// Position Management
let currentPositionId = null;
let deleteTargetId = null;

const positionModal = document.getElementById('positionModal');
const positionForm = document.getElementById('positionForm');
const deleteModal = document.getElementById('deleteModal');

const addPositionBtn = document.getElementById('addPositionBtn');
const closePositionModal = document.getElementById('closePositionModal');
const cancelPositionBtn = document.getElementById('cancelPositionBtn');
const savePositionBtn = document.getElementById('savePositionBtn');

const closeDeleteModal = document.getElementById('closeDeleteModal');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

// Open add position modal
addPositionBtn?.addEventListener('click', () => {
    currentPositionId = null;
    document.getElementById('positionModalTitle').textContent = addPositionBtn.textContent.trim();
    positionForm.reset();
    document.getElementById('position_id').value = '';
    openModal(positionModal);
});

// Edit position
document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
        currentPositionId = btn.dataset.id;
        document.getElementById('position_id').value = currentPositionId;
        
        try {
            const response = await fetch(`../apis/api.php?action=getPosition&id=${currentPositionId}`);
            const position = await response.json();
            
            document.getElementById('position_ar_name').value = position.ar_name;
            document.getElementById('position_en_name').value = position.en_name;
            document.getElementById('position_fr_name').value = position.fr_name;
            document.getElementById('position_election_id').value = position.id_election;
            
            openModal(positionModal);
        } catch (err) {
            console.error('Error:', err);
            alert('Error loading position data');
        }
    });
});

// Delete position
document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        deleteTargetId = btn.dataset.id;
        openModal(deleteModal);
    });
});

// Modal functions
function openModal(modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal(modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// Close handlers
closePositionModal.onclick = () => closeModal(positionModal);
cancelPositionBtn.onclick = () => closeModal(positionModal);
positionModal.querySelector('.modal-overlay').onclick = () => closeModal(positionModal);

closeDeleteModal.onclick = () => closeModal(deleteModal);
cancelDeleteBtn.onclick = () => closeModal(deleteModal);
deleteModal.querySelector('.modal-overlay').onclick = () => closeModal(deleteModal);

// Form submission
positionForm.onsubmit = async function(e) {
    e.preventDefault();
    
    savePositionBtn.classList.add('loading');
    savePositionBtn.disabled = true;
    
    const formData = new FormData(positionForm);
    // Always use addPosition; backend will upsert (update if exists for election)
    formData.append('action', 'addPosition');
    
    try {
        const response = await fetch('../apis/api.php', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.text();
        
        if (data.includes('success') || data.includes('added') || data.includes('updated')) {
            closeModal(positionModal);
            window.location.reload();
        } else {
            console.error('Server Response:', data);
            alert('Error: ' + data);
        }
    } catch (err) {
        console.error('Error:', err);
        alert('An error occurred while saving the position');
    } finally {
        savePositionBtn.classList.remove('loading');
        savePositionBtn.disabled = false;
    }
};

// Confirm delete
confirmDeleteBtn.onclick = async function() {
    const formData = new FormData();
    formData.append('action', 'deletePosition');
    formData.append('id', deleteTargetId);
    
    try {
        await fetch('../apis/api.php', {
            method: 'POST',
            body: formData
        });
        
        closeModal(deleteModal);
        window.location.reload();
    } catch (err) {
        console.error('Error:', err);
        alert('An error occurred while deleting the position');
    }
};
