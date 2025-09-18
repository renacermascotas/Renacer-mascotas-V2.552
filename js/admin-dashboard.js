import { supabase } from './supabase-client.js';

// admin-dashboard.js: Panel de administración de Renacer Mascotas
// Este archivo controla la lógica de autenticación, tabs, CRUD de blog, testimonios y galería, y notificaciones visuales.

// --- Theme Toggle ---
const themeToggleBtn = document.getElementById('theme-toggle-btn');
const body = document.body;

function applyTheme(theme) {
    body.classList.toggle('dark-mode', theme === 'dark');
    // Re-render charts after theme is applied and DOM has updated
    setTimeout(() => {
        if (typeof window.renderAnalyticsCharts === 'function') {
            window.renderAnalyticsCharts();
        }
    }, 0);
}

if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
        const newTheme = body.classList.contains('dark-mode') ? 'light' : 'dark';
        localStorage.setItem('theme', newTheme);
        applyTheme(newTheme);
    });
}

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

function getGreeting() {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
        return 'Buenos días';
    } else if (hour >= 12 && hour < 20) {
        return 'Buenas tardes';
    } else {
        return 'Buenas noches';
    }
}

function showGreetingModal(message) {
    const backdrop = document.createElement('div');
    backdrop.className = 'greeting-backdrop';

    const modal = document.createElement('div');
    modal.className = 'greeting-modal';
    modal.textContent = message;

    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);

    // Trigger fade-in animation
    requestAnimationFrame(() => {
        backdrop.style.opacity = '1';
        modal.style.transform = 'scale(1)';
    });

    // Fade-out and remove after a delay
    setTimeout(() => {
        backdrop.style.opacity = '0';
        modal.style.transform = 'scale(0.9)';
        setTimeout(() => backdrop.remove(), 500); // Remove from DOM after transition
    }, 2500); // Visible for 2.5 seconds
}

function initializeDashboard() {
  // Apply saved theme first
  const savedTheme = localStorage.getItem('theme') || 'light'; // Default to light
  applyTheme(savedTheme);
  // Renderiza la sección de analítica por defecto al cargar
  renderAnalyticsSection();
  // Muestra el saludo de bienvenida solo si se acaba de loguear
  if (sessionStorage.getItem('justLoggedIn') === 'true') {
    showGreetingModal(`Hola Admin, ${getGreeting()}`);
    sessionStorage.removeItem('justLoggedIn');
  }
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
    // Cambia la pestaña activa
    tabBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    tabSections.forEach(sec => sec.classList.remove('active'));
    const sectionId = 'tab-' + btn.dataset.tab;
    const section = document.getElementById(sectionId);
    section.classList.add('active');

    // Al hacer clic, recargamos la lista de datos desde la página 1.
    switch (btn.dataset.tab) {
      case 'analytics': renderAnalyticsSection(); break;
      case 'blog': renderBlogList(1); break;
      case 'testimonios': renderTestimonialList(1); break;
      case 'galeria': renderGalleryList(1); break;
    }
  });
});

// --- Pagination Renderer ---
function renderPagination(containerId, currentPage, totalItems, pageSize, onPageChange) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const totalPages = Math.ceil(totalItems / pageSize);
    container.innerHTML = ''; // Clear previous pagination

    if (totalPages <= 1) {
        return; // No need for pagination
    }

    const createPageButton = (page, text = page, isActive = false, isDisabled = false) => {
        const button = document.createElement('button');
        button.textContent = text;
        if (isActive) button.classList.add('active');
        button.disabled = isDisabled;
        button.onclick = () => onPageChange(page);
        return button;
    };

    container.appendChild(createPageButton(currentPage - 1, 'Anterior', false, currentPage === 1));

    // Page number logic with ellipsis
    const pageNumbers = new Set();
    pageNumbers.add(1);
    pageNumbers.add(totalPages);
    pageNumbers.add(currentPage);
    if (currentPage > 1) pageNumbers.add(currentPage - 1);
    if (currentPage < totalPages) pageNumbers.add(currentPage + 1);

    let lastPage = 0;
    Array.from(pageNumbers).sort((a, b) => a - b).forEach(page => {
        if (lastPage !== 0 && page > lastPage + 1) {
            const ellipsis = document.createElement('span');
            ellipsis.textContent = '...';
            ellipsis.style.padding = '8px';
            ellipsis.style.color = 'var(--text-secondary)';
            container.appendChild(ellipsis);
        }
        container.appendChild(createPageButton(page, page, page === currentPage));
        lastPage = page;
    });

    container.appendChild(createPageButton(currentPage + 1, 'Siguiente', false, currentPage === totalPages));
}

// --- Pagination State ---
const PAGE_SIZE = 5; // 5 items per page
let blogCurrentPage = 1;
let testimonialsCurrentPage = 1;
let galleryCurrentPage = 1;

// --- BLOG: CRUD de entradas de blog, subida de imágenes, edición y borrado ---
let editingBlogId = null;
let blogImageFile = null;

function initBlogSection() {
  // El HTML ya existe, solo seleccionamos los elementos y asignamos eventos.
  const form = document.getElementById('blog-form');
  const submitBtn = document.getElementById('blog-submit-btn');
  const cancelBtn = document.getElementById('blog-cancel-btn');
  const imageFileInput = document.getElementById('blog-image-file');
  const imageUrlInput = document.getElementById('blog-image-url');

  imageFileInput.addEventListener('change', (e) => {
    blogImageFile = e.target.files[0] || null;
    if (blogImageFile) {
      imageUrlInput.value = `Archivo: ${blogImageFile.name}`;
      imageUrlInput.disabled = true;
    }
  });

  form.onsubmit = async function(e) {
    e.preventDefault();
    submitBtn.disabled = true;
    submitBtn.textContent = 'Guardando...';

    const title = document.getElementById('blog-title').value;
    const content = document.getElementById('blog-content').value;
    let imageUrl = imageUrlInput.value;

    try {
      if (blogImageFile) {
        const filePath = `blog/${Date.now()}-${blogImageFile.name}`;
        const { error: uploadError } = await supabase.storage.from('media').upload(filePath, blogImageFile);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(filePath);
        imageUrl = publicUrl;
      }

      const postData = { title, content, image_url: imageUrl };

      let response;
      if (editingBlogId) {
        response = await supabase.from('blog_posts').update(postData).eq('id', editingBlogId);
      } else {
        response = await supabase.from('blog_posts').insert([postData]);
      }

      if (response.error) throw response.error;

      showToast('Entrada de blog guardada con éxito.', 'success');
      resetBlogForm();
      if (editingBlogId) {
        await renderBlogList(blogCurrentPage); // Stay on the same page when editing
      } else {
        await renderBlogList(1); // Go to the first page for new entries
      }
    } catch (err) {
      console.error('Error al guardar la entrada de blog:', err);
      showToast(`Error: ${err.message}`, 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Guardar Post';
    }
  };

  cancelBtn.onclick = resetBlogForm;
}

function resetBlogForm() {
  document.getElementById('blog-form').reset();
  editingBlogId = null;
  blogImageFile = null;
  document.getElementById('blog-image-url').disabled = false;
  document.getElementById('blog-submit-btn').textContent = 'Guardar Post';
  document.getElementById('blog-cancel-btn').style.display = 'none';
}

async function renderBlogList(page = 1) {
  blogCurrentPage = page;
  const tableBody = document.querySelector('#blog-table tbody');
  const skeletonRow = `
    <tr class="skeleton-row">
        <td><div class="skeleton-box text-long"></div></td>
        <td><div class="skeleton-box image"></div></td>
        <td><div class="skeleton-box text-short"></div></td>
        <td><div class="skeleton-box actions"></div></td>
    </tr>
  `;
  tableBody.innerHTML = skeletonRow.repeat(3); // Mostrar 3 filas de esqueleto

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data: blogs, error, count } = await supabase
    .from('blog_posts')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) { tableBody.innerHTML = '<tr><td colspan="4">Error al cargar el blog.</td></tr>'; return; }

  if (!blogs.length) {
    tableBody.innerHTML = '<tr><td colspan="4">No hay entradas de blog.</td></tr>';
    return;
  }
  tableBody.innerHTML = blogs.map(blog => `
      <tr>
        <td>${blog.title}</td>
        <td>${blog.image_url ? `<img src="${blog.image_url}" width="80" height="50" style="object-fit: cover; border-radius: 5px;">` : 'N/A'}</td>
        <td>${new Date(blog.created_at).toLocaleDateString()}</td>
        <td>
          <button onclick="editBlog('${blog.id}')">Editar</button>
          <button onclick="deleteBlog('${blog.id}')">Eliminar</button>
        </td>
      </tr>
    `).join('');

    renderPagination('blog-pagination', blogCurrentPage, count, PAGE_SIZE, renderBlogList);
}

window.editBlog = async function(id) {
  // Obtener datos del blog y llenar el formulario
  const { data: blog, error } = await supabase.from('blog_posts').select('*').eq('id', id).single();
  if (error || !blog) { showToast('No se pudo encontrar la entrada.', 'error'); return; }

  document.getElementById('blog-title').value = blog.title;
  document.getElementById('blog-image-url').value = blog.image_url || '';
  document.getElementById('blog-content').value = blog.content;
  editingBlogId = id;
  document.getElementById('blog-submit-btn').textContent = 'Actualizar Post';
  document.getElementById('blog-cancel-btn').style.display = 'inline-block';
  document.querySelector('#tab-blog').scrollIntoView({ behavior: 'smooth' });
};

window.deleteBlog = async function(id) {
  if (!confirm('¿Eliminar esta entrada?')) return;
  try {
    // 1. Obtener el post para encontrar la URL de la imagen
    const { data: post, error: fetchError } = await supabase.from('blog_posts').select('image_url').eq('id', id).single();
    if (fetchError) throw fetchError;

    // 2. Borrar el registro de la base de datos
    const { error: deleteDbError } = await supabase.from('blog_posts').delete().eq('id', id);
    if (deleteDbError) throw deleteDbError;

    // 3. Si tenía una imagen en Supabase, borrarla también del Storage
    if (post.image_url && post.image_url.includes('supabase.co')) {
      const filePath = new URL(post.image_url).pathname.split('/media/')[1];
      if (filePath) {
        await supabase.storage.from('media').remove([filePath]);
      }
    }

    const { count } = await supabase.from('blog_posts').select('*', { count: 'exact' });
    const totalPages = Math.ceil(count / PAGE_SIZE);
    if (blogCurrentPage > totalPages && totalPages > 0) { blogCurrentPage = totalPages; }
    showToast('Entrada eliminada.', 'success');
    await renderBlogList(blogCurrentPage);
  } catch (err) {
    console.error('Error al eliminar la entrada del blog:', err);
    showToast(`Error al eliminar: ${err.message}`, 'error');
  }
};

// --- TESTIMONIOS: CRUD de testimonios, subida de imágenes, edición y borrado ---
let editingTestimonialId = null;
let testimonialImageFile = null;

function initTestimonialSection() {
  const form = document.getElementById('testimonial-form');
  const submitBtn = document.getElementById('testimonial-submit-btn');
  const cancelBtn = document.getElementById('testimonial-cancel-btn');
  const imageFileInput = document.getElementById('testimonial-image-file');
  const imageUrlInput = document.getElementById('testimonial-image-url');

  imageFileInput.addEventListener('change', (e) => {
    testimonialImageFile = e.target.files[0] || null;
    if (testimonialImageFile) {
      imageUrlInput.value = `Archivo: ${testimonialImageFile.name}`;
      imageUrlInput.disabled = true;
    }
  });

  form.onsubmit = async function(e) {
    e.preventDefault();
    submitBtn.disabled = true;
    submitBtn.textContent = 'Guardando...';

    const author = document.getElementById('testimonial-author').value;
    const text = document.getElementById('testimonial-text').value;
    let imageUrl = imageUrlInput.value;

    try {
      if (testimonialImageFile) {
        const filePath = `testimonials/${Date.now()}-${testimonialImageFile.name}`;
        const { error: uploadError } = await supabase.storage.from('media').upload(filePath, testimonialImageFile);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(filePath);
        imageUrl = publicUrl;
      }

      const testimonialData = { author, text, image_url: imageUrl };

      let response;
      if (editingTestimonialId) {
        response = await supabase.from('testimonials').update(testimonialData).eq('id', editingTestimonialId);
      } else {
        response = await supabase.from('testimonials').insert([testimonialData]);
      }

      if (response.error) throw response.error;

      showToast('Testimonio guardado con éxito.', 'success');
      resetTestimonialForm();
      if (editingTestimonialId) {
        await renderTestimonialList(testimonialsCurrentPage);
      } else {
        await renderTestimonialList(1);
      }
    } catch (err) {
      console.error('Error al guardar el testimonio:', err);
      showToast(`Error: ${err.message}`, 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Guardar Testimonio';
    }
  };

  cancelBtn.onclick = resetTestimonialForm;
}

function resetTestimonialForm() {
  document.getElementById('testimonial-form').reset();
  editingTestimonialId = null;
  testimonialImageFile = null;
  document.getElementById('testimonial-image-url').disabled = false;
  document.getElementById('testimonial-submit-btn').textContent = 'Guardar Testimonio';
  document.getElementById('testimonial-cancel-btn').style.display = 'none';
}

async function renderTestimonialList(page = 1) {
  testimonialsCurrentPage = page;
  const tableBody = document.querySelector('#testimonials-table tbody');
  const skeletonRow = `
    <tr class="skeleton-row">
        <td><div class="skeleton-box text-short"></div></td>
        <td><div class="skeleton-box image"></div></td>
        <td><div class="skeleton-box text-long"></div></td>
        <td><div class="skeleton-box actions"></div></td>
    </tr>
  `;
  tableBody.innerHTML = skeletonRow.repeat(3);

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data: testimonials, error, count } = await supabase
    .from('testimonials')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) { tableBody.innerHTML = '<tr><td colspan="4">Error al cargar testimonios.</td></tr>'; return; }

  if (!testimonials.length) {
    tableBody.innerHTML = '<tr><td colspan="4">No hay testimonios.</td></tr>';
    return;
  }
  tableBody.innerHTML = testimonials.map(t => `
      <tr>
        <td>${t.author}</td>
        <td>${t.image_url ? `<img src="${t.image_url}" width="80" height="50" style="object-fit: cover; border-radius: 5px;">` : 'N/A'}</td>
        <td>${t.text.substring(0, 50)}...</td>
        <td>
          <button onclick="editTestimonial('${t.id}')">Editar</button>
          <button onclick="deleteTestimonial('${t.id}')">Eliminar</button>
        </td>
      </tr>
    `).join('');

    renderPagination('testimonials-pagination', testimonialsCurrentPage, count, PAGE_SIZE, renderTestimonialList);
}

window.editTestimonial = async function(id) {
  const { data: t, error } = await supabase.from('testimonials').select('*').eq('id', id).single();
  if (error || !t) { showToast('No se pudo encontrar el testimonio.', 'error'); return; }

  document.getElementById('testimonial-author').value = t.author;
  document.getElementById('testimonial-text').value = t.text;
  document.getElementById('testimonial-image-url').value = t.image_url || '';
  editingTestimonialId = id;
  document.getElementById('testimonial-submit-btn').textContent = 'Actualizar';
  document.getElementById('testimonial-cancel-btn').style.display = 'inline-block';
  document.querySelector('#tab-testimonios').scrollIntoView({ behavior: 'smooth' });
};

window.deleteTestimonial = async function(id) {
  if (!confirm('¿Eliminar este testimonio?')) return;
  try {
    // 1. Obtener el testimonio para encontrar la URL de la imagen
    const { data: testimonial, error: fetchError } = await supabase.from('testimonials').select('image_url').eq('id', id).single();
    if (fetchError) throw fetchError;

    // 2. Borrar el registro de la base de datos
    const { error: deleteDbError } = await supabase.from('testimonials').delete().eq('id', id);
    if (deleteDbError) throw deleteDbError;

    // 3. Si tenía una imagen en Supabase, borrarla también del Storage
    if (testimonial.image_url && testimonial.image_url.includes('supabase.co')) {
      const filePath = new URL(testimonial.image_url).pathname.split('/media/')[1];
      if (filePath) {
        await supabase.storage.from('media').remove([filePath]);
      }
    }

    const { count } = await supabase.from('testimonials').select('*', { count: 'exact' });
    const totalPages = Math.ceil(count / PAGE_SIZE);
    if (testimonialsCurrentPage > totalPages && totalPages > 0) { testimonialsCurrentPage = totalPages; }
    showToast('Testimonio eliminado.', 'success');
    await renderTestimonialList(testimonialsCurrentPage);
  } catch (err) {
    console.error('Error al eliminar el testimonio:', err);
    showToast(`Error al eliminar: ${err.message}`, 'error');
  }
};

// --- GALERÍA: CRUD de imágenes de galería, subida, edición y borrado ---
let editingGalleryId = null;
let galleryImageFile = null;

function initGallerySection() {
  const form = document.getElementById('gallery-form');
  const submitBtn = document.getElementById('gallery-submit-btn');
  const cancelBtn = document.getElementById('gallery-cancel-btn');
  const imageFileInput = document.getElementById('gallery-image-file');

  imageFileInput.addEventListener('change', (e) => {
    galleryImageFile = e.target.files[0] || null;
  });

  form.onsubmit = async function(e) {
    e.preventDefault();
    submitBtn.disabled = true;
    submitBtn.textContent = 'Subiendo...';

    const description = document.getElementById('gallery-description').value;
    if (!galleryImageFile && !editingGalleryId) {
      showToast('Debes seleccionar una imagen para subir.', 'error');
      submitBtn.disabled = false;
      submitBtn.textContent = 'Añadir a la Galería';
      return;
    }

    try {
      const galleryData = { description };

      if (galleryImageFile) {
        const filePath = `gallery/${Date.now()}-${galleryImageFile.name}`;
        const { error: uploadError } = await supabase.storage.from('media').upload(filePath, galleryImageFile);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(filePath);
        galleryData.image_url = publicUrl;
      }

      let response;
      if (editingGalleryId) {
        response = await supabase.from('gallery').update(galleryData).eq('id', editingGalleryId);
      } else {
        response = await supabase.from('gallery').insert([galleryData]);
      }

      if (response.error) throw response.error;

      showToast('Imagen guardada en la galería.', 'success');
      resetGalleryForm();
      if (editingGalleryId) {
        await renderGalleryList(galleryCurrentPage);
      } else {
        await renderGalleryList(1);
      }
    } catch (err) {
      console.error('Error al guardar en galería:', err);
      showToast(`Error: ${err.message}`, 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Añadir a la Galería';
    }
  };

  cancelBtn.onclick = resetGalleryForm;
}

function resetGalleryForm() {
  document.getElementById('gallery-form').reset();
  editingGalleryId = null;
  galleryImageFile = null;
  document.getElementById('gallery-submit-btn').textContent = 'Añadir a la Galería';
  document.getElementById('gallery-cancel-btn').style.display = 'none';
  document.getElementById('gallery-image-file').required = true;
}

async function renderGalleryList(page = 1) {
  galleryCurrentPage = page;
  const tableBody = document.querySelector('#gallery-table tbody');
  const skeletonRow = `
    <tr class="skeleton-row">
        <td><div class="skeleton-box image"></div></td>
        <td><div class="skeleton-box text-long"></div></td>
        <td><div class="skeleton-box actions"></div></td>
    </tr>
  `;
  tableBody.innerHTML = skeletonRow.repeat(3);

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data: galleryItems, error, count } = await supabase
    .from('gallery')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (error) { tableBody.innerHTML = '<tr><td colspan="3">Error al cargar la galería.</td></tr>'; return; }

  if (!galleryItems.length) {
    tableBody.innerHTML = '<tr><td colspan="3">No hay imágenes en la galería.</td></tr>';
    return;
  }
  tableBody.innerHTML = galleryItems.map(item => `
      <tr>
        <td>${item.image_url ? `<img src="${item.image_url}" width="80" height="50" style="object-fit: cover; border-radius: 5px;">` : ''}</td>
        <td>${item.description || ''}</td>
        <td>
          <button onclick="editGallery('${item.id}')">Editar</button>
          <button onclick="deleteGallery('${item.id}')">Eliminar</button>
        </td>
      </tr>
    `).join('');

    renderPagination('gallery-pagination', galleryCurrentPage, count, PAGE_SIZE, renderGalleryList);
}

window.editGallery = async function(id) {
  const { data: item, error } = await supabase.from('gallery').select('*').eq('id', id).single();
  if (error || !item) { showToast('No se pudo encontrar la imagen.', 'error'); return; }

  document.getElementById('gallery-description').value = item.description || '';
  editingGalleryId = id;
  document.getElementById('gallery-submit-btn').textContent = 'Actualizar';
  document.getElementById('gallery-cancel-btn').style.display = 'inline-block';
  document.getElementById('gallery-image-file').required = false; // Not required when editing
  showToast('Puedes cambiar la descripción o subir una nueva imagen para reemplazar la actual.', 'success');
  document.querySelector('#tab-galeria').scrollIntoView({ behavior: 'smooth' });
};

window.deleteGallery = async function(id) {
  if (!confirm('¿Eliminar esta imagen de la galería?')) return;
  try {
    // 1. Obtener el item para encontrar la URL de la imagen
    const { data: item, error: fetchError } = await supabase.from('gallery').select('image_url').eq('id', id).single();
    if (fetchError) throw fetchError;

    // 2. Borrar el registro de la base de datos
    const { error: deleteDbError } = await supabase.from('gallery').delete().eq('id', id);
    if (deleteDbError) throw deleteDbError;

    // 3. Si tenía una imagen en Supabase, borrarla también del Storage
    if (item.image_url && item.image_url.includes('supabase.co')) {
      const filePath = new URL(item.image_url).pathname.split('/media/')[1];
      if (filePath) {
        await supabase.storage.from('media').remove([filePath]);
      }
    }

    const { count } = await supabase.from('gallery').select('*', { count: 'exact' });
    const totalPages = Math.ceil(count / PAGE_SIZE);
    if (galleryCurrentPage > totalPages && totalPages > 0) { galleryCurrentPage = totalPages; }
    showToast('Imagen eliminada de la galería.', 'success');
    await renderGalleryList(galleryCurrentPage);
  } catch (err) {
    console.error('Error al eliminar de la galería:', err);
    showToast(`Error al eliminar: ${err.message}`, 'error');
  }
};

// --- Notificación toast visual: muestra mensajes de éxito o error en la parte inferior ---
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 500);
  }, 3000);
}
