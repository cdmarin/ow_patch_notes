const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const url = require('url');

let port = process.env.PORT || 3000;
const PUBLIC_DIR = __dirname;

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    let pathname = parsedUrl.pathname;

    // API Endpoint: Ejecutar Scraper
    if (pathname === '/api/scrape') {
        const query = parsedUrl.query;
        const args = [];

        if (query.stadium === 'false') {
            args.push('--no-stadium');
        }
        if (query.general === 'false') {
            args.push('--no-general');
        }
        if (query.translate === 'false') {
            args.push('--no-translate');
        }
        if (query.force === 'true') {
            args.push('--force');
        }

        if (query.url) {
            try {
                const parsedScrapeUrl = new URL(query.url);
                if (parsedScrapeUrl.protocol === 'https:' && parsedScrapeUrl.hostname === 'overwatch.blizzard.com') {
                    const escapedUrl = query.url.replace(/"/g, '\\"');
                    args.push(`--url="${escapedUrl}"`);
                } else {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ success: false, error: 'La URL debe pertenecer al dominio oficial overwatch.blizzard.com' }));
                    return;
                }
            } catch (e) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: 'URL de descarga inválida' }));
                return;
            }
        }

        console.log(`[Server] Ejecutando scraper con argumentos: ${args.join(' ') || '(ninguno)'}`);

        const cmd = `node scraper.js ${args.join(' ')}`;
        const scraperDir = path.join(PUBLIC_DIR, 'scraper');

        // Establecer cabeceras para respuesta en streaming chunked
        res.writeHead(200, {
            'Content-Type': 'text/plain; charset=utf-8',
            'Transfer-Encoding': 'chunked',
            'Cache-Control': 'no-cache, no-transform', // Evita que proxies y CDNs alteren o compriman el stream
            'X-Accel-Buffering': 'no', // Desactivar almacenamiento en búfer del proxy (ej. Nginx en Render)
            'Content-Encoding': 'identity', // Evita que se aplique compresión gzip/brotli que retiene los chunks
            'Connection': 'keep-alive'
        });

        const child = exec(cmd, { cwd: scraperDir });

        child.stdout.on('data', (data) => {
            res.write(data);
            process.stdout.write(data);
        });

        child.stderr.on('data', (data) => {
            res.write(data);
            process.stderr.write(data);
        });

        child.on('close', (code) => {
            if (code !== 0) {
                console.error(`[Server] Error al ejecutar el scraper, código de salida: ${code}`);
                res.write(`\nERROR: El proceso terminó con código ${code}\n`);
            } else {
                console.log(`[Server] Scraper finalizado con éxito.`);
                res.write(`\nSUCCESS: Proceso finalizado\n`);
            }
            res.end();
        });

        child.on('error', (err) => {
            console.error(`[Server] Error al iniciar el proceso: ${err.message}`);
            res.write(`\nERROR: No se pudo iniciar el scraper: ${err.message}\n`);
            res.end();
        });

        req.on('close', () => {
            if (child.kill) {
                child.kill();
                console.log('[Server] Conexión cerrada por el cliente. Proceso scraper finalizado.');
            }
        });

        return;
    }

    // Servir index.html por defecto para la raíz
    if (pathname === '/') {
        pathname = '/index.html';
    }

    const filePath = path.join(PUBLIC_DIR, pathname);

    // Seguridad: evitar saltar fuera del directorio público
    if (!filePath.startsWith(PUBLIC_DIR)) {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('Forbidden');
        return;
    }

    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Not Found');
            return;
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        const headers = { 'Content-Type': contentType };
        // Prevent caching of development files
        if (['.html', '.js', '.css'].includes(ext)) {
            headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
        }

        res.writeHead(200, headers);
        const stream = fs.createReadStream(filePath);
        stream.pipe(res);
    });
});

function startServer(p) {
    server.listen(p, () => {
        console.log(`\n🚀 Servidor de Overwatch Patch Notes listo en http://localhost:${p}`);
        console.log(`Presiona Ctrl+C para detenerlo.\n`);
    });
}

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.log(`[Server] Puerto ${port} en uso, probando el ${port + 1}...`);
        port++;
        startServer(port);
    } else {
        console.error(`[Server] Error en el servidor:`, err);
    }
});

startServer(port);
