// supabase/functions/analytics-summary/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Define las cabeceras CORS que permitirán las peticiones desde cualquier origen.
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Para producción, considera cambiar '*' por tu dominio real
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Maneja la petición de pre-vuelo (preflight).
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Para que la función se conecte a Supabase, necesitas configurar las siguientes variables de entorno en tu proyecto:
    // 1. SUPABASE_URL: La URL de tu proyecto de Supabase.
    // 2. SUPABASE_SERVICE_ROLE_KEY: La clave de servicio (service_role) de tu proyecto.
    // Puedes encontrarlas en la sección de configuración de API de tu proyecto en Supabase.
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )ZZZZZZZ<XX

    // 1. Contar el total de visitas
    const { count: totalVisits, error: visitsError } = await supabaseAdmin
      .from('page_visits')
      .select('*', { count: 'exact', head: true });

    if (visitsError) throw visitsError;

    // 2. Encontrar el país con más visitas (topZone)
    const { data: topCountryData, error: countryError } = await supabaseAdmin
      .from('page_visits')
      .select('country')
      .not('country', 'is', null); // Ignorar registros sin país

    if (countryError) throw countryError;

    let topZone = 'N/A';
    if (topCountryData && topCountryData.length > 0) {
      const countryCounts = topCountryData.reduce((acc, { country }) => {
        if(country) {
          acc[country] = (acc[country] || 0) + 1;
        }
        return acc;
      }, {});

      if(Object.keys(countryCounts).length > 0) {
        topZone = Object.keys(countryCounts).reduce((a, b) => countryCounts[a] > countryCounts[b] ? a : b);
      }
    }

    // Prepara la respuesta final. avgTime se deja en 0 ya que no lo medimos.
    const analyticsData = {
      summary: {
        visits: totalVisits || 0,
        avgTime: 0, // No se calcula actualmente
        topZone: topZone,
      },
      // Los datos de gráficos se pueden dejar vacíos o calcularse de forma similar si es necesario.
      charts: {
        visitsByDay: [],
        topCountries: [],
      }
    };

    // Devuelve los datos como JSON.
    return new Response(
      JSON.stringify(analyticsData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error) {
    // En caso de error, también devuelve una respuesta con las cabeceras CORS.
    return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
