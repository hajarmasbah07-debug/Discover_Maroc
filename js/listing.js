// Shared listing logic with combinable filters
dataReady.then(() => {
  const grid        = document.getElementById('listing-grid');
  const searchInput = document.getElementById('search-input');
  const countEl     = document.getElementById('results-count');
  const noResults   = document.getElementById('no-results');
  const resetBtn    = document.getElementById('btn-reset');
  const category    = document.body.dataset.category;

  // Collect filter elements per category =====
  const filters = {};

  if (category === 'restaurant') {
    filters.cuisine  = document.getElementById('filter-cuisine');
    filters.priceMin = document.getElementById('filter-price-min');
    filters.priceMax = document.getElementById('filter-price-max');
    filters.stars    = document.getElementById('filter-stars');
  }

  if (category === 'hotel') {
    filters.type     = document.getElementById('filter-type');
    filters.stars    = document.getElementById('filter-stars');
    filters.priceMin = document.getElementById('filter-price-min');
    filters.priceMax = document.getElementById('filter-price-max');
  }

  if (category === 'activite') {
    filters.activityType = document.getElementById('filter-activity-type');
    filters.stars        = document.getElementById('filter-stars');
    filters.priceMin     = document.getElementById('filter-price-min');
    filters.priceMax     = document.getElementById('filter-price-max');
  }

  // Amenity chips (hotel only) =====
  let selectedAmenities = [];
  const chips = document.querySelectorAll('.chip');

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chip.classList.toggle('active');
      const val = chip.dataset.val;
      if (chip.classList.contains('active')) {
        selectedAmenities.push(val);
      } else {
        selectedAmenities = selectedAmenities.filter(a => a !== val);
      }
      render();
    });
  });

  // RENDER =====
  function render() {
    const query = searchInput.value.toLowerCase().trim();
    const selectedCity = getSelectedCity();

    let filtered = places.filter(p => {
      if (p.category !== category) return false;
      if (selectedCity && p.city.toLowerCase() !== selectedCity.toLowerCase()) return false;
      if (query && !p.name.toLowerCase().includes(query)) return false;

      // RESTAURANT
      if (category === 'restaurant') {
        const cuisine = filters.cuisine?.value;
        if (cuisine && !p.cuisine?.toLowerCase().includes(cuisine.toLowerCase())) return false;

        const maxStars = Number(filters.stars?.value);
if (maxStars > 0 && Number(p.rating) > maxStars) return false;

        const priceMin = parseInt(filters.priceMin?.value) || 0;
        const priceMax = parseInt(filters.priceMax?.value) || Infinity;
        if (p.pricePerPerson && (p.pricePerPerson < priceMin || p.pricePerPerson > priceMax)) return false;
      }

      // HOTEL
      if (category === 'hotel') {
        const type = filters.type?.value;
        if (type && !p.type?.toLowerCase().includes(type.toLowerCase())) return false;

        const maxStars = Number(filters.stars?.value);
console.log('maxStars:', maxStars, '| p.stars:', p.stars, '| type:', typeof p.stars);
if (maxStars > 0 && Number(p.stars) > maxStars) return false;

        const priceMin = parseInt(filters.priceMin?.value) || 0;
        const priceMax = parseInt(filters.priceMax?.value) || Infinity;
        if (p.pricePerNight && (p.pricePerNight < priceMin || p.pricePerNight > priceMax)) return false;

        if (selectedAmenities.length > 0) {
          const pAmenities = p.amenities || [];
          if (!selectedAmenities.every(a => pAmenities.includes(a))) return false;
        }
      }

      // ACTIVITE
      if (category === 'activite') {
        const type = filters.activityType?.value;
        if (type && !p.activityType?.toLowerCase().includes(type.toLowerCase())) return false;

        // Dans le bloc activite
const maxStars = Number(filters.stars?.value);
if (maxStars > 0 && Number(p.rating) > maxStars) return false;

        const priceMin = parseInt(filters.priceMin?.value) || 0;
        const priceMax = parseInt(filters.priceMax?.value) || Infinity;
        if (p.price != null && (p.price < priceMin || p.price > priceMax)) return false;
      }

      return true;
    });

    // Sort by avg rating
    filtered.sort((a, b) => parseFloat(calcAvgRating(b.id)) - parseFloat(calcAvgRating(a.id)));

    // Render
    grid.innerHTML = '';
    countEl.textContent = `${filtered.length} résultat${filtered.length > 1 ? 's' : ''}`;
    noResults.style.display = filtered.length === 0 ? 'block' : 'none';

    filtered.forEach(place => {
      const reviews = getAllReviews(place.id);
      const avg     = calcAvgRating(place.id);
      const isFav   = isFavorite(place.id, category);

      const card = document.createElement('div');
      card.className = 'card';

      // Build extra info
      let extraHTML = '';
      const amenityIcons = {
        'wifi':            '<i class="fa-solid fa-wifi" title="Wi-Fi"></i>',
        'piscine':         '<i class="fa-solid fa-swimmer" title="Piscine"></i>',
        'climatisation':   '<i class="fa-solid fa-wind" title="Climatisation"></i>',
        'parking':         '<i class="fa-solid fa-car" title="Parking"></i>',
        'petit-dejeuner':  '<i class="fa-solid fa-mug-saucer" title="Petit déjeuner"></i>',
        'spa':             '<i class="fa-solid fa-spa" title="Spa"></i>',
        'Room service':    '<i class="fa-solid fa-concierge-bell" title="Room Service"></i>'
      };

      if (category === 'restaurant' && place.cuisine) {
        extraHTML = `<div class="card-tags"><span class="tag">${place.cuisine}</span></div>`;
      }
      if (category === 'hotel') {
        if (place.type) {
          extraHTML = `<div class="card-type-row"><span class="tag">${place.type}</span></div>`;
        }
        if (place.amenities && place.amenities.length) {
          extraHTML += `<div class="card-amenities">${place.amenities.map(a => `<span>${amenityIcons[a] || a}</span>`).join('')}</div>`;
        }
      }
      if (category === 'activite' && place.activityType) {
        const label = place.activityType.charAt(0).toUpperCase() + place.activityType.slice(1);
        extraHTML = `<div class="card-tags"><span class="tag">${label}</span></div>`;
      }
card.innerHTML = `
  <a href="detail.html?id=${place.id}" style="display:block;color:inherit;">
    <img src="${place.image}" alt="${place.name}" loading="lazy">
    <div class="card-body">
      <h3>${place.name}</h3>
      <div class="city-row">
        <p class="city">${place.city}</p>
        ${category === 'hotel' && place.type ? `<span class="tag">${place.type}</span>` : ''}
        ${category === 'restaurant' && place.cuisine ? `<span class="tag">${place.cuisine}</span>` : ''}
        ${category === 'activite' && place.activityType ? `<span class="tag">${place.activityType}</span>` : ''}
      </div>
      <div class="card-price">${formatPrice(place)}</div>
      <div class="rating-row">
        ${starsHTML(parseFloat(avg))}
        <strong>${avg}</strong>
        <span class="count">(${reviews.length} avis)</span>
      </div>
    </div>
  </a>
  ${category === 'hotel' && place.amenities && place.amenities.length ? `<div class="card-amenities">${place.amenities.map(a => `<span>${amenityIcons[a] || a}</span>`).join('')}</div>` : ''}
  <button class="favorite-btn ${isFav ? 'active' : ''}" data-place-id="${place.id}" data-category="${category}" aria-label="Ajouter aux favoris">
    ${isFav ? '♥' : '♡'}
  </button>
`;
      const favBtn = card.querySelector('.favorite-btn');
      favBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const pid = parseInt(favBtn.dataset.placeId);
        const cat = favBtn.dataset.category;
        if (isFavorite(pid, cat)) {
          removeFavorite(pid, cat);
          favBtn.textContent = '♡';
          favBtn.classList.remove('active');
        } else {
          addFavorite(pid, cat);
          favBtn.textContent = '♥';
          favBtn.classList.add('active');
        }
      });

      grid.appendChild(card);
    });
  }

  // Bind events =====
  searchInput.addEventListener('input', render);

  Object.values(filters).forEach(el => {
    if (el) {
      el.addEventListener('input', render);
      el.addEventListener('change', render);
    }
  });

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      searchInput.value = '';
      Object.values(filters).forEach(el => { if (el) el.value = ''; });
      selectedAmenities = [];
      chips.forEach(chip => chip.classList.remove('active'));
      render();
    });
  }

  render();
});