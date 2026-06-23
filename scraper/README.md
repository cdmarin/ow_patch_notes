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
