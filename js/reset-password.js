// js/reset-password.js - Restablecer contraseña con token
import { supabase } from './supabase-client.js';

// Obtener token de la URL
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');

if (!token) {
    document.getElementById('reset-error').textContent = 'Token inválido o no proporcionado';
    document.getElementById('reset-error').style.display = 'block';
    document.getElementById('reset-password-form').style.display = 'none';
}

document.getElementById('reset-password-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const errorDiv = document.getElementById('reset-error');
    const successDiv = document.getElementById('reset-success');
    
    errorDiv.style.display = 'none';
    successDiv.style.display = 'none';
    errorDiv.textContent = '';
    successDiv.textContent = '';

    // Validar que las contraseñas coincidan
    if (newPassword !== confirmPassword) {
        errorDiv.textContent = 'Las contraseñas no coinciden';
        errorDiv.style.display = 'block';
        return;
    }

    // Validar longitud mínima
    if (newPassword.length < 6) {
        errorDiv.textContent = 'La contraseña debe tener al menos 6 caracteres';
        errorDiv.style.display = 'block';
        return;
    }

    try {
        // Llamar a la función RPC para resetear la contraseña
        const { data, error } = await supabase.rpc('reset_password_with_token', {
            p_token: token,
            p_new_password: newPassword
        });

        if (error) throw error;

        if (data === true) {
            // Contraseña actualizada exitosamente
            successDiv.textContent = 'Contraseña actualizada exitosamente. Redirigiendo al login...';
            successDiv.style.display = 'block';
            
            // Redirigir después de 3 segundos
            setTimeout(() => {
                window.location.href = 'admin-login.html';
            }, 3000);
        } else {
            errorDiv.textContent = 'El token es inválido o ha expirado. Solicita uno nuevo.';
            errorDiv.style.display = 'block';
        }
    } catch (err) {
        console.error('Error al restablecer contraseña:', err);
        errorDiv.textContent = 'Error al restablecer la contraseña. Intenta de nuevo.';
        errorDiv.style.display = 'block';
    }
});
