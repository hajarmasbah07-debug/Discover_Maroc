// Charge les données depuis les fichiers JSON et expose tout globalement

let places = [];
let cities = [];
let cityReviews = {};

// Charge les quatre JSON en parallèle (hotels, restaurants, activities + cities et reviews)
const dataReady = Promise.all([
  fetch('data/hotels.json').then(r => r.json()),
  fetch('data/restaurants.json').then(r => r.json()),
  fetch('data/activities.json').then(r => r.json()),
  fetch('data/cities.json').then(r => r.json()),
  fetch('data/cityreviews.json').then(r => r.json())
]).then(([hotelsData, restaurantsData, activitiesData, citiesData, cityReviewsData]) => {
  places = [...hotelsData, ...restaurantsData, ...activitiesData];
  cities = citiesData;
  cityReviews = cityReviewsData;
});

// HELPERS =====

function getPlaceById(id) {
  return places.find(p => p.id === parseInt(id));
}

function getAllReviews(placeId) {
  const place = getPlaceById(placeId);
  if (!place) return [];
  const stored = JSON.parse(localStorage.getItem('reviews') || '[]');
  const userReviews = stored.filter(r => r.placeId === parseInt(placeId));
  return [...place.reviews, ...userReviews];
}

function calcAvgRating(placeId) {
  const reviews = getAllReviews(placeId);
  if (reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return (sum / reviews.length).toFixed(1);
}

function starsHTML(rating, max = 5) {
  let html = '';
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.25;
  for (let i = 1; i <= max; i++) {
    if (i <= full) html += '<span class="star full">★</span>';
    else if (i === full + 1 && half) html += '<span class="star half">★</span>';
    else html += '<span class="star empty">☆</span>';
  }
  return html;
}

function getCityReviews(cityId) {
  const reviews = cityReviews[cityId] || [];
  return reviews;
}

function calcCityAvgRating(cityId) {
  const reviews = getCityReviews(cityId);
  if (reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return (sum / reviews.length).toFixed(1);
}

// PRICE FORMATTER =====

function formatPrice(place) {
  if (!place) return '';
  
  if (place.category === 'hotel' && place.pricePerNight) {
    return `${place.pricePerNight} DHS/nuit`;
  }
  
  if (place.category === 'restaurant' && place.pricePerPerson) {
    return `A partir de ${place.pricePerPerson} DHS`;
  }
  
  if (place.category === 'activite') {
    if (place.price === 0) {
      return 'GRATUIT';
    }
    return `A partir de ${place.price} DHS`;
  }
  
  return '';
}

// CITY SELECTION MANAGEMENT =====

function setSelectedCity(cityName) {
  if (cityName) {
    localStorage.setItem('selectedCity', cityName);
  }
}

function getSelectedCity() {
  return localStorage.getItem('selectedCity');
}

function clearSelectedCity() {
  localStorage.removeItem('selectedCity');
}

function getCityById(cityName) {
  return cities.find(c => c.name.toLowerCase() === cityName.toLowerCase());
}

// FAVORITES MANAGEMENT =====

function addFavorite(placeId, category) {
  const favorites = JSON.parse(localStorage.getItem('favorites') || '{}');
  if (!favorites[category]) {
    favorites[category] = [];
  }
  if (!favorites[category].includes(placeId)) {
    favorites[category].push(placeId);
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }
}

function removeFavorite(placeId, category) {
  const favorites = JSON.parse(localStorage.getItem('favorites') || '{}');
  if (favorites[category]) {
    favorites[category] = favorites[category].filter(id => id !== placeId);
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }
}

function isFavorite(placeId, category) {
  const favorites = JSON.parse(localStorage.getItem('favorites') || '{}');
  return favorites[category] && favorites[category].includes(placeId);
}

function getFavorites(category) {
  const favorites = JSON.parse(localStorage.getItem('favorites') || '{}');
  if (!favorites[category]) return [];
  return places.filter(p => p.category === category && favorites[category].includes(p.id));
}

function getFavoriteCities() {
  const favoriteCities = JSON.parse(localStorage.getItem('favoriteCities') || '[]');
  return cities.filter(c => favoriteCities.includes(c.name));
}

function addFavoriteCity(cityName) {
  const favoriteCities = JSON.parse(localStorage.getItem('favoriteCities') || '[]');
  if (!favoriteCities.includes(cityName)) {
    favoriteCities.push(cityName);
    localStorage.setItem('favoriteCities', JSON.stringify(favoriteCities));
  }
}

function removeFavoriteCity(cityName) {
  let favoriteCities = JSON.parse(localStorage.getItem('favoriteCities') || '[]');
  favoriteCities = favoriteCities.filter(c => c !== cityName);
  localStorage.setItem('favoriteCities', JSON.stringify(favoriteCities));
}

function isFavoriteCity(cityName) {
  const favoriteCities = JSON.parse(localStorage.getItem('favoriteCities') || '[]');
  return favoriteCities.includes(cityName);
}

// CAROUSEL HELPER (shared) =====
// CAROUSEL HELPER (shared) =====
function createCarousel(carouselId, prevBtnId, nextBtnId, dotsId) {
  const carousel       = document.getElementById(carouselId);
  const prevBtn        = document.getElementById(prevBtnId);
  const nextBtn        = document.getElementById(nextBtnId);
  const dotsContainer  = document.getElementById(dotsId);
  const wrapper        = carousel?.parentElement; // .carousel-wrapper

  if (!carousel || !prevBtn || !nextBtn || !wrapper) return;

  let currentIndex = 0;

  function getCardWidth() {
    const firstCard = carousel.children[0];
    if (!firstCard) return 260;
    const style = getComputedStyle(carousel);
    const gap   = parseFloat(style.gap) || parseFloat(style.columnGap) || 20;
    return firstCard.offsetWidth + gap;
  }

  function getVisibleCount() {
    const cardWidth = getCardWidth();
    return Math.max(1, Math.floor(wrapper.offsetWidth / cardWidth));
  }

  function getTotalSlides() {
    const total   = carousel.children.length;
    const visible = getVisibleCount();
    return Math.max(1, total - visible + 1);
  }

  function buildDots() {
    if (!dotsContainer) return;
    const total = getTotalSlides();
    dotsContainer.innerHTML = '';
    for (let i = 0; i < total; i++) {
      const dot = document.createElement('button');
      dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Slide ${i + 1}`);
      dot.addEventListener('click', () => goToSlide(i));
      dotsContainer.appendChild(dot);
    }
  }

  function update() {
    const cardWidth  = getCardWidth();
    const maxScroll  = carousel.scrollWidth - wrapper.offsetWidth;
    const pos        = Math.min(currentIndex * cardWidth, Math.max(0, maxScroll));

    carousel.style.transform = `translateX(${-pos}px)`;

    prevBtn.disabled = currentIndex <= 0;
    nextBtn.disabled = pos >= maxScroll - 1;

    if (dotsContainer) {
      dotsContainer.querySelectorAll('.carousel-dot').forEach((d, i) => {
        d.classList.toggle('active', i === currentIndex);
      });
    }
  }

  function goToSlide(idx) {
    const total = getTotalSlides();
    currentIndex = Math.max(0, Math.min(idx, total - 1));
    update();
  }

  prevBtn.addEventListener('click', () => goToSlide(currentIndex - 1));
  nextBtn.addEventListener('click', () => goToSlide(currentIndex + 1));

  // Rebuild on resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      currentIndex = 0;
      buildDots();
      update();
    }, 150);
  });
  // Attendre le layout réel avant le premier calcul
  requestAnimationFrame(() => {
    buildDots();
    update();
  });
}

// CARD BUILDER (shared) =====
function buildCard(place, category) {
  const reviews = getAllReviews(place.id);
  const avg     = calcAvgRating(place.id);
  const isFav   = isFavorite(place.id, category);

  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `
    <a href="detail.html?id=${place.id}" style="display:block;">
      <img src="${place.image}" alt="${place.name}" loading="lazy">
      <div class="card-body">
        <h3>${place.name}</h3>
        <p class="city">${place.city}</p>
        <div class="rating-row">
          ${starsHTML(parseFloat(avg))}
          <strong>${avg}</strong>
          <span class="count">(${reviews.length} avis)</span>
        </div>
      </div>
    </a>
    <button class="favorite-btn ${isFav ? 'active' : ''}" data-place-id="${place.id}" data-category="${category}" aria-label="Ajouter aux favoris">
      ${isFav ? '♥' : '♡'}
    </button>
  `;

  card.querySelector('.favorite-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    const btn = e.currentTarget;
    const pid = parseInt(btn.dataset.placeId);
    const cat = btn.dataset.category;
    if (isFavorite(pid, cat)) {
      removeFavorite(pid, cat);
      btn.textContent = '♡';
      btn.classList.remove('active');
    } else {
      addFavorite(pid, cat);
      btn.textContent = '♥';
      btn.classList.add('active');
    }
  });

  return card;
}
