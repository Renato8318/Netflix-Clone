// =========================================================
//                  CONFIGURAÇÃO DA API TMDb
// =========================================================

// CHAVE DE API FORNECIDA PELO USUÁRIO (Mantenha a sua chave aqui)
const API_KEY = '385852cfc5b213ccc9c5940b05c6b9db'; 
// =========================================================

const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/'; 
const LANGUAGE = 'pt-BR';

// Variável global para guardar o item em destaque (Hero)
let featuredItem = null; 
let currentMediaType = 'all';

// Endpoints da API
const ENDPOINTS = {
    trending: `${BASE_URL}/trending/all/week?api_key=${API_KEY}&language=${LANGUAGE}`,
    popularMovies: `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=${LANGUAGE}`,
    topRatedTv: `${BASE_URL}/tv/top_rated?api_key=${API_KEY}&language=${LANGUAGE}`,
    hero: `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=${LANGUAGE}`
};

// =========================================================
//                  1. FUNÇÕES DE LOCALSTORAGE (MINHA LISTA)
// =========================================================

const FAVORITES_KEY = 'netflixCloneFavorites';

function getFavorites() {
    const favorites = localStorage.getItem(FAVORITES_KEY);
    try {
        return favorites ? JSON.parse(favorites) : {};
    } catch (e) {
        console.error("Erro ao carregar favoritos do LocalStorage:", e);
        return {};
    }
}

function isFavorite(id) {
    const favorites = getFavorites();
    return favorites.hasOwnProperty(String(id));
}

function toggleFavorite(id, mediaType) {
    const favorites = getFavorites();
    const stringId = String(id);

    if (favorites.hasOwnProperty(stringId)) {
        delete favorites[stringId];
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
        return false;
    } else {
        favorites[stringId] = mediaType;
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
        return true;
    }
}


// =========================================================
//                  2. EFEITO STICKY DO HEADER
// =========================================================

const header = document.getElementById('main-header');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.classList.add('bg-black', 'shadow-lg', 'py-3');
        header.classList.remove('py-4');
    } else {
        header.classList.remove('bg-black', 'shadow-lg', 'py-3');
        header.classList.add('py-4');
    }
});


// =========================================================
//                  3. NAVEGAÇÃO DO CARROSSEL
// =========================================================

function setupCarouselNavigation(carouselId, leftArrowId, rightArrowId) {
    const carousel = document.getElementById(carouselId);
    const leftArrow = document.getElementById(leftArrowId);
    const rightArrow = document.getElementById(rightArrowId);
    const scrollAmount = 250; 

    if (carousel && leftArrow && rightArrow) {
        leftArrow.addEventListener('click', () => {
            carousel.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        });

        rightArrow.addEventListener('click', () => {
            carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        });
    }
}


// =========================================================
//                  4. MODAL E DETALHES DA API
// =========================================================

const modal = document.getElementById('movie-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const modalLoader = document.getElementById('modal-loader');
const modalContent = document.getElementById('modal-content');

// Evento para fechar o modal
closeModalBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    if (currentMediaType === 'favorites') {
        loadAllCarousels();
    }
});

// Fecha o modal ao clicar na área escura ao redor
modal.addEventListener('click', (e) => {
    if (e.target.id === 'movie-modal') {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        if (currentMediaType === 'favorites') {
            loadAllCarousels();
        }
    }
});


/**
 * Atualiza o botão de Favoritar no Modal (ícone e status).
 */
function updateFavoriteButton(itemId, mediaType) {
    const isFav = isFavorite(itemId);
    const favButton = document.getElementById('modal-favorite-btn');
    
    if (isFav) {
        favButton.innerHTML = `
            <svg class="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"></path></svg>
            Remover da Lista
        `;
        favButton.classList.remove('bg-gray-600', 'bg-opacity-70');
        favButton.classList.add('bg-red-600');
    } else {
        favButton.innerHTML = `
            <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
            Adicionar à Lista
        `;
        favButton.classList.remove('bg-red-600');
        favButton.classList.add('bg-gray-600', 'bg-opacity-70');
    }

    favButton.onclick = () => {
        const wasAdded = toggleFavorite(itemId, mediaType);
        updateFavoriteButton(itemId, mediaType); 
        
        console.log(wasAdded ? 'Adicionado à Minha Lista!' : 'Removido da Minha Lista!');
        
        if (currentMediaType === 'favorites' && !wasAdded) {
            loadAllCarousels();
        }
    };
}


/**
 * Abre o modal, busca detalhes completos e preenche a UI.
 */
async function openModal(itemId, mediaType) {
    // 1. Mostrar modal e loader
    modal.classList.add('flex');
    modal.classList.remove('hidden');
    modalLoader.classList.remove('hidden');
    modalContent.classList.add('hidden');

    try {
        // 2. Requisição de detalhes
        const detailUrl = `${BASE_URL}/${mediaType}/${itemId}?api_key=${API_KEY}&language=${LANGUAGE}`;
        const response = await fetch(detailUrl);
        const details = await response.json();

        // 3. Esconder loader e mostrar conteúdo
        modalLoader.classList.add('hidden');
        modalContent.classList.remove('hidden');

        // 4. Preencher o conteúdo
        document.getElementById('modal-title').textContent = details.title || details.name;
        document.getElementById('modal-overview').textContent = details.overview || 'Sinopse indisponível.';
        
        const date = details.release_date || details.first_air_date;
        document.getElementById('modal-release-date').textContent = date ? new Date(date).getFullYear() : 'N/A';
        const rating = details.vote_average ? details.vote_average.toFixed(1) : 'N/A';
        document.getElementById('modal-vote-average').textContent = `TMDb: ${rating}`;
        const genres = details.genres ? details.genres.map(g => g.name).join(', ') : 'N/A';
        document.getElementById('modal-genres').textContent = genres;

        let runtimeText = 'N/A';
        if (mediaType === 'movie' && details.runtime) {
            runtimeText = `${details.runtime} min`;
        } else if (mediaType === 'tv' && details.number_of_seasons) {
             runtimeText = `${details.number_of_seasons} Temp.`;
             if (details.number_of_episodes) {
                 runtimeText += ` (${details.number_of_episodes} Ep.)`;
             }
        }
        document.getElementById('modal-runtime').textContent = runtimeText;
        
        const backdropPath = details.backdrop_path || details.poster_path;
        if (backdropPath) {
            document.getElementById('modal-backdrop').style.backgroundImage = `url('${IMAGE_BASE_URL}w780${backdropPath}')`;
        }
        
        // 5. ATUALIZA O BOTÃO DE FAVORITAR
        updateFavoriteButton(itemId, mediaType); 

    } catch (error) {
        console.error("Erro ao carregar detalhes:", error);
        modalLoader.classList.add('hidden');
        modalContent.classList.add('hidden');
        alert("Erro ao carregar detalhes do conteúdo. Verifique o console para mais informações.");
    }
}


// =========================================================
//                  5. LÓGICA DE CARREGAMENTO DE CARROSSÉIS
// =========================================================

async function loadFavoritesCarousel(carouselId, imageSize = 'w500') {
    const carouselElement = document.getElementById(carouselId);
    carouselElement.innerHTML = ''; 
    
    const favoritesList = getFavorites();
    const favoriteIds = Object.keys(favoritesList);

    if (favoriteIds.length === 0) {
        carouselElement.innerHTML = '<p class="text-gray-500 p-4">Sua lista está vazia. Adicione um filme ou série através do modal de detalhes.</p>';
        return;
    }

    const requests = favoriteIds.map(id => {
        const mediaType = favoritesList[id];
        const type = mediaType === 'movie' || mediaType === 'tv' ? mediaType : 'movie'; 
        const detailUrl = `${BASE_URL}/${type}/${id}?api_key=${API_KEY}&language=${LANGUAGE}`;
        return fetch(detailUrl).then(res => res.json()).catch(() => null);
    });

    const items = await Promise.all(requests);
    
    items.filter(item => item && item.poster_path).forEach(item => {
        const posterPath = item.poster_path;
        const posterUrl = `${IMAGE_BASE_URL}${imageSize}${posterPath}`;
        const title = item.title || item.name; 
        const mediaType = item.media_type || (item.title ? 'movie' : 'tv'); 

        const posterDiv = document.createElement('div');
        posterDiv.className = 'flex-shrink-0 cursor-pointer poster-item'; // A largura será controlada pelo CSS
        posterDiv.innerHTML = `<img src="${posterUrl}" alt="${title}" class="w-full h-auto object-cover rounded hover:shadow-xl" loading="lazy">`;

        posterDiv.addEventListener('click', () => {
            openModal(item.id, mediaType);
        });

        carouselElement.appendChild(posterDiv);
    });

    if (carouselElement.children.length === 0) {
         carouselElement.innerHTML = '<p class="text-gray-500 p-4">Os itens favoritos não puderam ser carregados.</p>';
    }
}


async function fetchAndLoadCarousel(fetchUrl, carouselId, imageSize = 'w500', requiredType = null) {
    if (requiredType === 'favorites') {
        loadFavoritesCarousel(carouselId, imageSize);
        return;
    }

    const carouselElement = document.getElementById(carouselId);
    if (!carouselElement) return;

    carouselElement.innerHTML = ''; 

    try {
        const response = await fetch(fetchUrl);
        const data = await response.json();
        const itemsList = data.results; 

        itemsList.forEach(item => {
            const posterPath = item.poster_path;
            const mediaType = item.media_type || (item.title ? 'movie' : 'tv'); 
            
            if (requiredType && requiredType !== 'all' && mediaType !== requiredType) {
                return; 
            }

            if (posterPath) {
                const posterUrl = `${IMAGE_BASE_URL}${imageSize}${posterPath}`;
                const title = item.title || item.name; 

                const posterDiv = document.createElement('div');
                posterDiv.className = 'flex-shrink-0 cursor-pointer poster-item'; // A largura será controlada pelo CSS
                posterDiv.innerHTML = `<img src="${posterUrl}" alt="${title}" class="w-full h-auto object-cover rounded hover:shadow-xl" loading="lazy">`;

                posterDiv.addEventListener('click', () => {
                    openModal(item.id, mediaType);
                });

                carouselElement.appendChild(posterDiv);
            }
        });

        if (carouselElement.children.length === 0) {
            carouselElement.innerHTML = '<p class="text-gray-500 p-4">Nenhum conteúdo encontrado para esta categoria.</p>';
        }

    } catch (error) {
        console.error(`[ERRO] Falha ao carregar carrossel ${carouselId}:`, error);
        carouselElement.innerHTML = '<p class="text-red-500">Erro ao carregar conteúdo. Verifique sua chave API.</p>';
    }
}


function loadAllCarousels() {
    // Seleciona os contêineres de cada fileira de carrossel
    const tendenciasRow = document.querySelector('#carousel-tendencias').closest('.row-container');
    const popularesRow = document.querySelector('#carousel-populares').closest('.row-container');
    const seriesRow = document.querySelector('#carousel-series').closest('.row-container');
    const h2Tendencias = tendenciasRow.querySelector('h2');

    if (currentMediaType === 'favorites') {
        // --- MODO MINHA LISTA (APENAS UM CARROSSEL) ---
        popularesRow.style.display = 'none';
        seriesRow.style.display = 'none';
        tendenciasRow.style.display = 'block';
        h2Tendencias.textContent = 'Minha Lista';
        loadFavoritesCarousel('carousel-tendencias', 'w342');

    } else {
        // --- MODO NORMAL (TODOS, FILMES, SÉRIES) ---
        // Reseta os títulos e a visibilidade
        h2Tendencias.textContent = 'Tendências da Semana';
        tendenciasRow.style.display = 'block';
        popularesRow.style.display = 'block';
        seriesRow.style.display = 'block';

        // Carrega o carrossel de tendências, filtrando o conteúdo se necessário
        fetchAndLoadCarousel(ENDPOINTS.trending, 'carousel-tendencias', 'w342', currentMediaType);

        // Esconde/mostra a fileira de filmes populares
        if (currentMediaType === 'tv') {
            popularesRow.style.display = 'none';
        } else {
            popularesRow.style.display = 'block';
            // O 'requiredType' aqui é 'movie' porque este carrossel é SÓ de filmes
            fetchAndLoadCarousel(ENDPOINTS.popularMovies, 'carousel-populares', 'w342', 'movie');
        }

        // Esconde/mostra a fileira de séries
        if (currentMediaType === 'movie') {
            seriesRow.style.display = 'none';
        } else {
            seriesRow.style.display = 'block';
            // O 'requiredType' aqui é 'tv' porque este carrossel é SÓ de séries
            fetchAndLoadCarousel(ENDPOINTS.topRatedTv, 'carousel-series', 'w342', 'tv');
        }
    }
}


// =========================================================
//                  6. LÓGICA DE FILTRO E BOTÕES DO HERO
// =========================================================

/**
 * Configura o comportamento dos botões de filtro (Séries, Filmes, Todos, Minha Lista).
 */
function setupFilterNavigation() {
    const filterButtons = document.querySelectorAll('.nav-filter');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const newType = button.getAttribute('data-type');
            
            if (newType === currentMediaType) return; 

            currentMediaType = newType;
            
            filterButtons.forEach(btn => {
                btn.classList.remove('font-bold', 'text-white');
                btn.classList.add('text-gray-400');
            });
            button.classList.add('font-bold', 'text-white');
            button.classList.remove('text-gray-400');
            
            loadAllCarousels();
            
            const carouselsSection = document.getElementById('carousels');
            window.scrollTo({
                top: carouselsSection.offsetTop - header.offsetHeight - 20, 
                behavior: 'smooth'
            });
        });
    });
}

/**
 * Adiciona os listeners de evento aos botões do Hero Banner.
 */
function setupHeroButtons() {
    const assistButton = document.querySelector('#hero-banner + div .flex button:first-child');
    const detailsButton = document.querySelector('#hero-banner + div .flex button:last-child');
    
    if (featuredItem) {
        // Botão Assistir (apenas console log, pois não há player)
        assistButton.addEventListener('click', () => {
            console.log(`Assistindo: ${featuredItem.title || featuredItem.name}`);
            alert(`Iniciando a reprodução de: ${featuredItem.title || featuredItem.name}`);
        });

        // Botão Mais Detalhes (chama o modal com o ID e tipo)
        detailsButton.addEventListener('click', () => {
            const mediaType = featuredItem.media_type || (featuredItem.title ? 'movie' : 'tv');
            
            // CHAMA A FUNÇÃO DE MODAL COM OS DADOS DO ITEM EM DESTAQUE
            openModal(featuredItem.id, mediaType);
        });
    } else {
         console.error("featuredItem não foi carregado corretamente. Botões do Hero desativados.");
    }
}


/**
 * Preenche a seção de destaque (Hero) e armazena seus dados.
 */
async function loadHeroBanner() {
    try {
        const response = await fetch(ENDPOINTS.hero);
        const data = await response.json();
        const featured = data.results.find(item => item.backdrop_path) || data.results[0];

        if (featured && featured.backdrop_path) {
            // Armazena o item em destaque na variável global
            featuredItem = featured; 

            const bannerElement = document.getElementById('hero-banner');
            const titleElement = document.getElementById('hero-title');
            const overviewElement = document.getElementById('hero-overview');
            
            const bannerUrl = `${IMAGE_BASE_URL}original${featured.backdrop_path}`;
            
            bannerElement.style.backgroundImage = `url('${bannerUrl}')`;
            titleElement.textContent = featured.title || featured.name;
            overviewElement.textContent = (featured.overview || 'Sinopse indisponível.').substring(0, 200) + '...';

            // Configura a interatividade dos botões após o carregamento
            setupHeroButtons();
        }
    } catch (error) {
        console.error("[ERRO] Falha ao carregar Banner Hero:", error);
    }
}


// =========================================================
//                  7. EXECUÇÃO INICIAL
// =========================================================

document.addEventListener('DOMContentLoaded', () => {
    loadHeroBanner();
    setupCarouselNavigation('carousel-tendencias', 'tendencias-left-arrow', 'tendencias-right-arrow');
    setupCarouselNavigation('carousel-populares', 'populares-left-arrow', 'populares-right-arrow');
    setupCarouselNavigation('carousel-series', 'series-left-arrow', 'series-right-arrow');
    
    setupFilterNavigation();
    
    loadAllCarousels();
});