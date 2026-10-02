# 🎮 OW Patch Notes — Scraper

## Instalación

```bash
cd scraper
npm install
```

## Uso

### Scrapear el parche más reciente

```bash
npm run scrape
```

### Sin traducción automática (más rápido)

```bash
node scraper.js --no-translate
```

### URL específica

```bash
node scraper.js --url="https://overwatch.blizzard.com/en-us/news/patch-notes/overwatch/2"
```

## Traducción

1. **Traducción oficial de Blizzard (preferida).** El scraper descarga también la página
   española (`/es-es/`) y, si su estructura coincide exactamente con la inglesa, usa ese texto
   (nombres oficiales de habilidades, poderes y objetos). Se guarda `"translationSource": "official"`.
2. **Traducción automática (respaldo).** Si Blizzard todavía no ha publicado la versión
   española de un parche, o su estructura no coincide, se traduce con Google Translate /
   MyMemory / LibreTranslate (`"translationSource": "machine"`). En la siguiente ejecución en la
   que la versión oficial esté disponible, el parche se sustituye automáticamente.

Como la versión oficial suele tardar unos días, la traducción automática usa un **glosario de
nombres oficiales** (`data/glossary.json`) que se rellena solo cada vez que hay una versión
oficial: los nombres de habilidades, ventajas, poderes y objetos conocidos se escriben con su
nombre oficial (en el título y en el texto) y los desconocidos se dejan en inglés en lugar de
traducirse literalmente. Para llenarlo desde el principio, reprocesa los meses anteriores.

Si algún texto no se pudo traducir, el parche se guarda con `"translated": false` y se
reintenta en la siguiente ejecución.

Para regenerar meses anteriores con la traducción oficial, lanza el workflow
*Scrape Overwatch Patch Notes* manualmente indicando los meses (ej. `2026/05 2026/06`), o en local:

```bash
node scraper.js --url="https://overwatch.blizzard.com/en-us/news/patch-notes/live/2026/08"
```

Opciones: `--no-official` desactiva la traducción oficial; `OFFICIAL_LOCALE=es-mx` usa la
versión latinoamericana en lugar de la de España.

### Texto original en inglés

Junto a cada `patch.json` (traducido) se guarda `patch.en.json` con el texto original de
Blizzard. La web tiene un botón **ES / EN** en la cabecera para cambiar entre ambos. Los
parches descargados antes de este cambio no tienen original: el scraper lo añade la próxima
vez que los procese (reutilizando la traducción ya hecha), o reprocesa sus meses con el workflow.

## Aviso de parches nuevos en Discord

Tras cada ejecución del workflow, `notify.js` compara el índice de parches con el que había
antes del scraping y, si hay parches nuevos, publica un mensaje en Discord con un resumen y un
enlace directo a la web (`https://cdmarin.github.io/ow_patch_notes/?patch=2026-09-22`). Los
parches antiguos que aparecen al reprocesar meses anteriores no se anuncian.

Para activarlo:

1. En Discord: *Editar canal → Integraciones → Webhooks → Nuevo webhook* y copia su URL.
2. En GitHub: *Settings → Secrets and variables → Actions → New repository secret*, con el
   nombre `DISCORD_WEBHOOK_URL` y esa URL como valor.

Sin el secreto, el workflow funciona igual pero no envía nada. Para probarlo en local:

```bash
node notify.js --patch=2026-09-22 --dry-run   # Muestra el mensaje sin enviarlo
```

Quitando `--dry-run` y con `DISCORD_WEBHOOK_URL` definida se envía de verdad. Si la web se
publica en otra dirección, indícala con `SITE_URL`.

## Configuración de LibreTranslate

El scraper usa [LibreTranslate](https://github.com/LibreTranslate/LibreTranslate) para traducir automáticamente los textos al español.

### Opción A: Instancia pública (gratuita, puede tener límites)

Por defecto usa `https://libretranslate.com`. No necesitas configurar nada.

### Opción B: Self-host (recomendado para uso intensivo)

```bash
# Con Docker
docker run -ti --rm -p 5000:5000 libretranslate/libretranslate

# Con pip
pip install libretranslate
libretranslate
```

Luego configura la URL:

```bash
set LIBRETRANSLATE_URL=http://localhost:5000
node scraper.js
```

### Variables de entorno

| Variable | Default | Descripción |
|---|---|---|
| `LIBRETRANSLATE_URL` | `https://libretranslate.com` | URL de la instancia |
| `LIBRETRANSLATE_KEY` | *(vacío)* | API key (si requiere auth) |
| `DEBUG` | *(vacío)* | Mostrar stack traces de errores |

## Estructura de archivos generados

```
data/
├── patches_index.json          ← Índice de todos los parches
└── patches/
    └── 2026-06/
        ├── patch.json          ← Datos completos del parche
        └── meta.json           ← Metadatos (versión, fecha, título)
```

## Solución de problemas

**El scraper no encuentra la sección de Stadium**  
La estructura HTML de Blizzard puede cambiar. Edita `parser.js` y ajusta los selectores CSS en `parseStadium()`.

**Error de CORS / red**  
El scraper corre en Node.js y no tiene restricciones CORS. Si falla, puede ser un firewall o rate limiting de Blizzard. Espera unos minutos y reintenta.

**Traducción muy lenta**  
Usa `--no-translate` para saltar la traducción y traducir manualmente los JSONs, o instala LibreTranslate localmente con Docker.
