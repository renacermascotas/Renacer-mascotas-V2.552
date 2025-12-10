// js/forgot-password.js - Solicitar recuperación de contraseña
import { supabase } from './supabase-client.js';

document.getElementById('forgot-password-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const errorDiv = document.getElementById('forgot-error');
    const successDiv = document.getElementById('forgot-success');
    
    errorDiv.style.display = 'none';
    successDiv.style.display = 'none';
    errorDiv.textContent = '';
    successDiv.textContent = '';

    try {
        // Llamar a la función RPC para crear el token
        const { data, error } = await supabase.rpc('create_password_reset_token', {
            p_email: email
        });

        if (error) throw error;

        if (!data) {
            // No se encontró el usuario, pero no revelar esto por seguridad
            successDiv.textContent = 'Si el correo existe, recibirás un enlace de recuperación. Revisa tu correo.';
            successDiv.style.display = 'block';
        } else {
            // Token creado exitosamente
            const resetLink = `${window.location.origin}/html/reset-password.html?token=${data}`;
            
            // Mostrar el enlace (en producción, esto debería enviarse por email)
            successDiv.innerHTML = `
                <strong>Enlace de recuperación generado:</strong><br>
                <small style="word-break: break-all; display: block; margin-top: 10px;">
                    <a href="${resetLink}" target="_blank" style="color: #10b981;">${resetLink}</a>
                </small><br>
                <small style="color: #fbbf24;">⚠️ Este enlace expira en 1 hora</small><br>
                <small style="color: #94a3b8; margin-top: 5px; display: block;">
                    Nota: En producción, este enlace se enviará por correo electrónico
                </small>
            `;
            successDiv.style.display = 'block';
            
            // Limpiar el formulario
            document.getElementById('forgot-password-form').reset();
        }
    } catch (err) {
        console.error('Error al solicitar recuperación:', err);
        errorDiv.textContent = 'Error al procesar la solicitud. Intenta de nuevo.';
        errorDiv.style.display = 'block';
    }
});
