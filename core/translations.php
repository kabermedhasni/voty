<?php
header('Content-Type: application/javascript');
require_once __DIR__ . '/lang.php';

// Pass translations to JavaScript with French fallbacks
echo 'window.translations = ' .
    json_encode([
        'network_error' => t('network_error', 'Erreur réseau. Veuillez réessayer.'),
        'enter_id' => t('enter_id', 'Veuillez entrer votre NNI.'),
        'id_incorrect' => t('id_incorrect', 'L\'NNI est incorrect'),
        'user_registered' => t(
            'user_registered',
            'Cet utilisateur est déjà enregistré avec un mot de passe',
        ),
        'set_password' => t('set_password', 'Définissez maintenant un mot de passe'),
        'password_required' => t('password_required', 'Le mot de passe est requis.'),
        'account_created' => t('account_created', 'Compte créé avec succès!'),
        'something_wrong' => t('something_wrong', 'Quelque chose s\'est mal passé'),
        'password_wrong' => t('password_wrong', 'Le mot de passe est incorrect.'),
        'login_successful' => t('login_successful', 'Connexion réussie!'),
        'login_failed' => t('login_failed', 'Échec de la connexion'),
        'get_started' => t('get_started', 'Commencer'),
        'sign_in_subtitle' => t('sign_in_subtitle', 'Connectez-vous à votre compte'),
        'sign_up_subtitle' => t('sign_up_subtitle', 'Créer un nouveau compte'),
        'first_time' => t('first_time', 'Première fois?'),
        'sign_up' => t('sign_up', 'S\'inscrire'),
        'already_have_account' => t('already_have_account', 'Vous avez déjà un compte?'),
        'sign_in' => t('sign_in', 'Se connecter'),
        'continue' => t('continue', 'Continuer'),
    ]) .
    ";\n";

echo "window.currentLang = '" . current_lang() . "';\n";
