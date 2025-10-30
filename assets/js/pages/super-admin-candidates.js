// Admin Candidates Management
let candidates = [];
let positions = [];
let currentEditId = null;
let deleteTargetId = null;

// SVG Icons
const ICONS = {
    user: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    edit: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13M18.5 2.5C18.8978 2.1022 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.1022 21.5 2.5C21.8978 2.8978 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.1022 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    delete: '<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 6H5H21M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
};

// DOM Elements
const candidatesGrid = document.getElementById('candidatesGrid');
// const addCandidateBtn = document.getElementById('addCandidateBtn');
const candidateModal = document.getElementById('candidateModal');
const deleteModal = document.getElementById('deleteModal');
const candidateForm = document.getElementById('candidateForm');
const modalTitle = document.getElementById('modalTitle');
const closeModal = document.getElementById('closeModal');
const cancelBtn = document.getElementById('cancelBtn');
const saveBtn = document.getElementById('saveBtn');
const closeDeleteModal = document.getElementById('closeDeleteModal');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');

// Form inputs
const candidateIdInput = document.getElementById('candidateId');
const nameInput = document.getElementById('name');
const arNameInput = document.getElementById('ar_name');
const enDescInput = document.getElementById('en_description');
const frDescInput = document.getElementById('fr_description');
const arDescInput = document.getElementById('ar_description');
const supportingPartyInput = document.getElementById('supporting_party');
const idPositionInput = document.getElementById('id_position');
const photoInput = document.getElementById('photo');
const partyLogoInput = document.getElementById('party_logo');
const photoPreview = document.getElementById('photoPreview');
const partyLogoPreview = document.getElementById('partyLogoPreview');
const photoLabel = document.getElementById('photoLabel');
const partyLogoLabel = document.getElementById('partyLogoLabel');
// Custom dropdown elements for position
const positionDropdown = document.getElementById('positionDropdown');
const positionDropdownMenu = document.getElementById('positionDropdownMenu');
const positionSelectedText = document.getElementById('positionSelectedText');
const positionPlaceholder = (positionSelectedText && positionSelectedText.textContent ? positionSelectedText.textContent.trim() : '') || 'Select a position';
const currentLang = (document.documentElement && document.documentElement.lang) ? document.documentElement.lang : 'fr';
const adminContainer = document.querySelector('.admin-candidates-container');
const editLabel = (adminContainer && adminContainer.dataset && adminContainer.dataset.editLabel) ? adminContainer.dataset.editLabel : 'Edit';
const deleteLabel = (adminContainer && adminContainer.dataset && adminContainer.dataset.deleteLabel) ? adminContainer.dataset.deleteLabel : 'Delete';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadPositions();
    const electionId = getQueryParam('id_election');
    if (electionId) {
        loadCandidatesByElection(electionId);
    } else {
        loadCandidates();
    }
    initEventListeners();
});

// Event Listeners
function initEventListeners() {
    // addCandidateBtn.addEventListener('click', openAddModal);
    closeModal.addEventListener('click', closeAddModal);
    cancelBtn.addEventListener('click', closeAddModal);
    candidateModal.querySelector('.modal-overlay').addEventListener('click', closeAddModal);
    
    closeDeleteModal.addEventListener('click', closeDelModal);
    cancelDeleteBtn.addEventListener('click', closeDelModal);
    deleteModal.querySelector('.modal-overlay').addEventListener('click', closeDelModal);
    
    candidateForm.addEventListener('submit', handleSubmit);
    confirmDeleteBtn.addEventListener('click', handleDelete);
    
    // Handle position dropdown selection
    if (positionDropdown) {
        positionDropdown.addEventListener('dropdown:select', (e) => {
            try {
                const { container, item, value } = e.detail || {};
                if (!container || container !== positionDropdown) return;
                const label = (item && item.textContent ? item.textContent.trim() : '') || positionPlaceholder;
                idPositionInput.value = value || '';
                if (positionSelectedText) positionSelectedText.textContent = label;
            } catch (_) {}
        });
    }
    
    // File upload previews
    photoInput.addEventListener('change', (e) => handleFilePreview(e, photoPreview, photoLabel));
    partyLogoInput.addEventListener('change', (e) => handleFilePreview(e, partyLogoPreview, partyLogoLabel));
}

// Load positions
async function loadPositions() {
    try {
        const response = await fetch('../apis/candidate-handler.php?action=get_positions');
        const data = await response.json();
        
        if (data.success) {
            positions = data.positions;
            populatePositionsDropdown();
        }
    } catch (error) {
        console.error('Error loading positions:', error);
    }
}

function populatePositionsDropdown() {
    if (!positionDropdownMenu) return;
    const placeholder = positionPlaceholder;
    positionDropdownMenu.innerHTML = '';
    // Add placeholder/clear selection item
    const placeholderItem = document.createElement('div');
    placeholderItem.className = 'dropdown-item';
    placeholderItem.setAttribute('data-value', '');
    placeholderItem.textContent = placeholder;
    positionDropdownMenu.appendChild(placeholderItem);

    positions.forEach(position => {
        const item = document.createElement('div');
        item.className = 'dropdown-item';
        item.setAttribute('data-value', String(position.id));
        item.textContent = position.name;
        positionDropdownMenu.appendChild(item);
    });

    // Ensure selected text reflects current hidden input if any
    const currentVal = idPositionInput.value;
    if (currentVal) {
        const match = positions.find(p => String(p.id) === String(currentVal));
        if (match && positionSelectedText) positionSelectedText.textContent = match.name;
    } else if (positionSelectedText) {
        positionSelectedText.textContent = placeholder;
    }

    // Attach click handlers to newly created items to ensure selection works
    const items = positionDropdownMenu.querySelectorAll('.dropdown-item');
    items.forEach((item) => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            const value = item.getAttribute('data-value') || '';
            const label = (item.textContent || '').trim() || placeholder;
            idPositionInput.value = value;
            if (positionSelectedText) positionSelectedText.textContent = label;
            // Close dropdown UI
            const btn = document.getElementById('positionDropdownButton');
            if (btn) btn.classList.remove('active');
            positionDropdownMenu.classList.remove('active');
        });
    });
}

// Load candidates (all)
async function loadCandidates() {
    try {
        const response = await fetch('../apis/candidate-handler.php?action=get_all');
        const data = await response.json();
        
        if (data.success) {
            candidates = data.candidates;
            renderCandidates();
        }
    } catch (error) {
        console.error('Error loading candidates:', error);
        notify('Failed to load candidates', 'error');
    }
}

// Load candidates filtered by election
async function loadCandidatesByElection(idElection) {
    try {
        const res = await fetch(`../apis/api.php?action=getCandidatesByElection&id_election=${encodeURIComponent(idElection)}`);
        const list = await res.json();
        candidates = Array.isArray(list) ? list : [];
        if (candidates.length === 0) {
            // Fallback: show all candidates if none linked to this election
            await loadCandidates();
            return;
        }
        renderCandidates();
    } catch (error) {
        console.error('Error loading candidates by election:', error);
        notify('Failed to load candidates', 'error');
    }
}

// Render candidates
function renderCandidates() {
    if (candidates.length === 0) {
        candidatesGrid.innerHTML = `
            <div class="empty-state">
                ${ICONS.user}
                <h3>No candidates yet</h3>
                <p>Start by adding your first candidate</p>
            </div>
        `;
        return;
    }
    
    candidatesGrid.innerHTML = candidates.map(candidate => createCandidateCard(candidate)).join('');
    
    // Add event listeners to action buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
        btn.addEventListener('click', () => openEditModal(parseInt(btn.dataset.id)));
    });
    
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => openDeleteModal(parseInt(btn.dataset.id)));
    });
}

// Create candidate card HTML
function createCandidateCard(candidate) {
    const photoSrc = candidate.photo_path ? `..\\${candidate.photo_path}` : '..\\assets\\images\\candidates\\profile\\candidate-placeholder.png';
    const logoSrc = candidate.path_supporting_party_logo ? `..\\${candidate.path_supporting_party_logo}` : '..\\assets\\images\\candidates\\party\\party-placeholder.jpg';

    let displayName = candidate.name;
    let displayDesc = candidate.en_description;
    if (currentLang === 'ar') {
        displayName = candidate.ar_name || candidate.name;
        displayDesc = candidate.ar_description || candidate.en_description;
    } else if (currentLang === 'fr') {
        displayName = candidate.name; // no separate fr name in schema
        displayDesc = candidate.fr_description || candidate.en_description;
    } else {
        displayName = candidate.name;
        displayDesc = candidate.en_description;
    }
    
    const noElectionBadge = (!candidate.id_position && !candidate.position_election_id) ? '<div class="candidate-no-election">No selected election</div>' : '';

    return `
        <div class="candidate-card">
            <div class="candidate-header">
                <img src="${photoSrc}" alt="${candidate.name}" class="candidate-photo">
                <div class="candidate-info">
                    <div class="candidate-name">${escapeHtml(displayName)}</div>
                    ${noElectionBadge}
                    <div class="candidate-party">
                        <img src="${logoSrc}" alt="${candidate.Supporting_party}" class="party-logo">
                        <span class="party-name">${escapeHtml(candidate.Supporting_party)}</span>
                    </div>
                </div>
            </div>
            <div class="candidate-description">
                ${escapeHtml(displayDesc)}
            </div>
            <div class="candidate-actions">
                <button class="icon-btn edit-btn" data-id="${candidate.id}">
                    ${ICONS.edit}
                    <span>${escapeHtml(editLabel)}</span>
                </button>
                <button class="icon-btn delete-btn" data-id="${candidate.id}">
                    ${ICONS.delete}
                    <span>${escapeHtml(deleteLabel)}</span>
                </button>
            </div>
        </div>
    `;
}

// Modal functions
function openAddModal() {
    currentEditId = null;
    modalTitle.textContent = 'Add Candidate';
    resetForm();
    candidateModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function openEditModal(id) {
    currentEditId = id;
    modalTitle.textContent = 'Edit Candidate';
    const candidate = candidates.find(c => c.id === id);
    
    if (candidate) {
        populateForm(candidate);
        candidateModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeAddModal() {
    candidateModal.classList.remove('active');
    document.body.style.overflow = '';
    resetForm();
}

function openDeleteModal(id) {
    deleteTargetId = id;
    deleteModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeDelModal() {
    deleteModal.classList.remove('active');
    document.body.style.overflow = '';
    deleteTargetId = null;
}

// Form functions
function resetForm() {
    candidateForm.reset();
    candidateIdInput.value = '';
    // Reset position selection UI
    idPositionInput.value = '';
    if (positionSelectedText) positionSelectedText.textContent = positionPlaceholder;
    photoPreview.classList.remove('active');
    photoPreview.innerHTML = '';
    partyLogoPreview.classList.remove('active');
    partyLogoPreview.innerHTML = '';
    photoLabel.textContent = 'Upload image';
    partyLogoLabel.textContent = 'Upload image';
}

function populateForm(candidate) {
    candidateIdInput.value = candidate.id;
    nameInput.value = candidate.name;
    arNameInput.value = candidate.ar_name;
    enDescInput.value = candidate.en_description;
    frDescInput.value = candidate.fr_description;
    arDescInput.value = candidate.ar_description;
    supportingPartyInput.value = candidate.Supporting_party;
    idPositionInput.value = candidate.id_position || '';
    // Reflect in custom dropdown button text
    if (positionSelectedText) {
        const pos = positions.find(p => String(p.id) === String(candidate.id_position));
        positionSelectedText.textContent = pos ? pos.name : positionPlaceholder;
    }
    
    // Show existing images
    if (candidate.photo_path) {
        photoPreview.innerHTML = `<img src="../${candidate.photo_path}" alt="Candidate photo">`;
        photoPreview.classList.add('active');
        photoLabel.textContent = 'Change image';
    }
    
    if (candidate.path_supporting_party_logo) {
        partyLogoPreview.innerHTML = `<img src="../${candidate.path_supporting_party_logo}" alt="Party logo">`;
        partyLogoPreview.classList.add('active');
        partyLogoLabel.textContent = 'Change image';
    }
}

// Handle file preview
function handleFilePreview(event, previewElement, labelElement) {
    const file = event.target.files[0];
    
    if (file) {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                previewElement.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
                previewElement.classList.add('active');
                labelElement.textContent = file.name;
            };
            reader.readAsDataURL(file);
        } else {
            notify('Please select an image file', 'error');
            event.target.value = '';
        }
    }
}

// Handle form submit
async function handleSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(candidateForm);
    const action = currentEditId ? 'update' : 'create';
    formData.append('action', action);
    
    if (currentEditId) {
        formData.set('id', currentEditId);
    }
    
    // Show loading state
    saveBtn.classList.add('loading');
    saveBtn.disabled = true;
    
    try {
        const response = await fetch('../apis/candidate-handler.php', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            closeAddModal();
            await loadCandidates();
            notify(data.message, 'success');
            const savedId = data.id ? parseInt(data.id) : currentEditId;
            if (savedId) {
                showMissingCandidateNote(savedId);
            }
        } else {
            notify(data.message || 'Failed to save candidate', 'error');
        }
    } catch (error) {
        console.error('Error saving candidate:', error);
        notify('An error occurred while saving', 'error');
    } finally {
        saveBtn.classList.remove('loading');
        saveBtn.disabled = false;
    }
}

// Handle delete
async function handleDelete() {
    if (!deleteTargetId) return;
    
    confirmDeleteBtn.classList.add('loading');
    confirmDeleteBtn.disabled = true;
    
    try {
        const formData = new FormData();
        formData.append('action', 'delete');
        formData.append('id', deleteTargetId);
        
        const response = await fetch('../apis/candidate-handler.php', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            closeDelModal();
            await loadCandidates();
            notify(data.message, 'success');
        } else {
            notify(data.message || 'Failed to delete candidate', 'error');
        }
    } catch (error) {
        console.error('Error deleting candidate:', error);
        notify('An error occurred while deleting', 'error');
    } finally {
        confirmDeleteBtn.classList.remove('loading');
        confirmDeleteBtn.disabled = false;
    }
}

// Utility function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showMissingCandidateNote(id) {
    const cand = candidates.find(c => c.id === id);
    if (!cand) return;
    const missing = [];
    const photoMissing = !cand.photo_path || String(cand.photo_path).includes('candidate-placeholder.png');
    const logoMissing = !cand.path_supporting_party_logo || String(cand.path_supporting_party_logo).includes('party-placeholder.jpg');
    const partyMissing = !cand.Supporting_party || String(cand.Supporting_party).trim() === '';
    if (photoMissing) missing.push('profile photo');
    if (logoMissing) missing.push('party logo');
    if (partyMissing) missing.push('party');
    if (missing.length > 0) {
        notify(`Note: Missing ${missing.join(', ')}`, 'gray');
    }
}

// Notification function
function notify(message, type = 'error') {
    // Use global toast if available, otherwise fallback to console
    if (typeof showToast === 'function') {
        showToast(message, type);
    } else {
        console[type === 'error' ? 'error' : 'log'](message);
    }
}

// Helpers
function getQueryParam(key) {
    try {
        const params = new URLSearchParams(window.location.search);
        return params.get(key);
    } catch (_) {
        return null;
    }
}
