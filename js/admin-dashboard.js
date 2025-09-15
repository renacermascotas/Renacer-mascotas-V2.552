import { supabase } from './supabase-client.js';

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
    // Llamada a la Edge Function de Supabase
    const { data, error } = await supabase.functions.invoke('analytics-summary');
    if (error) throw error;

    visitsEl.textContent = data.summary.visits || '-';
    // Mostrar tiempo promedio en minutos y segundos
    const min = Math.floor((data.summary.avgTime || 0) / 60);
    const sec = Math.round((data.summary.avgTime || 0) % 60);
    avgTimeEl.textContent = min + 'm ' + sec + 's';
    topZoneEl.textContent = data.summary.topZone || '-';
  } catch (err) {
    console.error('Error al cargar la analítica:', err);
    visitsEl.textContent = avgTimeEl.textContent = topZoneEl.textContent = 'Error';
  }
}

function initializeDashboard() {
  // Renderiza la sección de analítica por defecto al cargar
  renderAnalyticsSection();
}

// --- Seguridad: Redirige a login si no hay token ---
document.addEventListener('DOMContentLoaded', async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    window.location.href = 'admin-login.html';
  } else {
    // Si hay sesión, inicializamos el dashboard
    initializeDashboard();
    // Inicializamos los formularios de las secciones CRUD una sola vez para mejorar el rendimiento.
    initBlogSection();
    initTestimonialSection();
    initGallerySection();
  }
});

// --- Logout: Cierra sesión y limpia token ---
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    await supabase.auth.signOut();
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

    const sectionId = 'tab-' + btn.dataset.tab;
    const section = document.getElementById(sectionId);
    section.style.display = 'block';

    // Al hacer clic, solo recargamos la lista de datos, no todo el formulario.
    switch (btn.dataset.tab) {
      case 'analytics': renderAnalyticsSection(); break;
      case 'blog': renderBlogList(); break;
      case 'testimonios': renderTestimonialList(); break;
      case 'galeria': renderGalleryList(); break;
    }
  });
});

// --- BLOG: CRUD de entradas de blog, subida de imágenes, edición y borrado ---
let editingBlogId = null;
function initBlogSection() {
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
        const filePath = `blog/${Date.now()}-${blogImageFile.name}`;
        const { error: uploadError } = await supabase.storage.from('media').upload(filePath, blogImageFile);
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(filePath);
        image = publicUrl;
      }

      const postData = { title, content, image_url: image };

      if (editingBlogId) {
        const { error } = await supabase.from('blog_posts').update(postData).eq('id', editingBlogId);
        if (error) throw error;

        editingBlogId = null;
        submitBtn.textContent = 'Agregar';
        cancelBtn.style.display = 'none';
      } else {
        const { error } = await supabase.from('blog_posts').insert([postData]);
        if (error) throw error;
      }

      await renderBlogList();
      form.reset();
      blogImageFile = null;
      const preview = document.getElementById('blog-image-preview');
      if (preview) preview.remove();
      showToast('Entrada de blog guardada con éxito.', 'success');
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
  const { data: blogs, error } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false });
  if (error) { listDiv.innerHTML = '<p>Error al cargar el blog.</p>'; return; }

  if (!blogs.length) {
    listDiv.innerHTML = '<p>No hay entradas.</p>';
    return;
  }
  listDiv.innerHTML = `<table><thead><tr><th>Título</th><th>Imagen</th><th>Acciones</th></tr></thead><tbody>
    ${blogs.map(blog => `
      <tr>
        <td>${blog.title}</td>
        <td>${blog.image_url ? `<img src="${blog.image_url}" width="60">` : ''}</td>
        <td>
          <button onclick="editBlog('${blog.id}')">Editar</button>
          <button onclick="deleteBlog('${blog.id}')">Eliminar</button>
        </td>
      </tr>
    `).join('')}
  </tbody></table>`;
}

window.editBlog = async function(id) {
  // Obtener datos del blog y llenar el formulario
  const { data: blog, error } = await supabase.from('blog_posts').select('*').eq('id', id).single();
  if (error || !blog) { showToast('No se pudo encontrar la entrada.', 'error'); return; }

  document.getElementById('blog-title').value = blog.title;
  document.getElementById('blog-image').value = blog.image_url || '';
  document.getElementById('blog-content').value = blog.content;
  editingBlogId = id;
  document.getElementById('blog-submit-btn').textContent = 'Guardar';
  document.getElementById('blog-cancel-btn').style.display = 'inline-block';
};

window.deleteBlog = async function(id) {
  if (!confirm('¿Eliminar esta entrada?')) return;
  await supabase.from('blog_posts').delete().eq('id', id);
  renderBlogList();
};

// --- TESTIMONIOS: CRUD de testimonios, subida de imágenes, edición y borrado ---
let editingTestimonialId = null;
function initTestimonialSection() {
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
        const filePath = `testimonials/${Date.now()}-${testimonialImageFile.name}`;
        const { error: uploadError } = await supabase.storage.from('media').upload(filePath, testimonialImageFile);
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(filePath);
        image = publicUrl;
      }

      const testimonialData = { author, text, image_url: image };

      if (editingTestimonialId) {
        const { error } = await supabase.from('testimonials').update(testimonialData).eq('id', editingTestimonialId);
        if (error) throw error;

        editingTestimonialId = null;
        submitBtn.textContent = 'Agregar';
        cancelBtn.style.display = 'none';
      } else {
        const { error } = await supabase.from('testimonials').insert([testimonialData]);
        if (error) throw error;
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
  const { data: testimonials, error } = await supabase.from('testimonials').select('*').order('created_at', { ascending: false });
  if (error) { listDiv.innerHTML = '<p>Error al cargar testimonios.</p>'; return; }

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
          <button onclick="editTestimonial('${t.id}')">Editar</button>
          <button onclick="deleteTestimonial('${t.id}')">Eliminar</button>
        </td>
      </tr>
    `).join('')}
  </tbody></table>`;
}

window.editTestimonial = async function(id) {
  const { data: t, error } = await supabase.from('testimonials').select('*').eq('id', id).single();
  if (error || !t) { showToast('No se pudo encontrar el testimonio.', 'error'); return; }

  document.getElementById('testimonial-author').value = t.author;
  document.getElementById('testimonial-text').value = t.text;
  document.getElementById('testimonial-image').value = t.image_url || '';
  editingTestimonialId = id;
  document.getElementById('testimonial-submit-btn').textContent = 'Guardar';
  document.getElementById('testimonial-cancel-btn').style.display = 'inline-block';
};

window.deleteTestimonial = async function(id) {
  if (!confirm('¿Eliminar este testimonio?')) return;
  await supabase.from('testimonials').delete().eq('id', id);
  renderTestimonialList();
};

// --- GALERÍA: CRUD de imágenes de galería, subida, edición y borrado ---
let editingGalleryId = null;
function initGallerySection() {
  const section = document.getElementById('tab-galeria');
    section.innerHTML = `
      <h3>Galería</h3>
      <form id="gallery-form">
        <div class="file-row">
          <input type="file" id="gallery-image-file" accept="image/*">
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
            preview.style.margin = '8px 0 16px';
            document.getElementById('gallery-form').insertBefore(preview, document.getElementById('gallery-description'));
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
    const description = document.getElementById('gallery-description').value;
    // Solo requerir una imagen si es un nuevo elemento, no al editar.
    if (!galleryImageFile && !editingGalleryId) {
      showToast('Debes subir una imagen.','error');
      return;
    }
    try {
      const galleryData = { description };

      // Si se subió un archivo nuevo, procesarlo y añadir la URL a los datos.
      if (galleryImageFile) {
        const filePath = `gallery/${Date.now()}-${galleryImageFile.name}`;
        const { error: uploadError } = await supabase.storage.from('media').upload(filePath, galleryImageFile);
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(filePath);
        galleryData.image_url = publicUrl;
      }

      if (editingGalleryId) {
        // Al editar, solo se actualizan los campos presentes en galleryData.
        const { error } = await supabase.from('gallery').update(galleryData).eq('id', editingGalleryId);
        if (error) throw error;

        editingGalleryId = null;
        submitBtn.textContent = 'Agregar';
        cancelBtn.style.display = 'none';
      } else {
        const { error } = await supabase.from('gallery').insert([galleryData]);
        if (error) throw error;
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
  const { data: galleryItems, error } = await supabase.from('gallery').select('*').order('created_at', { ascending: false });
  if (error) { listDiv.innerHTML = '<p>Error al cargar la galería.</p>'; return; }

  if (!galleryItems.length) {
    listDiv.innerHTML = '<p>No hay imágenes en la galería.</p>';
    return;
  }
  listDiv.innerHTML = `<table><thead><tr><th>Imagen</th><th>Descripción</th><th>Acciones</th></tr></thead><tbody>
    ${galleryItems.map(item => `
      <tr>
        <td>${item.image_url ? `<img src="${item.image_url}" width="60">` : ''}</td>
        <td>${item.description || ''}</td>
        <td>
          <button onclick="editGallery('${item.id}')">Editar</button>
          <button onclick="deleteGallery('${item.id}')">Eliminar</button>
        </td>
      </tr>
    `).join('')}
  </tbody></table>`;
}

window.editGallery = async function(id) {
  const { data: item, error } = await supabase.from('gallery').select('*').eq('id', id).single();
  if (error || !item) { showToast('No se pudo encontrar la imagen.', 'error'); return; }

  // No se puede rellenar un input de tipo file, pero sí la descripción.
  document.getElementById('gallery-description').value = item.description || '';
  editingGalleryId = id;
  document.getElementById('gallery-submit-btn').textContent = 'Guardar';
  document.getElementById('gallery-cancel-btn').style.display = 'inline-block';
  showToast('Sube una nueva imagen para reemplazar la actual.', 'success');
};

window.deleteGallery = async function(id) {
  if (!confirm('¿Eliminar esta imagen de la galería?')) return;
  await supabase.from('gallery').delete().eq('id', id);
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
