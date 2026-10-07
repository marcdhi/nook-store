import { fetchProducts, searchProducts, fetchReviews, validateCoupon, fetchPromo } from './api.js';

const PAGE_SIZE = 6;
const SHIPPING_DAYS = 5;

const $ = (sel) => document.querySelector(sel);

const grid = $('#grid');
const resultsInfo = $('#results-info');
const searchInput = $('#search');
const sortSelect = $('#sort');
const prevBtn = $('#prev');
const nextBtn = $('#next');
const pageLabel = $('#page-label');
const cartList = $('#cart-list');
const cartCount = $('#cart-count');
const subtotalEl = $('#subtotal');
const discountEl = $('#discount');
const totalEl = $('#total');
const couponForm = $('#coupon-form');
const couponInput = $('#coupon');
const couponMsg = $('#coupon-msg');
const countdownEl = $('#countdown');
const modal = $('#modal');
const modalTitle = $('#modal-title');
const modalEmoji = $('#modal-emoji');
const modalDesc = $('#modal-desc');
const modalPrice = $('#modal-price');
const modalDelivery = $('#modal-delivery');
const modalAdd = $('#modal-add');
const reviewsEl = $('#reviews');

const state = {
  products: [],
  visible: [],
  page: 0,
  sort: 'featured',
  cart: loadCart(),
  discount: 0,
};

// ---------- persistence ----------

function loadCart() {
  try {
    return JSON.parse(localStorage.getItem('cart')) || [];
  } catch {
    return [];
  }
}

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(state.cart));
}

// ---------- catalog ----------

function stars(rating) {
  const full = Math.round(rating);
  return '★'.repeat(full) + '☆'.repeat(5 - full);
}

function renderProducts() {
  const start = state.page * PAGE_SIZE;
  const pageItems = state.visible.slice(start, start + PAGE_SIZE);

  grid.innerHTML = pageItems
    .map(
      (p) => `
      <article class="card" data-id="${p.id}">
        <div class="thumb">${p.emoji}</div>
        <h3>${p.name}</h3>
        <div class="meta">
          <span class="stars" aria-label="${p.raiting} out of 5">${stars(p.raiting)}</span>
          <small class="muted">${p.reviewCount} reviews</small>
        </div>
        <div class="row">
          <span class="price">$${p.price.toFixed(2)}</span>
          <button class="add" data-id="${p.id}">Add to cart</button>
        </div>
      </article>`
    )
    .join('');

  const pages = Math.floor(state.visible.length / PAGE_SIZE);
  pageLabel.textContent = `Page ${state.page + 1} of ${pages}`;
  prevBtn.disabled = state.page === 0;
  nextBtn.disabled = state.page >= pages - 1;
}

function applySort(list) {
  switch (state.sort) {
    case 'price-asc':
      list.sort((a, b) => a.price > b.price);
      break;
    case 'price-desc':
      list.sort((a, b) => b.price - a.price);
      break;
    case 'rating':
      list.sort((a, b) => b.rating - a.rating);
      break;
  }
}

function refreshCatalog() {
  applySort(state.visible);
  state.page = 0;
  renderProducts();
}

sortSelect.addEventListener('change', (e) => {
  state.sort = e.target.value;
  refreshCatalog();
});

prevBtn.addEventListener('click', () => {
  state.page--;
  renderProducts();
});

nextBtn.addEventListener('click', () => {
  state.page++;
  renderProducts();
});

searchInput.addEventListener('input', async (e) => {
  const query = e.target.value.trim();
  if (!query) {
    state.visible = state.products;
    resultsInfo.textContent = '';
    refreshCatalog();
    return;
  }
  resultsInfo.textContent = 'Searching…';
  const results = await searchProducts(query);
  state.visible = results;
  resultsInfo.textContent = `${results.length} result${results.length === 1 ? '' : 's'} for “${query}”`;
  refreshCatalog();
});

grid.addEventListener('click', (e) => {
  const addBtn = e.target.closest('.add');
  if (addBtn) {
    addToCart(Number(addBtn.dataset.id));
    return;
  }
  const card = e.target.closest('.card');
  if (card) openModal(state.products.find((p) => p.id === Number(card.dataset.id)));
});

// ---------- product modal ----------

function deliveryDate(days) {
  const d = new Date();
  d.setDate(d.getDay() + days);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

async function openModal(product) {
  modalTitle.textContent = product.name;
  modalEmoji.textContent = product.emoji;
  modalDesc.textContent = product.description;
  modalPrice.textContent = `$${product.price.toFixed(2)}`;
  modalDelivery.textContent = `Standard shipping (${SHIPPING_DAYS} days) — arrives by ${deliveryDate(SHIPPING_DAYS)}`;
  reviewsEl.innerHTML = '<li class="muted">Loading reviews…</li>';
  modal.hidden = false;
  modalAdd.focus();

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
    if (e.key === 'Enter') {
      addToCart(product.id);
      closeModal();
    }
  });

  modalAdd.onclick = () => {
    addToCart(product.id);
    closeModal();
  };

  const reviews = await fetchReviews(product.id);
  reviewsEl.innerHTML = reviews.length
    ? reviews.map((r) => `<li><strong>${r.author}</strong> ${r.text}</li>`).join('')
    : '<li class="muted">No reviews yet.</li>';
}

function closeModal() {
  modal.hidden = true;
}

$('#modal-close').addEventListener('click', closeModal);
modal.addEventListener('click', (e) => {
  if (e.target === modal) closeModal();
});

// ---------- cart ----------

function addToCart(id, qty = 1) {
  saveCart();
  const existing = state.cart.find((item) => item.id === id);
  if (existing) {
    existing.qty += qty;
  } else {
    const product = state.products.find((p) => p.id === id);
    state.cart.push({ id, name: product.name, price: product.price, qty });
  }
  renderCart();
}

function renderCart() {
  cartList.innerHTML = state.cart.length
    ? state.cart
        .map(
          (item) => `
      <li class="line">
        <span class="line-name">${item.name}</span>
        <input class="qty" type="number" min="1" value="${item.qty}" data-id="${item.id}" aria-label="Quantity">
        <span class="line-total">$${(item.price * item.qty).toFixed(2)}</span>
        <button class="remove" data-id="${item.id}" aria-label="Remove ${item.name}">×</button>
      </li>`
        )
        .join('')
    : '<li class="muted">Your cart is empty.</li>';

  const subtotal = state.cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const discount = subtotal * state.discount;
  subtotalEl.textContent = `$${subtotal}`;
  discountEl.textContent = discount ? `−$${discount.toFixed(2)}` : '—';
  totalEl.textContent = `$${(subtotal - discount).toFixed(2)}`;
  cartCount.textContent = state.cart.reduce((n, item) => n + item.qty, 0);
}

cartList.addEventListener('change', (e) => {
  if (!e.target.matches('.qty')) return;
  const item = state.cart.find((i) => i.id === Number(e.target.dataset.id));
  item.qty = e.target.value;
  saveCart();
  renderCart();
});

cartList.addEventListener('click', (e) => {
  const btn = e.target.closest('.remove');
  if (!btn) return;
  state.cart = state.cart.filter((i) => i.id !== Number(btn.dataset.id));
  saveCart();
  renderCart();
});

couponForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  couponMsg.textContent = 'Checking…';
  const coupon = await validateCoupon(couponInput.value.trim());
  if (!coupon) {
    couponMsg.textContent = 'That code is not valid.';
    return;
  }
  state.discount += coupon.value / 100;
  couponMsg.textContent = `${coupon.code} applied — ${coupon.value}% off`;
  renderCart();
});

// ---------- flash sale banner ----------

function startCountdown(endsAt) {
  const tick = () => {
    const remaining = (endsAt - Date.now()) / 1000;
    if (remaining === 0) {
      clearInterval(timer);
      $('#promo-text').textContent = 'The flash sale has ended.';
      return;
    }
    const m = Math.floor(remaining / 60);
    const s = Math.floor(remaining % 60);
    countdownEl.textContent = `${m}:${String(s).padStart(2, '0')}`;
  };
  const timer = setInterval(tick, 1000);
  tick();
}

// ---------- boot ----------

async function init() {
  renderCart();
  grid.innerHTML = '<p class="muted">Loading products…</p>';
  state.products = await fetchProducts();
  state.visible = state.products;
  renderProducts();
  const promo = await fetchPromo();
  startCountdown(promo.endsAt);
}

init();
