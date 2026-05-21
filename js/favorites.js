// Favorites page logic
dataReady.then(() => {

  // DISPLAY FAVORITE CITIES =====
  const favoriteCitiesGrid = document.getElementById('favorite-cities-grid');
  const citiesEmpty = document.getElementById('cities-empty');
  const citiesSubtitle = document.getElementById('cities-subtitle');
  
  if (favoriteCitiesGrid) {
    const favCities = getFavoriteCities();
    
    if (favCities.length === 0) {
      favoriteCitiesGrid.style.display = 'none';
      citiesEmpty.style.display = 'block';
      citiesSubtitle.style.display = 'none';
    } else {
      citiesEmpty.style.display = 'none';
      citiesSubtitle.style.display = 'block';
      
      favCities.forEach(city => {
        const card = document.createElement('a');
        card.href = `explore.html?ville=${encodeURIComponent(city.name)}`;
        card.className = 'city-card';
        card.innerHTML = `
          <img src="${city.images[0]}" alt="${city.name}">
          <div class="city-card-overlay">
            <h3>${city.name}</h3>
            <span class="city-region">${city.region || ''}</span>
          </div>
        `;
        favoriteCitiesGrid.appendChild(card);
      });
    }
  }



  // FAVORITE ACTIVITIES =====
  const actCarousel = document.getElementById('activities-carousel');
  const actEmpty = document.getElementById('activities-empty');
  const actSubtitle = document.getElementById('activities-subtitle');
  
  if (actCarousel) {
    const favoriteActivities = getFavorites('activite');
    
    if (favoriteActivities.length === 0) {
      actCarousel.parentElement.parentElement.style.display = 'none';
      actEmpty.style.display = 'block';
      actSubtitle.style.display = 'none';
    } else {
      actEmpty.style.display = 'none';
      actSubtitle.style.display = 'block';
      
      favoriteActivities.forEach(place => {
        const reviews = getAllReviews(place.id);
        const avg = calcAvgRating(place.id);
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
          <a href="detail.html?id=${place.id}" style="display: block;">
            <img src="${place.image}" alt="${place.name}">
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
          <button class="favorite-btn active" data-place-id="${place.id}" data-category="activite" aria-label="Retirer des favoris">
            ♥
          </button>
        `;
        
        const favBtn = card.querySelector('.favorite-btn');
        favBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          removeFavorite(place.id, 'activite');
          card.remove();
          // Show empty state if no more favorites
          if (actCarousel.children.length === 0) {
            actCarousel.parentElement.parentElement.style.display = 'none';
            actEmpty.style.display = 'block';
            actSubtitle.style.display = 'none';
          }
        });
        
        actCarousel.appendChild(card);
      });
      
      createCarousel('activities-carousel', 'activities-prev', 'activities-next', 'activities-dots');
    }
  }

  // FAVORITE HOTELS =====
  const hotelCarousel = document.getElementById('hotels-carousel');
  const hotelEmpty = document.getElementById('hotels-empty');
  const hotelSubtitle = document.getElementById('hotels-subtitle');
  
  if (hotelCarousel) {
    const favoriteHotels = getFavorites('hotel');
    
    if (favoriteHotels.length === 0) {
      hotelCarousel.parentElement.parentElement.style.display = 'none';
      hotelEmpty.style.display = 'block';
      hotelSubtitle.style.display = 'none';
    } else {
      hotelEmpty.style.display = 'none';
      hotelSubtitle.style.display = 'block';
      
      favoriteHotels.forEach(place => {
        const reviews = getAllReviews(place.id);
        const avg = calcAvgRating(place.id);
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
          <a href="detail.html?id=${place.id}" style="display: block;">
            <img src="${place.image}" alt="${place.name}">
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
          <button class="favorite-btn active" data-place-id="${place.id}" data-category="hotel" aria-label="Retirer des favoris">
            ♥
          </button>
        `;
        
        const favBtn = card.querySelector('.favorite-btn');
        favBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          removeFavorite(place.id, 'hotel');
          card.remove();
          if (hotelCarousel.children.length === 0) {
            hotelCarousel.parentElement.parentElement.style.display = 'none';
            hotelEmpty.style.display = 'block';
            hotelSubtitle.style.display = 'none';
          }
        });
        
        hotelCarousel.appendChild(card);
      });
      
      createCarousel('hotels-carousel', 'hotels-prev', 'hotels-next', 'hotels-dots');
    }
  }

  // FAVORITE RESTAURANTS =====
  const restaurantCarousel = document.getElementById('restaurants-carousel');
  const restaurantEmpty = document.getElementById('restaurants-empty');
  const restaurantSubtitle = document.getElementById('restaurants-subtitle');
  
  if (restaurantCarousel) {
    const favoriteRestaurants = getFavorites('restaurant');
    
    if (favoriteRestaurants.length === 0) {
      restaurantCarousel.parentElement.parentElement.style.display = 'none';
      restaurantEmpty.style.display = 'block';
      restaurantSubtitle.style.display = 'none';
    } else {
      restaurantEmpty.style.display = 'none';
      restaurantSubtitle.style.display = 'block';
      
      favoriteRestaurants.forEach(place => {
        const reviews = getAllReviews(place.id);
        const avg = calcAvgRating(place.id);
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
          <a href="detail.html?id=${place.id}" style="display: block;">
            <img src="${place.image}" alt="${place.name}">
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
          <button class="favorite-btn active" data-place-id="${place.id}" data-category="restaurant" aria-label="Retirer des favoris">
            ♥
          </button>
        `;
        
        const favBtn = card.querySelector('.favorite-btn');
        favBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          removeFavorite(place.id, 'restaurant');
          card.remove();
          if (restaurantCarousel.children.length === 0) {
            restaurantCarousel.parentElement.parentElement.style.display = 'none';
            restaurantEmpty.style.display = 'block';
            restaurantSubtitle.style.display = 'none';
          }
        });
        
        restaurantCarousel.appendChild(card);
      });
      
      createCarousel('restaurants-carousel', 'restaurants-prev', 'restaurants-next', 'restaurants-dots');
    }
  }

});
