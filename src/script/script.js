document.addEventListener('DOMContentLoaded', async () => {
    document.body.classList.add('inicio'); // Estado inicial de la clase 'inicio'

    const container = document.getElementById('cards-music');
    const textHello = document.querySelector('main h1'); // Si lo vas a usar, manténlo(efecto de respiracion al texto).
    const backgroundMusicDiv = document.getElementById('background-music'); // Usar esta variable directamente
    const audioPlayer = document.getElementById('audio-player'); // Reproductor de audio

    let currentPlayingSongId = null; // Variable para almacenar la canción que se está reproduciendo

    try {
        const response = await fetch('https://api.institutoalfa.org/api/songs');
        const songs = await response.json();
        const songList = Array.isArray(songs) ? songs : songs.songs;

        // Limpiamos el contenedor por si acaso (útil en desarrollo si recargas sin limpiar)
        container.innerHTML = '';

        // Almacenará todas las tarjetas DOM creadas
        const allCards = [];

        // Creamos TODAS las tarjetas y guardarlas en un array
        // Asignamos '--index' y el event listener A TODAS las tarjetas aquí
        songList.forEach((song, i) => {
            const card = document.createElement('div');
            card.className = 'tarjetas-musicales';
            const cover = song.image && song.image.url && song.image.url.startsWith('http') ? song.image.url : '/src/assets/photo_2024-08-22_17-15-22.jpg';
            console.log('Intentando cargar imagen:', cover);
            
            // Asignar el índice para la animación de serpiente posterior a todas las tarjetas
            card.style.setProperty('--index', i); 

            // Configurar el ángulo solo para las primeras 6 tarjetas que girarán
            if (i < 6) { 
                const angle = (360 / 6) * i; 
                card.style.setProperty('--angle', `${angle}deg`);
                // console.log(`Tarjeta ${i}: --angle = ${angle}deg`);
            }
            
            card.innerHTML = `
                <img src="${cover}" alt="${song.title}" class="music-cover" />
                <h2 class="song-title">${song.title}</h2>
                <p class="artist-name">${song.author}</p>
            `;
            
            // Añadir el event listener de clic a cada tarjeta
            card.addEventListener('click', () => {
                if (document.body.classList.contains('ordenado')) {
                    document.body.classList.add('fondo-activo');
                    document.body.classList.add('imagen-expandida');
                    document.body.classList.add('ocultar-hello'); // Oculta el texto de bienvenida
                    backgroundMusicDiv.style.backgroundImage = `url('${cover}')`;
                    // TODO: Aquí agregar la lógica para reproducir la canción real
                    // Por ejemplo: playSong(song.audioUrl);

                    // Crear un overlay para la imagen expandida
                    const overlay = document.createElement('div');
                    overlay.className = 'overlay-imagen-expandida';
                    overlay.innerHTML = `<img src="${cover}" alt="${song.title}" class="imagen-expandida-content"/>`;
                    document.body.appendChild(overlay);

                    // --- Lógica de Reproducción de Audio ---
                    if (song.audio && song.audio.url) { // Verifica si la canción tiene URL de audio
                        const audioUrl = song.audio.url;

                        if (audioUrl !== audioPlayer.src) {
                            // Si es una canción diferente, carga la nueva y reproduce desde el inicio
                            audioPlayer.src = audioUrl;
                            audioPlayer.currentTime = 0; // Asegura que empiece desde el principio
                            audioPlayer.play();
                            currentPlayingSongId = song._id; // Guarda el ID de la canción actual
                        } else {
                            // Si es la misma canción, reanuda desde donde se quedó
                            audioPlayer.play();
                        }
                    } else {
                        console.warn('Esta canción no tiene una URL de audio válida:', song.title);
                    }
                    // --- Fin Lógica de Reproducción de Audio ---

                    // Cerrar el overlay al hacer clic fuera de la imagen
                    overlay.addEventListener('click', (event) => {
                        // Solo cerrar si se hace clic en el overlay, no en la imagen dentro
                        if (event.target === overlay) {
                            document.body.classList.remove('imagen-expandida');
                            document.body.classList.remove('ocultar-hello');
                            
                            // Verifica si el overlay sigue siendo un hijo del body antes de intentar removerlo
                            if (document.body.contains(overlay)) {
                                document.body.removeChild(overlay);
                            }

                            // --- Lógica de Pausa de Audio ---
                            audioPlayer.pause(); // Pausa la reproducción cuando se cierra el overlay
                            // No reseteamos currentTime aquí, para que pueda reanudarse si se vuelve a abrir la misma canción
                            // --- Fin Lógica de Pausa de Audio ---
                        }
                    });
                }
            });

            allCards.push(card); // Guardamos todas las tarjetas
            // Esto permite que el CSS las controle y transicione todas.
            container.appendChild(card); // Añadimos la tarjeta al contenedor
        });

        // Después de 5 segundos, cambia el estado para ordenar abajo y añade el resto de las tarjetas
        setTimeout(() => {
            document.body.classList.remove('inicio');
            document.body.classList.add('fade-out'); // Añadimos la clase fade-out para ocultar el contenedor de órbita

            setTimeout(() => {
                document.body.classList.remove('fade-out'); // Quita la clase de ocultar
                document.body.classList.add('ordenado'); // Cambia a 'ordenado' para mostrar las tarjetas en fila

            // --- CÓDIGO PARA EL SCROLL CON DRAG ---
            let isDown = false;
            let startX;
            let scrollLeft;

            container.addEventListener('mousedown', (e) => { // Usar 'e' como argumento es más estándar
                isDown = true;
                container.classList.add('active-drag');
                startX = e.pageX - container.offsetLeft;
                scrollLeft = container.scrollLeft;
            });

            container.addEventListener('mouseleave', () => {
                isDown = false;
                container.classList.remove('active-drag');
            });

            container.addEventListener('mouseup', () => {
                isDown = false;
                container.classList.remove('active-drag');
            });

            container.addEventListener('mousemove', (e) => { // Usar 'e' como argumento es más estándar
                if (!isDown) return;
                e.preventDefault();
                const x = e.pageX - container.offsetLeft;
                const walk = (x - startX) * 2;
                container.scrollLeft = scrollLeft - walk;
            });
            // --- FIN CÓDIGO SCROLL CON DRAG ---

        }, 300); // Duración de la transición de ocultamiento (0.3s)
    }, 4000); // Duración de la animación ovalOrbit (4s)

    } catch (error) {
        container.innerHTML = '<p>Error al cargar tu playlist.</p>';
        console.error("Error al cargar las canciones:", error); // Activa el console.error para depuración
    }
});