// =========================================================
//                  CONFIGURAÇÃO DA API TMDb
// =========================================================

// CHAVE DE API: SUBSTITUA PELA SUA CHAVE REAL!
const API_KEY = '385852cfc5b213ccc9c5940b05c6b9db'; 
// =========================================================

const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/'; 
const LANGUAGE = 'pt-BR';

// Variáveis Globais para o Carrossel Automático do Hero e Filtros
let featuredItem = null; 
let featuredItemsList = []; // <-- ESSA ESTAVA FALTANDO
let currentFeaturedIndex = 0; // <-- ESSA ESTAVA FALTANDO
let currentMediaType = 'all';

// IDs de Gêneros e Códigos de País (TMDb)
const GENRES = {
    ACTION: 28,
    COMEDY: 35,
    HORROR: 27,
    ROMANCE: 10749,
    ANIMATION: 16, // Usado para "Animes"
};

const COUNTRIES = {
    JAPAN: 'JP',  // Usado para "Animes"
    KOREA: 'KR'   // Usado para "Séries Coreanas"
};

// Endpoints da API
const ENDPOINTS = {
    trending: `${BASE_URL}/trending/all/week?api_key=${API_KEY}&language=${LANGUAGE}`,
    popularMovies: `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=${LANGUAGE}`,
    topRatedTv: `${BASE_URL}/tv/top_rated?api_key=${API_KEY}&language=${LANGUAGE}`,
    popularTv: `${BASE_URL}/tv/popular?api_key=${API_KEY}&language=${LANGUAGE}`, // Para Top 10 Séries
    latestReleases: `${BASE_URL}/movie/now_playing?api_key=${API_KEY}&language=${LANGUAGE}`, // Para Lançamentos
    hero: `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=${LANGUAGE}`,
    search: `${BASE_URL}/search/multi?api_key=${API_KEY}&language=${LANGUAGE}`,
    actionMovies: `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=${LANGUAGE}&with_genres=${GENRES.ACTION}`,
    comedyMovies: `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=${LANGUAGE}&with_genres=${GENRES.COMEDY}`,
    romanceMovies: `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=${LANGUAGE}&with_genres=${GENRES.ROMANCE}`,
    horrorMovies: `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=${LANGUAGE}&with_genres=${GENRES.HORROR}`,
    anime: `${BASE_URL}/discover/tv?api_key=${API_KEY}&language=${LANGUAGE}&with_genres=${GENRES.ANIMATION}&with_origin_country=${COUNTRIES.JAPAN}`,
    koreanTv: `${BASE_URL}/discover/tv?api_key=${API_KEY}&language=${LANGUAGE}&with_origin_country=${COUNTRIES.KOREA}`
};

// Mapeamento centralizado dos carrosséis para facilitar manutenção e inicialização
const CAROUSELS_CONFIG = [
    { id: 'carousel-tendencias', h2Selector: '#carousels > div:nth-child(1) h2', originalTitle: 'Tendências da Semana', endpoint: ENDPOINTS.trending, loader: fetchAndLoadCarousel, arrows: { left: 'tendencias-left-arrow', right: 'tendencias-right-arrow' } },
    { id: 'carousel-top10-movies', h2Selector: '#carousels > div:nth-child(2) h2', originalTitle: 'Top 10 Filmes no Brasil', endpoint: ENDPOINTS.popularMovies, type: 'movie', loader: fetchAndLoadTop10Carousel, arrows: { left: 'top10-movies-left-arrow', right: 'top10-movies-right-arrow' } },
    { id: 'carousel-top10-series', h2Selector: '#carousels > div:nth-child(3) h2', originalTitle: 'Top 10 Séries no Brasil', endpoint: ENDPOINTS.popularTv, type: 'tv', loader: fetchAndLoadTop10Carousel, arrows: { left: 'top10-series-left-arrow', right: 'top10-series-right-arrow' } },
    { id: 'carousel-lancamentos', h2Selector: '#carousels > div:nth-child(4) h2', originalTitle: 'Últimos Lançamentos', endpoint: ENDPOINTS.latestReleases, type: 'movie', loader: fetchAndLoadCarousel, arrows: { left: 'lancamentos-left-arrow', right: 'lancamentos-right-arrow' } },
    { id: 'carousel-populares', h2Selector: '#carousels > div:nth-child(5) h2', originalTitle: 'Filmes Populares', endpoint: ENDPOINTS.popularMovies, loader: fetchAndLoadCarousel, arrows: { left: 'populares-left-arrow', right: 'populares-right-arrow' } },
    { id: 'carousel-series', h2Selector: '#carousels > div:nth-child(6) h2', originalTitle: 'Séries Mais Votadas', endpoint: ENDPOINTS.topRatedTv, loader: fetchAndLoadCarousel, arrows: { left: 'series-left-arrow', right: 'series-right-arrow' } },
    { id: 'carousel-action', h2Selector: '#carousels > div:nth-child(7) h2', originalTitle: 'Ação', endpoint: ENDPOINTS.actionMovies, type: 'movie', loader: fetchAndLoadCarousel, arrows: { left: 'action-left-arrow', right: 'action-right-arrow' } },
    { id: 'carousel-comedy', h2Selector: '#carousels > div:nth-child(8) h2', originalTitle: 'Comédia', endpoint: ENDPOINTS.comedyMovies, type: 'movie', loader: fetchAndLoadCarousel, arrows: { left: 'comedy-left-arrow', right: 'comedy-right-arrow' } },
    { id: 'carousel-horror', h2Selector: '#carousels > div:nth-child(9) h2', originalTitle: 'Terror', endpoint: ENDPOINTS.horrorMovies, type: 'movie', loader: fetchAndLoadCarousel, arrows: { left: 'horror-left-arrow', right: 'horror-right-arrow' } },
    { id: 'carousel-romance', h2Selector: '#carousels > div:nth-child(10) h2', originalTitle: 'Romance', endpoint: ENDPOINTS.romanceMovies, type: 'movie', loader: fetchAndLoadCarousel, arrows: { left: 'romance-left-arrow', right: 'romance-right-arrow' } },
    { id: 'carousel-anime', h2Selector: '#carousels > div:nth-child(11) h2', originalTitle: 'Animes', endpoint: ENDPOINTS.anime, type: 'tv', loader: fetchAndLoadCarousel, arrows: { left: 'anime-left-arrow', right: 'anime-right-arrow' } },
    { id: 'carousel-korean', h2Selector: '#carousels > div:nth-child(12) h2', originalTitle: 'Séries Coreanas', endpoint: ENDPOINTS.koreanTv, type: 'tv', loader: fetchAndLoadCarousel, arrows: { left: 'korean-left-arrow', right: 'korean-right-arrow' } }
];

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
//                  1.1 FUNÇÕES DE CURTIDAS (GOSTEI)
// =========================================================

const LIKES_KEY = 'netflixCloneLikes';

function getLikes() {
    const likes = localStorage.getItem(LIKES_KEY);
    try {
        return likes ? JSON.parse(likes) : {};
    } catch (e) {
        console.error("Erro ao carregar curtidas do LocalStorage:", e);
        return {};
    }
}

function isLiked(id) {
    const likes = getLikes();
    return likes.hasOwnProperty(String(id));
}

function toggleLike(id) {
    const likes = getLikes();
    const stringId = String(id);

    if (likes.hasOwnProperty(stringId)) {
        delete likes[stringId];
        localStorage.setItem(LIKES_KEY, JSON.stringify(likes));
        return false;
    } else {
        likes[stringId] = true;
        localStorage.setItem(LIKES_KEY, JSON.stringify(likes));
        return true;
    }
}

/**
 * Traduz um texto usando a API pública MyMemory.
 * @param {string} text Texto original em inglês.
 * @returns {string} Texto traduzido para português ou o original em caso de falha.
 */
async function translateText(text) {
    if (!text) return '';
    try {
        const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|pt`);
        const data = await response.json();
        return data.responseData.translatedText || text;
    } catch (error) {
        console.error("Erro na tradução do comentário:", error);
        return text;
    }
}


// =========================================================
//                  2. EFEITO STICKY DO HEADER
// =========================================================

const header = document.getElementById('main-header');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.classList.add('bg-[#141414]', 'shadow-2xl', 'py-2');
        header.classList.remove('py-4', 'bg-gradient-to-b', 'from-black/80');
    } else {
        header.classList.remove('bg-[#141414]', 'shadow-2xl', 'py-2');
        header.classList.add('py-4', 'bg-gradient-to-b', 'from-black/80');
    }
});


// =========================================================
//                  3. NAVEGAÇÃO DO CARROSSEL DE FILEIRAS
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

// Elementos do trailer no modal
const trailerContainer = document.getElementById('modal-trailer-container');
const trailerBtn = document.getElementById('modal-trailer-btn');
const backBtn = document.getElementById('modal-back-btn');
const modalDetailsHeader = document.getElementById('modal-details-header');
const modalDetailsBody = document.getElementById('modal-details-body');
let ytPlayer; // Variável global para o player do YouTube

/**
 * Função chamada pela API do YouTube quando o vídeo termina.
 */
function onPlayerStateChange(event) {
    // YT.PlayerState.ENDED é o estado '0', que significa que o vídeo terminou.
    if (event.data === YT.PlayerState.ENDED) {
        hideTrailer();
    }
}

/**
 * Limpa o trailer e restaura a visualização de detalhes.
 */
function hideTrailer() {
    // Destrói o player do YouTube para parar o vídeo e limpar recursos
    if (ytPlayer) {
        ytPlayer.destroy();
        ytPlayer = null;
    }
    trailerContainer.innerHTML = '';
    trailerContainer.classList.add('hidden');
    
    // Mostra os detalhes novamente
    modalDetailsHeader.classList.remove('hidden');
    modalDetailsBody.classList.remove('hidden');
    backBtn.classList.add('hidden');
    trailerBtn.classList.remove('hidden');
}

/**
 * Fecha o modal completamente e garante que o trailer seja limpo.
 */
function closeModal() {
    hideTrailer();
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    if (currentMediaType === 'favorites') {
        loadAllCarousels(); 
    }
}

// Evento para fechar o modal
closeModalBtn.addEventListener('click', closeModal);
backBtn.addEventListener('click', hideTrailer);

// Fecha o modal ao clicar na área escura ao redor
modal.addEventListener('click', (e) => {
    if (e.target.id === 'movie-modal') {
        closeModal();
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
        favButton.className = "btn-netflix flex items-center justify-center w-full px-4 py-3 bg-[#E50914] text-white font-bold rounded";
    } else {
        favButton.innerHTML = `
            <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
            Adicionar à Lista
        `;
        favButton.className = "btn-netflix flex items-center justify-center w-full px-4 py-3 bg-gray-500/50 backdrop-blur-md text-white font-bold rounded border border-white/10";
    }
    
    // Adicionamos a classe btn-netflix também ao botão de trailer e voltar
    document.getElementById('modal-trailer-btn').className = "btn-netflix hidden flex items-center justify-center w-full px-4 py-3 bg-white text-black font-bold rounded";
    document.getElementById('modal-back-btn').className = "btn-netflix hidden flex items-center justify-center w-full px-4 py-3 bg-gray-500/50 backdrop-blur-md text-white font-bold rounded border border-white/10";
    document.getElementById('modal-like-btn').className = "btn-netflix flex items-center justify-center w-full px-4 py-3 bg-gray-500/50 backdrop-blur-md text-white font-bold rounded border border-white/10";

    favButton.onclick = () => {
        const wasAdded = toggleFavorite(itemId, mediaType);
        updateFavoriteButton(itemId, mediaType); 
        
        if (currentMediaType === 'favorites' && !wasAdded) {
            loadAllCarousels();
        }
    };
}

/**
 * Atualiza o botão de Curtir no Modal.
 */
function updateLikeButton(itemId) {
    const liked = isLiked(itemId);
    const likeButton = document.getElementById('modal-like-btn');
    
    if (liked) {
        likeButton.innerHTML = `
            <svg class="w-6 h-6 mr-2 text-blue-400" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M2 20h2c.55 0 1-.45 1-1v-9c0-.55-.45-1-1-1H2v11zm19.83-7.12c.11-.25.17-.52.17-.8V11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-.1z"/></svg>
            Gostei
        `;
        likeButton.classList.add('border-blue-400');
    } else {
        likeButton.innerHTML = `
            <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3zM7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3"></path></svg>
            Classificar
        `;
        likeButton.classList.remove('border-blue-400');
    }

    likeButton.onclick = () => {
        const isNowLiked = toggleLike(itemId);
        updateLikeButton(itemId);
        if (isNowLiked) {
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#E50914', '#ffffff', '#b3b3b3'],
                zIndex: 9999
            });
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

    // Reseta o estado do modal para a visualização de detalhes
    trailerBtn.classList.add('hidden');
    trailerBtn.onclick = null;
    hideTrailer();

    try {
        // 2. Requisições em paralelo para detalhes e vídeos
        const detailUrl = `${BASE_URL}/${mediaType}/${itemId}?api_key=${API_KEY}&language=${LANGUAGE}`;
        const videosUrl = `${BASE_URL}/${mediaType}/${itemId}/videos?api_key=${API_KEY}&language=${LANGUAGE}`;
        const creditsUrl = `${BASE_URL}/${mediaType}/${itemId}/credits?api_key=${API_KEY}&language=${LANGUAGE}`;
        const reviewsUrl = `${BASE_URL}/${mediaType}/${itemId}/reviews?api_key=${API_KEY}`; // Reviews geralmente funcionam melhor sem filtro de língua
        const [detailsResponse, videosResponse, creditsResponse, reviewsResponse] = await Promise.all([fetch(detailUrl), fetch(videosUrl), fetch(creditsUrl), fetch(reviewsUrl)]);
        const details = await detailsResponse.json();
        const videosData = await videosResponse.json();
        const creditsData = await creditsResponse.json();
        const reviewsData = await reviewsResponse.json();

        // 3. Esconder loader e mostrar conteúdo
        modalLoader.classList.add('hidden');
        modalContent.classList.remove('hidden');
        
        if (details.success === false) {
             throw new Error(details.status_message || "Item não encontrado na API.");
        }

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
            document.getElementById('modal-backdrop').style.backgroundImage = `url('${IMAGE_BASE_URL}w1280${backdropPath}')`;
        }
        
        // 5. PREENCHER O ELENCO
        const castContainer = document.getElementById('modal-cast');
        castContainer.innerHTML = '';
        
        // Pegamos os 12 primeiros atores
        creditsData.cast.slice(0, 12).forEach(actor => {
            const actorDiv = document.createElement('div');
            actorDiv.className = 'flex-shrink-0 w-24 text-center';
            
            // Fallback para quando o ator não tem foto
            const profileUrl = actor.profile_path 
                ? `${IMAGE_BASE_URL}w185${actor.profile_path}` 
                : 'https://via.placeholder.com/185x278?text=Sem+Foto';

            actorDiv.innerHTML = `
                <img src="${profileUrl}" alt="${actor.name}" class="w-full h-32 object-cover rounded-lg mb-2 shadow-md">
                <p class="text-xs font-bold text-white truncate">${actor.name}</p>
                <p class="text-[10px] text-gray-400 truncate">${actor.character}</p>
            `;
            castContainer.appendChild(actorDiv);
        });

        // 6. PREENCHER COMENTÁRIOS
        const reviewsContainer = document.getElementById('modal-reviews');
        reviewsContainer.innerHTML = '';

        if (reviewsData.results && reviewsData.results.length > 0) {
            // Traduzimos os conteúdos em paralelo antes de renderizar
            const reviewsToDisplay = reviewsData.results.slice(0, 3);
            
            const translatedReviews = await Promise.all(reviewsToDisplay.map(async (review) => {
                const shortContent = review.content.length > 300 
                    ? review.content.substring(0, 300) + '...' 
                    : review.content;
                
                const translated = await translateText(shortContent);
                return { ...review, translatedContent: translated };
            }));

            translatedReviews.forEach(review => {
                const reviewDiv = document.createElement('div');
                reviewDiv.className = 'bg-gray-900/50 p-4 rounded-lg border border-gray-700';
                
                reviewDiv.innerHTML = `
                    <div class="flex items-center mb-2">
                        <span class="font-bold text-red-500 mr-2">${review.author}</span>
                        <span class="text-[10px] text-gray-500">${new Date(review.created_at).toLocaleDateString('pt-BR')}</span>
                        <span class="ml-auto text-[9px] text-gray-600 uppercase tracking-widest">Traduzido</span>
                    </div>
                    <p class="text-sm text-gray-300 italic leading-relaxed">"${review.translatedContent}"</p>
                `;
                reviewsContainer.appendChild(reviewDiv);
            });
        } else {
            reviewsContainer.innerHTML = '<p class="text-gray-500 text-sm italic">Ainda não há avaliações de usuários para este título.</p>';
        }

        // 5. ATUALIZA O BOTÃO DE FAVORITAR
        updateFavoriteButton(itemId, mediaType); 
        updateLikeButton(itemId);

        // 6. LÓGICA DO TRAILER
        const officialTrailer = videosData.results.find(video => video.type === 'Trailer' && video.site === 'YouTube');
        const anyTrailer = videosData.results.find(video => video.site === 'YouTube'); // Fallback para qualquer vídeo do YouTube

        const trailer = officialTrailer || anyTrailer;

        if (trailer && trailer.key) {
            trailerBtn.classList.remove('hidden');
            trailerBtn.onclick = () => {
                // Esconde os detalhes e mostra o container do trailer
                modalDetailsHeader.classList.add('hidden');
                modalDetailsBody.classList.add('hidden');
                trailerContainer.classList.remove('hidden');
                backBtn.classList.remove('hidden');
                trailerBtn.classList.add('hidden');

                // Cria e insere o iframe
                trailerContainer.innerHTML = `<div id="youtube-player-placeholder"></div>`;
                
                // Usa a API do YouTube para criar o player
                ytPlayer = new YT.Player('youtube-player-placeholder', {
                    height: '100%',
                    width: '100%',
                    videoId: trailer.key,
                    playerVars: {
                        'autoplay': 1, // Inicia o vídeo automaticamente
                        'rel': 0,      // Não mostra vídeos relacionados ao final
                        'controls': 1  // Mostra os controles do player
                    },
                    events: {
                        'onStateChange': onPlayerStateChange
                    }
                });
            };
        }

    } catch (error) {
        console.error("Erro ao carregar detalhes:", error);
        
        modalLoader.classList.add('hidden');
        modalContent.classList.add('hidden');
        
        alert(`Erro ao carregar detalhes do conteúdo. Verifique o console. Erro: ${error.message}`);
        closeModal();
    }
}


// =========================================================
//                  5. LÓGICA DE CARREGAMENTO DE CARROSSÉIS
// =========================================================

/**
 * Carrega o carrossel usando apenas os itens salvos no LocalStorage (Minha Lista).
 */
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
        posterDiv.className = 'w-36 sm:w-40 md:w-56 flex-shrink-0 cursor-pointer poster-item'; 
        posterDiv.innerHTML = `<img src="${posterUrl}" alt="${title}" class="w-full h-auto object-cover rounded hover:shadow-xl" loading="lazy">`;

        posterDiv.addEventListener('click', () => {
            openModal(item.id, mediaType);
        });

        carouselElement.appendChild(posterDiv);
    });

    if (carouselElement.children.length === 0 && favoriteIds.length > 0) {
         carouselElement.innerHTML = '<p class="text-gray-500 p-4">Os itens favoritos não puderam ser carregados.</p>';
    }
}


/**
 * Busca dados da API e carrega um carrossel.
 */
async function fetchAndLoadCarousel(fetchUrl, carouselId, imageSize = 'w500', requiredType = null) {
    if (requiredType === 'favorites') { 
        loadFavoritesCarousel(carouselId, imageSize);
        return;
    }
    
    const carouselElement = document.getElementById(carouselId);
    if (!carouselElement) return;

    // Adiciona um loader visual
    carouselElement.innerHTML = '<div class="animate-pulse w-full flex space-x-3"><div class="h-40 w-40 bg-gray-800 rounded"></div><div class="h-40 w-40 bg-gray-800 rounded hidden md:block"></div><div class="h-40 w-40 bg-gray-800 rounded hidden lg:block"></div></div>'; 

    try {
        const response = await fetch(fetchUrl);
        const data = await response.json();
        const itemsList = data.results; 
        
        // Limpa o loader
        carouselElement.innerHTML = ''; 

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
                posterDiv.className = 'w-36 sm:w-40 md:w-56 flex-shrink-0 cursor-pointer poster-item'; 
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
        carouselElement.innerHTML = '<p class="text-red-500">Erro ao carregar conteúdo. Verifique sua chave API ou o console.</p>';
    }
}

/**
 * Busca dados da API e carrega um carrossel no estilo "Top 10".
 */
async function fetchAndLoadTop10Carousel(fetchUrl, carouselId, mediaType) {
    const carouselElement = document.getElementById(carouselId);
    if (!carouselElement) return;

    // Adiciona um loader visual
    carouselElement.innerHTML = '<div class="animate-pulse w-full flex space-x-3"><div class="h-40 w-40 bg-gray-800 rounded"></div><div class="h-40 w-40 bg-gray-800 rounded hidden md:block"></div><div class="h-40 w-40 bg-gray-800 rounded hidden lg:block"></div></div>';

    try {
        const response = await fetch(fetchUrl);
        const data = await response.json();
        const itemsList = data.results.slice(0, 10); // Pega apenas os 10 primeiros

        carouselElement.innerHTML = '';

        itemsList.forEach((item, index) => {
            if (item.poster_path) {
                const posterUrl = `${IMAGE_BASE_URL}w342${item.poster_path}`;
                const title = item.title || item.name;

                const posterDiv = document.createElement('div');
                posterDiv.className = 'top-10-item flex-shrink-0 cursor-pointer';
                posterDiv.innerHTML = `
                    <div class="top-10-number">
                        <span>${index + 1}</span>
                    </div>
                    <div class="top-10-poster">
                        <img src="${posterUrl}" alt="${title}" class="w-full h-full object-cover" loading="lazy">
                    </div>
                `;

                posterDiv.addEventListener('click', () => {
                    openModal(item.id, mediaType);
                });

                carouselElement.appendChild(posterDiv);
            }
        });

        if (carouselElement.children.length === 0) {
            carouselElement.innerHTML = '<p class="text-gray-500 p-4">Nenhum conteúdo encontrado.</p>';
        }

    } catch (error) {
        console.error(`[ERRO] Falha ao carregar carrossel Top 10 ${carouselId}:`, error);
        carouselElement.innerHTML = '<p class="text-red-500">Erro ao carregar conteúdo.</p>';
    }
}








/**
 * Carrega todos os carrosséis baseando-se no filtro de mídia (all, movie, tv, favorites).
 * ESSA FUNÇÃO RESOLVE O PROBLEMA DE EXIBIÇÃO.
 */
function loadAllCarousels() {
    const carouselsContainer = document.getElementById('carousels');
    // Seleciona todos os divs 'row-container' para controlar a visibilidade.
    const allRowContainers = carouselsContainer.querySelectorAll('.row-container');


    if (currentMediaType === 'favorites') {
        // --- MODO MINHA LISTA ---
        
        allRowContainers.forEach((container, index) => {
            container.style.display = index === 0 ? 'block' : 'none';
        });
        
        // 2. Renomeia o título do primeiro carrossel e GARANTE que ele está visível
        document.querySelector(CAROUSELS_CONFIG[0].h2Selector).textContent = 'Minha Lista';
        allRowContainers[0].style.display = 'block'; 
        
        // 3. Carrega SÓ a lista de favoritos no primeiro carrossel
        fetchAndLoadCarousel(null, CAROUSELS_CONFIG[0].id, 'w342', 'favorites');

    } else {
        // --- MODO NORMAL (all, movie, tv) ---
        
        // 2. Restaura os títulos originais
        CAROUSELS_CONFIG.forEach(c => {
            const titleElement = document.querySelector(c.h2Selector);
            if (titleElement) titleElement.textContent = c.originalTitle;
        });

        CAROUSELS_CONFIG.forEach((carousel, index) => {
            const rowContainer = allRowContainers[index];
            if (!rowContainer) return;

            let shouldDisplay = false;
            if (currentMediaType === 'all') {
                shouldDisplay = true;
            } else if (carousel.type) { // Se o carrossel tem um tipo definido (movie, tv)
                shouldDisplay = carousel.type === currentMediaType;
            } else { // Carrosséis genéricos como "Tendências"
                shouldDisplay = true;
            }

            rowContainer.style.display = shouldDisplay ? 'block' : 'none';

            if (shouldDisplay) {
                // Usa o loader apropriado (padrão ou top 10)
                const imageSize = carousel.loader === fetchAndLoadTop10Carousel ? 'w342' : 'w500';
                const typeToLoad = carousel.type || currentMediaType; // Para o carrossel de tendências
                carousel.loader(carousel.endpoint, carousel.id, carousel.loader === fetchAndLoadTop10Carousel ? typeToLoad : imageSize, typeToLoad);
            }
        });
    }
}


// =========================================================
//                  6. LÓGICA DO CARROSSEL AUTOMÁTICO DO HERO
// =========================================================

/**
 * Configura o comportamento dos botões de filtro.
 */
function setupFilterNavigation() {
    const filterButtons = document.querySelectorAll('.nav-filter');
    const logo = document.getElementById('logo');
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const mobileDropdown = document.getElementById('mobile-dropdown');

    // Função interna para aplicar o filtro e atualizar a UI de forma síncrona
    const applyFilter = (type) => {
        // Se clicar em 'trending' (Bombando), tratamos como 'all' para carregar tudo
        // mas você poderia implementar uma lógica específica aqui se quisesse.
        const targetType = type === 'trending' ? 'all' : type;
        
        if (targetType === currentMediaType && type !== 'all') return;
        
        currentMediaType = targetType;

        // Atualiza o estilo de TODOS os botões (desktop e mobile)
        filterButtons.forEach(btn => {
            const btnType = btn.getAttribute('data-type');
            if (btnType === type) {
                btn.classList.add('font-semibold', 'text-white');
                btn.classList.remove('text-[#e5e5e5]');
            } else {
                btn.classList.remove('font-semibold', 'text-white');
                btn.classList.add('text-[#e5e5e5]');
            }
        });

        loadAllCarousels();
        
        // Comportamento de scroll
        if (type === 'all') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            const carouselsSection = document.getElementById('carousels');
            window.scrollTo({
                top: carouselsSection.offsetTop - header.offsetHeight - 20, 
                behavior: 'smooth'
            });
        }
        
        // Fecha o menu mobile após o clique
        mobileDropdown.classList.add('hidden');
    };
    
    filterButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            applyFilter(button.getAttribute('data-type'));
        });
    });

    // Lógica do Logo para Resetar
    logo.addEventListener('click', () => applyFilter('all'));

    // Toggle do Menu Mobile
    mobileBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Impede que o clique no botão propague para o document
        mobileDropdown.classList.toggle('hidden');
    });

    // Fecha o menu mobile se clicar em qualquer lugar da tela
    document.addEventListener('click', () => {
        mobileDropdown.classList.add('hidden');
    });
}

/**
 * Atualiza o conteúdo visual do Hero Banner com o item no índice fornecido.
 */
function updateHeroContent(item) {
    if (!item || !item.backdrop_path) return;

    featuredItem = item; 

    const bannerElement = document.getElementById('hero-banner');
    const titleElement = document.getElementById('hero-title');
    const overviewElement = document.getElementById('hero-overview');
    
    const bannerUrl = `${IMAGE_BASE_URL}original${item.backdrop_path}`;
    
    // Animação de transição (garantindo que o banner exista)
    if (bannerElement) {
        bannerElement.style.opacity = 0;
        setTimeout(() => {
            bannerElement.style.backgroundImage = `url('${bannerUrl}')`;
            titleElement.textContent = item.title || item.name;
            overviewElement.textContent = (item.overview || 'Sinopse indisponível.').substring(0, 200) + '...';
            bannerElement.style.opacity = 1;
        }, 500); // 500ms para o fade-in
    }

    setupHeroButtons();
}


/**
 * Inicia a rotação automática do Hero Banner a cada 8 segundos.
 */
function startHeroCarousel() {
    if (featuredItemsList.length <= 1) return; 

    setInterval(() => {
        currentFeaturedIndex = (currentFeaturedIndex + 1) % featuredItemsList.length;
        const nextItem = featuredItemsList[currentFeaturedIndex];
        
        updateHeroContent(nextItem);
    }, 8000); // 8 segundos
}

/**
 * Adiciona os listeners de evento aos botões do Hero Banner.
 */
function setupHeroButtons() {
    const assistButton = document.querySelector('.hero-buttons button:first-child');
    const detailsButton = document.querySelector('.hero-buttons button:last-child');
    
    if (!assistButton || !detailsButton) return;

    // Remove listeners antigos para evitar duplicação
    assistButton.onclick = null;
    detailsButton.onclick = null;

    if (featuredItem && featuredItem.id) {
        const mediaType = featuredItem.media_type || (featuredItem.title ? 'movie' : 'tv');
        
        assistButton.addEventListener('click', () => {
            alert(`Iniciando a reprodução de: ${featuredItem.title || featuredItem.name}`);
        });

        detailsButton.addEventListener('click', () => {
            openModal(featuredItem.id, mediaType);
        });
        
        assistButton.disabled = false;
        detailsButton.disabled = false;

    } else {
         assistButton.disabled = true;
         detailsButton.disabled = true;
    }
}


/**
 * Busca os dados do Hero Banner, armazena a lista e inicia a rotação.
 */
async function loadHeroBanner() {
    try {
        const response = await fetch(ENDPOINTS.hero);
        const data = await response.json();
        
        // Filtra para garantir que só itens com backdrop (imagem de fundo) sejam usados
        featuredItemsList = data.results.filter(item => item.backdrop_path); 

        if (featuredItemsList.length > 0) {
            updateHeroContent(featuredItemsList[0]);
            startHeroCarousel();
        }
    } catch (error) {
        console.error("[ERRO] Falha ao carregar Banner Hero:", error);
    }
    
    setupHeroButtons();
}


// =========================================================
//                  7. LÓGICA DE BUSCA
// =========================================================

const searchIcon = document.getElementById('search-icon');
const searchInput = document.getElementById('search-input');
const clearSearchBtn = document.getElementById('clear-search');
const carouselsSection = document.getElementById('carousels');
const searchResultsSection = document.getElementById('search-results-section');
const searchResultsGrid = document.getElementById('search-results-grid');
const searchResultsTitle = document.getElementById('search-results-title');

/**
 * Cria uma versão "debounced" de uma função que atrasa sua execução.
 * @param {Function} func A função a ser "debounced".
 * @param {number} delay O atraso em milissegundos.
 * @returns {Function} A nova função "debounced".
 */
function debounce(func, delay) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
}

/**
 * Exibe ou oculta a interface de busca.
 */
function toggleSearchView(showSearch) {
    const transitionDuration = 500; // Deve corresponder à duração no CSS (duration-500)

    if (showSearch) {
        // Fade out carrosséis
        carouselsSection.classList.add('opacity-0');
        setTimeout(() => {
            carouselsSection.classList.add('hidden');
        }, transitionDuration);

        // Fade in resultados da busca
        searchResultsSection.classList.remove('hidden');
        setTimeout(() => searchResultsSection.classList.remove('opacity-0'), 50); // Pequeno delay para garantir que a transição ocorra
    } else {
        // Fade out resultados da busca
        searchResultsSection.classList.add('opacity-0');
        setTimeout(() => {
            searchResultsSection.classList.add('hidden');
            searchInput.value = ''; // Limpa o input ao sair da busca
        }, transitionDuration);
        // Fade in carrosséis
        carouselsSection.classList.remove('hidden');
        setTimeout(() => carouselsSection.classList.remove('opacity-0'), 50);
    }
}

/**
 * Busca filmes e séries na API e exibe os resultados.
 */
async function performSearch(query) {
    if (!query || query.trim() === '') {
        toggleSearchView(false); // Se a busca estiver vazia, volta para a home
        return;
    }

    toggleSearchView(true);
    searchResultsGrid.innerHTML = '<p class="text-gray-400 col-span-full">Buscando...</p>';
    searchResultsTitle.textContent = `Resultados para: "${query}"`;

    try {
        const response = await fetch(`${ENDPOINTS.search}&query=${encodeURIComponent(query)}`);
        const data = await response.json();
        const items = data.results.filter(item => item.poster_path && (item.media_type === 'movie' || item.media_type === 'tv'));

        searchResultsGrid.innerHTML = '';

        if (items.length === 0) {
            searchResultsGrid.innerHTML = `
                <div class="col-span-full py-20 text-center">
                    <p class="text-gray-400 text-lg">Nenhum resultado encontrado para "${query}".</p>
                    <p class="text-gray-500 text-sm mt-2">Tente buscar por outros termos, atores ou gêneros.</p>
                </div>
            `;
            return;
        }

        items.forEach(item => {
            const posterUrl = `${IMAGE_BASE_URL}w342${item.poster_path}`;
            const title = item.title || item.name;
            const mediaType = item.media_type;

            const posterDiv = document.createElement('div');
            posterDiv.className = 'cursor-pointer poster-item';
            posterDiv.innerHTML = `<img src="${posterUrl}" alt="${title}" class="w-full h-auto object-cover rounded hover:shadow-xl" loading="lazy">`;

            posterDiv.addEventListener('click', () => {
                openModal(item.id, mediaType);
            });

            searchResultsGrid.appendChild(posterDiv);
        });

    } catch (error) {
        console.error("Erro ao realizar busca:", error);
        searchResultsGrid.innerHTML = '<p class="text-red-500 col-span-full">Erro ao buscar. Tente novamente mais tarde.</p>';
    }
}

/**
 * Configura os eventos do ícone e do input de busca.
 */
function setupSearch() {
    const debouncedSearch = debounce(performSearch, 400); // Atraso de 400ms

    searchIcon.addEventListener('click', () => {
        searchInput.classList.toggle('hidden');
        if (!searchInput.classList.contains('hidden')) {
            searchInput.focus();
        }
        // Se o campo de busca estiver vazio ao clicar no ícone para fechar, volta à home
        if (searchInput.classList.contains('hidden') && searchInput.value) {
            toggleSearchView(false);
        }
    });

    searchInput.addEventListener('input', (e) => {
        debouncedSearch(e.target.value);
    });
}


// =========================================================
//                  8. EXECUÇÃO INICIAL
// =========================================================

document.addEventListener('DOMContentLoaded', () => {
    loadHeroBanner();
    // Inicializa a navegação de todos os carrosséis baseada na config
    CAROUSELS_CONFIG.forEach(carousel => {
        if (carousel.arrows) {
            setupCarouselNavigation(carousel.id, carousel.arrows.left, carousel.arrows.right);
        }
    });

    setupFilterNavigation();
    setupSearch(); // <-- Adicionando a configuração da busca
    
    // Inicia o carregamento dos carrosséis de fileiras
    loadAllCarousels();
});