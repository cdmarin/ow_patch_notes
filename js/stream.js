let currentPatch = 1;
let totalPatches = 1;
let lastHeroName = '';

export function appendConsoleLog(consoleEl, text, forceType) {
    // Capturar el nombre del héroe actual en traducción
    if (text.includes('🌐 Traduciendo:')) {
        const parts = text.split('🌐 Traduciendo:');
        if (parts.length > 1) {
            lastHeroName = parts[1].replace(/\.+$/, '').trim();
        }
    }

    // Si es un log de control de progreso de traducción, actualizar la línea de progreso en lugar de acumular líneas
    if (text.includes('TRADUCCION_PROGRESO:')) {
        const match = text.match(/TRADUCCION_PROGRESO:\s*(\d+)\/(\d+)/);
        if (match) {
            const count = match[1];
            const total = match[2];
            
            let progressLine = consoleEl.querySelector('.console-translation-progress');
            if (!progressLine) {
                progressLine = document.createElement('div');
                progressLine.className = 'console-line console-translation-progress';
                progressLine.style.color = '#38bdf8'; // Celeste brillante
                progressLine.style.fontWeight = '600';
                consoleEl.appendChild(progressLine);
            }
            
            if (lastHeroName) {
                progressLine.textContent = `⏳ Traducción ${lastHeroName} (${count}/${total})`;
            } else {
                progressLine.textContent = `⏳ Traducción elementos (${count}/${total})`;
            }
            consoleEl.scrollTop = consoleEl.scrollHeight;
        }
        return;
    }

    // Filtrar otros logs de control detallados de traducción para no inundar la consola de la UI
    // (Mantenemos los mensajes de héroe individual '🌐 Traduciendo: ...', '📁 Traduciendo rol: ...' y '📦 Traduciendo objetos...')
    const lowerText = text.toLowerCase();
    if (
        text.includes('TRADUCCION_PROGRESO') ||
        lowerText.includes('traducción:') ||
        lowerText.includes('elementos a traducir') ||
        lowerText.includes('traduciendo corrección de errores')
    ) {
        return;
    }

    const logLine = document.createElement('div');
    logLine.className = 'console-line';
    let cleanText = text.replace('SUCCESS:', '')
                        .replace('ERROR:', '')
                        .replace(' (vunknown)', '')
                        .replace('(vunknown)', '')
                        .replace(' (--no-translate)', '')
                        .replace('(--no-translate)', '')
                        .trim();
    if (!cleanText) return;

    // Omitir advertencias internas de Node.js sobre TLS/certificados
    if (cleanText.includes('NODE_TLS_REJECT_UNAUTHORIZED') || cleanText.includes('--trace-warnings')) {
        return;
    }

    // Reemplazar referencias a index.html por texto amigable
    if (cleanText.includes('index.html')) {
        cleanText = '✅ Los cambios están listos para visualizar en la aplicación.';
    }

    // No mostrar rutas de archivos locales al usuario por seguridad/estética
    if (cleanText.includes(':\\') || (cleanText.includes('/') && cleanText.includes('.json')) || cleanText.includes('\\data\\')) {
        if (cleanText.includes('patch.json')) {
            cleanText = '✅ Datos del parche guardados correctamente.';
        } else if (cleanText.includes('meta.json')) {
            cleanText = '✅ Metadatos e información general guardados.';
        } else if (cleanText.includes('patches_index') || cleanText.includes('Índice actualizado')) {
            cleanText = '✅ Lista de parches actualizada.';
        } else {
            return; // Omitir cualquier otra línea que filtre rutas internas
        }
    }

    logLine.textContent = cleanText;

    if (forceType === 'error' || text.startsWith('ERROR:') || text.includes('❌') || text.includes('Error fatal:')) {
        logLine.classList.add('log-error');
    } else if (forceType === 'success' || text.startsWith('SUCCESS:') || text.includes('✅') || text.includes('exitosamente')) {
        logLine.classList.add('log-success');
    } else if (text.includes('⚠️')) {
        logLine.classList.add('log-warn');
    } else if (text.includes('ℹ️') || text.includes('Paso')) {
        logLine.classList.add('log-info');
    }

    consoleEl.appendChild(logLine);
    consoleEl.scrollTop = consoleEl.scrollHeight;
}

export function updateProgressBar(line, progressBar, progressPercent) {
    // Detectar si estamos procesando un parche específico en el bucle
    if (line.includes('Procesando parche')) {
        const match = line.match(/Procesando parche\s+(\d+)\/(\d+)/);
        if (match) {
            currentPatch = parseInt(match[1], 10);
            totalPatches = parseInt(match[2], 10);
        }
    }

    let currentPct = parseInt(progressPercent.textContent) || 0;
    let patchInternalPct = 0;

    if (line.includes('Paso 1/5')) {
        patchInternalPct = 10;
    } else if (line.includes('Paso 2/5')) {
        patchInternalPct = 20;
    } else if (line.includes('Traduciendo al español') || line.includes('Traduciendo corrección')) {
        patchInternalPct = 25;
    } else if (line.includes('TRADUCCION_PROGRESO:')) {
        const match = line.match(/TRADUCCION_PROGRESO:\s*(\d+)\/(\d+)/);
        if (match) {
            const count = parseInt(match[1], 10);
            const total = parseInt(match[2], 10);
            if (total > 0) {
                // Escalar de 25% a 85% durante la traducción de este parche
                const progressFraction = count / total;
                patchInternalPct = Math.round(25 + progressFraction * (85 - 25));
            }
        }
    } else if (line.includes('Guardando archivos de datos')) {
        patchInternalPct = 90;
    } else if (line.includes('Actualizando índice')) {
        patchInternalPct = 95;
    } else if (line.includes('SUCCESS: Proceso finalizado') || line.includes('finalizado exitosamente')) {
        currentPatch = totalPatches;
        patchInternalPct = 100;
    }

    // Calcular el porcentaje total acumulado (repartido entre todos los parches)
    let targetPct = currentPct;
    if (totalPatches > 0) {
        const basePct = ((currentPatch - 1) / totalPatches) * 100;
        const phaseContribution = (patchInternalPct / 100) * (100 / totalPatches);
        targetPct = Math.round(basePct + phaseContribution);
    }

    if (targetPct > currentPct) {
        progressBar.style.width = `${targetPct}%`;
        progressPercent.textContent = `${targetPct}%`;
    }
}

export async function startScrapeStream(queryParams, onSuccess) {
    const overlay = document.getElementById('scrape-overlay');
    const consoleEl = document.getElementById('scrape-console');
    const progressBar = document.getElementById('scrape-progress-inner');
    const progressPercent = document.getElementById('scrape-percent');
    const footer = document.getElementById('scrape-footer');
    const closeBtn = document.getElementById('scrape-close-btn');

    if (!overlay || !consoleEl || !progressBar || !progressPercent || !footer || !closeBtn) {
        console.error('[App] No se encontraron elementos DOM para mostrar el progreso de refresco.');
        return;
    }

    // Resetear variables globales de seguimiento de parches
    currentPatch = 1;
    totalPatches = 1;
    lastHeroName = '';

    // Mostrar overlay, ocultar footer, resetear progreso
    overlay.classList.remove('hidden');
    footer.classList.add('hidden');
    progressBar.style.width = '0%';
    progressPercent.textContent = '0%';
    consoleEl.innerHTML = '';

    let success = false;
    let errorMsg = '';

    try {
        const response = await fetch(`/api/scrape${queryParams}`);
        if (!response.ok) {
            throw new Error(`Error de red HTTP ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop(); // Mantener la última línea incompleta en el buffer

            for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed) {
                    appendConsoleLog(consoleEl, trimmed);
                    updateProgressBar(trimmed, progressBar, progressPercent);

                    if (trimmed.includes('SUCCESS: Proceso finalizado') || trimmed.includes('finalizado exitosamente')) {
                        success = true;
                    } else if (trimmed.startsWith('ERROR:') || trimmed.includes('Error fatal:')) {
                        errorMsg = trimmed.replace('ERROR:', '').trim();
                    }
                }
            }
        }

        // Procesar cualquier texto remanente en el buffer
        if (buffer) {
            const trimmed = buffer.trim();
            if (trimmed) {
                appendConsoleLog(consoleEl, trimmed);
                updateProgressBar(trimmed, progressBar, progressPercent);
                if (trimmed.includes('SUCCESS: Proceso finalizado') || trimmed.includes('finalizado exitosamente')) {
                    success = true;
                } else if (trimmed.startsWith('ERROR:') || trimmed.includes('Error fatal:')) {
                    errorMsg = trimmed.replace('ERROR:', '').trim();
                }
            }
        }

    } catch (err) {
        console.error('[App] Error en stream de scrape:', err);
        appendConsoleLog(consoleEl, `ERROR: ${err.message}`, 'error');
        errorMsg = err.message;
    } finally {
        // Finalizado el streaming de datos
        footer.classList.remove('hidden');
        if (success) {
            progressBar.style.width = '100%';
            progressPercent.textContent = '100%';
            appendConsoleLog(consoleEl, '✅ Proceso completado con éxito', 'success');
        } else {
            appendConsoleLog(consoleEl, `❌ Error en el proceso: ${errorMsg || 'Desconocido'}`, 'error');
        }

        // Controlador del botón de cerrar
        closeBtn.onclick = () => {
            overlay.classList.add('hidden');
            if (success && onSuccess) {
                onSuccess();
            }
        };
    }
}
