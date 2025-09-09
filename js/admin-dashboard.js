// admin-dashboard.js: Panel de administración de Renacer Mascotas
// Este archivo controla la lógica de autenticación, tabs, CRUD de blog, testimonios y galería, y notificaciones visuales.

// --- Analítica: cargar datos desde el backend y mostrar en dashboard ---
async function renderAnalyticsSection() {
  const visitsEl = document.getElementById('analytics-visits');
  const avgTimeEl = document.getElementById('analytics-avgtime');
  const topZoneEl = document.getElementById('analytics-topzone');
  visitsEl.textContent = '...';
  avgTimeEl.textContent = '...';
  topZoneEl.textContent = '...';
  try {
    const res = await fetch('http://localhost:4000/api/analytics/summary');
    if (!res.ok) throw new Error('No se pudo obtener analítica');
    const data = await res.json();
    visitsEl.textContent = data.visits || '-';
    // Mostrar tiempo promedio en minutos y segundos
    const min = Math.floor((data.avgTime || 0) / 60);
    const sec = Math.round((data.avgTime || 0) % 60);
    avgTimeEl.textContent = min + 'm ' + sec + 's';
    topZoneEl.textContent = data.topZone || '-';
  } catch (err) {
    visitsEl.textContent = avgTimeEl.textContent = topZoneEl.textContent = 'Error';
  }
}

// --- Seguridad: Redirige a login si no hay token ---
if (!localStorage.getItem('adminToken')) {
  window.location.href = 'admin-login.html';
}

// --- Logout: Cierra sesión y limpia token ---
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('adminToken');
    window.location.href = 'admin-login.html';
  });
}

// --- Tabs: Cambia entre secciones del dashboard ---
const tabBtns = document.querySelectorAll('.tab-btn');
const tabSections = document.querySelectorAll('.tab-section');
tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    tabBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    tabSections.forEach(sec => sec.style.display = 'none');
    const section = document.getElementById('tab-' + btn.dataset.tab);
    section.style.display = 'block';
    if (btn.dataset.tab === 'analytics') renderAnalyticsSection();
    if (btn.dataset.tab === 'blog') renderBlogSection();
    if (btn.dataset.tab === 'testimonios') renderTestimonialSection();
    if (btn.dataset.tab === 'galeria') renderGallerySection();
  });
});

// --- Utilidad para obtener el token JWT del localStorage ---
function getToken() {
  return localStorage.getItem('adminToken');
}

// --- BLOG: CRUD de entradas de blog, subida de imágenes, edición y borrado ---
let editingBlogId = null;
async function renderBlogSection() {
  const section = document.getElementById('tab-blog');
    section.innerHTML = `
      <h3>Entradas de Blog</h3>
      <form id="blog-form">
        <input type="text" id="blog-title" placeholder="Título" required>
        <div class="file-row">
          <input type="file" id="blog-image-file" accept="image/*">
          <input type="text" id="blog-image" placeholder="URL de imagen o subir archivo">
        </div>
        <textarea id="blog-content" placeholder="Contenido" required></textarea>
        <button type="submit" id="blog-submit-btn">Agregar</button>
        <button type="button" id="blog-cancel-btn" style="display:none;margin-left:8px;">Cancelar</button>
      </form>
      <div id="blog-list">Cargando...</div>
    `;
    // Previsualización de imagen para blog
    let blogImageFile = null;
    document.getElementById('blog-image-file').addEventListener('change', function(e) {
      blogImageFile = e.target.files[0] || null;
      if (blogImageFile) {
        const reader = new FileReader();
        reader.onload = function(ev) {
          let preview = document.getElementById('blog-image-preview');
          if (!preview) {
            preview = document.createElement('img');
            preview.id = 'blog-image-preview';
            preview.style.maxWidth = '80px';
            preview.style.margin = '8px 0';
            document.getElementById('blog-form').insertBefore(preview, document.getElementById('blog-image').parentNode.nextSibling);
          }
          preview.src = ev.target.result;
        };
        reader.readAsDataURL(blogImageFile);
      }
    });
  const form = document.getElementById('blog-form');
  const submitBtn = document.getElementById('blog-submit-btn');
  const cancelBtn = document.getElementById('blog-cancel-btn');

  form.onsubmit = async function(e) {
    e.preventDefault();
    e.stopPropagation();
    const title = document.getElementById('blog-title').value;
    const content = document.getElementById('blog-content').value;
    let image = document.getElementById('blog-image').value;
    if (!blogImageFile && !image) {
      showToast('Debes subir una imagen o ingresar la URL.','error');
      return;
    }
    try {
      if (blogImageFile) {
        const formData = new FormData();
        formData.append('file', blogImageFile);
        const res = await fetch('http://localhost:4000/api/upload', {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        image = data.url;
      }
      if (editingBlogId) {
        await fetch('http://localhost:4000/api/blog/' + editingBlogId, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + getToken()
          },
          body: JSON.stringify({ title, image, content })
        });
        editingBlogId = null;
        submitBtn.textContent = 'Agregar';
        cancelBtn.style.display = 'none';
      } else {
        await fetch('http://localhost:4000/api/blog', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + getToken()
          },
          body: JSON.stringify({ title, image, content })
        });
      }
      await renderBlogList();
      form.reset();
      blogImageFile = null;
      const preview = document.getElementById('blog-image-preview');
      if (preview) preview.remove();
      showToast('Entrada de blog guardada con éxito.');
    } catch (err) {
      showToast('Error al guardar la entrada de blog.', 'error');
    }
  };

  cancelBtn.onclick = function() {
    editingBlogId = null;
    form.reset();
    submitBtn.textContent = 'Agregar';
    cancelBtn.style.display = 'none';
  };

  renderBlogList();
}

async function renderBlogList() {
  const listDiv = document.getElementById('blog-list');
  const res = await fetch('http://localhost:4000/api/blog');
  const blogs = await res.json();
  if (!blogs.length) {
    listDiv.innerHTML = '<p>No hay entradas.</p>';
    return;
  }
  listDiv.innerHTML = `<table><thead><tr><th>Título</th><th>Imagen</th><th>Acciones</th></tr></thead><tbody>
    ${blogs.map(blog => `
      <tr>
        <td>${blog.title}</td>
        <td>${blog.image ? `<img src="${blog.image}" width="60">` : ''}</td>
        <td>
          <button onclick="editBlog('${blog._id}')">Editar</button>
          <button onclick="deleteBlog('${blog._id}')">Eliminar</button>
        </td>
      </tr>
    `).join('')}
  </tbody></table>`;
}

window.editBlog = async function(id) {
  // Obtener datos del blog y llenar el formulario
  const res = await fetch('http://localhost:4000/api/blog');
  const blogs = await res.json();
  const blog = blogs.find(b => b._id === id);
  if (!blog) return;
  document.getElementById('blog-title').value = blog.title;
  document.getElementById('blog-image').value = blog.image || '';
  document.getElementById('blog-content').value = blog.content;
  editingBlogId = id;
  document.getElementById('blog-submit-btn').textContent = 'Guardar';
  document.getElementById('blog-cancel-btn').style.display = 'inline-block';
};

window.deleteBlog = async function(id) {
  if (!confirm('¿Eliminar esta entrada?')) return;
  await fetch('http://localhost:4000/api/blog/' + id, {
    method: 'DELETE',
    headers: { 'Authorization': 'Bearer ' + getToken() }
  });
  renderBlogList();
};

// --- TESTIMONIOS: CRUD de testimonios, subida de imágenes, edición y borrado ---
let editingTestimonialId = null;
async function renderTestimonialSection() {
  const section = document.getElementById('tab-testimonios');
    section.innerHTML = `
      <h3>Testimonios</h3>
      <form id="testimonial-form">
        <input type="text" id="testimonial-author" placeholder="Autor" required>
        <div class="file-row">
          <input type="file" id="testimonial-image-file" accept="image/*">
          <input type="text" id="testimonial-image" placeholder="URL de imagen o subir archivo">
        </div>
        <textarea id="testimonial-text" placeholder="Testimonio" required></textarea>
        <div style="display:flex;gap:8px;align-items:center;">
          <button type="submit" id="testimonial-submit-btn">Agregar</button>
          <button type="button" id="testimonial-cancel-btn" style="display:none;">Cancelar</button>
        </div>
      </form>
      <div id="testimonial-list">Cargando...</div>
    `;
    // Previsualización de imagen para testimonios
    let testimonialImageFile = null;
    document.getElementById('testimonial-image-file').addEventListener('change', function(e) {
      testimonialImageFile = e.target.files[0] || null;
      if (testimonialImageFile) {
        const reader = new FileReader();
        reader.onload = function(ev) {
          let preview = document.getElementById('testimonial-image-preview');
          if (!preview) {
            preview = document.createElement('img');
            preview.id = 'testimonial-image-preview';
            preview.style.maxWidth = '80px';
            preview.style.margin = '8px 0';
            document.getElementById('testimonial-form').insertBefore(preview, document.getElementById('testimonial-image').parentNode.nextSibling);
          }
          preview.src = ev.target.result;
        };
        reader.readAsDataURL(testimonialImageFile);
      }
    });

  const form = document.getElementById('testimonial-form');
  const submitBtn = document.getElementById('testimonial-submit-btn');
  const cancelBtn = document.getElementById('testimonial-cancel-btn');


  form.onsubmit = async function(e) {
    e.preventDefault();
    e.stopPropagation();
    const author = document.getElementById('testimonial-author').value;
    const text = document.getElementById('testimonial-text').value;
    let image = document.getElementById('testimonial-image').value;
    if (!testimonialImageFile && !image) {
      showToast('Debes subir una imagen o ingresar la URL.','error');
      return;
    }
    try {
      if (testimonialImageFile) {
        const formData = new FormData();
        formData.append('file', testimonialImageFile);
        const res = await fetch('http://localhost:4000/api/upload', {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        image = data.url;
      }
      if (editingTestimonialId) {
        await fetch('http://localhost:4000/api/testimonials/' + editingTestimonialId, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + getToken()
          },
          body: JSON.stringify({ author, text, image })
        });
        editingTestimonialId = null;
        submitBtn.textContent = 'Agregar';
        cancelBtn.style.display = 'none';
      } else {
        await fetch('http://localhost:4000/api/testimonials', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + getToken()
          },
          body: JSON.stringify({ author, text, image })
        });
      }
      await renderTestimonialList();
      form.reset();
      testimonialImageFile = null;
      const preview = document.getElementById('testimonial-image-preview');
      if (preview) preview.remove();
      showToast('Testimonio guardado con éxito.','success');
    } catch (err) {
      showToast('Error al guardar el testimonio.','error');
    }
  };

  cancelBtn.onclick = function() {
    editingTestimonialId = null;
    form.reset();
    submitBtn.textContent = 'Agregar';
    cancelBtn.style.display = 'none';
  };

  renderTestimonialList();
}

async function renderTestimonialList() {
  const listDiv = document.getElementById('testimonial-list');
  const res = await fetch('http://localhost:4000/api/testimonials');
  const testimonials = await res.json();
  if (!testimonials.length) {
    listDiv.innerHTML = '<p>No hay testimonios.</p>';
    return;
  }
  listDiv.innerHTML = `<table><thead><tr><th>Autor</th><th>Testimonio</th><th>Acciones</th></tr></thead><tbody>
    ${testimonials.map(t => `
      <tr>
        <td>${t.author}</td>
        <td>${t.text}</td>
        <td>
          <button onclick="editTestimonial('${t._id}')">Editar</button>
          <button onclick="deleteTestimonial('${t._id}')">Eliminar</button>
        </td>
      </tr>
    `).join('')}
  </tbody></table>`;
}

window.editTestimonial = async function(id) {
  const res = await fetch('http://localhost:4000/api/testimonials');
  const testimonials = await res.json();
  const t = testimonials.find(t => t._id === id);
  if (!t) return;
  document.getElementById('testimonial-author').value = t.author;
  document.getElementById('testimonial-text').value = t.text;
  editingTestimonialId = id;
  document.getElementById('testimonial-submit-btn').textContent = 'Guardar';
  document.getElementById('testimonial-cancel-btn').style.display = 'inline-block';
};

window.deleteTestimonial = async function(id) {
  if (!confirm('¿Eliminar este testimonio?')) return;
  await fetch('http://localhost:4000/api/testimonials/' + id, {
    method: 'DELETE',
    headers: { 'Authorization': 'Bearer ' + getToken() }
  });
  renderTestimonialList();
};

// --- GALERÍA: CRUD de imágenes de galería, subida, edición y borrado ---
let editingGalleryId = null;
async function renderGallerySection() {
  const section = document.getElementById('tab-galeria');
    section.innerHTML = `
      <h3>Galería</h3>
      <form id="gallery-form">
        <div class="file-row">
          <input type="file" id="gallery-image-file" accept="image/*">
          <input type="text" id="gallery-image" placeholder="URL de imagen o subir archivo" required>
        </div>
        <input type="text" id="gallery-description" placeholder="Descripción">
        <button type="submit" id="gallery-submit-btn">Agregar</button>
        <button type="button" id="gallery-cancel-btn" style="display:none;margin-left:8px;">Cancelar</button>
      </form>
      <div id="gallery-list">Cargando...</div>
    `;
    // Previsualización de imagen para galería
    let galleryImageFile = null;
    document.getElementById('gallery-image-file').addEventListener('change', function(e) {
      galleryImageFile = e.target.files[0] || null;
      if (galleryImageFile) {
        const reader = new FileReader();
        reader.onload = function(ev) {
          let preview = document.getElementById('gallery-image-preview');
          if (!preview) {
            preview = document.createElement('img');
            preview.id = 'gallery-image-preview';
            preview.style.maxWidth = '80px';
            preview.style.margin = '8px 0';
            document.getElementById('gallery-form').insertBefore(preview, document.getElementById('gallery-image').parentNode.nextSibling);
          }
          preview.src = ev.target.result;
        };
        reader.readAsDataURL(galleryImageFile);
      }
    });
  const form = document.getElementById('gallery-form');
  const submitBtn = document.getElementById('gallery-submit-btn');
  const cancelBtn = document.getElementById('gallery-cancel-btn');

  form.onsubmit = async function(e) {
    e.preventDefault();
    e.stopPropagation();
    let image = document.getElementById('gallery-image').value;
    const description = document.getElementById('gallery-description').value;
    if (!galleryImageFile && !image) {
      showToast('Debes subir una imagen o ingresar la URL.','error');
      return;
    }
    try {
      if (galleryImageFile) {
        const formData = new FormData();
        formData.append('file', galleryImageFile);
        const res = await fetch('http://localhost:4000/api/upload', {
          method: 'POST',
          body: formData
        });
        const data = await res.json();
        image = data.url;
      }
      if (editingGalleryId) {
        await fetch('http://localhost:4000/api/gallery/' + editingGalleryId, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + getToken()
          },
          body: JSON.stringify({ image, description })
        });
        editingGalleryId = null;
        submitBtn.textContent = 'Agregar';
        cancelBtn.style.display = 'none';
      } else {
        await fetch('http://localhost:4000/api/gallery', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + getToken()
          },
          body: JSON.stringify({ image, description })
        });
      }
      await renderGalleryList();
      form.reset();
      galleryImageFile = null;
      const preview = document.getElementById('gallery-image-preview');
      if (preview) preview.remove();
      showToast('Imagen de galería guardada con éxito.');
    } catch (err) {
      showToast('Error al guardar la imagen de galería.', 'error');
    }
  };

  cancelBtn.onclick = function() {
    editingGalleryId = null;
    form.reset();
    submitBtn.textContent = 'Agregar';
    cancelBtn.style.display = 'none';
  };

  renderGalleryList();
}

async function renderGalleryList() {
  const listDiv = document.getElementById('gallery-list');
  const res = await fetch('http://localhost:4000/api/gallery');
  const galleryItems = await res.json();
  if (!galleryItems.length) {
    listDiv.innerHTML = '<p>No hay imágenes en la galería.</p>';
    return;
  }
  listDiv.innerHTML = `<table><thead><tr><th>Imagen</th><th>Descripción</th><th>Acciones</th></tr></thead><tbody>
    ${galleryItems.map(item => `
      <tr>
        <td>${item.image ? `<img src="${item.image}" width="60">` : ''}</td>
        <td>${item.description || ''}</td>
        <td>
          <button onclick="editGallery('${item._id}')">Editar</button>
          <button onclick="deleteGallery('${item._id}')">Eliminar</button>
        </td>
      </tr>
    `).join('')}
  </tbody></table>`;
}

window.editGallery = async function(id) {
  const res = await fetch('http://localhost:4000/api/gallery');
  const galleryItems = await res.json();
  const item = galleryItems.find(i => i._id === id);
  if (!item) return;
  document.getElementById('gallery-image').value = item.image || '';
  document.getElementById('gallery-description').value = item.description || '';
  editingGalleryId = id;
  document.getElementById('gallery-submit-btn').textContent = 'Guardar';
  document.getElementById('gallery-cancel-btn').style.display = 'inline-block';
};

window.deleteGallery = async function(id) {
  if (!confirm('¿Eliminar esta imagen de la galería?')) return;
  await fetch('http://localhost:4000/api/gallery/' + id, {
    method: 'DELETE',
    headers: { 'Authorization': 'Bearer ' + getToken() }
  });
  renderGalleryList();
};

// --- Notificación toast visual: muestra mensajes de éxito o error en la parte inferior ---
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 3000);
}
