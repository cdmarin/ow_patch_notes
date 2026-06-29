/**
 * parser.js — Parser de HTML de Blizzard → JSON estructurado
 * 
 * Parsea la página de patch notes de Overwatch:
 * https://overwatch.blizzard.com/en-us/news/patch-notes/
 * 
 * La estructura HTML de Blizzard puede cambiar en cualquier momento.
 * Si el scraper deja de funcionar, probablemente sea por esto.
 */

const cheerio = require('cheerio');

// Palabras clave para clasificar el tipo de cambio automáticamente
const CHANGE_TYPE_KEYWORDS = {
    nerf: ['decreased', 'reduced', 'removed', 'no longer', 'lowered', 'nerfed', 'eliminated', 'deleted'],
    buff: ['increased', 'improved', 'added', 'bonus', 'enhanced', 'boosted', 'buffed', 'now grants'],
    new: ['new:', 'new ability', 'new power', 'new item', 'now:', 'introducing'],
    rework: ['reworked', 'redesigned', 'overhauled', 'changed to', 'now functions', 'reformado', 'now:']
};

// Palabras clave de contexto que invierten la lógica buff/nerf
const NEGATIVE_CONTEXT_KEYWORDS = [
    'cooldown', 'cost', 'delay', 'degeneration', 'spread', 'recoil',
    'penalty', 'charge required', 'reload time', 'recovery', 'cast time',
    'lock-on time'
];

/**
 * Detecta el tipo de cambio basado en el texto.
 * @param {string} text - Texto del cambio
 * @returns {'buff'|'nerf'|'new'|'rework'|'adjust'} - Tipo de cambio
 */
function detectChangeType(text) {
    const lower = text.toLowerCase();

    // 1. Absolutos: Rework y New
    if (CHANGE_TYPE_KEYWORDS.rework.some(k => lower.includes(k))) return 'rework';
    if (CHANGE_TYPE_KEYWORDS.new.some(k => lower.includes(k))) return 'new';

    // 2. Buffs y Nerfs
    let isBuff = CHANGE_TYPE_KEYWORDS.buff.some(k => lower.includes(k));
    let isNerf = CHANGE_TYPE_KEYWORDS.nerf.some(k => lower.includes(k));

    // Si contiene "bonus" pero también un verbo de nerf claro, predomina el nerf
    if (isBuff && isNerf && lower.includes('bonus')) {
        const hasClearNerfVerb = ['reduced', 'decreased', 'lowered', 'removed'].some(v => lower.includes(v));
        if (hasClearNerfVerb) {
            isBuff = false;
        }
    }

    const hasNegativeContext = NEGATIVE_CONTEXT_KEYWORDS.some(k => lower.includes(k));

    if (isBuff && isNerf) return 'adjust'; // Conflicto

    // 3. Invertir lógica si es un atributo negativo (ej: reducción de enfriamiento = buff)
    if (hasNegativeContext) {
        if (isNerf) return 'buff'; // "reduced" + "cooldown" = buff
        if (isBuff) return 'nerf'; // "increased" + "cooldown" = nerf
    } else {
        if (isBuff) return 'buff';
        if (isNerf) return 'nerf';
    }

    return 'adjust'; // Tipo por defecto
}

/**
 * Parsea las secciones del HTML secuencialmente.
 * @param {CheerioAPI} $ - Instancia de Cheerio
 * @returns {Object} - Datos de las diferentes secciones
 */
/**
 * Parsea las secciones del HTML secuencialmente para un contenedor específico (un parche o todo el documento).
 * @param {CheerioAPI} $ - Instancia de Cheerio
 * @param {Cheerio} [container] - Contenedor del parche específico (si lo hay)
 * @returns {Object} - Datos de las diferentes secciones
 */
/**
 * Parsea un bloque genérico único de actualización (sea el cuerpo principal de la sección o un bloque PatchNotesGeneralUpdate).
 * @param {CheerioAPI} $ 
 * @param {string} name - Nombre o título del bloque
 * @param {Cheerio} $descContainer - Contenedor de la descripción/contenido del bloque
 * @returns {Object|null}
 */
function parseSingleGenericBlock($, name, $descContainer) {
    if (!$descContainer || $descContainer.length === 0) return null;
    
    const changes = [];
    const children = $descContainer.children();
    
    let lastParagraphText = '';
    let introParagraphs = [];
    
    children.each((idx, child) => {
        const $child = $(child);
        const tagName = child.tagName.toLowerCase();
        
        const isTextTag = ['p', 'h4', 'h5', 'h6', 'span', 'strong', 'em'].includes(tagName);
        
        if (isTextTag) {
            const text = $child.text().trim();
            if (text) {
                lastParagraphText = text;
                if (changes.length === 0) {
                    introParagraphs.push(text);
                }
            }
        } else if (tagName === 'ul' || tagName === 'ol') {
            const details = [];
            $child.find('li').each((liIdx, li) => {
                const text = $(li).text().trim();
                if (text) details.push(text);
            });
            
            if (details.length > 0) {
                let changeTitle = name;
                if (lastParagraphText) {
                    changeTitle = lastParagraphText;
                    if (changeTitle.length > 120) {
                        const sentences = changeTitle.split(/[.!?]\s+/);
                        const lastSentence = sentences[sentences.length - 1] || sentences[0];
                        if (lastSentence && lastSentence.length < 120) {
                            changeTitle = lastSentence;
                        } else {
                            changeTitle = changeTitle.substring(0, 117) + '...';
                        }
                    }
                    changeTitle = changeTitle.replace(/[-:]$/, '').trim();
                }
                
                changes.push({
                    title: changeTitle,
                    type: detectChangeType(changeTitle + ' ' + details.join(' ')),
                    details: details
                });
            }
        }
    });
    
    if (changes.length === 0 && introParagraphs.length > 0) {
        changes.push({
            title: name,
            type: detectChangeType(name + ' ' + introParagraphs.join(' ')),
            details: introParagraphs
        });
    }
    
    return {
        name: name,
        desc: introParagraphs.join('\n\n'),
        changes: changes
    };
}

/**
 * Parsea sub-secciones genéricas (ej. mapas o actualizaciones generales que no son héroes directos)
 * @param {CheerioAPI} $ 
 * @param {Cheerio} $el 
 * @returns {Array<Object>}
 */
function parseGenericUpdateSection($, $el) {
    const items = [];
    
    // 1. Parsea la descripción principal de la sección si tiene listas (ul/ol)
    const sectionDesc = $el.find('> .PatchNotes-sectionDescription, > div > .PatchNotes-sectionDescription').first();
    if (sectionDesc.length > 0) {
        const sectionTitle = $el.find('h4.PatchNotes-sectionTitle').first().text().trim() || 'General';
        const item = parseSingleGenericBlock($, sectionTitle, sectionDesc);
        if (item && item.changes.length > 0) {
            items.push(item);
        }
    }
    
    // 2. Parsea cada bloque PatchNotesGeneralUpdate
    $el.find('.PatchNotesGeneralUpdate').each((idx, blockEl) => {
        const $block = $(blockEl);
        const title = $block.find('.PatchNotesGeneralUpdate-title').first().text().trim() || 'General';
        const descContainer = $block.find('.PatchNotesGeneralUpdate-description').first();
        
        const item = parseSingleGenericBlock($, title, descContainer);
        if (item) {
            items.push(item);
        }
    });
    
    return items;
}

function parseSections($, container) {
    const data = {
        stadium: { intro: '', roles: { 'Tanque': [], 'Daño': [], 'Apoyo': [] }, generalItems: [] },
        gameBase: { intro: '', roles: { 'Tanque': [], 'Daño': [], 'Apoyo': [] }, generalItems: [] },
        maps: [],
        system: [],
        bugFixes: []
    };

    let currentContext = 'gameBase';

    const roleMap = {
        'tank': 'Tanque',
        'damage': 'Daño',
        'support': 'Apoyo'
    };

    const HERO_ROLE_MAP = {
        // Tanks
        'd.va': 'Tanque', 'dva': 'Tanque', 'doomfist': 'Tanque', 'junker queen': 'Tanque', 'junker-queen': 'Tanque',
        'mauga': 'Tanque', 'orisa': 'Tanque', 'ramattra': 'Tanque', 'reinhardt': 'Tanque', 'roadhog': 'Tanque',
        'sigma': 'Tanque', 'winston': 'Tanque', 'wrecking ball': 'Tanque', 'wrecking-ball': 'Tanque', 'zarya': 'Tanque',
        'hazard': 'Tanque', 'domina': 'Tanque',

        // Damage
        'ashe': 'Daño', 'bastion': 'Daño', 'cassidy': 'Daño', 'echo': 'Daño', 'genji': 'Daño',
        'hanzo': 'Daño', 'junkrat': 'Daño', 'mei': 'Daño', 'pharah': 'Daño', 'reaper': 'Daño',
        'sojourn': 'Daño', 'soldier: 76': 'Daño', 'soldier-76': 'Daño', 'sombra': 'Daño', 'symmetra': 'Daño',
        'torbjörn': 'Daño', 'torbjorn': 'Daño', 'tracer': 'Daño', 'widowmaker': 'Daño', 'venture': 'Daño',
        'freja': 'Daño', 'vendetta': 'Daño', 'sierra': 'Daño', 'emre': 'Daño', 'shion': 'Daño', 'anran': 'Daño',

        // Support
        'ana': 'Apoyo', 'baptiste': 'Apoyo', 'brigitte': 'Apoyo', 'illari': 'Apoyo', 'juno': 'Apoyo',
        'kiriko': 'Apoyo', 'lifeweaver': 'Apoyo', 'lúcio': 'Apoyo', 'lucio': 'Apoyo', 'mercy': 'Apoyo',
        'moira': 'Apoyo', 'zenyatta': 'Apoyo', 'jetpack cat': 'Apoyo', 'jetpack-cat': 'Apoyo',
        'wuyang': 'Apoyo', 'mizuki': 'Apoyo'
    };

    const sections = container ? container.find('.PatchNotes-section') : $('.PatchNotes-section');

    sections.each((i, el) => {
        const $el = $(el);
        const isGeneric = $el.hasClass('PatchNotes-section-generic_update');
        const isHero = $el.hasClass('PatchNotes-section-hero_update');
        const title = $el.find('h4.PatchNotes-sectionTitle').first().text().trim();
        const titleLower = title.toLowerCase();

        // Actualizar contexto basado en palabras clave del título
        const hasBugFix = titleLower.includes('bug');
        const hasStadium = titleLower.includes('stadium');
        const hasHero = titleLower.includes('hero') || titleLower.includes('balance') || titleLower.includes('hotfix') || titleLower.includes('gameplay');
        const hasMap = titleLower.includes('map');

        if (hasBugFix) {
            currentContext = 'bugFixes';
        } else if (hasStadium) {
            if (titleLower.includes('item')) {
                currentContext = 'stadiumGeneral';
            } else {
                currentContext = 'stadium';
            }
        } else if (hasHero) {
            currentContext = 'gameBase';
        } else if (hasMap) {
            currentContext = 'maps';
        }

        if (isGeneric) {
            const descContainer = $el.find('.PatchNotesGeneralUpdate-description, .PatchNotes-sectionDescription');
            if (currentContext === 'bugFixes') {
                descContainer.find('li').each((j, li) => {
                    const text = $(li).text().trim();
                    if (text) data.bugFixes.push(text);
                });
            } else {
                const parsedItems = parseGenericUpdateSection($, $el);
                
                // Conservar tarjetas de héroe internas si las hay
                $el.find('.PatchNotesHeroUpdate').each((j, heroEl) => {
                    const item = parseHeroElement($, $(heroEl));
                    if (item && item.name) {
                        parsedItems.push(item);
                    }
                });

                if (currentContext === 'stadium' || currentContext === 'stadiumGeneral') {
                    data.stadium.generalItems.push(...parsedItems);
                } else {
                    data.gameBase.generalItems.push(...parsedItems);
                }

                // Guardar la intro
                const firstParagraph = descContainer.find('> p').first().text().trim();
                if (currentContext === 'stadium' || currentContext === 'stadiumGeneral') {
                    data.stadium.intro = firstParagraph || descContainer.text().trim();
                } else {
                    data.gameBase.intro = firstParagraph || descContainer.text().trim();
                }
            }
        } else if (isHero) {
            const roleKey = titleLower; // "tank", "damage", "support"
            const parsedRole = roleMap[roleKey];

            $el.find('.PatchNotesHeroUpdate').each((j, heroEl) => {
                const hero = parseHeroElement($, $(heroEl));
                if (hero && hero.name) {
                    // Determinar rol usando nuestro diccionario estricto
                    const matchedRole = HERO_ROLE_MAP[hero.name.toLowerCase().trim()];
                    const role = matchedRole || parsedRole || 'Daño';

                    // Si no estamos en un contexto válido de héroes, inferir por el título
                    let destContext = currentContext;
                    if (destContext !== 'stadium' && destContext !== 'stadiumGeneral' && destContext !== 'gameBase') {
                        if (titleLower.includes('stadium')) {
                            destContext = 'stadium';
                        } else {
                            destContext = 'gameBase';
                        }
                    }

                    if (destContext === 'stadium' || destContext === 'stadiumGeneral') {
                        data.stadium.roles[role].push(hero);
                    } else {
                        data.gameBase.roles[role].push(hero);
                    }
                }
            });
        }
    });

    return data;
}

/**
 * Parsea un elemento de héroe genérico.
 * @param {CheerioAPI} $ 
 * @param {Cheerio} $hero 
 * @returns {Object} - Datos del héroe
 */
function parseHeroElement($, $hero) {
    const portrait = $hero.find('.PatchNotesHeroUpdate-icon').first().attr('src');
    const hero = {
        name: $hero.find('.PatchNotesHeroUpdate-name').first().text().trim(),
        desc: $hero.find('.PatchNotesHeroUpdate-dev').first().text().trim(),
        portrait: portrait || null,
        changes: []
    };

    // General / Perk updates
    const generalUpdatesContainer = $hero.find('.PatchNotesHeroUpdate-generalUpdates');
    if (generalUpdatesContainer.length > 0) {
        const hasParagraphs = generalUpdatesContainer.children('p').length > 0;

        if (hasParagraphs) {
            // New sibling-based structure: <p>Title</p> followed by <ul><li>Detail</li></ul>
            let currentTitle = '';
            generalUpdatesContainer.children().each((idx, childEl) => {
                const $child = $(childEl);
                if ($child.is('p')) {
                    currentTitle = $child.text().trim();
                } else if ($child.is('ul')) {
                    const details = [];
                    $child.find('li').each((liIdx, liEl) => {
                        const text = $(liEl).text().trim();
                        if (text) details.push(text);
                    });

                    if (currentTitle || details.length > 0) {
                        hero.changes.push({
                            title: currentTitle || (details.length > 0 ? details[0] : 'General'),
                            type: detectChangeType(currentTitle + ' ' + details.join(' ')),
                            details: details.length > 0 ? details : [currentTitle]
                        });
                        currentTitle = ''; // consumed
                    }
                }
            });
            // If any leftover title
            if (currentTitle) {
                hero.changes.push({
                    title: currentTitle,
                    type: detectChangeType(currentTitle),
                    details: [currentTitle]
                });
            }
        } else {
            // Old nested structure: ul > li > ul > li
            generalUpdatesContainer.find('> ul > li').each((i, li) => {
                const $li = $(li);
                let title = $li.contents().not('ul').text().trim();
                title = title.replace(/[-:]$/, '').trim();

                const details = [];
                $li.find('ul li').each((j, detailLi) => {
                    const detailText = $(detailLi).text().trim();
                    if (detailText) details.push(detailText);
                });

                if (!title && details.length === 0) {
                    title = $li.text().trim();
                }

                if (title || details.length > 0) {
                    hero.changes.push({
                        title: title || (details.length > 0 ? details[0] : 'General'),
                        type: detectChangeType(title + ' ' + details.join(' ')),
                        details: details.length > 0 ? details : [title]
                    });
                }
            });
        }
    }

    // Ability updates
    $hero.find('.PatchNotesAbilityUpdate').each((i, abilityEl) => {
        const $ability = $(abilityEl);
        const title = $ability.find('.PatchNotesAbilityUpdate-name').first().text().trim();
        const icon = $ability.find('.PatchNotesAbilityUpdate-icon').first().attr('src');
        const details = [];
        $ability.find('.PatchNotesAbilityUpdate-detailList ul li').each((j, detailLi) => {
            const detailText = $(detailLi).text().trim();
            if (detailText) details.push(detailText);
        });

        if (title || details.length > 0) {
            hero.changes.push({
                title: title || (details.length > 0 ? details[0] : 'Ability'),
                type: detectChangeType(title + ' ' + details.join(' ')),
                details: details.length > 0 ? details : [title],
                icon: icon || null
            });
        }
    });

    return hero;
}

/**
 * Extrae la versión del parche del HTML de forma acotada.
 * @param {CheerioAPI} $ 
 * @param {Cheerio} [container] - Contenedor del parche
 * @returns {string} - Versión del parche
 */
function parseVersion($, container) {
    const context = container || $('body');
    const versionText = context.find('.patch-version, .PatchNotes-patchTitle, h1, h2, h3, h4').text() || $('title').text();
    const match = versionText.match(/\d+\.\d+\.\d+/);
    return match ? match[0] : 'unknown';
}

/**
 * Extrae la fecha del parche desde el título del parche en formato YYYY-MM-DD.
 * @param {string} title 
 * @returns {string|null}
 */
function parseDateFromTitle(title) {
    const months = {
        january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
        july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
        enero: 1, febrero: 2, marzo: 3, abril: 4, mayo: 5, junio: 6,
        julio: 7, agosto: 8, septiembre: 9, octubre: 10, noviembre: 11, diciembre: 12
    };
    const match = title.match(/\b(january|february|march|april|may|june|july|august|september|october|november|december|enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\s+(\d{1,2}),?\s+(\d{4})/i);
    if (match) {
        const month = months[match[1].toLowerCase()];
        const day = match[2].padStart(2, '0');
        const year = match[3];
        return `${year}-${String(month).padStart(2, '0')}-${day}`;
    }
    return null;
}

/**
 * Función principal de parseo. Devuelve un array de parches encontrados en el HTML.
 * @param {string} html - HTML de la página de Blizzard
 * @param {string} [defaultDate] - Fecha por defecto
 * @returns {Array<Object>} - Lista de objetos de parche
 */
function parseHTML(html, defaultDate) {
    const $ = cheerio.load(html);
    const patches = [];

    const patchElements = $('.PatchNotes-patch');
    if (patchElements.length > 0) {
        patchElements.each((i, patchEl) => {
            const $patch = $(patchEl);
            const title = $patch.find('.PatchNotes-patchTitle, h3, h4').first().text().trim();
            const date = parseDateFromTitle(title) || defaultDate || new Date().toISOString().split('T')[0];
            const version = parseVersion($, $patch);

            console.log(`🏟️  Parseando patch de fecha: ${date} (${title})...`);
            const sectionsData = parseSections($, $patch);

            patches.push({
                version,
                date,
                title: `Actualización del ${formatDateDay(date)}`,
                sections: sectionsData
            });
        });
    } else {
        // Fallback: tratar toda la página como un solo parche
        const date = defaultDate || new Date().toISOString().split('T')[0];
        const version = parseVersion($);
        console.log(`🏟️  Fallback: Parseando toda la página como un solo parche para fecha ${date}...`);
        const sectionsData = parseSections($);
        patches.push({
            version,
            date,
            title: `Actualización del ${formatDateDay(date)}`,
            sections: sectionsData
        });
    }

    return patches;
}

/**
 * Formatea una fecha YYYY-MM-DD para mostrar día y mes en español.
 */
function formatDateDay(dateStr) {
    if (!dateStr) return 'Parche';
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const [year, month, day] = dateStr.split('-');
    return `${day ? parseInt(day, 10) + ' de ' : ''}${months[parseInt(month, 10) - 1]} ${year}`;
}

module.exports = { parseHTML, detectChangeType };
