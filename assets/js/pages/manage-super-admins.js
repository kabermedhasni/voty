document.addEventListener('DOMContentLoaded', function() {
    // Modal elements
    const userModal = document.getElementById('userModal');
    const deleteModal = document.getElementById('deleteModal');
    const userForm = document.getElementById('userForm');
    const searchInput = document.getElementById('searchInput');
    const usersTableBody = document.getElementById('usersTableBody');
    
    // Buttons
    const addUserBtn = document.getElementById('addUserBtn');
    const closeUserModal = document.getElementById('closeUserModal');
    const closeDeleteModal = document.getElementById('closeDeleteModal');
    const cancelUserBtn = document.getElementById('cancelUserBtn');
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
    const saveUserBtn = document.getElementById('saveUserBtn');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    
    // Form fields
    const userIdHidden = document.getElementById('user_id_hidden');
    const usernameField = document.getElementById('username');
    const userIdField = document.getElementById('user_id');
    const passwordField = document.getElementById('password');
    const passwordLabel = document.getElementById('passwordLabel');
    const passwordHelp = document.getElementById('passwordHelp');
    const userModalTitle = document.getElementById('userModalTitle');
    
    let currentUserId = null;
    let isEditing = false;
    
    // Translations
    const translations = {
        add_super_admin: 'Ajouter un super administrateur',
        edit_super_admin: 'Modifier le super administrateur',
        password: 'Mot de passe',
        password_optional: 'Mot de passe (optionnel)',
        required: '*',
        optional: ''
    };
    
    // Open add user modal
    addUserBtn.addEventListener('click', function() {
        openUserModal();
    });
    
    // Close modals
    closeUserModal.addEventListener('click', closeUserModalHandler);
    closeDeleteModal.addEventListener('click', closeDeleteModalHandler);
    cancelUserBtn.addEventListener('click', closeUserModalHandler);
    cancelDeleteBtn.addEventListener('click', closeDeleteModalHandler);
    
    // Close modals when clicking overlay
    userModal.addEventListener('click', function(e) {
        if (e.target === userModal || e.target.classList.contains('modal-overlay')) {
            closeUserModalHandler();
        }
    });
    
    deleteModal.addEventListener('click', function(e) {
        if (e.target === deleteModal || e.target.classList.contains('modal-overlay')) {
            closeDeleteModalHandler();
        }
    });
    
    // Handle form submission
    userForm.addEventListener('submit', function(e) {
        e.preventDefault();
        saveUser();
    });
    
    // Handle delete confirmation
    confirmDeleteBtn.addEventListener('click', function() {
        deleteUser();
    });
    
    // Search functionality
    let searchTimeout;
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            searchUsers();
        }, 300);
    });
    
    // Event delegation for edit and delete buttons
    usersTableBody.addEventListener('click', function(e) {
        const editBtn = e.target.closest('.edit-btn');
        const deleteBtn = e.target.closest('.delete-btn');
        
        if (editBtn) {
            const id = editBtn.dataset.id;
            const username = editBtn.dataset.username;
            const userId = editBtn.dataset.userId;
            openUserModal(id, username, userId);
        }
        
        if (deleteBtn) {
            const id = deleteBtn.dataset.id;
            openDeleteModal(id);
        }
    });
    
    function openUserModal(id = null, username = '', userId = '') {
        isEditing = !!id;
        currentUserId = id;
        
        // Reset form
        userForm.reset();
        
        if (isEditing) {
            userModalTitle.textContent = translations.edit_super_admin;
            userIdHidden.value = id;
            usernameField.value = username;
            userIdField.value = userId;
            passwordField.required = false;
            passwordLabel.innerHTML = translations.password_optional + ' <span class="optional"></span>';
            passwordHelp.style.display = 'block';
        } else {
            userModalTitle.textContent = translations.add_super_admin;
            userIdHidden.value = '';
            passwordField.required = true;
            passwordLabel.innerHTML = translations.password + ' <span class="required">*</span>';
            passwordHelp.style.display = 'none';
        }
        
        userModal.classList.add('active');
        usernameField.focus();
    }
    
    function closeUserModalHandler() {
        userModal.classList.remove('active');
        userForm.reset();
        currentUserId = null;
        isEditing = false;
    }
    
    function openDeleteModal(id) {
        currentUserId = id;
        deleteModal.classList.add('active');
    }
    
    function closeDeleteModalHandler() {
        deleteModal.classList.remove('active');
        currentUserId = null;
    }
    
    function saveUser() {
        const formData = new FormData(userForm);
        formData.append('action', isEditing ? 'edit' : 'add');
        
        // Show loading state
        saveUserBtn.classList.add('loading');
        saveUserBtn.disabled = true;
        
        fetch('', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showToast(data.message, 'success');
                closeUserModalHandler();
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            } else {
                showToast(data.message || 'Une erreur est survenue', 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showToast('Une erreur est survenue', 'error');
        })
        .finally(() => {
            saveUserBtn.classList.remove('loading');
            saveUserBtn.disabled = false;
        });
    }
    
    function deleteUser() {
        const formData = new FormData();
        formData.append('action', 'delete');
        formData.append('id', currentUserId);
        
        // Show loading state
        confirmDeleteBtn.classList.add('loading');
        confirmDeleteBtn.disabled = true;
        
        fetch('', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showToast(data.message, 'success');
                closeDeleteModalHandler();
                // Remove the row from table
                const row = document.querySelector(`tr[data-id="${currentUserId}"]`);
                if (row) {
                    row.remove();
                }
                
                // Check if table is empty
                const remainingRows = usersTableBody.querySelectorAll('tr:not(.empty-row)');
                if (remainingRows.length === 0) {
                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                }
            } else {
                showToast(data.message || 'Une erreur est survenue', 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showToast('Une erreur est survenue', 'error');
        })
        .finally(() => {
            confirmDeleteBtn.classList.remove('loading');
            confirmDeleteBtn.disabled = false;
        });
    }
    
    function searchUsers() {
        const searchTerm = searchInput.value.trim();
        
        if (searchTerm === '') {
            window.location.reload();
            return;
        }
        
        const formData = new FormData();
        formData.append('action', 'search');
        formData.append('search', searchTerm);
        
        fetch('', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                updateUsersTable(data.users);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }
    
    function updateUsersTable(users) {
        usersTableBody.innerHTML = '';
        
        if (users.length === 0) {
            usersTableBody.innerHTML = `
                <tr class="empty-row">
                    <td colspan="3">
                        <div class="empty-state">
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            <h3>Aucun résultat trouvé</h3>
                            <p>Essayez avec d'autres termes de recherche</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }
        
        users.forEach(user => {
            const row = document.createElement('tr');
            row.dataset.id = user.id;
            row.innerHTML = `
                <td>${escapeHtml(user.username)}</td>
                <td>${escapeHtml(user.user_id)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="icon-btn edit-btn" data-id="${user.id}" data-username="${escapeHtml(user.username)}" data-user-id="${escapeHtml(user.user_id)}">
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13M18.5 2.5C18.8978 2.1022 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.1022 21.5 2.5C21.8978 2.8978 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.1022 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            Modifier
                        </button>
                        <button class="icon-btn delete-btn" data-id="${user.id}">
                            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M3 6H5H21M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                            Supprimer
                        </button>
                    </div>
                </td>
            `;
            usersTableBody.appendChild(row);
        });
    }
    
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
});
