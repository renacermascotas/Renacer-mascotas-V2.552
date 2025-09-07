// Genera dinámicamente las tarjetas del blog con imágenes y textos
const blogPosts = [
  {
    img: 'fotos/1.jpg',
    alt: 'Consejos de alimentación para mascotas',
    title: 'Tips de Alimentación',
    text: 'Cómo elegir el mejor alimento para tu mascota.',
    link: 'consejos.html'
  },
  {
    img: 'fotos/1-4.jpg',
    alt: 'Guía para bañar a un perro en casa',
    title: 'Baño en casa',
    text: 'Guía práctica para bañar a tu perro.',
    link: 'consejos.html'
  },
  {
    img: 'fotos/3.jpg',
    alt: 'Mascota feliz',
    title: 'Juegos y Enriquecimiento',
    text: 'Ideas para mantener a tu mascota activa y feliz.',
    link: 'consejos.html'
  }
];

const blogCards = document.getElementById('blog-cards');
if (blogCards) {
  blogPosts.forEach(post => {
    const card = document.createElement('div');
    card.className = 'plan-img-box';
    card.tabIndex = 0;
    card.innerHTML = `
      <a href="${post.link}" style="text-decoration:none; color:inherit;">
        <img src="${post.img}" alt="${post.alt}" class="plan-image" />
        <div style="width:100%;text-align:center;margin-top:1.2rem;">
          <h3 style="color:var(--secondary);font-size:1.15rem;font-weight:800;margin-bottom:0.7rem;">${post.title}</h3>
          <p style="color:#444;font-size:1.05rem;">${post.text}</p>
        </div>
      </a>
    `;
    blogCards.appendChild(card);
  });
}
