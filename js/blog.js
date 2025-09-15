// =========================================
// BLOQUE: Carga dinámica de entradas de blog desde el backend
// Explicación: Este bloque obtiene los posts del blog desde la API y los muestra en el frontend, reflejando los cambios hechos en el admin.
// =========================================
import { supabase } from './supabase-client.js';

document.addEventListener('DOMContentLoaded', function () {
  const blogCards = document.getElementById('blog-cards');
  if (!blogCards) return;

  async function loadBlogPosts() {
    try {
      const { data: posts, error } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false }).limit(3);
      if (error) throw error;

      if (!Array.isArray(posts) || posts.length === 0) {
        blogCards.innerHTML = '<p>No hay entradas de blog aún.</p>';
        return;
      }
      blogCards.innerHTML = posts.map(post => `
        <div class="plan-img-box">
          <a href="#" style="text-decoration:none; color:inherit;"> <!-- Idealmente, esto debería enlazar a una página de post individual -->
            <img src="${post.image_url || 'fotos/default.jpg'}" alt="${post.title}" crossorigin="anonymous">
            <div style="width:100%;text-align:center;margin-top:1.2rem;">
              <h3 style="color:var(--secondary);font-size:1.15rem;font-weight:800;margin-bottom:0.7rem;">${post.title}</h3>
              <p style="color:#444;font-size:1.05rem;">${post.content ? post.content.substring(0, 80) + '...' : ''}</p>
            </div>
          </a>
        </div>
      `).join('');
    } catch (err) {
      console.error('Error cargando el blog:', err);
      blogCards.innerHTML = '<p>Error al cargar el blog.</p>';
    }
  }

  loadBlogPosts();
});
