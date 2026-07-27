# APA La Plata — Sitio y sistema de diseño

Trabajo Práctico Final — Sitio y sistema para una organización de bien común (APA La Plata, Asociación Protectora de Animales de La Plata).

Sitio estático (HTML, CSS y JavaScript sin dependencias), mobile first, que implementa el sistema de diseño documentado en `TP_Final_APA_LaPlata_Etapas1y2.pdf` (variables, átomos, moléculas, organismos y layout responsivo).

## Páginas

- `index.html` — Inicio: hero, datos institucionales, catálogo destacado y proceso de adopción.
- `adopcion.html` — Catálogo completo de perros en adopción, con barra de filtros por tamaño y edad.
- `animal.html?id=<id>` — Detalle de un animal.
- `sobre-apa.html` — Presentación institucional.
- `contacto.html` — Formulario de contacto y formas de colaborar.

## Estructura

```
assets/
  css/style.css     Sistema de diseño (variables, átomos, moléculas, organismos)
  js/animales.js    Datos del catálogo de perros
  js/main.js        Menú móvil, filtros, render de tarjetas y formulario
  img/              Logo y fotos de los animales
```

## Cómo verlo localmente

Al ser un sitio estático, alcanza con abrir `index.html` en el navegador, o levantar un servidor simple:

```
python3 -m http.server 8000
```

y visitar `http://localhost:8000`.