# 🐾 Renacer Mascotas - Sitio Web Corporativo

## 📋 Descripción General

Sitio web corporativo para **Renacer Mascotas**, empresa dedicada al cuidado integral de mascotas con servicios de veterinaria, spa, nutrición, planes funerarios y convenios corporativos. El proyecto está desarrollado con tecnologías web modernas y cuenta con interfaz de administración para gestión de contenidos.

---

## 🚀 Características Principales

### ✨ Funcionalidades del Sitio

- **Página Principal (index.html)**
  - Hero carousel con imágenes WebP optimizadas
  - Video de presentación con poster responsive
  - Secciones de servicios principales
  - Testimonios dinámicos
  - Sistema de ubicaciones con Google Maps integrado
  - Newsletter para suscripciones

- **Sistema de Navegación**
  - Menú principal responsive con submenús desplegables
  - Logo interactivo como activador de menú en móvil
  - Tooltip animado para guiar al usuario ("Toca el logo para ver nuestro menú")
  - Menú hamburguesa oculto en versión móvil
  - Smooth scroll entre secciones

- **Páginas de Servicios**
  - **Veterinaria**: Información de servicios médicos y especialidades
  - **Planes**: Planes de afiliación y membresías
  - **Exequiales**: Servicios funerarios para mascotas
  - **Convenios**: Alianzas corporativas con empresas
  - **Aliados**: Red de partners y colaboradores con logos
  - **Galería**: Galería de imágenes dinámica

- **Blog Dinámico**
  - Sistema de posts con paginación
  - Imágenes optimizadas y lazy loading
  - Diseño responsive tipo card

- **Testimonios**
  - Visualización en formato carrusel
  - Imágenes de clientes con fallback a íconos
  - Sistema de calificación por estrellas

- **Formulario de Contacto**
  - Validación HTML5
  - Autocomplete inteligente para mejor UX
  - Integración directa con WhatsApp
  - Campos: nombre, email, teléfono, asunto, mensaje

### 🎨 Sistema de Diseño

#### Paleta de Colores
```css
--primary: #2E7D32      /* Verde principal */
--secondary: #FFA726    /* Naranja secundario */
--accent: #00ACC1       /* Cyan de acento */
--dark: #1B5E20         /* Verde oscuro */
--light: #F1F8E9        /* Verde claro */
--text-dark: #212121    /* Texto principal */
--text-light: #757575   /* Texto secundario */
```

#### Tipografía
- **Principal**: Poppins (Google Fonts)
- **Tamaños responsive**: rem units para escalabilidad
- **Pesos**: 300 (light), 400 (regular), 600 (semibold), 700 (bold)

#### Componentes Reutilizables

**Botones**
```css
.btn - Botón estándar con hover effect
.btn-primary - Botón verde principal
.btn-secondary - Botón naranja
.whatsapp-btn - Botón con ícono de WhatsApp
```

**Cards**
```css
.card - Tarjeta base con sombra
.service-card - Tarjeta de servicio con ícono
.blog-card - Tarjeta de blog post
.testimonial-card - Tarjeta de testimonio
```

**Grid System**
```css
.grid-2 - Grid de 2 columnas (responsive)
.grid-3 - Grid de 3 columnas (responsive)
.grid-4 - Grid de 4 columnas (responsive)
```

### 📱 Optimización Móvil

#### Media Queries Breakpoints
```css
@media (max-width: 900px)  /* Tablets y móviles grandes */
@media (max-width: 480px)  /* Móviles estándar */
@media (max-width: 360px)  /* Móviles pequeños */
@media (orientation: landscape) /* Modo horizontal */
```

#### Botones Flotantes
- **WhatsApp**: Fixed bottom-right, z-index 99999
- **PSE (Pagos)**: Encima de WhatsApp con separación
- **Scroll to Top**: Fixed bottom-left, aparece después de scroll

#### Z-Index Hierarchy
```css
Floating buttons: 99999
Mobile menu: 1001
Header: 1000
Modals/overlays: 10000+
```

#### Archivo `mobile-fixes.css`
Archivo crítico con máxima especificidad (!important) para garantizar visibilidad de elementos flotantes en todos los dispositivos móviles. Incluye:
- Tamaños de botones responsivos (56px → 50px → 46px)
- Posicionamiento fixed forzado
- Visibility y display controlados
- Soporte para landscape

### 🛠️ Panel de Administración

**Ruta**: `/html/admin-dashboard.html`

#### Funcionalidades Admin

**Gestión de Blog**
- Crear, editar y eliminar posts
- Subida de imágenes o URL externa
- Editor de texto con textarea
- Vista previa en tabla con paginación
- Filtrado y búsqueda

**Gestión de Testimonios**
- CRUD completo de testimonios
- Subida de imagen de cliente
- Validación de campos requeridos
- Vista en tabla ordenada por fecha

**Gestión de Galería**
- Subida masiva de imágenes
- Descripción opcional por imagen
- Eliminación con confirmación
- Vista en grid responsive
- Paginación automática

**Analytics Dashboard**
- Gráficos de visitas (Chart.js)
- Estadísticas de páginas más visitadas
- Datos de geolocalización de visitantes
- Métricas de tiempo real

#### Sistema de Autenticación
- Login seguro con Supabase Auth
- Persistencia de sesión
- Cierre de sesión
- Redirección automática si no está autenticado

---

## 📁 Estructura del Proyecto

```
Renacer-mascotas-V2/
│
├── index.html              # Página principal
├── aliados.html            # Página de aliados
├── blog.html               # Listado de blog posts
├── contactos.html          # Página de contacto
├── convenios.html          # Convenios corporativos
├── exequiales.html         # Servicios funerarios
├── galeria.html            # Galería de imágenes
├── planes.html             # Planes de afiliación
├── testimonios.html        # Testimonios de clientes
├── veterinaria.html        # Servicios veterinarios
│
├── header.html             # Header común (carga dinámica)
├── footer.html             # Footer común (carga dinámica)
├── topbar.html             # Barra superior de contacto
├── redes_sociales.html     # Enlaces a redes sociales
├── contacto_extra.html     # Formulario de contacto embebido
│
├── css/
│   ├── styles.css          # Estilos compilados principales
│   ├── base.css            # Reset y estilos base
│   ├── layout.css          # Grid, header, footer, navegación
│   ├── components.css      # Botones, cards, forms
│   ├── sections.css        # Secciones específicas de páginas
│   ├── scroll-to-top.css   # Botón scroll to top
│   ├── mobile-fixes.css    # Fixes críticos para móvil (z-index, visibility)
│   ├── loader.css          # Animación de carga
│   ├── admin-glass.css     # Estilos glassmorphism del admin
│   └── admin-login-modern.css # Estilos del login admin
│
├── js/
│   ├── main.js             # Script principal
│   ├── menu.js             # Lógica del menú responsive
│   ├── include-html.js     # Carga dinámica de header/footer
│   ├── hero-carousel.js    # Carrusel de hero
│   ├── slider.js           # Sliders genéricos
│   ├── lightbox.js         # Lightbox para galería
│   ├── reveal.js           # Animaciones scroll reveal
│   ├── loader.js           # Loading screen
│   ├── form.js             # Validación de formularios
│   ├── blog.js             # Funcionalidad del blog
│   ├── gallery.js          # Funcionalidad de galería
│   ├── testimonial-loader.js # Carga de testimonios
│   ├── testimonios.js      # Funcionalidad testimonios
│   └── analytics-charts.js # Gráficos de analytics
│
├── fotos/                  # Imágenes del sitio
│   ├── Aliados_logos/      # Logos de aliados
│   ├── Logos_Convenios_RM/ # Logos de convenios
│   └── *.webp              # Imágenes optimizadas WebP
│
└── package.json            # Dependencias del proyecto
```

---

## 🔧 Tecnologías Utilizadas

### Frontend
- **HTML5**: Semántico con accesibilidad (ARIA labels)
- **CSS3**: Flexbox, Grid, Custom Properties, Animations
- **JavaScript ES6+**: Módulos, Async/Await, Fetch API
- **Font Awesome 6.5.0**: Iconografía
- **Google Fonts**: Tipografía Poppins

### Librerías JavaScript
- **Chart.js**: Gráficos de analytics
- **Lazy Loading**: Carga diferida de imágenes
- **IntersectionObserver API**: Animaciones reveal on scroll

### Optimización
- **WebP**: Formato de imagen optimizado
- **Lazy Loading**: Atributo `loading="lazy"` en imágenes
- **Code Splitting**: Carga de scripts por página
- **Minificación**: CSS y JS optimizados
- **CSP (Content Security Policy)**: Seguridad de headers

---

## 🎯 Características Técnicas Destacadas

### 1. Sistema de Carga Dinámica
```javascript
// include-html.js - Carga header/footer dinámicamente
function includeHTML() {
    const elements = document.querySelectorAll('[include-html]');
    elements.forEach(async (element) => {
        const file = element.getAttribute('include-html');
        const response = await fetch(file);
        element.innerHTML = await response.text();
    });
}
```

### 2. Menú Responsive con Logo Interactivo
```javascript
// menu.js - Logo como trigger del menú en móvil
const brand = document.querySelector('.brand');
brand.addEventListener('click', (e) => {
    if (window.innerWidth <= 900) {
        e.preventDefault();
        toggleMenu();
    }
});
```

### 3. Validación y Autocomplete en Formularios
```html
<!-- Atributos autocomplete para mejor UX -->
<input type="text" name="nombre" autocomplete="name" required>
<input type="email" name="email" autocomplete="email" required>
<input type="tel" name="telefono" autocomplete="tel">
```

### 4. Content Security Policy (CSP)
```html
<meta http-equiv="Content-Security-Policy" content="
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' data: https: blob:;
    connect-src 'self' https://cdn.jsdelivr.net;
    font-src 'self' https://fonts.gstatic.com;
">
```

### 5. Lazy Loading de Imágenes
```html
<img src="image.webp" loading="lazy" alt="Descripción">
<picture>
    <source srcset="image.webp" type="image/webp">
    <img src="image.jpg" alt="Fallback" loading="lazy">
</picture>
```

### 6. Animaciones Scroll Reveal
```javascript
// reveal.js - Animaciones al hacer scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
        }
    });
}, observerOptions);
```

---

##  Instalación y Uso

### Requisitos Previos
- Navegador web moderno (Chrome, Firefox, Edge, Safari)
- Servidor web local (opcional): Live Server, http-server, XAMPP

### Ejecución Local

**Opción 1: Con Live Server (VS Code)**
```bash
# Instalar extensión Live Server en VS Code
# Click derecho en index.html → "Open with Live Server"
```

**Opción 2: Con http-server (Node.js)**
```bash
npm install -g http-server
http-server -p 8080
# Abrir http://localhost:8080
```

**Opción 3: Con Python**
```bash
# Python 3
python -m http.server 8000
# Abrir http://localhost:8000
```

---

## ⚙️ Configuración de Supabase

### 1. Crear Proyecto en Supabase
1. Ve a [supabase.com](https://supabase.com) y crea una cuenta
2. Crea un nuevo proyecto
3. Guarda las credenciales que te proporciona

### 2. Configurar Variables de Entorno

**Crear archivo `.env` en la raíz del proyecto:**
```bash
cp .env.template .env
```

**Edita `.env` con tus credenciales:**
```env
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu_anon_key_aqui
SUPABASE_SERVICE_KEY=tu_service_role_key_aqui
```

⚠️ **IMPORTANTE**: Nunca subas el archivo `.env` a Git (ya está en `.gitignore`)

### 3. Ejecutar Schema SQL

1. Ve a tu proyecto en Supabase Dashboard
2. Click en **SQL Editor** en el menú lateral
3. Copia todo el contenido de `supabase/schema.sql`
4. Pégalo en el editor y ejecuta con `Run`

Esto creará:
- ✅ Tablas: `admin_users`, `testimonios`, `galeria`, `aliados`, `convenios`, `blog_posts`, `analytics_events`
- ✅ Funciones de autenticación y seguridad
- ✅ Row Level Security (RLS) en todas las tablas
- ✅ Usuario admin por defecto (usuario: `admin`, contraseña: `admin123`)

### 4. Crear Storage Buckets

En Supabase Dashboard → **Storage**:
1. Crea bucket `galeria` (público)
2. Crea bucket `aliados` (público)
3. Crea bucket `convenios` (público)
4. Crea bucket `blog` (público)

### 5. Actualizar Archivos de Configuración

Los archivos ya están configurados para usar las variables de entorno:
- `js/supabase-client.js` - Cliente frontend
- `backend/supabase-client.js` - Cliente backend

### 6. Configurar Vercel (Opcional)

Si vas a desplegar en Vercel:
1. Ve a tu proyecto en Vercel Dashboard
2. Settings → Environment Variables
3. Agrega las mismas variables del archivo `.env`:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_KEY`
4. Redeploy el proyecto

### 7. Primer Acceso al Admin

1. Abre `html/admin-login.html`
2. Usuario: `admin`
3. Contraseña: `admin123`
4. ⚠️ **CAMBIA LA CONTRASEÑA** inmediatamente después del primer login

**Para cambiar contraseña:**
- Opción 1: Panel Admin → Usuarios Admin → Editar usuario
- Opción 2: Usa "¿Olvidaste tu contraseña?" en el login
- Opción 3: SQL: `UPDATE admin_users SET password_hash = crypt('nueva_pass', gen_salt('bf')) WHERE username = 'admin';`

---

## 🔐 Sistema de Autenticación

Ver documentación completa en [`AUTENTICACION.md`](./AUTENTICACION.md)

### Características:
- ✅ Login seguro con bcrypt
- ✅ Recuperación de contraseña con tokens
- ✅ Gestión de usuarios administradores
- ✅ Sistema de roles
- ✅ Sesiones validadas
- ✅ Tokens de recuperación expiran en 1 hora

---
---

## 🎨 Guía de Estilos

### Convenciones de Código

**HTML**
- Usar HTML5 semántico (`<header>`, `<nav>`, `<main>`, `<article>`, `<section>`, `<footer>`)
- Atributos ARIA para accesibilidad
- Validación HTML5 en formularios
- Lazy loading en imágenes

**CSS**
- BEM naming convention (Block__Element--Modifier)
- Mobile-first approach
- CSS Variables para temas
- Comentarios descriptivos por sección

**JavaScript**
- ES6+ syntax
- Async/await para operaciones asíncronas
- Módulos para organización de código
- Comentarios JSDoc en funciones principales

### Nomenclatura de Clases CSS

```css
/* Bloques */
.header { }
.menu { }
.card { }

/* Elementos */
.menu__item { }
.card__title { }
.card__image { }

/* Modificadores */
.btn--primary { }
.card--featured { }
.menu__item--active { }
```

---

## 🔄 Flujo de Trabajo

### Actualización de Contenido

El sitio cuenta con un sistema de gestión de contenidos que permite actualizar:
- Posts del blog
- Testimonios de clientes
- Imágenes de galería
- Información de servicios

### Agregar Nueva Página

1. Crear archivo `nueva-pagina.html`
2. Incluir estructura base:
```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nueva Página - Renacer Mascotas</title>
    <link rel="stylesheet" href="css/styles.css">
    <link rel="stylesheet" href="css/mobile-fixes.css">
</head>
<body>
    <div include-html="header.html"></div>
    
    <main>
        <!-- Contenido aquí -->
    </main>
    
    <div include-html="footer.html"></div>
    
    <script type="module" src="js/main.js"></script>
</body>
</html>
```
3. Agregar al menú en `header.html`
4. Crear estilos específicos si es necesario

---

## 📈 Optimizaciones Implementadas

### Performance
- ✅ Imágenes en formato WebP (reducción ~30% tamaño)
- ✅ Lazy loading en todas las imágenes
- ✅ CSS crítico inline (futuro)
- ✅ Minificación de assets
- ✅ Caching de headers HTTP
- ✅ Sprites CSS para íconos pequeños

### SEO
- ✅ Meta tags descriptivos en todas las páginas
- ✅ Structured data (Schema.org) para servicios
- ✅ Sitemap.xml generado
- ✅ Robots.txt configurado
- ✅ URLs amigables
- ✅ Alt text en todas las imágenes

### Accesibilidad (A11y)
- ✅ ARIA labels en elementos interactivos
- ✅ Contraste de colores WCAG AA
- ✅ Navegación por teclado completa
- ✅ Focus visible en elementos
- ✅ Textos alternativos descriptivos
- ✅ Formularios con labels asociados

### UX/UI
- ✅ Diseño responsive en 4 breakpoints
- ✅ Animaciones suaves (ease-in-out)
- ✅ Feedback visual en interacciones
- ✅ Loading states
- ✅ Estados hover/focus/active
- ✅ Tooltips informativos

---

## 🐛 Solución de Problemas Comunes

### Botones flotantes no visibles en móvil
**Solución**: Verificar que `mobile-fixes.css` esté cargado al final del `<head>` y que tenga la máxima especificidad con `!important`.

### Menú no se despliega en móvil
**Solución**: Verificar que `menu.js` esté cargado correctamente y que el logo tenga la clase `.brand`.

### Imágenes no cargan correctamente
**Solución**: Verificar rutas de imágenes y que los archivos WebP existan en la carpeta `/fotos`.

### Formularios no funcionan
**Solución**: Verificar atributos `autocomplete` y validación HTML5 en campos requeridos.

---

## 📝 Changelog Reciente

### v2.0.0 - Optimización Móvil Completa (Nov 2024)

**✨ Nuevas Características**
- Logo como activador del menú en móvil
- Tooltip animado para guía de usuario
- Botones flotantes (WhatsApp, PSE, Scroll-to-top) visibles en todas las páginas
- Archivo `mobile-fixes.css` con z-index optimizado

**🔧 Correcciones**
- CSP actualizado con wildcard `*.supabase.co` y `cdn.jsdelivr.net`
- Video poster corregido: `4.jpg` → `4.webp`
- Srcset corregido: espacios en nombres de archivo eliminados
- Atributos autocomplete agregados en formularios
- Z-index hierarchy reorganizado (floats: 99999, menu: 1001, header: 1000)

**🎨 Mejoras de Diseño**
- Hamburguesa completamente oculta (4 capas de hiding)
- Submenús funcionando correctamente en móvil
- Responsive para 4 breakpoints diferentes
- Soporte para orientación landscape

---

## 👥 Equipo de Desarrollo

**Desarrollador Principal**: Juan Monsalve  
**Cliente**: Renacer Mascotas  
**Año**: 2024-2025

---

## 📄 Licencia

Proyecto propietario de **Renacer Mascotas**. Todos los derechos reservados.

---

## 🔗 Enlaces Útiles

- **Font Awesome Icons**: https://fontawesome.com/icons
- **Chart.js**: https://www.chartjs.org/
- **Google Fonts**: https://fonts.google.com/

---

## 📞 Contacto

Para consultas sobre el proyecto:
- **Email**: info@renacermascotas.com
- **WhatsApp**: Botón flotante en el sitio web

---

**Última actualización**: Noviembre 2024  
**Versión**: 2.0.0
