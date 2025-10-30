// Import multi-select dropdown functions
import { reinitMultiSelectDropdown, resetMultiSelectDropdown } from '../utilities/multi-select-dropdown.js';

// Search functionality for elections
document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.getElementById('searchElectionsInput');
  const electionsGrid = document.querySelector('.elections-grid');
  
  if (searchInput && electionsGrid) {
    searchInput.addEventListener('input', function(e) {
      const searchTerm = e.target.value.toLowerCase().trim();
      const electionCards = electionsGrid.querySelectorAll('.election-card');
      
      electionCards.forEach(card => {
        const organizer = card.querySelector('.election-organizer')?.textContent.toLowerCase() || '';
        const year = card.querySelector('.election-year-badge')?.textContent.toLowerCase() || '';
        
        const matches = organizer.includes(searchTerm) || year.includes(searchTerm);
        card.style.display = matches ? '' : 'none';
      });
    });
  }
});

window.stopElection = function(electionId, lang) {
    const modal = document.getElementById('stopElectionModal');
    const message = document.getElementById('stopElectionMessage');
    const closeBtn = document.getElementById('closeStopElectionModal');
    const noBtn = document.getElementById('stopElectionNo');
    const yesBtn = document.getElementById('stopElectionYes');

    const langs = {
        ar: { stopElection: "هل أنت متأكد من إيقاف هذه الانتخابات؟" },
        en: { stopElection: 'Are you Sure about Stopping this Election' },
        fr: { stopElection: "Êtes-vous sûr de vouloir arrêter cette élection ?" }
    };

    message.textContent = langs[lang].stopElection;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    const closeHandler = () => {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    };

    closeBtn.onclick = closeHandler;
    noBtn.onclick = closeHandler;
    modal.querySelector('.modal-overlay').onclick = closeHandler;

    yesBtn.onclick = async function() {
        const formData = new FormData();
        formData.append('action', 'stopElection');
        formData.append('id_Election', electionId);

        try {
            await fetch('../apis/api.php', { method: 'POST', body: formData });
            closeHandler();
            window.location.reload();
        } catch (err) {
            console.error('Error:', err);
        }
    };
}

window.addElection = function(lang) {
    const modal = document.getElementById('addElectionModal');
    const form = document.getElementById('addElectionForm');
    const closeBtn = document.getElementById('closeAddElectionModal');
    const cancelBtn = document.getElementById('cancelAddElectionBtn');
    const saveBtn = document.getElementById('saveElectionBtn');

    const langs = {
        ar: {
            addElection: "إضافة انتخابات جديدة",
            nameOrganizerArabic: "اسم المنظم بالعربية",
            nameOrganizerEnglish: "اسم المنظم بالإنجليزية",
            nameOrganizerFrench: "اسم المنظم بالفرنسية",
            yearElection: "سنة الانتخابات",
            startElection: "تاريخ بدء الانتخابات",
            endElection: "تاريخ انتهاء الانتخابات",
            submitBtn: "إضافة",
            pleaseCompleteForm: "يرجى ملء النموذج بالكامل",
        },
        en: {
            addElection: 'Add new Election',
            nameOrganizerArabic: 'Name of Organizer in Arabic',
            nameOrganizerEnglish: 'Name of Organizer in English',
            nameOrganizerFrench: 'Name of Organizer in French',
            yearElection: 'Year Of Election',
            startElection: 'Election Start date',
            endElection: 'Election End date',
            submitBtn: 'Add',
            pleaseCompleteForm: 'Please fill out the Form Completely',
        },
        fr: {
            addElection: "Ajouter une nouvelle élection",
            nameOrganizerArabic: "Nom de l'organisateur en arabe",
            nameOrganizerEnglish: "Nom de l'organisateur en anglais",
            nameOrganizerFrench: "Nom de l'organisateur en français",
            yearElection: "Année de l'élection",
            startElection: "Date de début de l'élection",
            endElection: "Date de fin de l'élection",
            submitBtn: "Ajouter",
            pleaseCompleteForm: "Veuillez remplir complètement le formulaire",
        }
    };

    form.reset();
    
    // Reset multi-select dropdown
    const container = document.getElementById('adminMultiSelect');
    if (container) {
        resetMultiSelectDropdown(container);
    }
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    const closeHandler = () => {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    };

    closeBtn.onclick = closeHandler;
    cancelBtn.onclick = closeHandler;
    modal.querySelector('.modal-overlay').onclick = closeHandler;

    form.onsubmit = async function(e) {
        e.preventDefault();
        
        saveBtn.classList.add('loading');
        saveBtn.disabled = true;
        
        const formData = new FormData(form);
        formData.append('action', 'addElection');
        
        try {
            const response = await fetch('../apis/api.php', { method: 'POST', body: formData });
            const data = await response.json();
            
            if (data.success || data.id) {
                closeHandler();
                window.location.reload();
            } else {
                showToast(data.error || 'Failed to add election', 'error');
                saveBtn.classList.remove('loading');
                saveBtn.disabled = false;
            }
        } catch (err) {
            console.error('Error:', err);
            showToast('An error occurred while adding the election', 'error');
            saveBtn.classList.remove('loading');
            saveBtn.disabled = false;
        }
    };
}

window.editElection = function(electionId, lang) {
    const modal = document.getElementById('addElectionModal');
    const form = document.getElementById('addElectionForm');
    const closeBtn = document.getElementById('closeAddElectionModal');
    const cancelBtn = document.getElementById('cancelAddElectionBtn');
    const saveBtn = document.getElementById('saveElectionBtn');
    const modalTitle = modal.querySelector('.modal-header h2');
    
    // Change modal title
    modalTitle.textContent = lang === 'ar' ? 'تعديل الانتخابات' : lang === 'fr' ? 'Modifier l\'élection' : 'Edit Election';
    
    // Fetch election data and assigned admins
    Promise.all([
        fetch(`../apis/api.php?action=getElection&id=${electionId}`).then(res => res.json()),
        fetch(`../apis/api.php?action=getElectionAdmins&election_id=${electionId}`).then(res => res.json())
    ])
        .then(([election, admins]) => {
            // Populate form
            document.getElementById('election_ar_organizer').value = election.ar_organizer || '';
            document.getElementById('election_en_organizer').value = election.en_organizer || '';
            document.getElementById('election_fr_organizer').value = election.fr_organizer || '';
            document.getElementById('election_year').value = election.year || '';
            document.getElementById('election_start_date').value = election.start_date || '';
            document.getElementById('election_end_date').value = election.end_date || '';
            document.getElementById('election_status').value = election.status || '1';
            
            // Populate multi-select dropdown with assigned admins
            const hiddenInput = document.getElementById('election_admin_user_ids');
            const container = document.getElementById('adminMultiSelect');
            
            if (hiddenInput && container && Array.isArray(admins)) {
                const adminIds = admins.map(a => a.admin_user_id).join(',');
                hiddenInput.value = adminIds;
                
                // Reinitialize the multi-select dropdown with new values
                reinitMultiSelectDropdown(container);
            }
            
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        })
        .catch(err => {
            console.error('Error loading election:', err);
            showToast('Failed to load election data', 'error');
        });
    
    const closeHandler = () => {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        modalTitle.textContent = lang === 'ar' ? 'إضافة انتخابات جديدة' : lang === 'fr' ? 'Ajouter une nouvelle élection' : 'Add new Election';
        
        // Reset multi-select dropdown
        const container = document.getElementById('adminMultiSelect');
        if (container) {
            resetMultiSelectDropdown(container);
        }
    };
    
    closeBtn.onclick = closeHandler;
    cancelBtn.onclick = closeHandler;
    modal.querySelector('.modal-overlay').onclick = closeHandler;
    
    form.onsubmit = async function(e) {
        e.preventDefault();
        
        saveBtn.classList.add('loading');
        saveBtn.disabled = true;
        
        const formData = new FormData(form);
        formData.append('action', 'editElection');
        formData.append('id', electionId);
        
        try {
            const response = await fetch('../apis/api.php', { method: 'POST', body: formData });
            
            // Check if response is OK (status 200-299)
            if (response.ok) {
                const text = await response.text();
                // Try to parse as JSON, but if it fails, assume success if response was OK
                try {
                    const data = JSON.parse(text);
                    if (data.success || data.id || response.status === 200) {
                        closeHandler();
                        window.location.reload();
                    } else {
                        showToast(data.error || 'Failed to update election', 'error');
                        saveBtn.classList.remove('loading');
                        saveBtn.disabled = false;
                    }
                } catch (parseErr) {
                    // If JSON parse fails but response was OK, assume success
                    closeHandler();
                    window.location.reload();
                }
            } else {
                // Response not OK
                const data = await response.json().catch(() => ({ error: 'Failed to update election' }));
                showToast(data.error || 'Failed to update election', 'error');
                saveBtn.classList.remove('loading');
                saveBtn.disabled = false;
            }
        } catch (err) {
            console.error('Error:', err);
            showToast('An error occurred while updating the election', 'error');
            saveBtn.classList.remove('loading');
            saveBtn.disabled = false;
        }
    };
}

window.addNewCandidate = function(electionId, lang) {
    const candidateModal = document.getElementById('candidateModal');
    const candidateForm = document.getElementById('candidateForm');
    const positionInput = document.getElementById('candidate_id_position');
    const electionIdInput = document.getElementById('electionId');
    const closeCandidateModal = document.getElementById('closeCandidateModal');
    const cancelCandidateBtn = document.getElementById('cancelCandidateBtn');
    const saveCandidateBtn = document.getElementById('saveCandidateBtn');

    // Reset form
    candidateForm.reset();
    electionIdInput.value = electionId;
    positionInput.value = '';

    // Resolve single position for this election
    fetch(`../apis/api.php?action=getPositionByElection&id_election=${electionId}`)
        .then(res => res.json())
        .then(list => {
            const positions = Array.isArray(list) ? list : [];
            if (!positions.length) {
                showToast('Please create a position for this election in Settings first.', 'error');
                return;
            }
            // Enforce single position: take the first one
            positionInput.value = positions[0].id;

            // Show modal only after we have a position id
            candidateModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        })
        .catch(err => {
            console.error('Error loading positions:', err);
            showToast('Failed to load election position', 'error');
        });

    // Close modal handlers
    const closeHandler = () => {
        candidateModal.classList.remove('active');
        document.body.style.overflow = '';
    };

    closeCandidateModal.onclick = closeHandler;
    cancelCandidateBtn.onclick = closeHandler;
    candidateModal.querySelector('.modal-overlay').onclick = closeHandler;

    // Form submission
    candidateForm.onsubmit = async function(e) {
        e.preventDefault();

        if (!positionInput.value) {
            showToast('No position is set for this election.', 'error');
            return;
        }

        saveCandidateBtn.classList.add('loading');
        saveCandidateBtn.disabled = true;

        const formData = new FormData(candidateForm);
        formData.append('action', 'addCandidate');

        try {
            const response = await fetch('../apis/api.php', {
                method: 'POST',
                body: formData
            });

            const data = await response.text();

            if (data.includes('success') || data.includes('added')) {
                closeHandler();
                window.location.reload();
            } else {
                console.error('Server Response:', data);
                showToast('Error: ' + data, 'error');
            }
        } catch (err) {
            console.error('Error:', err);
            showToast('An error occurred while saving the candidate', 'error');
        } finally {
            saveCandidateBtn.classList.remove('loading');
            saveCandidateBtn.disabled = false;
        }
    };
}

window.publishResults = function(electionId) {
    const formData = new FormData();
    formData.append('action', 'publishResults');
    formData.append('id_election', electionId);

    fetch('../apis/api.php', {
        method: 'POST',
        body: formData
    })
    .then(res => res.text())
    .catch(err => console.error('Error:', err));
    window.location.reload();
}

window.stopPublishingResults = function(electionId) {
    const formData = new FormData();
    formData.append('action', 'stopPublishingResults');
    formData.append('id_election', electionId);

    fetch('../apis/api.php', {
        method: 'POST',
        body: formData
    })
    .then(res => res.text())
    .catch(err => console.error('Error:', err));
    window.location.reload();
}

window.getListOfCandidates = function(electionId) {
    window.location.href = `../super_admin/admin-candidates.php?id_election=${electionId}`;
}

window.getResults = function(electionId) {
    window.location.href = `../admin/admin-results.php?id_election=${electionId}`;
}

// Handle custom dropdown selections
document.addEventListener('dropdown:select', (e) => {
    const { container, value } = e.detail;
    
    // Status dropdown
    if (container.id === 'statusDropdown') {
        const hiddenInput = document.getElementById('election_status');
        const button = container.querySelector('.dropdown-button .dropdown-text');
        const selectedItem = container.querySelector(`.dropdown-item[data-value="${value}"]`);
        
        if (hiddenInput && button && selectedItem) {
            hiddenInput.value = value;
            button.textContent = selectedItem.textContent.trim();
        }
    }
});