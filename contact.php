<?php
require_once 'core/lang.php';

// Check if user is logged in
if (!isset($_SESSION['logged_in']) || !$_SESSION['logged_in']) {
    header('Location: auth');
    exit();
}


// If role is not set or is not 'user', 'admin' or 'super_admin', log out
if (!isset($_SESSION['role']) || !in_array($_SESSION['role'], ['user', 'admin', 'super_admin'])) {
    header('Location: core/logout');
    exit();
}

include 'includes/header.php';
?>
<div class="contact-container">
    <div class="contact-info">
        <div class="curved-lines"></div>
        <div class="left-container">
        <h1>Contact information</h1>
        <p class="subtitle">Si vous avez des questions, n'hésitez pas à nous contacter</p>
        
        <div class="info-label">
            <svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 15.46L16.87 14.24C16.42 14.1 15.93 14.21 15.59 14.54L13.76 16.37C11.38 15.13 9.37 13.12 8.13 10.74L10.01 8.86C10.34 8.52 10.45 8.03 10.31 7.58L9.09 3.45C8.86 2.68 8.14 2.13 7.33 2.13H4.19C3.3 2.13 2.53 2.9 2.64 3.79C3.6 12.62 10.89 19.9 19.71 20.86C20.6 20.97 21.37 20.2 21.37 19.31V16.17C21.38 15.37 20.83 14.65 21.05 14.42Z" 
                        stroke="#06ac7d" 
                        stroke-width="1.5" 
                        stroke-linecap="round" 
                        stroke-linejoin="round"/>
            </svg>
            <span>+222 20 25 20 26</span>
        </div>
        
        <div class="info-label">
            <svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" 
                        stroke="#06ac7d" 
                        stroke-width="1.5" 
                        stroke-linecap="round" 
                        stroke-linejoin="round"/>
                <path d="M22 6L12 13L2 6" 
                        stroke="#06ac7d" 
                        stroke-width="1.5" 
                        stroke-linecap="round" 
                        stroke-linejoin="round"/>
            </svg>
            <span>contact@voty.com</span>
        </div>
        
        <div class="info-label">
            <svg class="icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" 
                        stroke="#0d9488" 
                        stroke-width="1.5" 
                        stroke-linecap="round" 
                        stroke-linejoin="round"/>
                <circle cx="12" cy="10" r="3" 
                        stroke="#0d9488" 
                        stroke-width="1.5" 
                        stroke-linecap="round" 
                        stroke-linejoin="round"/>
            </svg>
            <span>Nouckchott, mauritanie</span>
        </div>
        
        <div class="social-icons">
            <a href="#" aria-label="Facebook">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
            </a>
            <a href="#" aria-label="Twitter">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
            </a>
            <a href="#" aria-label="YouTube">
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
            </a>
        </div>
        </div>
    </div>

    <div class="contact-form">
        <form class="right-container">
            <div class="form-row">
                <div class="form-group">
                    <label>Prenom<span class="required">*</span></label>
                    <input type="text" required>
                </div>
                <div class="form-group">
                    <label>Nom<span class="required">*</span></label>
                    <input type="text" required>
                </div>
            </div>

            <div class="form-group">
                <label>Email</label>
                <input type="email">
            </div>

            <div class="form-group">
                <label>Telephone</label>
                <input type="tel">
            </div>

            <div class="form-group">
                <label>Message</label>
                <textarea></textarea>
            </div>

            <button type="submit" class="submit-btn">Send Message</button>
        </form>
    </div>
</div>
<script src="assets/js/utilities/utils.js" defer></script>
<script src="assets/js/pages/contact.js" defer></script>

<?php include 'includes/footer.php'; ?>
