// Home page logic
dataReady.then(() => {

  // CLEAR CITY SELECTION ON INDEX PAGE =====
  clearSelectedCity();

  // HERO SLIDESHOW =====
  const heroImages = [
    'images/H1.png',
    'images/H2.png',
    'images/H3.png',
    'images/H4.png',
    'images/H5.png'
  ];

  const heroSection = document.querySelector('.hero');
  if (heroSection) {
    const slidesContainer = document.createElement('div');
    slidesContainer.className = 'hero-slides';

    heroImages.forEach((src, i) => {
      const slide = document.createElement('div');
      slide.className = 'hero-slide' + (i === 0 ? ' active' : '');
      slide.style.backgroundImage = `url('${src}')`;
      slidesContainer.appendChild(slide);
    });

    heroSection.insertBefore(slidesContainer, heroSection.firstChild);

    const slides = slidesContainer.querySelectorAll('.hero-slide');
    let current = 0;
    let autoplayTimer;

    function goToSlide(idx) {
      slides[current].classList.remove('active');
      current = (idx + heroImages.length) % heroImages.length;
      slides[current].classList.add('active');
    }

    function startAutoplay() {
      autoplayTimer = setInterval(() => goToSlide(current + 1), 5000);
    }

    function stopAutoplay() { clearInterval(autoplayTimer); }

    startAutoplay();
    heroSection.addEventListener('mouseenter', stopAutoplay);
    heroSection.addEventListener('mouseleave', startAutoplay);
  }

  // VILLES POPULAIRES (triées par note) =====
  const cityGrid = document.getElementById('city-grid');
  if (cityGrid) {
    const sortedCities = [...cities].sort((a, b) => {
      const avgA = parseFloat(calcCityAvgRating(a.id || a.name));
      const avgB = parseFloat(calcCityAvgRating(b.id || b.name));
      return avgB - avgA;
    });

    sortedCities.slice(0, 6).forEach(city => {
      const card = document.createElement('div');
      card.className = 'city-card';
      const isFav = isFavoriteCity(city.name);
      card.innerHTML = `
        <a href="explore.html?ville=${encodeURIComponent(city.name)}" style="display:block;width:100%;height:100%;">
          <img src="${city.images[0]}" alt="${city.name}" loading="lazy">
          <div class="city-card-overlay">
            <h3>${city.name}</h3>
            <span class="city-region">${city.region || ''}</span>
          </div>
        </a>
        <button class="favorite-btn ${isFav ? 'active' : ''}" data-city="${city.name}" aria-label="Ajouter aux favoris">
          ${isFav ? '♥' : '♡'}
        </button>
      `;

      const link = card.querySelector('a');
      link.addEventListener('click', () => setSelectedCity(city.name));

      const favBtn = card.querySelector('.favorite-btn');
      favBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const cityName = favBtn.dataset.city;
        if (isFavoriteCity(cityName)) {
          removeFavoriteCity(cityName);
          favBtn.textContent = '♡';
          favBtn.classList.remove('active');
        } else {
          addFavoriteCity(cityName);
          favBtn.textContent = '♥';
          favBtn.classList.add('active');
        }
      });

      cityGrid.appendChild(card);
    });
    createCarousel('city-grid', 'cities-prev', 'cities-next', 'cities-dots');
  }

  // ACTIVITÉS POPULAIRES (triées par note) =====
  const actCarousel = document.getElementById('activities-carousel');
  if (actCarousel) {
    places
      .filter(p => p.category === 'activite')
      .sort((a, b) => parseFloat(calcAvgRating(b.id)) - parseFloat(calcAvgRating(a.id)))
      .slice(0, 8)
      .forEach(p => actCarousel.appendChild(buildCard(p, 'activite')));
    createCarousel('activities-carousel', 'activities-prev', 'activities-next', 'activities-dots');
  }

  // HÉBERGEMENTS POPULAIRES (triés par note) =====
  const hotelCarousel = document.getElementById('hotels-carousel');
  if (hotelCarousel) {
    places
      .filter(p => p.category === 'hotel')
      .sort((a, b) => parseFloat(calcAvgRating(b.id)) - parseFloat(calcAvgRating(a.id)))
      .slice(0, 8)
      .forEach(p => hotelCarousel.appendChild(buildCard(p, 'hotel')));
    createCarousel('hotels-carousel', 'hotels-prev', 'hotels-next', 'hotels-dots');
  }

  // RESTAURANTS POPULAIRES (triés par note) =====
  const restaurantCarousel = document.getElementById('restaurants-carousel');
  if (restaurantCarousel) {
    places
      .filter(p => p.category === 'restaurant')
      .sort((a, b) => parseFloat(calcAvgRating(b.id)) - parseFloat(calcAvgRating(a.id)))
      .slice(0, 8)
      .forEach(p => restaurantCarousel.appendChild(buildCard(p, 'restaurant')));
    createCarousel('restaurants-carousel', 'restaurants-prev', 'restaurants-next', 'restaurants-dots');
  }

  // HERO SEARCH =====
  const searchBtn   = document.getElementById('hero-search-btn');
  const searchInput = document.getElementById('hero-search');

  if (searchBtn && searchInput) {
    searchBtn.addEventListener('click', () => {
      const q = searchInput.value.trim();
      if (q) {
        setSelectedCity(q);
        window.location.href = `explore.html?city=${encodeURIComponent(q)}`;
      }
    });

    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') searchBtn.click();
    });
  }

});