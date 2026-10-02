/**
 * notify.js — Avisa en Discord cuando el scraper ha encontrado parches nuevos
 *
 * Uso:
 *   node notify.js --before=<ruta>     → Compara el índice actual con una copia anterior y avisa de los nuevos
 *   node notify.js --patch=2026-09-22  → Avisa de un parche concreto (para pruebas)
 *   node notify.js --dry-run           → Muestra el mensaje sin enviarlo
 *
 * Variables de entorno:
 *   DISCORD_WEBHOOK_URL  → URL del webhook del canal de Discord (si falta, no se envía nada)
 *   SITE_URL             → URL pública de la web (default: https://cdmarin.github.io/ow_patch_notes/)
 */

const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const yargs = require('yargs');

// ─── Configuración ────────────────────────────────────────────────────────────

const DATA_DIR = path.join(__dirname, '..', 'data');
const PATCHES_DIR = path.join(DATA_DIR, 'patches');
const PATCHES_INDEX = path.join(DATA_DIR, 'patches_index.json');

const SITE_URL = (process.env.SITE_URL || 'https://cdmarin.github.io/ow_patch_notes/').replace(/\/*$/, '/');
const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

const HERO_SECTIONS = [
    { id: 'gameBase', label: 'Juego base' },
    { id: 'stadium', label: 'Stadium' },
    { id: 'arcade', label: 'Arcade' },
];
const MAX_HEROES_LISTED = 12;
const MAX_EMBEDS = 10; // Límite de Discord por mensaje
const EMBED_COLOR = 0xf99e1a; // Naranja de Overwatch

// Espera a que GitHub Pages publique los datos nuevos antes de avisar
const DEPLOY_TIMEOUT_MS = 5 * 60 * 1000;
const DEPLOY_POLL_MS = 15 * 1000;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function log(msg, type = 'info') {
    const icons = { info: 'ℹ️ ', success: '✅', error: '❌', warn: '⚠️ ' };
    console.log(`${icons[type] || '  '} ${msg}`);
}

async function readIndex(file) {
    if (!file || !(await fs.pathExists(file))) return [];
    const index = await fs.readJson(file);
    return index.patches || [];
}

/**
 * Parches que no estaban en el índice anterior y son más recientes que todos los que había.
 * (Al reprocesar meses antiguos aparecen parches "nuevos" que no deben anunciarse.)
 */
function findNewPatches(before, after) {
    const sorted = [...after].sort((a, b) => b.date.localeCompare(a.date));
    if (before.length === 0) return sorted.slice(0, 1);

    const knownIds = new Set(before.map(p => p.id));
    const newestKnown = before.reduce((max, p) => (p.date > max ? p.date : max), '');
    return sorted.filter(p => !knownIds.has(p.id) && p.date > newestKnown);
}

function summarize(patch) {
    const lines = [];
    const sections = patch.sections || {};

    for (const { id, label } of HERO_SECTIONS) {
        const section = sections[id];
        if (!section) continue;

        const heroes = Object.values(section.roles || {}).flat().map(h => h.name).filter(Boolean);
        const general = (section.generalItems || []).length;
        const parts = [];
        if (heroes.length > 0) {
            const listed = heroes.slice(0, MAX_HEROES_LISTED).join(', ');
            const rest = heroes.length - MAX_HEROES_LISTED;
            parts.push(rest > 0 ? `${listed} y ${rest} más` : listed);
        }
        if (general > 0) {
            parts.push(`${general} ${general === 1 ? 'cambio general' : 'cambios generales'}`);
        }
        if (parts.length > 0) lines.push(`**${label}:** ${parts.join(' · ')}`);
    }

    const bugFixes = (sections.bugFixes || []).length;
    if (bugFixes > 0) {
        lines.push(`**Correcciones:** ${bugFixes} ${bugFixes === 1 ? 'error corregido' : 'errores corregidos'}`);
    }

    return lines.join('\n');
}

function buildEmbed(meta, patch) {
    const url = `${SITE_URL}?patch=${encodeURIComponent(meta.id)}`;
    const summary = summarize(patch);
    return {
        title: `Nuevo parche de Overwatch — ${meta.title}`,
        url,
        description: `${summary ? summary + '\n\n' : ''}[Ver las notas del parche](${url})`,
        color: EMBED_COLOR,
        timestamp: new Date(`${meta.date}T00:00:00Z`).toISOString(),
    };
}

/**
 * Espera a que la web publicada ya incluya los parches nuevos (el despliegue de
 * GitHub Pages tarda un poco tras el push). Si se agota el tiempo, se avisa igualmente.
 */
async function waitForDeploy(patchIds) {
    const deadline = Date.now() + DEPLOY_TIMEOUT_MS;
    while (true) {
        try {
            const resp = await axios.get(`${SITE_URL}data/patches_index.json?t=${Date.now()}`, { timeout: 15000 });
            const liveIds = new Set((resp.data.patches || []).map(p => p.id));
            if (patchIds.every(id => liveIds.has(id))) {
                log('La web publicada ya incluye los parches nuevos.', 'success');
                return;
            }
        } catch (err) {
            log(`No se pudo comprobar la web publicada: ${err.message}`, 'warn');
        }
        if (Date.now() + DEPLOY_POLL_MS > deadline) {
            log('La web todavía no muestra los parches nuevos. Se avisa igualmente.', 'warn');
            return;
        }
        await new Promise(resolve => setTimeout(resolve, DEPLOY_POLL_MS));
    }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
    const argv = yargs
        .option('before', { type: 'string', description: 'Copia de patches_index.json anterior al scraping' })
        .option('patch', { type: 'string', description: 'ID de un parche concreto del que avisar (ej: 2026-09-22)' })
        .option('dry-run', { type: 'boolean', default: false, description: 'Mostrar el mensaje sin enviarlo' })
        .option('wait', { type: 'boolean', default: true, description: 'Esperar a que la web publique los parches antes de avisar' })
        .help()
        .argv;

    const current = await readIndex(PATCHES_INDEX);

    let newPatches;
    if (argv.patch) {
        newPatches = current.filter(p => p.id === argv.patch);
        if (newPatches.length === 0) throw new Error(`El parche ${argv.patch} no está en el índice`);
    } else if (argv.before) {
        newPatches = findNewPatches(await readIndex(argv.before), current);
    } else {
        throw new Error('Indica --before=<ruta> o --patch=<id>');
    }

    // Del más antiguo al más reciente, descartando los marcadores de "mes sin parches"
    const embeds = [];
    for (const meta of newPatches.reverse()) {
        const patch = await fs.readJson(path.join(PATCHES_DIR, meta.id, 'patch.json'));
        if (patch.isEmptyPlaceholder) continue;
        embeds.push(buildEmbed(meta, patch));
    }

    if (embeds.length === 0) {
        log('No hay parches nuevos de los que avisar.');
        return;
    }

    const payload = { embeds: embeds.slice(-MAX_EMBEDS), allowed_mentions: { parse: [] } };
    log(`Parches nuevos: ${embeds.map(e => e.url.split('=').pop()).join(', ')}`);

    if (argv['dry-run']) {
        console.log(JSON.stringify(payload, null, 2));
        return;
    }
    if (!WEBHOOK_URL) {
        log('Falta DISCORD_WEBHOOK_URL: no se envía el aviso a Discord.', 'warn');
        return;
    }

    if (argv.wait) {
        await waitForDeploy(newPatches.map(p => p.id));
    }

    await axios.post(WEBHOOK_URL, payload, { timeout: 30000 });
    log('Aviso enviado a Discord.', 'success');
}

main().catch(error => {
    // No mostrar nunca la URL del webhook (es un secreto)
    const detail = error.response ? `HTTP ${error.response.status}: ${JSON.stringify(error.response.data)}` : error.message;
    log(`No se pudo enviar el aviso a Discord: ${detail}`, 'error');
    process.exit(1);
});
