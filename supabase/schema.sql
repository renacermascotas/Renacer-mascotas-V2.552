-- =========================================
-- SCHEMA SQL PARA RENACER MASCOTAS
-- Base de datos: jpzpvxinodynotpdjbzh.supabase.co
-- =========================================

-- 1. TABLA: admin_users
-- Almacena los usuarios administradores del sistema
CREATE TABLE IF NOT EXISTS public.admin_users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    nombre_completo VARCHAR(255),
    rol VARCHAR(50) DEFAULT 'admin',
    activo BOOLEAN DEFAULT true,
    ultimo_acceso TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Política: Solo usuarios autenticados pueden ver usuarios
CREATE POLICY "Permitir lectura autenticada admin"
    ON public.admin_users
    FOR SELECT
    USING (true);

-- Política: Solo usuarios autenticados pueden actualizar
CREATE POLICY "Permitir actualización autenticada admin"
    ON public.admin_users
    FOR UPDATE
    USING (true);

-- NOTA IMPORTANTE: Para crear el primer usuario admin, ejecuta este SQL después:
-- INSERT INTO public.admin_users (username, password_hash, email, nombre_completo) 
-- VALUES ('admin', crypt('tu_contraseña_segura', gen_salt('bf')), 'admin@renacermascotas.com', 'Administrador Principal');

-- Habilitar la extensión pgcrypto para encriptar contraseñas
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- FUNCIÓN: Verificar login de administrador
CREATE OR REPLACE FUNCTION verify_admin_login(p_username VARCHAR, p_password VARCHAR)
RETURNS TABLE (
    id BIGINT,
    username VARCHAR,
    email VARCHAR,
    nombre_completo VARCHAR,
    rol VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.username,
        u.email,
        u.nombre_completo,
        u.rol
    FROM public.admin_users u
    WHERE u.username = p_username
      AND u.password_hash = crypt(p_password, u.password_hash)
      AND u.activo = true;
    
    -- Actualizar último acceso si el login fue exitoso
    UPDATE public.admin_users
    SET ultimo_acceso = NOW()
    WHERE username = p_username
      AND password_hash = crypt(p_password, password_hash)
      AND activo = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- FUNCIÓN: Verificar contraseña (método alternativo)
CREATE OR REPLACE FUNCTION verify_password(p_user_id BIGINT, p_password VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
    v_password_hash TEXT;
BEGIN
    SELECT password_hash INTO v_password_hash
    FROM public.admin_users
    WHERE id = p_user_id AND activo = true;
    
    IF v_password_hash IS NULL THEN
        RETURN FALSE;
    END IF;
    
    RETURN v_password_hash = crypt(p_password, v_password_hash);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- FUNCIÓN: Crear token de recuperación de contraseña
CREATE OR REPLACE FUNCTION create_password_reset_token(p_email VARCHAR)
RETURNS TEXT AS $$
DECLARE
    v_user_id BIGINT;
    v_token TEXT;
BEGIN
    -- Buscar usuario por email
    SELECT id INTO v_user_id
    FROM public.admin_users
    WHERE email = p_email AND activo = true;
    
    IF v_user_id IS NULL THEN
        RETURN NULL; -- Usuario no encontrado
    END IF;
    
    -- Generar token aleatorio
    v_token := encode(gen_random_bytes(32), 'hex');
    
    -- Invalidar tokens anteriores del usuario
    UPDATE public.password_reset_tokens
    SET used = true
    WHERE user_id = v_user_id AND used = false;
    
    -- Insertar nuevo token (válido por 1 hora)
    INSERT INTO public.password_reset_tokens (user_id, token, expires_at)
    VALUES (v_user_id, v_token, NOW() + INTERVAL '1 hour');
    
    RETURN v_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- FUNCIÓN: Resetear contraseña con token
CREATE OR REPLACE FUNCTION reset_password_with_token(p_token TEXT, p_new_password VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
    v_user_id BIGINT;
    v_token_valid BOOLEAN;
BEGIN
    -- Verificar que el token existe, no ha sido usado y no ha expirado
    SELECT user_id, (expires_at > NOW() AND used = false)
    INTO v_user_id, v_token_valid
    FROM public.password_reset_tokens
    WHERE token = p_token;
    
    IF v_user_id IS NULL OR NOT v_token_valid THEN
        RETURN FALSE; -- Token inválido o expirado
    END IF;
    
    -- Actualizar contraseña
    UPDATE public.admin_users
    SET password_hash = crypt(p_new_password, gen_salt('bf')),
        updated_at = NOW()
    WHERE id = v_user_id;
    
    -- Marcar token como usado
    UPDATE public.password_reset_tokens
    SET used = true
    WHERE token = p_token;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- FUNCIÓN: Crear nuevo usuario administrador
CREATE OR REPLACE FUNCTION create_admin_user(
    p_username VARCHAR,
    p_password VARCHAR,
    p_email VARCHAR,
    p_nombre_completo VARCHAR DEFAULT NULL,
    p_rol VARCHAR DEFAULT 'admin',
    p_activo BOOLEAN DEFAULT true
)
RETURNS BIGINT AS $$
DECLARE
    v_user_id BIGINT;
BEGIN
    INSERT INTO public.admin_users (username, password_hash, email, nombre_completo, rol, activo)
    VALUES (
        p_username,
        crypt(p_password, gen_salt('bf')),
        p_email,
        p_nombre_completo,
        p_rol,
        p_activo
    )
    RETURNING id INTO v_user_id;
    
    RETURN v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- FUNCIÓN: Actualizar contraseña de administrador
CREATE OR REPLACE FUNCTION update_admin_password(p_user_id BIGINT, p_new_password VARCHAR)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE public.admin_users
    SET password_hash = crypt(p_new_password, gen_salt('bf')),
        updated_at = NOW()
    WHERE id = p_user_id AND activo = true;
    
    IF FOUND THEN
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;





-- 2. TABLA: admin_sessions
-- Almacena las sesiones activas de los administradores
CREATE TABLE IF NOT EXISTS public.admin_sessions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES public.admin_users(id) ON DELETE CASCADE,
    session_token TEXT UNIQUE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;

-- Índices para sesiones
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON public.admin_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_user_id ON public.admin_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON public.admin_sessions(expires_at);


-- 2B. TABLA: password_reset_tokens
-- Almacena los tokens de recuperación de contraseña
CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES public.admin_users(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- Índices para tokens de reset
CREATE INDEX IF NOT EXISTS idx_reset_tokens_token ON public.password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_reset_tokens_user_id ON public.password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_reset_tokens_expires ON public.password_reset_tokens(expires_at);


-- 3. TABLA: testimonios
-- Almacena los testimonios de clientes
CREATE TABLE IF NOT EXISTS public.testimonios (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    testimonio TEXT NOT NULL,
    calificacion INTEGER CHECK (calificacion >= 1 AND calificacion <= 5),
    fecha DATE DEFAULT CURRENT_DATE,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.testimonios ENABLE ROW LEVEL SECURITY;

-- Política: Permitir lectura pública
CREATE POLICY "Permitir lectura pública de testimonios"
    ON public.testimonios
    FOR SELECT
    USING (activo = true);

-- Política: Permitir inserción autenticada
CREATE POLICY "Permitir inserción autenticada"
    ON public.testimonios
    FOR INSERT
    WITH CHECK (true);

-- Política: Permitir actualización autenticada
CREATE POLICY "Permitir actualización autenticada"
    ON public.testimonios
    FOR UPDATE
    USING (true);

-- Política: Permitir eliminación autenticada
CREATE POLICY "Permitir eliminación autenticada"
    ON public.testimonios
    FOR DELETE
    USING (true);


-- 2. TABLA: galeria
-- Almacena las imágenes de la galería
CREATE TABLE IF NOT EXISTS public.galeria (
    id BIGSERIAL PRIMARY KEY,
    titulo VARCHAR(255),
    descripcion TEXT,
    imagen_url TEXT NOT NULL,
    categoria VARCHAR(100),
    activo BOOLEAN DEFAULT true,
    orden INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.galeria ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso
CREATE POLICY "Permitir lectura pública de galería"
    ON public.galeria
    FOR SELECT
    USING (activo = true);

CREATE POLICY "Permitir inserción autenticada galería"
    ON public.galeria
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Permitir actualización autenticada galería"
    ON public.galeria
    FOR UPDATE
    USING (true);

CREATE POLICY "Permitir eliminación autenticada galería"
    ON public.galeria
    FOR DELETE
    USING (true);


-- 3. TABLA: aliados
-- Almacena información de aliados comerciales
CREATE TABLE IF NOT EXISTS public.aliados (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    logo_url TEXT NOT NULL,
    descripcion TEXT,
    departamento VARCHAR(100),
    ciudad VARCHAR(100),
    direccion TEXT,
    telefono VARCHAR(50),
    email VARCHAR(255),
    sitio_web TEXT,
    activo BOOLEAN DEFAULT true,
    orden INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.aliados ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso
CREATE POLICY "Permitir lectura pública de aliados"
    ON public.aliados
    FOR SELECT
    USING (activo = true);

CREATE POLICY "Permitir inserción autenticada aliados"
    ON public.aliados
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Permitir actualización autenticada aliados"
    ON public.aliados
    FOR UPDATE
    USING (true);

CREATE POLICY "Permitir eliminación autenticada aliados"
    ON public.aliados
    FOR DELETE
    USING (true);


-- 4. TABLA: convenios
-- Almacena información de convenios
CREATE TABLE IF NOT EXISTS public.convenios (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    logo_url TEXT NOT NULL,
    descripcion TEXT,
    departamento VARCHAR(100),
    ciudad VARCHAR(100),
    direccion TEXT,
    telefono VARCHAR(50),
    email VARCHAR(255),
    sitio_web TEXT,
    activo BOOLEAN DEFAULT true,
    orden INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.convenios ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso
CREATE POLICY "Permitir lectura pública de convenios"
    ON public.convenios
    FOR SELECT
    USING (activo = true);

CREATE POLICY "Permitir inserción autenticada convenios"
    ON public.convenios
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Permitir actualización autenticada convenios"
    ON public.convenios
    FOR UPDATE
    USING (true);

CREATE POLICY "Permitir eliminación autenticada convenios"
    ON public.convenios
    FOR DELETE
    USING (true);


-- 5. TABLA: blog_posts
-- Almacena las entradas del blog
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id BIGSERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    contenido TEXT NOT NULL,
    resumen TEXT,
    imagen_destacada TEXT,
    autor VARCHAR(100),
    categoria VARCHAR(100),
    tags TEXT[],
    activo BOOLEAN DEFAULT true,
    fecha_publicacion TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso
CREATE POLICY "Permitir lectura pública de blog"
    ON public.blog_posts
    FOR SELECT
    USING (activo = true);

CREATE POLICY "Permitir inserción autenticada blog"
    ON public.blog_posts
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Permitir actualización autenticada blog"
    ON public.blog_posts
    FOR UPDATE
    USING (true);

CREATE POLICY "Permitir eliminación autenticada blog"
    ON public.blog_posts
    FOR DELETE
    USING (true);


-- 6. TABLA: analytics_events
-- Almacena eventos de analytics
CREATE TABLE IF NOT EXISTS public.analytics_events (
    id BIGSERIAL PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB,
    user_id VARCHAR(255),
    session_id VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    page_url TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Política: Permitir inserción pública (para analytics)
CREATE POLICY "Permitir inserción pública analytics"
    ON public.analytics_events
    FOR INSERT
    WITH CHECK (true);

-- Política: Solo lectura autenticada
CREATE POLICY "Permitir lectura autenticada analytics"
    ON public.analytics_events
    FOR SELECT
    USING (true);


-- 7. CREAR ÍNDICES PARA MEJORAR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_admin_users_username ON public.admin_users(username);
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON public.admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_activo ON public.admin_users(activo);
CREATE INDEX IF NOT EXISTS idx_testimonios_activo ON public.testimonios(activo);
CREATE INDEX IF NOT EXISTS idx_testimonios_fecha ON public.testimonios(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_galeria_activo ON public.galeria(activo);
CREATE INDEX IF NOT EXISTS idx_galeria_categoria ON public.galeria(categoria);
CREATE INDEX IF NOT EXISTS idx_galeria_orden ON public.galeria(orden);
CREATE INDEX IF NOT EXISTS idx_aliados_activo ON public.aliados(activo);
CREATE INDEX IF NOT EXISTS idx_aliados_departamento ON public.aliados(departamento);
CREATE INDEX IF NOT EXISTS idx_convenios_activo ON public.convenios(activo);
CREATE INDEX IF NOT EXISTS idx_convenios_departamento ON public.convenios(departamento);
CREATE INDEX IF NOT EXISTS idx_blog_activo ON public.blog_posts(activo);
CREATE INDEX IF NOT EXISTS idx_blog_slug ON public.blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_fecha ON public.blog_posts(fecha_publicacion DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_type ON public.analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_timestamp ON public.analytics_events(timestamp DESC);


-- 8. CREAR STORAGE BUCKETS
-- Nota: Esto debe ejecutarse desde el dashboard de Supabase en la sección Storage

-- Bucket para imágenes de galería
-- INSERT INTO storage.buckets (id, name, public) VALUES ('galeria', 'galeria', true);

-- Bucket para logos de aliados
-- INSERT INTO storage.buckets (id, name, public) VALUES ('aliados', 'aliados', true);

-- Bucket para logos de convenios
-- INSERT INTO storage.buckets (id, name, public) VALUES ('convenios', 'convenios', true);

-- Bucket para imágenes de blog
-- INSERT INTO storage.buckets (id, name, public) VALUES ('blog', 'blog', true);


-- 9. POLÍTICAS DE STORAGE (ejecutar en SQL Editor después de crear los buckets)
/*
-- Permitir lectura pública de todos los buckets
CREATE POLICY "Acceso público lectura galería"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'galeria');

CREATE POLICY "Acceso público lectura aliados"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'aliados');

CREATE POLICY "Acceso público lectura convenios"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'convenios');

CREATE POLICY "Acceso público lectura blog"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'blog');

-- Permitir inserción autenticada
CREATE POLICY "Permitir upload autenticado galería"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'galeria');

CREATE POLICY "Permitir upload autenticado aliados"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'aliados');

CREATE POLICY "Permitir upload autenticado convenios"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'convenios');

CREATE POLICY "Permitir upload autenticado blog"
    ON storage.objects FOR INSERT
    WITH CHECK (bucket_id = 'blog');
*/


-- 10. DATOS DE EJEMPLO (OPCIONAL - Comentar si no se necesitan)

-- Crear el primer usuario administrador
-- IMPORTANTE: Cambia 'tuContraseñaSegura123' por tu contraseña deseada
INSERT INTO public.admin_users (username, password_hash, email, nombre_completo, rol) 
VALUES ('admin', crypt('admin123', gen_salt('bf')), 'admin@renacermascotas.com', 'Administrador Principal', 'admin')
ON CONFLICT (username) DO NOTHING;

-- Insertar testimonio de ejemplo
INSERT INTO public.testimonios (nombre, testimonio, calificacion) VALUES
('María González', 'Excelente servicio, mi mascota quedó muy bien atendida', 5),
('Carlos Pérez', 'Muy profesionales y cariñosos con los animales', 5)
ON CONFLICT DO NOTHING;

-- FIN DEL SCHEMA
