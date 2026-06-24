const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const PATCHES_DIR = path.join(DATA_DIR, 'patches');
const PATCHES_INDEX = path.join(DATA_DIR, 'patches_index.json');

console.log('🧹 Limpiando parches locales...');

// 1. Borrar todas las carpetas dentro de data/patches
if (fs.existsSync(PATCHES_DIR)) {
    const files = fs.readdirSync(PATCHES_DIR);
    let deletedCount = 0;
    for (const file of files) {
        const curPath = path.join(PATCHES_DIR, file);
        if (fs.lstatSync(curPath).isDirectory()) {
            console.log(`Eliminando carpeta: ${file}`);
            fs.rmSync(curPath, { recursive: true, force: true });
            deletedCount++;
        }
    }
    console.log(`Se eliminaron ${deletedCount} carpetas de parches.`);
} else {
    console.log('No existe la carpeta de parches.');
}

// 2. Reiniciar data/patches_index.json
const emptyIndex = { patches: [] };
fs.writeFileSync(PATCHES_INDEX, JSON.stringify(emptyIndex, null, 2), 'utf8');
console.log('Índice de parches reiniciado correctamente.');

console.log('✅ ¡Limpieza completada!');
