// =========================================
// BLOQUE: Cliente de Supabase
// Explicación: Centraliza la configuración y creación del cliente de Supabase para ser reutilizado en todo el frontend.
// =========================================

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://obsshvmadmfmqigivjkb.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ic3Nodm1hZG1mbXFpZ2l2amtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5NjA1ODIsImV4cCI6MjA3MzUzNjU4Mn0.pRB9hUR80nqPuH-D7ojBxrUQM1Ax2x3LWV0p59few6U'; // Pega tu Anon Key aquí

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);