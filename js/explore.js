// Explore page — City detail showcase OR All Cities Grid
dataReady.then(() => {
  const params = new URLSearchParams(window.location.search);
  const cityQuery = params.get('city') || params.get('ville');
  let city = null;

  if (cityQuery) {
    city = cities.find(c => 
      c.name.toLowerCase() === cityQuery.toLowerCase() || 
      c.id === cityQuery
    );
    if (city) {
      setSelectedCity(city.name);
    }
  }

  if (!city) {
    displayAllCitiesGrid();
    return;
  }

  displayCityDetail(city);
});

// AFFICHER LA GRILLE DE TOUTES LES VILLES =====
function displayAllCitiesGrid() {
  document.querySelector('.city-hero').style.display = 'none';
  document.querySelector('.city-container').style.display = 'none';
  
  const gridSection = document.getElementById('cities-grid-section');
  gridSection.style.display = 'block';

  const citiesGrid = document.getElementById('cities-grid');
  citiesGrid.innerHTML = '';

  cities.forEach(city => {
    const cityCard = document.createElement('div');
    cityCard.className = 'city-card';
    
    const cityImage = city.images && city.images.length > 0 
      ? city.images[0] 
      : 'https://via.placeholder.com/280x220?text=' + city.name;
    
    const tags = city.about?.tags || [];
    const tagsHTML = tags.slice(0, 2).map(tag => 
      `<span class="city-card-tag">${tag}</span>`
    ).join('');
    
    const shortDesc = city.description.split('.')[0] + '.';
    
    cityCard.innerHTML = `
      <div class="city-card-image-wrapper">
        <img src="${cityImage}" alt="${city.name}" class="city-card-image">
        <div class="city-card-region-badge">${city.region}</div>
      </div>
      <div class="city-card-content">
        <h3 class="city-card-name">${city.name}</h3>
        <p class="city-card-description">${shortDesc}</p>
        <div class="city-card-tags">${tagsHTML}</div>
      </div>
    `;

    cityCard.addEventListener('click', () => {
      navigateToCity(city.id);
    });

    citiesGrid.appendChild(cityCard);
  });
}

// NAVIGUER VERS UNE VILLE =====
function navigateToCity(cityId) {
  window.location.href = `explore.html?city=${cityId}`;
}

// AFFICHER LE DÉTAIL D'UNE VILLE =====
function displayCityDetail(city) {
  document.querySelector('.city-hero').style.display = 'block';
  document.querySelector('.city-container').style.display = 'block';
  document.getElementById('cities-grid-section').style.display = 'none';

  setSelectedCity(city.name);

  // CAROUSEL =====
  const carouselTrack = document.getElementById('carousel-track');
  const carouselDots = document.getElementById('carousel-dots');

  city.images.forEach((img, idx) => {
    const imgEl = document.createElement('img');
    imgEl.src = img;
    imgEl.alt = city.name;
    carouselTrack.appendChild(imgEl);

    const dotBtn = document.createElement('button');
    dotBtn.className = `dot${idx === 0 ? ' active' : ''}`;
    dotBtn.dataset.index = idx;
    dotBtn.addEventListener('click', () => goTo(parseInt(dotBtn.dataset.index)));
    carouselDots.appendChild(dotBtn);
  });

  let current = 0;

  function goTo(index) {
    current = (index + city.images.length) % city.images.length;
    carouselTrack.style.transform = `translateX(-${current * 100}%)`;
    document.querySelectorAll('.carousel-dots .dot').forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
  }

  document.querySelector('.carousel-btn.prev').addEventListener('click', () => goTo(current - 1));
  document.querySelector('.carousel-btn.next').addEventListener('click', () => goTo(current + 1));

  // HERO INFO =====
  document.getElementById('city-name').textContent = city.name;
  document.getElementById('city-region').textContent = city.region;
  document.getElementById('city-description').textContent = city.description;

  // ABOUT SECTION =====
  if (city.about) {
    document.getElementById('about-localisation').textContent = city.about.localisation;
    document.getElementById('about-ambiance').textContent = city.about.ambiance;
    document.getElementById('about-importance').textContent = city.about.importanceHistorique;
    document.getElementById('about-special').textContent = city.about.ceQuiLaRendSpeciale;
  }

  // CULTURE SECTION =====
  if (city.culture) {
    document.getElementById('culture-cuisine').textContent = city.culture.cuisineLocale;
    document.getElementById('culture-traditions').textContent = city.culture.traditions;
    document.getElementById('culture-langue').textContent = city.culture.langueDialecte;
    document.getElementById('culture-musique').textContent = city.culture.musique;
    document.getElementById('culture-artisanat').textContent = city.culture.artisanat;
    document.getElementById('culture-style').textContent = city.culture.styleDeVie;
  }

  // FÊTES & ÉVÉNEMENTS =====
  if (city.evenements) {
    const eventList = document.getElementById('evenements-list');
    city.evenements.forEach(event => {
      const li = document.createElement('li');
      li.textContent = event;
      eventList.appendChild(li);
    });
  }

  if (city.placesPopulaires) {
    const placesList = document.getElementById('places-list');
    city.placesPopulaires.forEach(place => {
      const li = document.createElement('li');
      li.textContent = place;
      placesList.appendChild(li);
    });
  }

  if (city.monuments) {
    const monumentList = document.getElementById('monuments-list');
    city.monuments.forEach(monument => {
      const li = document.createElement('li');
      li.textContent = monument;
      monumentList.appendChild(li);
    });
  }

  // INFORMATIONS PRATIQUES =====
  if (city.infosPratiques) {
    const info = city.infosPratiques;

    document.getElementById('info-meilleure').textContent = info.meillerePeriode;
    document.getElementById('info-eviter').textContent = info.periodeAEviter;
    document.getElementById('info-temperature').textContent = info.temperatureMoyenne;

    if (info.budgetMoyen) {
      document.getElementById('budget-hotel').textContent = info.budgetMoyen.hotelNuit;
      document.getElementById('budget-repas').textContent = info.budgetMoyen.repasRestaurant;
      document.getElementById('budget-transport').textContent = info.budgetMoyen.transportJour;
      document.getElementById('budget-jour').textContent = info.budgetMoyen.budgetJour;
    }

    if (info.transport) {
      const transport = info.transport;

      const addTransport = (label, value, id) => {
        const el = document.getElementById(id);
        if (!el) return;
        if (value) {
          el.innerHTML = `<strong>${label}</strong>${value}`;
        } else {
          el.style.display = 'none';
        }
      };

      addTransport('Depuis Casablanca', transport.depuisCasablanca, 'transport-from-casablanca');
      addTransport('Depuis Rabat', transport.depuisRabat, 'transport-from-city1');
      addTransport('Depuis Fès', transport.depuisFes, 'transport-from-city2');
      addTransport('Aéroport', transport.aeroport, 'transport-airport');
    }
  }
}

// REVIEWS =====
dataReady.then(() => {
  const params = new URLSearchParams(window.location.search);
  const cityQuery = params.get('city') || params.get('ville');
  if (!cityQuery) return;

  const city = cities.find(c =>
    c.name.toLowerCase() === cityQuery.toLowerCase() || c.id === cityQuery
  );
  if (!city) return;

  const reviews = getCityReviews(city.id || city.name);
  const scoreEl = document.getElementById('reviews-score');
  const starsEl = document.getElementById('reviews-stars');
  const countEl = document.getElementById('reviews-count');
  const gridEl  = document.getElementById('reviews-grid');
  if (!gridEl) return;

  if (!reviews || reviews.length === 0) {
    scoreEl.textContent = '—';
    gridEl.innerHTML = '<p class="reviews-empty">Aucun avis pour cette ville pour le moment.</p>';
    countEl.textContent = '0 avis';
    return;
  }

  const avg = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);
  scoreEl.textContent = avg;
  countEl.textContent = reviews.length + ' avis';

  const fullStars = Math.floor(avg);
  const halfStar  = avg % 1 >= 0.25;
  let starsHTML = '';
  for (let i = 1; i <= 5; i++) {
    if (i <= fullStars) starsHTML += '★';
    else if (i === fullStars + 1 && halfStar) starsHTML += '½';
    else starsHTML += '☆';
  }
  starsEl.textContent = starsHTML;

  gridEl.innerHTML = '';
  reviews.slice(0, 6).forEach(r => {
    const initials = (r.author || r.name || 'V')
      .split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

    const date = r.date
      ? new Date(r.date).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
      : '';

    const ratingStars = '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating);

    const card = document.createElement('div');
    card.className = 'review-item';
    card.innerHTML = `
      <div class="review-header">
        <div class="review-author">
          <div class="review-avatar">${initials}</div>
          <div class="review-meta">
            <span class="review-name">${r.author || r.name || 'Voyageur'}</span>
            ${date ? `<span class="review-date">${date}</span>` : ''}
          </div>
        </div>
        <div class="review-rating">${ratingStars}</div>
      </div>
      <p class="review-text">${r.comment || r.text || ''}</p>
    `;
    gridEl.appendChild(card);
  });
});

// MODAL AVIS =====
const reviewCtaLink = document.getElementById('review-cta-link');
const reviewModal = document.getElementById('review-modal');
const modalOverlay = document.getElementById('modal-overlay');
const modalClose = document.getElementById('modal-close');

if (reviewCtaLink && reviewModal) {
  reviewCtaLink.addEventListener('click', (e) => {
    e.preventDefault();
    reviewModal.classList.add('active');
    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  });

  function closeModal() {
    reviewModal.classList.remove('active');
    modalOverlay.classList.remove('active');
    document.body.style.overflow = 'auto';
    document.getElementById('review-form').reset();
    document.getElementById('review-rating').value = 0;
    updateStarsDisplay(0);
    document.getElementById('form-msg').innerHTML = '';
  }

  modalClose.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', closeModal);

  // Star picker in modal
  const starPicker = document.getElementById('star-picker');
  const ratingInput = document.getElementById('review-rating');
  const starBtns = starPicker.querySelectorAll('.star-btn');
  let selectedRating = 0;

  function updateStarsDisplay(value) {
    starBtns.forEach(btn => {
      const v = parseInt(btn.dataset.value);
      btn.textContent = v <= value ? '★' : '☆';
      btn.classList.toggle('active', v <= value);
    });
  }

  starBtns.forEach(btn => {
    btn.addEventListener('mouseenter', () => updateStarsDisplay(parseInt(btn.dataset.value)));
    btn.addEventListener('click', () => {
      selectedRating = parseInt(btn.dataset.value);
      ratingInput.value = selectedRating;
      updateStarsDisplay(selectedRating);
    });
  });

  starPicker.addEventListener('mouseleave', () => updateStarsDisplay(selectedRating));

  // Form submission
  const reviewForm = document.getElementById('review-form');
  const msgEl = document.getElementById('form-msg');

  reviewForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const params = new URLSearchParams(window.location.search);
    const cityQuery = params.get('city') || params.get('ville');
    const city = cities.find(c =>
      c.name.toLowerCase() === cityQuery.toLowerCase() || c.id === cityQuery
    );
    if (!city) return;

    const author = document.getElementById('review-name').value.trim();
    const rating = parseInt(ratingInput.value);
    const comment = document.getElementById('review-comment').value.trim();

    if (!author || !rating || !comment) {
      msgEl.innerHTML = '<p class="msg-error">Tous les champs sont obligatoires.</p>';
      return;
    }

    const review = {
      cityId: city.id || city.name,
      author,
      rating,
      comment,
      date: new Date().toISOString().split('T')[0]
    };

    const stored = JSON.parse(localStorage.getItem('cityReviews') || '{}');
    const cityReviewList = stored[city.id || city.name] || [];
    cityReviewList.push(review);
    stored[city.id || city.name] = cityReviewList;
    localStorage.setItem('cityReviews', JSON.stringify(stored));

    msgEl.innerHTML = '<p class="msg-success">Merci ! Votre avis a été ajouté.</p>';

    setTimeout(() => {
      closeModal();
      location.reload();
    }, 1500);
  });
}