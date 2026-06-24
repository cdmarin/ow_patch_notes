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

        const child = exec(cmd, { cwd: scraperDir }, (error, stdout, stderr) => {
            if (error) {
                console.error(`[Server] Error al ejecutar el scraper: ${error.message}`);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: error.message, stderr }));
                return;
            }

            console.log(`[Server] Scraper finalizado con éxito.`);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, stdout }));
        });

        // Pipe the logs in real-time to the server console
        child.stdout.on('data', (data) => {
            process.stdout.write(data);
        });
        child.stderr.on('data', (data) => {
            process.stderr.write(data);
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

        res.writeHead(200, { 'Content-Type': contentType });
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
