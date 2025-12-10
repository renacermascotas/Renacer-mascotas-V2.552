// =========================================
// BLOQUE: Cliente de Supabase configurado de forma segura
// Explicación: Centraliza la configuración segura del cliente de Supabase con validaciones y configuración robusta.
// =========================================

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Configuración de Supabase - Las credenciales deberían venir de variables de entorno en producción
const SUPABASE_URL = window.SUPABASE_CONFIG?.url || 'https://jpzpvxinodynotpdjbzh.supabase.co';
const SUPABASE_ANON_KEY = window.SUPABASE_CONFIG?.anonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwenB2eGlub2R5bm90cGRqYnpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNTYwNzksImV4cCI6MjA3OTczMjA3OX0.wV1AofKF8vMbrRvXuoQMDswAP2bEnzUW2s7fo_eu8Ho';

// Validar que las credenciales existan
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('Configuración de Supabase incompleta - funcionando en modo offline');
    // No lanzar error, permitir que la aplicación funcione sin Supabase
}

// Configuración segura del cliente
export const supabase = SUPABASE_URL && SUPABASE_ANON_KEY ? 
    createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
        },
        db: {
            schema: 'public'
        },
        global: {
            headers: {
                'X-Client-Info': 'renacer-mascotas-web'
            }
        }
    }) : null;

// Verificar conexión y estado de autenticación solo si supabase está disponible
if (supabase) {
    supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN') {
            console.log('Usuario autenticado correctamente');
        } else if (event === 'SIGNED_OUT') {
            console.log('Usuario desconectado');
        } else if (event === 'TOKEN_REFRESHED') {
            console.log('Token renovado');
        }
    });
} else {
    console.log('Supabase no disponible - funcionando en modo offline');
}