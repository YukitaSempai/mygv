# MYGV — The Pinnacle of Golf Visa

Sitio estático multi-página para presentar la membresía MYGV y sus beneficios, explorar campos de golf y consultar información del servicio. Incluye un mapa interactivo con Leaflet, filtros, agrupación de marcadores y contenido bilingüe.

## Tecnologías

- HTML5, CSS3 y JavaScript
- Bootstrap
- Leaflet y MarkerCluster para el mapa

## Desarrollo local

Desde la raíz del repositorio:

```powershell
py -m http.server 8000 --directory html
```

Abre `http://localhost:8000`. Las páginas publicadas se mantienen en `html/`.

## Publicación

GitHub Actions publica el contenido de `html/` en [GitHub Pages](https://yukitasempai.github.io/mygv/). Los cambios enviados a `main` actualizan la demo automáticamente.