const patchData = {
    "Intro": {
        desc: "Esta actualización tiene como objetivo refrescar el meta de Stadium y agregar más variedad de builds, especialmente para muchos de los héroes que han tenido opciones viables limitadas desde el lanzamiento de Stadium. Todos los héroes reciben cambios, y varios obtienen reworks a gran escala. Las restricciones de grupo se han eliminado de Stadium Ranked debido a que impedían jugar con amigos sin ser efectivas para el emparejamiento."
    },
    "Tanque": [
        {
            name: "D.Va",
            desc: "Estos cambios buscan darle a D.Va una opción más orientada al Piloto, mejorando su build de Misiles y abriendo su itemización.",
            changes: [
                { title: "Express Detonation (Poder)", details: ["Añadido '+50% de Radio a Llamar a Meca'."] },
                { title: "Legendary Loadout (Poder)", details: ["Daño extra de explosión incrementado a 375% (antes 325%)."] },
                { title: "Multitask Mod (Poder)", details: ["Reformado a Poder."] },
                { title: "Nano Cola Nitrous (Poder)", details: ["Reformado a Poder.", "Ahora: 'Mientras estás eyectado del Meca, ganas 40% de Vida Máxima y 30% de Velocidad'."] },
                { title: "Party Protector (Poder)", details: ["Eliminado."] },
                { title: "Ultrawide Matrix (Poder)", details: ["Eliminado."] },
                { title: "Mastermind's Mitigator (Objeto Raro)", details: ["Añadido 10% de Robo de Vida de Habilidad."] },
                { title: "Busan Blaster (Objeto Épico)", details: ["Costo reducido a 9000 (antes 10000).", "Eliminado 20% Poder de Habilidad.", "Añadido 50 de Armadura.", "Daño explosivo reducido a 60.", "Ahora genera Carga de Definitiva."] },
                { title: "Dae-Hyun's Detonator (Objeto Épico)", details: ["Costo aumentado a 9000.", "Rareza aumentada a Épico.", "Eliminado 15% Robo de Vida.", "Añadido 15% Carga de Definitiva inicial y 25 Armadura."] },
                { title: "Macro Missile (Objeto Épico)", details: ["Eliminado."] },
                { title: "Onslaught Ordnance (Objeto Épico)", details: ["Costo reducido a 10000.", "Poder de Habilidad reducido a 10%."] }
            ]
        },
        {
            name: "Doomfist",
            desc: "Mejoras en sus poderes menos usados. Jab Cross fue reformado para permitir más Poder de Arma y builds híbridas.",
            changes: [
                { title: "Aftershock (Poder)", details: ["Daño reducido al 40% (antes 60%)."] },
                { title: "Asteroid Smash (Poder)", details: ["Ahora atrae hacia abajo a los enemigos en su área.", "Daño Máximo disminuido a 150.", "Daño base de impacto aumentado a 75."] },
                { title: "Jab Cross (Poder)", details: ["Ahora otorga Velocidad de Ataque extra (no solo cuerpo a cuerpo).", "Duración reducida a 0.75s."] },
                { title: "Slam Wham (Poder)", details: ["Reformado: Aumenta el daño de Golpe Sísmico hasta un 75% y su rango hasta un 50% basado en el tiempo en el aire.", "Añadido indicador de UI."] },
                { title: "The Bestest Defense (Poder)", details: ["Escalado incrementado a 50% (antes 35%)."] },
                { title: "Loaded Knuckles (Objeto Épico)", details: ["Eliminado 20% Daño Cuerpo a Cuerpo.", "Añadido 15% Poder de Arma."] },
                { title: "Wing Clipper (Objeto Raro)", details: ["Eliminado."] },
                { title: "Power Bank (Objeto Raro)", details: ["Eliminada la ralentización después de cargar pasado el umbral."] },
                { title: "Second Wind (Objeto Raro)", details: ["Nuevo: 25 de Vida, 20% Reducción Coste Definitiva. Gastar tu Definitiva reinicia todos los enfriamientos de habilidades y restaura el 100% de la Vida."] },
                { title: "Chasmcrusher (Objeto Épico)", details: ["Añadido 'Puedes Saltar en el aire durante Golpe Sísmico'."] }
            ]
        },
        {
            name: "Hazard",
            desc: "Cambios para darle a Hazard una build viable de Poder de Arma y centrar Guardia de Púas.",
            changes: [
                { title: "Barbed Shot (Poder)", details: ["Daño extra ahora escala con Poder de Arma.", "Daño extra reducido a 8."] },
                { title: "Bonerot (Poder)", details: ["Reformado: Hacer 6 instancias de Daño de Arma marca al objetivo con púas. Golpe Rápido y Salto Violento las detonan por 50(PA) daño."] },
                { title: "Boomslang's Blaster (Poder)", details: ["Cambiado de Objeto a Poder."] },
                { title: "Bunny Hop (Poder)", details: ["Añadido 'otorga a los aliados Sobrecuración igual al 10% de tu Vida Máxima por 3s' al usar Salto Violento."] },
                { title: "Hit Me Again (Poder)", details: ["Eliminado."] },
                { title: "Juiced (Poder)", details: ["Curación cambiada a 30% de la Vida Máxima sobre 3s."] },
                { title: "Slasher (Poder)", details: ["Eliminada la Carga de Definitiva incrementada.", "Rango para ignorar al enemigo reducido a 7m."] },
                { title: "Twin Fang (Poder)", details: ["Reformado: Cada 3er disparo de Espolón Óseo dispara un tiro adicional con 50% de daño."] },
                { title: "Woof Woof (Poder)", details: ["Reformado: Después de usar Salto Violento, aumenta el Rango de Guardia de Púas un 50% por 3s."] },
                { title: "Skewer Bloom (Objeto Raro)", details: ["Eliminado."] },
                { title: "Blood Needle (Objeto Épico)", details: ["Costo disminuido a 9500.", "Curación Vida Máxima aumentada a 0.5%.", "Recurso Máximo de Curación eliminado.", "Salud cambiada a Armadura."] },
                { title: "Spine Protector (Objeto Épico)", details: ["Costo reducido a 9500.", "Robo de Vida de Arma aumentado a 10%."] },
                { title: "Susannah's Support (Objeto Épico)", details: ["Costo reducido a 9000.", "Daño Mitigado convertido a curación aumentado a 25%."] }
            ]
        },
        {
            name: "Junker Queen",
            desc: "Mejorando la build de Cuchilla Dentada y potenciando Bow Down.",
            changes: [
                { title: "Blade Parade (Poder)", details: ["Puede mantenerse 1s más tras carga completa.", "Daño adicional reducido a 75%.", "Aumenta velocidad del proyectil según el tiempo cargado hasta 200%.", "Ya no empuja."] },
                { title: "Bow Down (Poder)", details: ["Añadido 'Mientras lanzas Masacre, te vuelves Imparable y reinicias todos los cooldowns'.", "Duración de derribo aumentada a 2s."] },
                { title: "Cut 'Em Gracie (Poder)", details: ["Reformado: Cada enemigo golpeado por Cuchilla Dentada reduce su enfriamiento 1s. Al retirarla su radio aumenta 100% y hace 40 daño de impacto."] },
                { title: "Merciless Magnetism (Poder)", details: ["Reformado: Cuchilla Dentada puede asestar críticos con 50% daño extra. Fuerza de arrastre aumentada 50%. Al hacer crítico, el bono se duplica."] },
                { title: "Tinker Tracksuit (Objeto Épico)", details: ["Costo aumentado a 10500.", "Añadida 50 Vida.", "Eliminada 5% Reducción de Enfriamiento.", "Reformado: Cuchilla Dentada, Masacre y Carnicería otorgan 20% Poder de Habilidad por 5s."] },
                { title: "Thick Skull (Objeto Épico)", details: ["Costo reducido a 9000.", "Reducción de daño también se activa al lanzar Cuchilla Dentada.", "Reducción de daño disminuida a 30% (antes 75%)."] }
            ]
        },
        {
            name: "Orisa",
            desc: "Opciones para Poder de Arma más específico y Jabalina.",
            changes: [
                { title: "Core Cooling (Poder)", details: ["Nuevo: 'Mientras Fortificación está activa, reduce Calor generado en 90% y gana 10% Vel. Ataque'."] },
                { title: "Critical Charger (Poder)", details: ["Nuevo: 'Jabalina de Energía asesta críticos con 50% daño extra. Se puede cargar para 200% vel. de proyectil y perfora enemigos'."] },
                { title: "Factory Reset / Hot Rotate-O / Javelin Overclock (Poderes)", details: ["Eliminados."] },
                { title: "Hooves of Steel (Poder)", details: ["Reformado: Tras Fortificación, gana Escudos iguales al 60% del Daño de Arma hecho durante Fortificación, hasta 200."] },
                { title: "Lassoed (Poder)", details: ["Añadido 'Gana 3% Carga Definitiva por cada enemigo atraído'."] },
                { title: "Oladele-Copter Blades (Poder)", details: ["Reformado a Poder. Mientras usas Giro de Jabalina y Sobrecarga de Terra, obtienes Vuelo Libre y 20% Vel. de Movimiento, pero Sobrecarga hace 50% menos daño."] },
                { title: "Optimized Energy (Objeto Raro)", details: ["Eliminado."] },
                { title: "Electro-Lights (Objeto Épico)", details: ["Costo incrementado a 11000. Rareza aumentada a Épico."] },
                { title: "OR-15 Escalator (Objeto Épico)", details: ["Nuevo: 10% Robo de Vida Arma. Gana Poder de Arma basado en Calor hasta 30%. Costo 10000."] },
                { title: "3-D Printed Lance (Objeto Épico)", details: ["Costo reducido a 10000. Añadido 50 Armadura. Poder de Habilidad reducido a 10%. Ya no genera calor en Jabalina. Reducción de CD en Jabalina aumentada a 20%."] },
                { title: "Siphonic Spear (Objeto Raro)", details: ["Curación de Vida Máx reducida a 5%. Duración de curación reducida a 2s."] },
                { title: "Solar Regenergy (Objeto Raro)", details: ["Costo aumentado a 5000."] },
                { title: "Efi's Theorem (Objeto Épico)", details: ["Eliminado 20% Robo de Vida Habilidad."] }
            ]
        },
        {
            name: "Ramattra",
            desc: "Ajustes de equilibrio.",
            changes: [
                { title: "Omnium Augment (Objeto Raro)", details: ["Costo incrementado a 5000."] },
                { title: "Nano-Mender (Objeto Épico)", details: ["Costo reducido a 9000."] },
                { title: "Swirling Ward (Objeto Épico)", details: ["La altura de salto aumentada ahora solo te afecta a ti y no a tus aliados."] }
            ]
        },
        {
            name: "Reinhardt",
            desc: "Nuevas opciones para Campo Protector y Carga.",
            changes: [
                { title: "Amplification Barrier / Vanguard (Poderes)", details: ["Eliminados."] },
                { title: "Barrier Reconstruction (Poder)", details: ["La restauración de vida del escudo ahora se activa con todo Daño Cuerpo a Cuerpo, no solo el Martillo."] },
                { title: "Crusader Slam (Poder)", details: ["Nuevo: Mientras Campo Protector está activo, usa Disparo Principal para lanzar enemigos y hacer Daño Cuerpo a Cuerpo igual a 5% de la Vida del Campo."] },
                { title: "Iron Drift (Poder)", details: ["Nuevo: +200% Duración de Carga. La Carga puede atrapar múltiples enemigos a la vez y puede ralentizarse aguantando hacia atrás."] },
                { title: "Dampener Grip (Objeto Épico)", details: ["Costo incrementado a 11000."] },
                { title: "Plan Z (Objeto Épico)", details: ["Costo reducido a 10000."] },
                { title: "Phoenix Protocol (Objeto Épico)", details: ["Vida aumentada a 50."] },
                { title: "Wilhelmwagen (Objeto Épico)", details: ["Costo reducido a 9500."] }
            ]
        },
        {
            name: "Sigma",
            desc: "Mayor agencia en enfrentamientos difíciles y mejora a Acreción.",
            changes: [
                { title: "Apogee Alignment (Poder)", details: ["Daño incrementado al 75%. (antes 50%)."] },
                { title: "Mass Driver (Poder)", details: ["Daño de Acreción incrementado a 25% daño adicional.", "Curación de Barrera Experimental aumentada a 150."] },
                { title: "Zero Gravity (Poder)", details: ["Eliminada 10% reducción daño.", "Duración aumentada a 2.5s.", "El Vuelo ahora también se activa al usar Gadget."] },
                { title: "The Harness (Objeto Épico)", details: ["Añadido: Si Acreción falla, su cooldown se reduce 4s."] }
            ]
        },
        {
            name: "Winston",
            desc: "Mejoras a Disparo Secundario y Salto Potenciado.",
            changes: [
                { title: "Base", details: ["El Proyector de Barrera ahora escala con Poder de Habilidad y ya no escala con Moneda Pasiva."] },
                { title: "Circuit Breaker (Poder)", details: ["Robo Vida Eléctrico reducido a 10%. Eliminado daño eléctrico aumentado."] },
                { title: "Electro Cluster (Poder)", details: ["Rango reducido a 15%."] },
                { title: "Lightning Rod (Poder)", details: ["Rango de rebote aumentado a 8m."] },
                { title: "Lunar Leap (Poder)", details: ["Carga Definitiva por objetivo golpeado aumentada a 3%."] },
                { title: "Lucheng Launchers (Poder)", details: ["Reformado: El daño del Salto se vuelve Eléctrico y puede aumentar hasta 75% daño en el aire. El bono se duplica en Rabia Primigenia."] },
                { title: "Primal Punch (Poder)", details: ["Cooldown del Salto también se reinicia por eliminaciones del Secundario del Cañón."] },
                { title: "Pocket Projector (Poder)", details: ["Vida del Mini Proyector aumentada a 10%."] },
                { title: "Surge Protector (Poder)", details: ["Reformado: Los aliados dentro del Proyector se curan por 30(PA) cada 1s."] },
                { title: "Volatile Volt (Poder)", details: ["Daño Crítico Secundario aumentado a 250%."] },
                { title: "Harold's Glasses (Objeto Épico)", details: ["Costo reducido a 11000. Añadida 50 Armadura y 10% Poder Arma. Durante Salto, Secundario hace 15% más daño y carga 75% más rápido."] },
                { title: "Horizon Expander (Objeto Épico)", details: ["Costo disminuido a 10000. Añadido 50 Armadura. Añadido +50% Duración Rabia Primigenia."] }
            ]
        },
        {
            name: "Zarya",
            desc: "Mejorando Barrera Proyectada y opciones de Disparo Secundario.",
            changes: [
                { title: "Charged Link (Poder)", details: ["Nuevo: Los aciertos del Secundario otorgan 2 de energía y aumenta rango del Principal un 20% por 3s."] },
                { title: "Graviton Anomaly (Poder)", details: ["Duración incrementada a 25% reducida (antes 50% reducida)."] },
                { title: "Here to Spot You (Poder)", details: ["Añadido +20% Rango Barrera Proyectada. Curación aumentada a 30%."] },
                { title: "Limit Breaker (Poder)", details: ["Energía Máxima aumentada a 150."] },
                { title: "Lynx's Datadrive (Objeto Épico)", details: ["Vida aumentada a 50."] },
                { title: "Particle Accelerator (Poder)", details: ["Velocidad Ataque Secundario base aumentada a 20%. Velocidad Ataque Adicional aumentada a 500%."] },
                { title: "Bigger Beam (Objeto Épico)", details: ["Eliminado."] },
                { title: "Piercing Beam (Objeto Épico)", details: ["Reformado a Objeto. Añadido 15% Poder de Arma y Costo 11000."] }
            ]
        }
    ],
    "Daño": [
        {
            name: "Ashe",
            desc: "Menos dependencia de Lentes Infrarrojos.",
            changes: [
                { title: "Base", details: ["Moneda por daño/curación reducida 5%. Daño base mira Viper reducido a 72."] },
                { title: "Calamity (Poder)", details: ["Munición restaurada aumentada a 25%. Disparos fallidos consumen cargas."] },
                { title: "Pin B.O.B (Poder)", details: ["Añadido 3s Cooldown para reactivar sin matar. Ahora carga a donde apunte la mira."] },
                { title: "Reload Therapy (Poder)", details: ["Cambiado de Restaurar a Curar."] },
                { title: "Stacked Sticks (Poder)", details: ["Vel. de quemadura más rápida aumentada a 40%."] },
                { title: "What in Tarnation (Poder)", details: ["Añadido: Si Recortada no hace daño, devuelve 3s de su cooldown."] },
                { title: "Objetos", details: ["Build a Blast Buckshot ahora cuesta 11000 y da Poder de Arma.", "B.O.B Wire Defense y Silver Lighter reducidos en costo/efecto.", "Infrared Lenses cuesta 12000 y el daño solo aplica a daño No-Quemadura."] }
            ]
        },
        {
            name: "Cassidy",
            desc: "Reduciendo consistencia, mejorando Abanicar el Martillo.",
            changes: [
                { title: "Base", details: ["Moneda de daño/cura aumentada 14.3%. Daño Pacificador base reducido a 65."] },
                { title: "Barrage Blastin' (Poder)", details: ["Nuevo: Al quedarse sin munición en Abanicar, recarga todo automáticamente y sigue disparando con 60% daño reducido."] },
                { title: "Gunslinger Grit (Poder)", details: ["Nuevo: Al recargar o restaurar munición, curas 2% Vida por cada munición."] },
                { title: "Hot Potato (Poder)", details: ["Distancia de tiro aumentada a 125%."] },
                { title: "Silver Bullet (Poder)", details: ["Nuevo: Abanicar reemplazado por un tiro perforante que hace 50(PA) de daño extra sobre 2.5s."] },
                { title: "Think Flasht (Poder)", details: ["Duración entorpecimiento reducida a 25%."] },
                { title: "Objetos", details: ["Quickload Chamber sube a Épico (13000), añade 20% Munición Máx.", "Frankie's Fixer cura 10% Vida Máxima sobre 3s tras Evasión."] }
            ]
        },
        {
            name: "Freja",
            desc: "Ajustes a daño de Take Aim.",
            changes: [
                { title: "Base", details: ["Daño base de explosión de Take Aim reducido a 75."] },
                { title: "Mighty Gust (Poder)", details: ["Daño incrementado a 60."] },
                { title: "Peak Performance (Poder)", details: ["Añadido: gana 20% Movimiento mientras estás en el aire."] },
                { title: "Objetos", details: ["Toxin Tips ahora da 10% Vel. Ataque y ralentización baja a 20%.", "Tracker Tags cuesta 5000 y la duración baja a 2s."] }
            ]
        },
        {
            name: "Genji",
            desc: "Mejoras para builds de Corte Veloz.",
            changes: [
                { title: "Cybernetic Speed (Poder)", details: ["Velocidad de Ataque por carga aumentada a 3%."] },
                { title: "Deflect-O-Bot (Poder)", details: ["Reformado: +200% Vel. Proyectil desviado. Desvía automáticamente hacia enemigos y en los primeros 0.3s hace 50% daño crítico extra."] },
                { title: "Dragon's Breath (Poder)", details: ["Hace 25% más daño a enemigos en el aire."] },
                { title: "Forged Under Fire (Poder)", details: ["Curación de desvío reducida a 100%."] },
                { title: "Laceration (Poder)", details: ["Por cada enemigo extra dañado por Corte Veloz, reduce su cooldown en 2s."] },
                { title: "Spirit of Sojiro (Poder)", details: ["+1s duración Desvío. Ahora desvía de ambos lados."] },
                { title: "Wyrm's Maw (Poder)", details: ["Tras hacer daño con Shuriken, tu próximo Corte Veloz gana 10% daño y 5% rango (x5)."] },
                { title: "Dragon Strike (Objeto Épico)", details: ["Nuevo: El primer golpe de Hoja del Dragón es un Corte Veloz amplio con 100% daño crítico adicional."] }
            ]
        },
        {
            name: "Junkrat",
            desc: "Reduciendo el uptime de Zip Grease, mejoras a la Mina.",
            changes: [
                { title: "Rainin' Lead (Poder)", details: ["Añadido +25% radio de explosión a Caos Total.", "Frecuencia de bombas baja a 0.35s."] },
                { title: "Rip Roll (Poder)", details: ["Activa Caos Total cuando Rueda Explosiva es destruida."] },
                { title: "Slapnel (Poder)", details: ["Reformado: Golpe Rápido detona una Mina infligiendo 20% daño, lanzándote y empujando."] },
                { title: "Successful Heist (Poder)", details: ["Nuevo: Por cada objetivo golpeado por la detonación de la Mina, reduce su cooldown en 0.5s."] },
                { title: "Zip Grease (Poder)", details: ["Reformado a Poder. Tiros reducidos con vel extra a 1."] },
                { title: "Objetos", details: ["Gachabomb cambiado a Objeto.", "Refreshing Radiation reduce duración Sobrecuración a 3s."] }
            ]
        },
        {
            name: "Mei",
            desc: "Nuevas opciones de Primario y Secundario.",
            changes: [
                { title: "Blizznado (Poder)", details: ["Los aliados en Ventisca curan por 8% de tu Vida Máx cada 1s."] },
                { title: "Deep Chills (Poder)", details: ["Nuevo: Golpear continuamente a un enemigo con el Bláster principal lo congelará por 0.75s."] },
                { title: "Slowball (Poder)", details: ["Reformado: Tras usar habilidad o gadget, tus próximos 2 Témpanos disparan una bola de nieve a 200% velocidad que aplica 30% ralentización."] },
                { title: "Himalayan Hat (Objeto Épico)", details: ["Mientras Ventisca esté activada, gana 20% Daño de Arma."] },
                { title: "Objetos", details: ["Snowboot cambia a Supervivencia y ahora activa en Ventisca."] }
            ]
        },
        {
            name: "Pharah",
            desc: "Ligeros retoques.",
            changes: [
                { title: "Nosedive (Poder)", details: ["Nuevo: Mientras estás en el aire, usa Agacharse para lanzarte al suelo y restaurar 50% combustible (6s CD)."] },
                { title: "Rocket Propellant (Objeto Épico)", details: ["90% Reducción de Daño Propio del Lanzacohetes. Tras usar habilidad, gana 75% de Empuje Propio del arma por 3s."] }
            ]
        },
        {
            name: "Reaper",
            desc: "Mejoras a Forma Espectral.",
            changes: [
                { title: "Harvest Fest (Poder)", details: ["Probabilidad aumentada a 20%. Restauración de Vida y Munición bajada a 15%. Ahora tiene protección de mala suerte."] },
                { title: "Hellshroud (Poder)", details: ["Nuevo: En Forma Espectral, atravesar enemigos los quema por 25% de tu Vida Máxima y reduce su vel. ataque/mov en 30% por 3s."] },
                { title: "Wall of Life and Death (Poder)", details: ["Nuevo: En Forma Espectral, te haces 50% más grande, bloqueas proyectiles y curas aliados en 6m por 35(PA)/s."] },
                { title: "Wraith Flight (Poder)", details: ["Reformado a Poder. Añadido 'presiona Saltar en el aire para planear'."] }
            ]
        },
        {
            name: "Sojourn",
            desc: "Poder centrado en el Deslizamiento.",
            changes: [
                { title: "Base", details: ["Daño base máx Disparo Cargado bajado a 115."] },
                { title: "Aftershock (Poder)", details: ["Reformado: Tiros al 100% o críticos activan una explosión de 50% daño a enemigos."] },
                { title: "Commotion Cycle (Poder)", details: ["Reduce cooldowns de TODAS las habilidades."] },
                { title: "Conductor Chase (Poder)", details: ["Reformado: Durante Deslizamiento, ganas 10% Carga Cañón y 50% Munición. La carga decae 75% más lento."] },
                { title: "Drill Kick (Poder)", details: ["Nuevo: +50% Vel. Deslizamiento. Durante Deslizamiento ganas 25% Red. Daño e infliges 75 daño a enemigos cercanos."] },
                { title: "Fine Tuned Thrusters (Poder)", details: ["+1s duración Deslizamiento. Las eliminaciones reinician el cooldown."] },
                { title: "Charge Convertor (Objeto Épico)", details: ["Nuevo: El Disparo Cargado otorga Poder Habilidad según carga gastada (hasta 40%)."] },
                { title: "Overclocked Surge (Objeto Épico)", details: ["Nuevo: En Sobrecarga, habilidades refrescan 300% más rápido. Eliminaciones extienden 2s."] }
            ]
        },
        {
            name: "Soldier: 76",
            desc: "Build de correr y disparar.",
            changes: [
                { title: "Base", details: ["Daño base Rifle bajado a 18."] },
                { title: "Aura Cloud / Biotic Bullseye", details: ["Campo biótico gana +40% radio. Estar dentro da 50% más Carga de Definitiva."] },
                { title: "Run and Gun (Poder)", details: ["Nuevo: Disparar y habilidades no interrumpen Sprint. Daño en Sprint otorga Movimiento y Robo Vida (hasta 25%)."] },
                { title: "Track and Field (Poder)", details: ["Reformado: En Sprint, habilidades refrescan 75% más rápido y restauras 15% Munición/s."] },
                { title: "No Visor Needed (Objeto Épico)", details: ["Nuevo: Visor Táctico ya no autoapunta, pero da 25% Vel. Ataque y 35% Daño Crítico."] }
            ]
        },
        {
            name: "Torbjörn",
            desc: "Puede lanzar su martillo.",
            changes: [
                { title: "Hammer Throw (Poder)", details: ["Nuevo: Lanza el Martillo de Forja con disparo secundario. 200% efectividad en Torretas y aliados."] },
                { title: "Turriplets (Poder)", details: ["Vel. Ataque aumentada a 75%."] },
                { title: "Anchor Bolts (Objeto Épico)", details: ["Nuevo: Las torretas se pueden pegar a paredes y techos."] }
            ]
        },
        {
            name: "Tracer",
            desc: "Doble efecto a Regresión.",
            changes: [
                { title: "Base", details: ["Daño Pistolas reducido a 5.25."] },
                { title: "Blink Hop (Poder)", details: ["Nuevo: Traslación viaja 3m más. En el aire otorga salto extra y reduce su cooldown."] },
                { title: "Chrono Stabilizer (Poder)", details: ["Nuevo: Tras Traslación, curas a aliados (40 PA) y a ti (10 PA)."] },
                { title: "Quantum Reload (Poder)", details: ["Nuevo: Al usar Regresión, ganas Munición igual al 100% que decae."] },
                { title: "Temportal (Poder)", details: ["Reformado: Regresión deja Portal Temporal. Hasta 3 aliados (y Tracer) pueden interactuar para volver en el tiempo 1s."] },
                { title: "Chrono Bomb (Objeto Épico)", details: ["Reformado: Roba 20% Vel Ataque y Movimiento de enemigos pegados con Bomba."] }
            ]
        },
        {
            name: "Vendetta",
            desc: "Mejoras a opciones nicho.",
            changes: [
                { title: "Apex Bloodlust (Poder)", details: ["Nuevo: Ganas 5% Robo Vida y enfriamientos recargan 5% más rápido por carga Onslaught."] },
                { title: "Cataclisma (Poder)", details: ["Daño de Soaring Slice también activa la explosión."] },
                { title: "Skycut (Poder)", details: ["Tras Soaring Slice, tu próximo Palatine Fang dispara un Projected Edge con 75% daño."] },
                { title: "Undying Fury (Poder)", details: ["Reformado: Si murieras, quedas Entorpecido y doblas tus cargas de Onslaught y Robo de Vida."] }
            ]
        }
    ],
    "Apoyo": [
        {
            name: "Ana",
            desc: "Mejoras a Dardo Sedante.",
            changes: [
                { title: "Dream Field (Poder)", details: ["Nuevo: Aciertos de Dardo Sedante te curan a ti y aliados por 10% Vida Máx por 5s."] },
                { title: "Home Remedy (Poder)", details: ["Reformado: +30% Radio Granada. Granada aplica Sobrecuración igual a 30% Vida Máx."] },
                { title: "Target Tracker (Objeto Épico)", details: ["Costo 12000. 10% Poder de Arma y 10% Red Cooldown."] },
                { title: "Dash Boots (Objeto Épico)", details: ["Costo 10000. Cooldown sube a 5s."] }
            ]
        },
        {
            name: "Brigitte",
            desc: "Nerf general de supervivencia.",
            changes: [
                { title: "Burst Aid (Poder)", details: ["Reformado: Usa Recargar para consumir 1 Pack de Reparación y curar 20% Vida Máxima con un burst de 50% Movimiento."] },
                { title: "God Ray (Poder)", details: ["Daño por metro aumentado a 5%."] }
            ]
        },
        {
            name: "Jetpack Cat",
            desc: "Ajustes de balance.",
            changes: [
                { title: "Ambidex-fur-ous (Poder)", details: ["Efectividad del disparo aumentada a 35%."] },
                { title: "Bouncing Biscuits (Poder)", details: ["Proyectil rebotado aumentado a 50%."] }
            ]
        },
        {
            name: "Juno",
            desc: "Opciones de utilidad para Hiper Anillo.",
            changes: [
                { title: "Marswalking (Poder)", details: ["Nuevo: Hiper Anillo se despliega de lado y da 250% Altura Salto. Se reduce su CD cuando un aliado lo pasa."] },
                { title: "Pulstar Destroyers (Poder)", details: ["Reformado a Poder. Ahora explota en aliados curando 20(PA)."] },
                { title: "Torpedo Glide (Poder)", details: ["Durante Planeo, daño (75) o cura (100) reducen CD de Pulsar."] },
                { title: "Boost Kick / Black Hole (Objetos)", details: ["Kick hace que el Melé tras Glide Boost empuje más y haga 50% más daño.", "Black Hole ralentiza enemigos que pasan el anillo un 35%."] }
            ]
        },
        {
            name: "Kiriko",
            desc: "Two-Zu es eliminado.",
            changes: [
                { title: "Two-Zu (Poder)", details: ["Eliminado."] },
                { title: "Foxy Fireworks (Poder)", details: ["Reformado: Tras usar habilidad o gadget, los próximos 3 Kunai explotan en área."] },
                { title: "Good Fortune (Poder)", details: ["Nuevo: Los Kunai lanzan 3 Ofudas de Sanación a un aliado frente a ti."] },
                { title: "Our Bikes (Poder)", details: ["Cambiado a Poder. Tras Carrera de Kitsune, refresca todas las habilidades."] }
            ]
        },
        {
            name: "Lúcio",
            desc: "Grandes bufos al Trotamuros (Wallride).",
            changes: [
                { title: "Beat Drop (Poder)", details: ["Reformado: Aterrizar con Barrera explota por 75(PA) daño. Si gastas Definitiva, daño se duplica."] },
                { title: "Hip Hop (Poder)", details: ["Cambiado a Poder. En Wallride o aire, habilidades refrescan 10% más rápido."] },
                { title: "Premium Streaming (Poder)", details: ["Nuevo: +50% Vel. Proyectil. Ganas 6% Vel. Ataque por cada aliado en Cambio de Pista y les curas."] },
                { title: "Rhythm Rail (Poder)", details: ["Nuevo: Wallride por 3s carga tu próxima Onda Sonora, aumentando empuje 25% y daño 75%."] },
                { title: "Vivace (Poder)", details: ["Reformado: Cada 0.5s de Wallride ganas 1% Velocidad por 5s, se acumula hasta 30 veces."] }
            ]
        },
        {
            name: "Mercy",
            desc: "Mejoras a Sanación Flash.",
            changes: [
                { title: "Battle Medic (Poder)", details: ["Tras cambiar a Bláster, ganas 20% Vel. Ataque y 20% Robo Vida por 2s por cada 1s curando."] },
                { title: "Distortion (Poder)", details: ["Al usar Sanación Flash, das Sobrecuración (30% Vida Máx) y empujas enemigos 5m."] },
                { title: "Double Dose (Poder)", details: ["Nuevo: Ganas 1 carga adicional de Sanación Flash. Activar Valquiria refresca una."] },
                { title: "Supply Surge (Poder)", details: ["Sanación Flash da 20% Movimiento, 100% CD refrescado, y 20% Robo Vida a ti y al aliado."] }
            ]
        },
        {
            name: "Moira",
            desc: "Nuevos estilos basados en Desvanecimiento.",
            changes: [
                { title: "Necrotic Orb (Poder)", details: ["Nuevo: Usar Recargar envía un Orbe (35 PA) y reduce daño enemigo 30% por 3s (8s CD)."] },
                { title: "Orbsplosion (Poder)", details: ["Nuevo: Vuelve a lanzar Orbe para detonarlo, curando/dañando un % de su capacidad máxima."] },
                { title: "Spectral Beam (Poder)", details: ["Nuevo: Atravesar enemigos en Desvanecimiento lanza Coalescencia al 60% por 1.25s."] },
                { title: "Void Hoppers (Poder)", details: ["Reformado: Atravesar a un objetivo te da 10% Vida Sobrecurada. Si es aliado, lo cura y lo desfasa."] }
            ]
        },
        {
            name: "Wuyang",
            desc: "Ajustes en Ola Guardiana.",
            changes: [
                { title: "Bifurcation (Poder)", details: ["Nuevo: Tu Corriente Restaurativa salta al anterior aliado con 100% curación. Puedes tener otra pasiva."] },
                { title: "Ripple Sense (Poder)", details: ["Nuevo: Orbe de Agua mejorado revela enemigos en 8m cada 5s."] },
                { title: "Waveshatter (Poder)", details: ["Nuevo: Ola Guardiana puede asestar críticos y aumenta anchura/efectividad viajando hacia abajo."] }
            ]
        },
        {
            name: "Zenyatta",
            desc: "Reducción de supervivencia extrema.",
            changes: [
                { title: "Enlightenment (Poder)", details: ["Paz Interior ahora reduce la curación de Enlightenment sobre ti."] },
                { title: "Sharpened Focus (Poder)", details: ["Nuevo: Secundario carga 20% más rápido. Ganas Sobrecuración y Velocidad por cada Orbe."] },
                { title: "Golden Monk (Objeto Épico)", details: ["Daño Melé te otorga 25% Vel Ataque por 1s."] }
            ]
        }
    ],
    "Objetos Generales y Mapas": [
        {
            name: "Objetos Generales y Gadgets",
            desc: "Contraestrategias mejoradas para composiciones pesadas.",
            changes: [
                { title: "El-Saka Suppressor", details: ["Reducción de curación sube a 35%."] },
                { title: "Cybervenom", details: ["Reducción de curación sube a 35%."] },
                { title: "Gadget Maximizer (Objeto Épico)", details: ["Nuevo: 10% PA, 5% Red. Enfriamiento, 25% Red. Gadget. Costo 9500."] },
                { title: "Three Tap Tommygun (Objeto Épico)", details: ["Reformado: Próximos 3 golpes de Arma hacen daño adicional igual al 5% Vida actual del objetivo sobre 5s."] },
                { title: "Siphon Snippet (Gadget Raro)", details: ["Nuevo: Empuja y aplica 35% Red Curación. +25 Sobrecuración por cada enemigo golpeado."] },
                { title: "Vortex Vial (Gadget Épico)", details: ["Nuevo: Coloca Vórtice que atrae enemigos abajo."] }
            ]
        },
        {
            name: "Nuevo Mapa",
            desc: "Oasis University se une a la arena.",
            changes: [
                { title: "Oasis University", details: ["Se ha añadido el punto de control de Oasis University al modo Stadium."] }
            ]
        }
    ]
};

// Modificamos ligeramente la lógica de JS para exportar los datos al index
if (typeof module !== 'undefined') {
    module.exports = patchData;
} else {
    window.patchData = patchData;
}
