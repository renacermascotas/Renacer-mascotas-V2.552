# Pasos Finales para Configurar el Proyecto con Supabase

¡Ya casi está todo listo! Sigue estos pasos en la web de Supabase para que tu panel de administración funcione perfectamente.

---

### Paso 1: Crear las Tablas en la Base de Datos

1.  Ve a tu proyecto en [supabase.com](https://supabase.com).
2.  En el menú de la izquierda, haz clic en **SQL Editor**.
3.  Haz clic en **+ New query**.
4.  Pega el siguiente código y haz clic en **RUN**.

```sql
-- Tabla para la galería
CREATE TABLE gallery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  image_url TEXT NOT NULL,
  description TEXT
);

-- Tabla para el blog
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  title TEXT NOT NULL,
  content TEXT,
  image_url TEXT
);

-- Tabla para los testimonios
CREATE TABLE testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  author TEXT NOT NULL,
  text TEXT,
  image_url TEXT
);

-- Habilitar Row Level Security (RLS) para proteger tus tablas
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- Política para permitir la lectura pública de las tablas
CREATE POLICY "Public read access" ON gallery FOR SELECT USING (true);
CREATE POLICY "Public read access" ON blog_posts FOR SELECT USING (true);
CREATE POLICY "Public read access" ON testimonials FOR SELECT USING (true);

-- Política para permitir a los usuarios autenticados (tu admin) gestionar el contenido
CREATE POLICY "Allow auth users to manage content" ON gallery FOR ALL
  USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow auth users to manage content" ON blog_posts FOR ALL
  USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow auth users to manage content" ON testimonials FOR ALL
  USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
```

---

### Paso 2: Crear el Contenedor de Archivos (Bucket)

Aquí es donde se guardarán las fotos que subas.

1.  En el menú de la izquierda, haz clic en **Storage**.
2.  Haz clic en **Create a new bucket**.
3.  Nombra el bucket `media`.
4.  **Importante:** Activa la opción **"Make this bucket public"**.
5.  Haz clic en **Create bucket**.

---

### Paso 3 (Opcional): Poblar con Datos de Ejemplo

Si quieres tener contenido de prueba desde el inicio:

1.  En tu proyecto, ve a la carpeta `backend/`.
2.  Crea un archivo llamado `.env`.
3.  Dentro de `.env`, pega tu clave `service_role` así: `SUPABASE_SERVICE_KEY=tu_clave_secreta_aqui`.
4.  Abre una terminal en la carpeta `backend/` y ejecuta: `node create-sample-data.js`.

¡Y listo! Ahora puedes ir a `html/admin-login.html`, iniciar sesión y empezar a subir fotos y hacer pruebas.

---

### Paso 4: Crear tu Usuario Administrador

El sistema ya no usa un usuario por defecto. Debes crear tu propio usuario para acceder al panel.

1.  En el menú de la izquierda de tu proyecto de Supabase, ve a **Authentication**.
2.  Haz clic en el botón **Add user**.
3.  Ingresa un **email** y una **contraseña segura**.
4.  Haz clic en **Create user**.

Usa este email y contraseña para iniciar sesión en `admin-login.html`.