// js/admin-users.js - Gestión de usuarios administradores
import { supabase } from './supabase-client.js';

// Verificar sesión
const adminUser = sessionStorage.getItem('admin_user');
if (!adminUser) {
    window.location.href = 'admin-login.html';
}

// Variables globales
let isEditMode = false;
let currentUserId = null;

// Elementos del DOM
const usersList = document.getElementById('users-list');
const userModal = document.getElementById('user-modal');
const userForm = document.getElementById('user-form');
const modalTitle = document.getElementById('modal-title');
const btnNewUser = document.getElementById('btn-new-user');
const btnCancel = document.getElementById('btn-cancel');

// Cargar usuarios al iniciar
loadUsers();

// Event listeners
btnNewUser.addEventListener('click', () => openModal());
btnCancel.addEventListener('click', () => closeModal());
userForm.addEventListener('submit', handleSubmit);

// Cerrar modal al hacer click fuera
userModal.addEventListener('click', (e) => {
    if (e.target === userModal) closeModal();
});

/**
 * Cargar y mostrar todos los usuarios
 */
async function loadUsers() {
    try {
        const { data: users, error } = await supabase
            .from('admin_users')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        displayUsers(users);
    } catch (err) {
        console.error('Error al cargar usuarios:', err);
        usersList.innerHTML = '<p style="color: #ef4444;">Error al cargar usuarios</p>';
    }
}

/**
 * Mostrar usuarios en la interfaz
 */
function displayUsers(users) {
    if (!users || users.length === 0) {
        usersList.innerHTML = '<p>No hay usuarios registrados</p>';
        return;
    }

    usersList.innerHTML = users.map(user => `
        <div class="user-card">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
                <div>
                    <h3>👤 ${user.nombre_completo || user.username}</h3>
                    <span class="badge ${user.activo ? 'badge-active' : 'badge-inactive'}">
                        ${user.activo ? 'Activo' : 'Inactivo'}
                    </span>
                </div>
            </div>
            
            <div class="user-info">
                <div class="user-info-item">
                    <label>Usuario</label>
                    <div>${user.username}</div>
                </div>
                <div class="user-info-item">
                    <label>Email</label>
                    <div>${user.email}</div>
                </div>
                <div class="user-info-item">
                    <label>Rol</label>
                    <div>${user.rol}</div>
                </div>
                <div class="user-info-item">
                    <label>Último Acceso</label>
                    <div>${user.ultimo_acceso ? new Date(user.ultimo_acceso).toLocaleString('es-CO') : 'Nunca'}</div>
                </div>
                <div class="user-info-item">
                    <label>Creado</label>
                    <div>${new Date(user.created_at).toLocaleDateString('es-CO')}</div>
                </div>
            </div>
            
            <div class="user-actions">
                <button class="btn btn-primary" onclick="editUser(${user.id})">✏️ Editar</button>
                <button class="btn btn-warning" onclick="resetUserPassword(${user.id}, '${user.username}')">🔑 Resetear Contraseña</button>
                <button class="btn ${user.activo ? 'btn-danger' : 'btn-success'}" 
                        onclick="toggleUserStatus(${user.id}, ${user.activo})">
                    ${user.activo ? '❌ Desactivar' : '✅ Activar'}
                </button>
            </div>
        </div>
    `).join('');
}

/**
 * Abrir modal para crear o editar usuario
 */
function openModal(userId = null) {
    isEditMode = !!userId;
    currentUserId = userId;
    
    modalTitle.textContent = isEditMode ? 'Editar Usuario' : 'Crear Nuevo Usuario';
    
    if (isEditMode) {
        loadUserData(userId);
        document.getElementById('password').required = false;
        document.querySelector('#password-group small').style.display = 'block';
    } else {
        userForm.reset();
        document.getElementById('password').required = true;
        document.querySelector('#password-group small').style.display = 'none';
    }
    
    userModal.classList.add('active');
}

/**
 * Cargar datos de usuario para edición
 */
async function loadUserData(userId) {
    try {
        const { data: user, error } = await supabase
            .from('admin_users')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) throw error;

        document.getElementById('user-id').value = user.id;
        document.getElementById('username').value = user.username;
        document.getElementById('email').value = user.email;
        document.getElementById('nombre-completo').value = user.nombre_completo || '';
        document.getElementById('rol').value = user.rol;
        document.getElementById('activo').value = user.activo.toString();
        document.getElementById('password').value = '';
    } catch (err) {
        console.error('Error al cargar usuario:', err);
        showFormError('Error al cargar datos del usuario');
    }
}

/**
 * Cerrar modal
 */
function closeModal() {
    userModal.classList.remove('active');
    userForm.reset();
    document.getElementById('form-error').style.display = 'none';
    document.getElementById('form-success').style.display = 'none';
}

/**
 * Manejar envío del formulario
 */
async function handleSubmit(e) {
    e.preventDefault();
    
    const formData = {
        username: document.getElementById('username').value.trim(),
        email: document.getElementById('email').value.trim(),
        nombre_completo: document.getElementById('nombre-completo').value.trim(),
        rol: document.getElementById('rol').value,
        activo: document.getElementById('activo').value === 'true'
    };
    
    const password = document.getElementById('password').value;

    try {
        if (isEditMode) {
            // Actualizar usuario existente
            await updateUser(currentUserId, formData, password);
        } else {
            // Crear nuevo usuario
            if (!password) {
                showFormError('La contraseña es requerida para nuevos usuarios');
                return;
            }
            await createUser(formData, password);
        }
        
        showFormSuccess(isEditMode ? 'Usuario actualizado exitosamente' : 'Usuario creado exitosamente');
        
        setTimeout(() => {
            closeModal();
            loadUsers();
        }, 1500);
    } catch (err) {
        console.error('Error:', err);
        showFormError(err.message || 'Error al guardar usuario');
    }
}

/**
 * Crear nuevo usuario
 */
async function createUser(formData, password) {
    // Usar función RPC para crear usuario con contraseña encriptada
    const { data, error } = await supabase.rpc('create_admin_user', {
        p_username: formData.username,
        p_password: password,
        p_email: formData.email,
        p_nombre_completo: formData.nombre_completo,
        p_rol: formData.rol,
        p_activo: formData.activo
    });

    if (error) {
        // Si la función RPC no existe, usar método alternativo
        if (error.code === '42883') {
            console.warn('Función create_admin_user no disponible, usando método alternativo');
            
            // Insertar con contraseña temporal (necesita actualización en SQL)
            const { error: insertError } = await supabase
                .from('admin_users')
                .insert([{
                    username: formData.username,
                    email: formData.email,
                    nombre_completo: formData.nombre_completo,
                    rol: formData.rol,
                    activo: formData.activo,
                    password_hash: 'temp_' + password // Esto no es seguro, necesita la función RPC
                }]);
            
            if (insertError) throw insertError;
            
            throw new Error('Usuario creado pero la contraseña debe ser configurada manualmente en SQL');
        }
        throw error;
    }
}

/**
 * Actualizar usuario existente
 */
async function updateUser(userId, formData, password) {
    const updateData = {
        username: formData.username,
        email: formData.email,
        nombre_completo: formData.nombre_completo,
        rol: formData.rol,
        activo: formData.activo,
        updated_at: new Date().toISOString()
    };

    // Si hay nueva contraseña, usar función RPC
    if (password) {
        const { error } = await supabase.rpc('update_admin_password', {
            p_user_id: userId,
            p_new_password: password
        });
        
        if (error && error.code !== '42883') throw error;
    }

    // Actualizar otros datos
    const { error: updateError } = await supabase
        .from('admin_users')
        .update(updateData)
        .eq('id', userId);

    if (updateError) throw updateError;
}

/**
 * Cambiar estado de usuario (activar/desactivar)
 */
window.toggleUserStatus = async function(userId, currentStatus) {
    const action = currentStatus ? 'desactivar' : 'activar';
    if (!confirm(`¿Estás seguro de ${action} este usuario?`)) return;

    try {
        const { error } = await supabase
            .from('admin_users')
            .update({ activo: !currentStatus })
            .eq('id', userId);

        if (error) throw error;

        loadUsers();
    } catch (err) {
        console.error('Error al cambiar estado:', err);
        alert('Error al cambiar estado del usuario');
    }
};

/**
 * Resetear contraseña de usuario
 */
window.resetUserPassword = async function(userId, username) {
    const newPassword = prompt(`Ingresa la nueva contraseña para ${username}:\n(Mínimo 6 caracteres)`);
    
    if (!newPassword) return;
    
    if (newPassword.length < 6) {
        alert('La contraseña debe tener al menos 6 caracteres');
        return;
    }

    try {
        const { error } = await supabase.rpc('update_admin_password', {
            p_user_id: userId,
            p_new_password: newPassword
        });

        if (error) {
            if (error.code === '42883') {
                alert('Función de actualización no disponible. Usa SQL:\nUPDATE admin_users SET password_hash = crypt(\'' + newPassword + '\', gen_salt(\'bf\')) WHERE id = ' + userId + ';');
                return;
            }
            throw error;
        }

        alert('Contraseña actualizada exitosamente');
    } catch (err) {
        console.error('Error al resetear contraseña:', err);
        alert('Error al resetear contraseña');
    }
};

/**
 * Editar usuario
 */
window.editUser = function(userId) {
    openModal(userId);
};

/**
 * Mostrar error en formulario
 */
function showFormError(message) {
    const errorDiv = document.getElementById('form-error');
    const successDiv = document.getElementById('form-success');
    
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    successDiv.style.display = 'none';
}

/**
 * Mostrar éxito en formulario
 */
function showFormSuccess(message) {
    const errorDiv = document.getElementById('form-error');
    const successDiv = document.getElementById('form-success');
    
    successDiv.textContent = message;
    successDiv.style.display = 'block';
    errorDiv.style.display = 'none';
}
