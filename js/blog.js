// =========================================
// BLOQUE: Carga dinámica de entradas de blog desde el backend
// Explicación: Este bloque obtiene los posts del blog desde la API y los muestra en el frontend, reflejando los cambios hechos en el admin.
// =========================================
import { supabase } from './supabase-client.js';
import { sanitizeText, sanitizeHTML } from './security.js';

document.addEventListener('DOMContentLoaded', function () {
  const blogCards = document.getElementById('blog-cards');
  if (!blogCards) {
    console.log('Contenedor de blog no encontrado');
    return;
  }

  async function loadBlogPosts() {
    try {
        if (!supabase) {
            console.log('Supabase no disponible, cargando posts por defecto');
            loadDefaultBlogPosts();
            return;
        }

        console.log('Intentando conectar a Supabase para blog...');
        const { data: posts, error } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false }).limit(3);
        
        if (error) {
            console.warn('Error de Supabase en blog (usando contenido por defecto):', error.message);
            loadDefaultBlogPosts();
            return;
        }      if (!Array.isArray(posts) || posts.length === 0) {
        console.log('📝 No hay posts en Supabase, usando contenido por defecto');
        loadDefaultBlogPosts();
        return;
      }

      console.log('✅ Blog cargado desde Supabase -', posts.length, 'posts');
      blogCards.innerHTML = posts.map((post, idx) => `
        <div class="plan-img-box" data-post-id="${idx}">
          <div style="cursor: pointer;" onclick="openBlogModal(${idx})">
            <img src="${sanitizeText(post.imagen_destacada) || 'fotos/4.jpg'}" alt="${sanitizeText(post.titulo)}" crossorigin="anonymous">
            <div style="width:100%;text-align:center;margin-top:1.2rem;">
              <h3 style="color:var(--secondary);font-size:1.15rem;font-weight:800;margin-bottom:0.7rem;">${sanitizeText(post.titulo)}</h3>
              <p style="color:#444;font-size:1.05rem;">${post.contenido ? sanitizeText(post.contenido.substring(0, 80)) + '...' : ''}</p>
              <button class="btn" style="margin-top:0.5rem;">Leer más</button>
            </div>
          </div>
        </div>
      `).join('');
      
      // Guardar posts para el modal
      window.blogPosts = posts;
    } catch (err) {
      console.error('Error cargando el blog:', err);
      loadDefaultBlogPosts();
    }
  }

  function loadDefaultBlogPosts() {
    const defaultPosts = [
      {
        title: "Cuidados básicos para tu mascota",
        content: "Consejos esenciales para mantener a tu mascota saludable y feliz durante todo el año...",
        image_url: "fotos/4.jpg"
      },
      {
        title: "Nutrición adecuada para perros",
        content: "Guía completa sobre la alimentación correcta según la edad y raza de tu perro...",
        image_url: "fotos/3.jpg"
      },
      {
        title: "Vacunación: Protege a tu mascota",
        content: "Calendario de vacunación y importancia de mantener al día las vacunas de tu mascota...",
        image_url: "fotos/gatos perro.png"
      }
    ];

    blogCards.innerHTML = defaultPosts.map(post => `
      <div class="plan-img-box">
        <a href="blog.html" style="text-decoration:none; color:inherit;">
          <img src="${post.image_url}" alt="${post.title}" crossorigin="anonymous">
          <div style="width:100%;text-align:center;margin-top:1.2rem;">
            <h3 style="color:var(--secondary);font-size:1.15rem;font-weight:800;margin-bottom:0.7rem;">${post.title}</h3>
            <p style="color:#444;font-size:1.05rem;">${post.content.substring(0, 80)}...</p>
          </div>
        </a>
      </div>
    `).join('');
  }

  loadBlogPosts();
});

// Modal para mostrar blog completo
window.openBlogModal = function(idx) {
  const posts = window.blogPosts || [];
  if (!posts[idx]) return;
  
  const post = posts[idx];
  
  // Crear modal
  const modal = document.createElement('div');
  modal.className = 'blog-modal';
  modal.innerHTML = `
    <div class="blog-modal-content">
      <button class="blog-modal-close" onclick="closeBlogModal()">&times;</button>
      <img src="${sanitizeText(post.imagen_destacada) || 'fotos/4.jpg'}" alt="${sanitizeText(post.titulo)}" style="width:100%;max-height:400px;object-fit:cover;border-radius:12px;margin-bottom:1.5rem;">
      <h2 style="color:var(--secondary);margin-bottom:1rem;">${sanitizeText(post.titulo)}</h2>
      <div style="color:#666;line-height:1.8;text-align:justify;">${sanitizeHTML(post.contenido)}</div>
      <div style="margin-top:2rem;text-align:center;">
        <a href="blog.html" class="btn">Ir a Blog</a>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  setTimeout(() => modal.classList.add('show'), 10);
  document.body.style.overflow = 'hidden';
};

window.closeBlogModal = function() {
  const modal = document.querySelector('.blog-modal');
  if (modal) {
    modal.classList.remove('show');
    setTimeout(() => {
      modal.remove();
      document.body.style.overflow = '';
    }, 300);
  }
};
