// Script para poblar la base de datos con datos de ejemplo para galería, blog y testimonios
// NOTA: Este script se ejecuta localmente con Node.js para poblar la base de datos de Supabase.
// Necesitarás instalar el cliente de Supabase: npm install @supabase/supabase-js
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config'; // Carga las variables de entorno desde el archivo .env

const SUPABASE_URL = 'https://obsshvmadmfmqigivjkb.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  throw new Error(
    'La clave SUPABASE_SERVICE_KEY no está definida. ' +
    'Asegúrate de crear un archivo .env en la carpeta /backend y añadir la clave allí.'
  );
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function main() {
  console.log('Poblando la base de datos de Supabase...');

  // Datos de ejemplo
  const galleryData = [
    { image_url: 'https://picsum.photos/seed/galeria1/800/600', description: 'Perro feliz en el parque' },
    { image_url: 'https://picsum.photos/seed/galeria2/800/600', description: 'Gato curioso mirando la cámara' }
  ];
  const blogData = [
    { title: 'Cómo cuidar a tu mascota en verano', image_url: 'https://picsum.photos/seed/blog1/400/300', content: 'Consejos para mantener a tu mascota fresca y saludable.' },
    { title: 'Alimentación natural para perros', image_url: 'https://picsum.photos/seed/blog2/400/300', content: 'Beneficios de una dieta natural y balanceada.' }
  ];
  const testimonialData = [
    { author: 'Ana López', text: 'Excelente servicio, mi perro salió feliz del spa.', image_url: 'https://picsum.photos/seed/testimonio1/200/200' },
    { author: 'Carlos Pérez', text: 'Muy profesionales y atentos. ¡Recomendados!', image_url: 'https://picsum.photos/seed/testimonio2/200/200' }
  ];

  console.log('Limpiando colecciones existentes...');
  await supabase.from('gallery').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('blog_posts').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('testimonials').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  console.log('Insertando datos de ejemplo...');
  await supabase.from('gallery').insert(galleryData);
  await supabase.from('blog_posts').insert(blogData);
  await supabase.from('testimonials').insert(testimonialData);

  console.log('Datos de ejemplo insertados correctamente.');
}

main().catch(console.error);
