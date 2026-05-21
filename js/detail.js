
// Detail page logic
dataReady.then(() => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const place = getPlaceById(id);

  if (!place) {
    document.querySelector('.detail-info').innerHTML = '<p>Lieu introuvable.</p>';
    return;
  }

  // Update page title
  document.title = `${place.name} — DiscoverMaroc`;

  // Hero
  document.getElementById('detail-img').src = place.image;
  document.getElementById('detail-img').alt = place.name;
  document.getElementById('detail-name').textContent = place.name;
  document.getElementById('detail-city').textContent = place.city;

  const badge = document.getElementById('detail-badge');
  badge.textContent = place.category;
  badge.className = `badge ${place.category}`;

  // Rating
  const reviews = getAllReviews(place.id);
  const avg = calcAvgRating(place.id);

  document.getElementById('detail-rating').textContent = avg;
  document.getElementById('detail-stars').innerHTML = starsHTML(parseFloat(avg));
  document.getElementById('detail-count').textContent = `${reviews.length} avis`;

  // Price
  document.getElementById('detail-price').textContent = formatPrice(place);

  // Description
  document.getElementById('detail-desc').textContent = place.description;

  // Difficulty and Best Season (activités seulement)
  if (place.difficulty || place.bestSeason) {
    const detailsHtml = `
      <div class="activity-details">
        ${place.difficulty ? `<h2 class="section-title">Difficulté: </h2> <p>${place.difficulty}</p>` : ''}
        ${place.bestPeriod ? `<h2 class="section-title">Meilleure periode: </h2> <p>${place.bestPeriod}</p>` : ''}
      </div>
    `;
    document.getElementById('detail-infos-pratiques').insertAdjacentHTML('beforeend', detailsHtml);
  }

  // Infos Pratiques (restaurants seulement)
  if (place.infosPratiques) {
    const infos = place.infosPratiques;
    const infosHtml = `
      <div class="infos-pratiques">
        <h2 class="section-title" style="margin-bottom: 30px;">Infos Pratiques</h2>
        ${infos.adresse ? `<div class="info-item"><strong>Adresse:</strong> ${infos.adresse}</div>` : ''}
        ${infos.telephone ? `<div class="info-item"><strong>Téléphone:</strong> ${infos.telephone}</div>` : ''}
        ${infos.horaires ? `<div class="info-item"><strong>Horaires:</strong> ${infos.horaires}</div>` : ''}
        ${infos.specialites ? `<div class="info-item"><strong>Spécialités:</strong> ${infos.specialites}</div>` : ''}
        ${infos.conseils ? `<div class="info-item"><strong>Conseils:</strong> ${infos.conseils}</div>` : ''}
      </div>
    `;
    document.getElementById('detail-infos-pratiques').innerHTML = infosHtml;
  }

  // Review button - open modal
  const btnAddReview = document.getElementById('review-cta-link');
  const reviewModal = document.getElementById('review-modal');
  const modalOverlay = document.getElementById('modal-overlay');
  const modalClose = document.getElementById('modal-close');

  btnAddReview.addEventListener('click', (e) => {
    e.preventDefault();
    reviewModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  });

  function closeModal() {
    reviewModal.classList.remove('active');
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

    const author = document.getElementById('review-name').value.trim();
    const rating = parseInt(ratingInput.value);
    const comment = document.getElementById('review-comment').value.trim();

    if (!author || !rating || !comment) {
      msgEl.innerHTML = '<p class="msg-error">Tous les champs sont obligatoires.</p>';
      return;
    }

    // Save review to localStorage
    const review = {
      placeId: place.id,
      author,
      rating,
      comment,
      date: new Date().toISOString().split('T')[0]
    };

    const stored = JSON.parse(localStorage.getItem('reviews') || '[]');
    stored.push(review);
    localStorage.setItem('reviews', JSON.stringify(stored));

    msgEl.innerHTML = '<p class="msg-success">Merci ! Votre avis a été ajouté.</p>';

    setTimeout(() => {
      closeModal();
      location.reload();
    }, 1500);
  });

  // Render reviews
  const list = document.getElementById('reviews-list');
  const scoreEl = document.getElementById('reviews-score');
  const starsEl = document.getElementById('reviews-stars');
  const countEl = document.getElementById('reviews-count');
  
  if (!reviews || reviews.length === 0) {
    scoreEl.textContent = '—';
    list.innerHTML = '<p class="reviews-empty">Aucun avis pour le moment.</p>';
    countEl.textContent = '0 avis';
  } else {
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
    
    list.innerHTML = '';
    reviews
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 6)
      .forEach(r => {
        const initials = (r.author || r.name || 'V')
          .split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
        
        const date = r.date
          ? new Date(r.date).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
          : '';
        
        const ratingStars = '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating);
        
        const div = document.createElement('div');
        div.className = 'review-item';
        div.innerHTML = `
          <div class="review-header">
            <div class="review-author">
              <div class="review-avatar">${initials}</div>
              <div class="review-meta">
                <span class="review-name">${r.author}</span>
                ${date ? `<span class="review-date">${date}</span>` : ''}
              </div>
            </div>
            <div class="review-rating">${ratingStars}</div>
          </div>
          <p class="review-text">${r.comment}</p>
        `;
        list.appendChild(div);
      });
  }
});