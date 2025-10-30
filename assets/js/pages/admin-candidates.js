// Admin Candidates (for regular admins)
// - Loads candidates (optionally filtered by election)
// - Supports opening the add modal via URL (?add=1&id_election=...)
// - Loads positions for the election and populates dropdown
// - Creates candidate via core/candidate-handler.php (action=create)
// - Simple delete with confirm via core/candidate-handler.php (action=delete)

let candidates = [];
let positions = [];
let currentElectionId = null;

// DOM
const candidatesGrid = document.getElementById('candidatesGrid');
const candidateModal = document.getElementById('candidateModal');
const candidateForm = document.getElementById('candidateForm');
const closeModal = document.getElementById('closeModal');
const cancelBtn = document.getElementById('cancelBtn');
const saveBtn = document.getElementById('saveBtn');

// Inputs
const candidateIdInput = document.getElementById('candidateId');
const nameInput = document.getElementById('name');
const arNameInput = document.getElementById('ar_name');
const enDescInput = document.getElementById('en_description');
const frDescInput = document.getElementById('fr_description');
const arDescInput = document.getElementById('ar_description');
const supportingPartyInput = document.getElementById('supporting_party');
const idPositionSelect = document.getElementById('id_position');
const photoInput = document.getElementById('photo');
const partyLogoInput = document.getElementById('party_logo');
const photoPreview = document.getElementById('photoPreview');
const partyLogoPreview = document.getElementById('partyLogoPreview');
const photoLabel = document.getElementById('photoLabel');
const partyLogoLabel = document.getElementById('partyLogoLabel');

// Labels from container
const adminContainer = document.querySelector('.admin-candidates-container');
const editLabel = adminContainer?.dataset?.editLabel || 'Edit';
const deleteLabel = adminContainer?.dataset?.deleteLabel || 'Delete';

document.addEventListener('DOMContentLoaded', async () => {
  const electionId = getQueryParam('id_election');
  currentElectionId = electionId;
  
  await loadCandidates();
  // Don't filter - show all candidates for admin's elections
  renderCandidates();

  initEvents();

  // Open modal only if election ID is provided
  const shouldAdd = getQueryParam('add');
  if (shouldAdd === '1' && electionId) {
    await loadPositionsForElection(electionId);
    openAddModal();
  }
});

function initEvents() {
  closeModal?.addEventListener('click', closeAddModal);
  cancelBtn?.addEventListener('click', closeAddModal);
  candidateModal?.querySelector('.modal-overlay')?.addEventListener('click', closeAddModal);

  candidateForm?.addEventListener('submit', handleCreate);

  photoInput?.addEventListener('change', (e) => handleFilePreview(e, photoPreview, photoLabel));
  partyLogoInput?.addEventListener('change', (e) => handleFilePreview(e, partyLogoPreview, partyLogoLabel));
}

async function loadCandidates() {
  try {
    const res = await fetch('../apis/candidate-handler.php?action=get_all');
    const data = await res.json();
    if (data.success) candidates = data.candidates || [];
    else candidates = [];
  } catch (e) {
    console.error('Failed to load candidates', e);
    candidates = [];
  }
}

function filterCandidatesByElection(electionId) {
  try {
    candidates = candidates.filter(c => String(c.position_election_id || '') === String(electionId));
  } catch (_) {}
}

function renderCandidates() {
  if (!candidatesGrid) return;
  
  if (!Array.isArray(candidates) || candidates.length === 0) {
    candidatesGrid.innerHTML = `
      <div class="empty-state">
        <h3>No candidates yet</h3>
        <p>Start by adding your first candidate from the <a href="admin-elections.php">Elections page</a></p>
      </div>
    `;
    return;
  }

  candidatesGrid.innerHTML = candidates.map(createCandidateCard).join('');

  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', () => openEditModal(parseInt(btn.dataset.id)));
  });
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', () => handleDeleteCandidate(parseInt(btn.dataset.id)));
  });
}

function createCandidateCard(candidate) {
  const photoSrc = candidate.photo_path ? `..\\${candidate.photo_path}` : '..\\assets\\images\\candidates\\profile\\candidate-placeholder.png';
  const logoSrc = candidate.path_supporting_party_logo ? `..\\${candidate.path_supporting_party_logo}` : '..\\assets\\images\\candidates\\party\\party-placeholder.jpg';
  const displayName = candidate.name || '';
  const displayDesc = candidate.fr_description || candidate.en_description || '';

  return `
    <div class="candidate-card">
      <div class="candidate-header">
        <img src="${photoSrc}" alt="${escapeHtml(displayName)}" class="candidate-photo">
        <div class="candidate-info">
          <div class="candidate-name">${escapeHtml(displayName)}</div>
          <div class="candidate-party">
            <img src="${logoSrc}" alt="${escapeHtml(candidate.Supporting_party || '')}" class="party-logo">
            <span class="party-name">${escapeHtml(candidate.Supporting_party || '')}</span>
          </div>
        </div>
      </div>
      <div class="candidate-description">${escapeHtml(displayDesc)}</div>
      <div class="candidate-actions">
        <button class="icon-btn edit-btn" data-id="${candidate.id}">
          <span>${escapeHtml(editLabel)}</span>
        </button>
        <button class="icon-btn delete-btn" data-id="${candidate.id}">
          <span>${escapeHtml(deleteLabel)}</span>
        </button>
      </div>
    </div>
  `;
}

async function loadPositionsForElection(electionId) {
  try {
    const res = await fetch(`../apis/api.php?action=getPositionByElection&id_election=${encodeURIComponent(electionId)}`);
    const list = await res.json();
    positions = Array.isArray(list) ? list : [];
    populatePositionDropdown();
  } catch (e) {
    console.error('Failed to load positions', e);
    positions = [];
  }
}

function populatePositionDropdown() {
  if (!idPositionSelect) return;
  
  // Clear existing options
  idPositionSelect.innerHTML = '<option value="">Select a position</option>';
  
  if (positions.length === 0) {
    idPositionSelect.innerHTML = '<option value="">No positions available - Please add positions first</option>';
    idPositionSelect.disabled = true;
    notify('No positions available for this election. Please add positions first.', 'warning');
    return;
  }
  
  idPositionSelect.disabled = false;
  positions.forEach(pos => {
    const option = document.createElement('option');
    option.value = pos.id;
    // Use the appropriate language name
    option.textContent = pos.en_name || pos.fr_name || pos.ar_name || 'Position';
    idPositionSelect.appendChild(option);
  });
}

function openAddModal() {
  // Check if election is selected
  if (!currentElectionId) {
    notify('Please select an election first', 'error');
    return;
  }
  
  // Check if positions are loaded
  if (positions.length === 0) {
    notify('No positions available for this election. Please add positions first.', 'error');
    return;
  }
  
  resetForm();
  populatePositionDropdown(); // Ensure dropdown is populated when modal opens
  candidateModal?.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function openEditModal(id) {
  const cand = candidates.find(c => String(c.id) === String(id));
  if (!cand) return;
  populateForm(cand);
  candidateModal?.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeAddModal() {
  candidateModal?.classList.remove('active');
  document.body.style.overflow = '';
}

function resetForm() {
  candidateForm?.reset();
  candidateIdInput && (candidateIdInput.value = '');
  photoPreview && (photoPreview.innerHTML = '');
  partyLogoPreview && (partyLogoPreview.innerHTML = '');
  photoPreview && photoPreview.classList.remove('active');
  partyLogoPreview && partyLogoPreview.classList.remove('active');
  if (photoLabel) photoLabel.textContent = 'Upload image';
  if (partyLogoLabel) partyLogoLabel.textContent = 'Upload image';
}

function populateForm(c) {
  candidateIdInput && (candidateIdInput.value = c.id);
  if (nameInput) nameInput.value = c.name || '';
  if (arNameInput) arNameInput.value = c.ar_name || '';
  if (enDescInput) enDescInput.value = c.en_description || '';
  if (frDescInput) frDescInput.value = c.fr_description || '';
  if (arDescInput) arDescInput.value = c.ar_description || '';
  if (supportingPartyInput) supportingPartyInput.value = c.Supporting_party || '';
  if (idPositionSelect) idPositionSelect.value = c.id_position || '';

  if (c.photo_path && photoPreview) {
    photoPreview.innerHTML = `<img src="../${c.photo_path}" alt="Candidate photo">`;
    photoPreview.classList.add('active');
    if (photoLabel) photoLabel.textContent = 'Change image';
  }
  if (c.path_supporting_party_logo && partyLogoPreview) {
    partyLogoPreview.innerHTML = `<img src="../${c.path_supporting_party_logo}" alt="Party logo">`;
    partyLogoPreview.classList.add('active');
    if (partyLogoLabel) partyLogoLabel.textContent = 'Change image';
  }
}

function handleFilePreview(event, previewElement, labelElement) {
  const file = event.target.files?.[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    notify('Please select an image file', 'error');
    event.target.value = '';
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    if (previewElement) {
      previewElement.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
      previewElement.classList.add('active');
    }
    if (labelElement) labelElement.textContent = file.name;
  };
  reader.readAsDataURL(file);
}

async function handleCreate(e) {
  e.preventDefault();
  if (!candidateForm) return;

  // Validate position is selected
  const selectedPosition = idPositionSelect?.value;
  if (!selectedPosition) {
    notify('Please select a position for this candidate', 'error');
    idPositionSelect?.focus();
    return;
  }

  // Check if positions are available
  if (positions.length === 0) {
    notify('No positions available. Please add positions to the election first.', 'error');
    return;
  }

  saveBtn?.classList.add('loading');
  if (saveBtn) saveBtn.disabled = true;

  try {
    const formData = new FormData(candidateForm);
    // Use candidate-handler.php which expects 'create'
    formData.append('action', 'create');

    const res = await fetch('../apis/candidate-handler.php', {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    if (data.success) {
      closeAddModal();
      await loadCandidates();
      const electionId = getQueryParam('id_election');
      if (electionId) filterCandidatesByElection(electionId);
      renderCandidates();
      notify('Candidate saved successfully', 'success');
    } else {
      notify(data.message || data.error || 'Failed to save candidate', 'error');
    }
  } catch (err) {
    console.error('Error saving candidate:', err);
    notify('An error occurred while saving', 'error');
  } finally {
    saveBtn?.classList.remove('loading');
    if (saveBtn) saveBtn.disabled = false;
  }
}

async function handleDeleteCandidate(id) {
  if (!id) return;
  if (!confirm('Delete this candidate?')) return;
  try {
    const fd = new FormData();
    fd.append('action', 'delete');
    fd.append('id', String(id));
    const res = await fetch('../apis/candidate-handler.php', { method: 'POST', body: fd });
    const data = await res.json();
    if (data.success) {
      await loadCandidates();
      const electionId = getQueryParam('id_election');
      if (electionId) filterCandidatesByElection(electionId);
      renderCandidates();
    } else {
      notify(data.message || data.error || 'Failed to delete candidate', 'error');
    }
  } catch (e) {
    console.error('Delete error', e);
    notify('An error occurred while deleting', 'error');
  }
}

function notify(message, type = 'error') {
  if (typeof window.showToast === 'function') {
    window.showToast(message, type);
  } else {
    if (type === 'error') console.error(message); else console.log(message);
  }
}

function getQueryParam(key) {
  try { return new URLSearchParams(window.location.search).get(key); } catch { return null; }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text ?? '';
  return div.innerHTML;
}

