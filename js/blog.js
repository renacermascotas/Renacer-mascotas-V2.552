// =========================================
// BLOQUE: Generación dinámica de tarjetas de blog
// Explicación: Este bloque define los posts del blog y genera las tarjetas visuales con imagen, título y texto, insertándolas en el contenedor principal de la sección blog.
// =========================================
// =========================================
// BLOQUE: Carga dinámica de entradas de blog desde el backend
// Explicación: Este bloque obtiene los posts del blog desde la API y los muestra en el frontend, reflejando los cambios hechos en el admin.
// =========================================
document.addEventListener('DOMContentLoaded', function () {
  const blogCards = document.getElementById('blog-cards');
  if (!blogCards) return;
  fetch('http://localhost:4000/api/blog')
    .then(res => res.ok ? res.json() : [])
    .then(posts => {
      if (!Array.isArray(posts) || posts.length === 0) {
        blogCards.innerHTML = '<p>No hay entradas de blog aún.</p>';
        return;
      }
      blogCards.innerHTML = posts.map(post => `
        <div class="plan-img-box">
          <a href="#" style="text-decoration:none; color:inherit;">
            <img src="${post.image || 'fotos/default.jpg'}" alt="${post.title}">
            <div style="width:100%;text-align:center;margin-top:1.2rem;">
              <h3 style="color:var(--secondary);font-size:1.15rem;font-weight:800;margin-bottom:0.7rem;">${post.title}</h3>
              <p style="color:#444;font-size:1.05rem;">${post.content ? post.content.substring(0, 80) + '...' : ''}</p>
            </div>
          </a>
        </div>
      `).join('');
    })
    .catch(() => {
      blogCards.innerHTML = '<p>Error al cargar el blog.</p>';
    });
});
