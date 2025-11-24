// =========================================================
//                  CONFIGURAÇÃO DA API TMDb
// =========================================================

// CHAVE DE API FORNECIDA PELO USUÁRIO
const API_KEY = '385852cfc5b213ccc9c5940b05c6b9db'; 
// =========================================================

const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/'; 
const LANGUAGE = 'pt-BR';

// Endpoints da API
const ENDPOINTS = {
    trending: `${BASE_URL}/trending/all/week?api_key=${API_KEY}&language=${LANGUAGE}`,
    popularMovies: `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=${LANGUAGE}`,
    topRatedTv: `${BASE_URL}/tv/top_rated?api_key=${API_KEY}&language=${LANGUAGE}`,
    hero: `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=${LANGUAGE}`
};

// =========================================================
//                  1. EFEITO STICKY DO HEADER
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
//                  2. NAVEGAÇÃO DO CARROSSEL
// =========================================================

/**
 * Configura os botões de seta para rolagem horizontal do carrossel.
 */
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
//                  3. MODAL E DETALHES DA API
// =========================================================

const modal = document.getElementById('movie-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const modalLoader = document.getElementById('modal-loader');
const modalContent = document.getElementById('modal-content');

// Evento para fechar o modal
closeModalBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
});

// Fecha o modal ao clicar na área escura ao redor
modal.addEventListener('click', (e) => {
    if (e.target.id === 'movie-modal') {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }
});

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
        
        // Data de Lançamento
        const date = details.release_date || details.first_air_date;
        document.getElementById('modal-release-date').textContent = date ? new Date(date).getFullYear() : 'N/A';

        // Nota Média
        const rating = details.vote_average ? details.vote_average.toFixed(1) : 'N/A';
        document.getElementById('modal-vote-average').textContent = `TMDb: ${rating}`;
        
        // Gêneros
        const genres = details.genres ? details.genres.map(g => g.name).join(', ') : 'N/A';
        document.getElementById('modal-genres').textContent = genres;

        // Duração/Runtime
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


        // Banner de Fundo do Modal
        const backdropPath = details.backdrop_path || details.poster_path;
        if (backdropPath) {
            document.getElementById('modal-backdrop').style.backgroundImage = `url('${IMAGE_BASE_URL}w780${backdropPath}')`;
        }


    } catch (error) {
        console.error("Erro ao carregar detalhes:", error);
        modalLoader.classList.add('hidden');
        modalContent.classList.add('hidden');
        alert("Erro ao carregar detalhes do conteúdo. Verifique o console para mais informações.");
    }
}


/**
 * Busca dados da API e renderiza os cartazes no carrossel, anexando o evento de clique.
 */
async function fetchAndLoadCarousel(fetchUrl, carouselId, imageSize = 'w500') {
    const carouselElement = document.getElementById(carouselId);
    if (!carouselElement) return;

    try {
        const response = await fetch(fetchUrl);
        if (!response.ok) {
            throw new Error(`Erro na requisição: ${response.status}`);
        }
        
        const data = await response.json();
        const itemsList = data.results; 

        itemsList.forEach(item => {
            const posterPath = item.poster_path;

            if (posterPath) {
                const posterUrl = `${IMAGE_BASE_URL}${imageSize}${posterPath}`;
                const title = item.title || item.name; 
                const mediaType = item.media_type || (item.title ? 'movie' : 'tv'); 

                const posterDiv = document.createElement('div');
                posterDiv.className = 'w-40 md:w-56 flex-shrink-0 cursor-pointer poster-item';
                
                posterDiv.innerHTML = `
                    <img 
                        src="${posterUrl}" 
                        alt="${title}" 
                        class="w-full h-auto object-cover rounded hover:shadow-xl"
                        loading="lazy"
                    >
                `;

                // Anexa a função do modal ao clique
                posterDiv.addEventListener('click', () => {
                    openModal(item.id, mediaType);
                });

                carouselElement.appendChild(posterDiv);
            }
        });

    } catch (error) {
        console.error(`[ERRO] Falha ao carregar carrossel ${carouselId}:`, error);
        carouselElement.innerHTML = '<p class="text-red-500">Erro ao carregar conteúdo. Verifique sua chave API.</p>';
    }
}


/**
 * Preenche a seção de destaque (Hero)
 */
async function loadHeroBanner() {
    try {
        const response = await fetch(ENDPOINTS.hero);
        const data = await response.json();
        const featured = data.results.find(item => item.backdrop_path) || data.results[0];

        if (featured && featured.backdrop_path) {
            const bannerElement = document.getElementById('hero-banner');
            const titleElement = document.getElementById('hero-title');
            const overviewElement = document.getElementById('hero-overview');
            
            const bannerUrl = `${IMAGE_BASE_URL}original${featured.backdrop_path}`;
            
            bannerElement.style.backgroundImage = `url('${bannerUrl}')`;
            titleElement.textContent = featured.title || featured.name;
            overviewElement.textContent = (featured.overview || 'Sinopse indisponível.').substring(0, 200) + '...';
        }
    } catch (error) {
        console.error("[ERRO] Falha ao carregar Banner Hero:", error);
    }
}


// =========================================================
//                  4. EXECUÇÃO INICIAL
// =========================================================

document.addEventListener('DOMContentLoaded', () => {
    // Carrega o banner principal
    loadHeroBanner();

    // Carrega os carrosséis
    fetchAndLoadCarousel(ENDPOINTS.trending, 'carousel-tendencias', 'w342');
    fetchAndLoadCarousel(ENDPOINTS.popularMovies, 'carousel-populares', 'w342');
    fetchAndLoadCarousel(ENDPOINTS.topRatedTv, 'carousel-series', 'w342');

    // Configura a navegação por setas para os carrosséis
    setupCarouselNavigation('carousel-tendencias', 'tendencias-left-arrow', 'tendencias-right-arrow');
    setupCarouselNavigation('carousel-populares', 'populares-left-arrow', 'populares-right-arrow');
    setupCarouselNavigation('carousel-series', 'series-left-arrow', 'series-right-arrow');
});