# MIGA VERDE
Hero estático de una pantalla. Servir `dist` con cualquier servidor HTTP.

- 300vh de sección y escenario sticky de 100vh.
- Rueda, tarjetas, flechas y swipe vertical. Transición sincronizada de 900 ms.
- Precarga y decodificación de las nueve capas antes de habilitar la interacción.
- Movimiento reducido: solo fundidos; sin parallax ni flotación.
- Bolsa demostrativa; no se procesan pagos ni pedidos.

Las nueve imágenes se generaron en API MART, modelo `gpt-image-2`, resolución `2k`, parámetro `quality: medium`, con la referencia adjunta. La API acepta el parámetro de calidad en su esquema, aunque su documentación pública no garantiza cómo lo aplica. Identificadores y enlaces originales en `art-direction/generations.json` (caducan). Los recortes llegaron con damero opaco y se convirtieron a PNG alfa mediante segmentación del fondo. Fondos y adornos: 2048×1152; galletas: 2048×2048.

La tipografía usa Didot/Bodoni y Georgia como respaldo: la imagen de referencia no identifica una fuente exacta.

## Build de producción

`dist/index.html` es la entrada en la raíz del build. Publicar únicamente `dist/`.
Las nueve capas se sirven en WebP, con transparencia en galletas y adornos.
Los PNG/JPG previos se conservan en `art-direction/production-sources/`, fuera del build.
Incluye favicon SVG y tarjeta social JPEG de 1200×630.
Todas las referencias de recursos son relativas. Al fijar el dominio definitivo,
conviene convertir `og:image` y `twitter:image` a URL absoluta para asegurar
compatibilidad con los rastreadores de redes sociales.
