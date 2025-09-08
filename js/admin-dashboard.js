// admin-dashboard.js: Lógica del panel de administración

// Proteger acceso: solo si hay token
if (!localStorage.getItem('adminToken')) {
  window.location.href = 'admin-login.html';
}

// Logout
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('adminToken');
    window.location.href = 'admin-login.html';
  });
}

// Tabs
const tabBtns = document.querySelectorAll('.tab-btn');
const tabSections = document.querySelectorAll('.tab-section');
tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    tabBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    tabSections.forEach(sec => sec.style.display = 'none');
    document.getElementById('tab-' + btn.dataset.tab).style.display = 'block';
  });
});


// Utilidad para obtener el token
function getToken() {
  return localStorage.getItem('adminToken');
}

// Renderizar sección Blog con edición
let editingBlogId = null;
async function renderBlogSection() {
  const section = document.getElementById('tab-blog');
  section.innerHTML = `
    <h3>Entradas de Blog</h3>
    <form id="blog-form">
      <input type="text" id="blog-title" placeholder="Título" required>
      <input type="text" id="blog-image" placeholder="URL de imagen">
      <textarea id="blog-content" placeholder="Contenido" required></textarea>
      <button type="submit" id="blog-submit-btn">Agregar</button>
      <button type="button" id="blog-cancel-btn" style="display:none;margin-left:8px;">Cancelar</button>
    </form>
    <div id="blog-list">Cargando...</div>
  `;
  const form = document.getElementById('blog-form');
  const submitBtn = document.getElementById('blog-submit-btn');
  const cancelBtn = document.getElementById('blog-cancel-btn');

  form.onsubmit = async function(e) {
    e.preventDefault();
    const title = document.getElementById('blog-title').value;
    const image = document.getElementById('blog-image').value;
    const content = document.getElementById('blog-content').value;
    if (editingBlogId) {
      // Editar
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
      // Crear
      await fetch('http://localhost:4000/api/blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + getToken()
        },
        body: JSON.stringify({ title, image, content })
      });
    }
    renderBlogList();
    form.reset();
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

// Testimonios con edición
let editingTestimonialId = null;
async function renderTestimonialSection() {
  const section = document.getElementById('tab-testimonios');
  section.innerHTML = `
    <h3>Testimonios</h3>
    <form id="testimonial-form">
      <input type="text" id="testimonial-author" placeholder="Autor" required>
      <textarea id="testimonial-text" placeholder="Testimonio" required></textarea>
      <button type="submit" id="testimonial-submit-btn">Agregar</button>
      <button type="button" id="testimonial-cancel-btn" style="display:none;margin-left:8px;">Cancelar</button>
    </form>
    <div id="testimonial-list">Cargando...</div>
  `;
  const form = document.getElementById('testimonial-form');
  const submitBtn = document.getElementById('testimonial-submit-btn');
  const cancelBtn = document.getElementById('testimonial-cancel-btn');

  form.onsubmit = async function(e) {
    e.preventDefault();
    const author = document.getElementById('testimonial-author').value;
    const text = document.getElementById('testimonial-text').value;
    if (editingTestimonialId) {
      await fetch('http://localhost:4000/api/testimonials/' + editingTestimonialId, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + getToken()
        },
        body: JSON.stringify({ author, text })
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
        body: JSON.stringify({ author, text })
      });
    }
    renderTestimonialList();
    form.reset();
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

// Galería con edición
let editingGalleryId = null;
async function renderGallerySection() {
  const section = document.getElementById('tab-galeria');
  section.innerHTML = `
    <h3>Galería</h3>
    <form id="gallery-form">
      <input type="text" id="gallery-image" placeholder="URL de imagen" required>
      <input type="text" id="gallery-description" placeholder="Descripción">
      <button type="submit" id="gallery-submit-btn">Agregar</button>
      <button type="button" id="gallery-cancel-btn" style="display:none;margin-left:8px;">Cancelar</button>
    </form>
    <div id="gallery-list">Cargando...</div>
  `;
  const form = document.getElementById('gallery-form');
  const submitBtn = document.getElementById('gallery-submit-btn');
  const cancelBtn = document.getElementById('gallery-cancel-btn');

  form.onsubmit = async function(e) {
    e.preventDefault();
    const image = document.getElementById('gallery-image').value;
    const description = document.getElementById('gallery-description').value;
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
    renderGalleryList();
    form.reset();
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
  const images = await res.json();
  if (!images.length) {
    listDiv.innerHTML = '<p>No hay imágenes.</p>';
    return;
  }
  listDiv.innerHTML = `<table><thead><tr><th>Imagen</th><th>Descripción</th><th>Acciones</th></tr></thead><tbody>
    ${images.map(img => `
      <tr>
        <td>${img.image ? `<img src="${img.image}" width="60">` : ''}</td>
        <td>${img.description || ''}</td>
        <td>
          <button onclick="editGallery('${img._id}')">Editar</button>
          <button onclick="deleteGallery('${img._id}')">Eliminar</button>
        </td>
      </tr>
    `).join('')}
  </tbody></table>`;
}

window.editGallery = async function(id) {
  const res = await fetch('http://localhost:4000/api/gallery');
  const images = await res.json();
  const img = images.find(i => i._id === id);
  if (!img) return;
  document.getElementById('gallery-image').value = img.image;
  document.getElementById('gallery-description').value = img.description || '';
  editingGalleryId = id;
  document.getElementById('gallery-submit-btn').textContent = 'Guardar';
  document.getElementById('gallery-cancel-btn').style.display = 'inline-block';
};

window.deleteGallery = async function(id) {
  if (!confirm('¿Eliminar esta imagen?')) return;
  await fetch('http://localhost:4000/api/gallery/' + id, {
    method: 'DELETE',
    headers: { 'Authorization': 'Bearer ' + getToken() }
  });
  renderGalleryList();
};

// Inicializar secciones al cambiar de pestaña
tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    if (btn.dataset.tab === 'blog') renderBlogSection();
    if (btn.dataset.tab === 'testimonios') renderTestimonialSection();
    if (btn.dataset.tab === 'galeria') renderGallerySection();
  });
});

// Renderizar la primera sección al cargar
renderBlogSection();
