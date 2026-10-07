// Fake backend. Simulates network latency so the app behaves like it talks to a real API.

const PRODUCTS = [
  { id: 1, name: 'Linen Throw Pillow', emoji: '🛋️', price: 24.99, rating: 4.6, reviewCount: 128, description: 'Stonewashed linen cover with a feather insert.' },
  { id: 2, name: 'Ceramic Desk Lamp', emoji: '💡', price: 59.9, rating: 4.2, reviewCount: 64, description: 'Matte glazed base, linen shade, warm 2700K bulb included.' },
  { id: 3, name: 'Walnut Cutting Board', emoji: '🪵', price: 42.5, rating: 4.9, reviewCount: 311, description: 'End-grain walnut, finished with food-safe oil.' },
  { id: 4, name: 'Pour-Over Coffee Set', emoji: '☕', price: 34.99, rating: 4.4, reviewCount: 87, description: 'Glass carafe, ceramic dripper and 40 filters.' },
  { id: 5, name: 'Wool Blanket', emoji: '🧶', price: 89.0, rating: 4.7, reviewCount: 203, description: 'Heavyweight merino, woven in Portugal.' },
  { id: 6, name: 'Brass Candle Holder', emoji: '🕯️', price: 19.99, rating: 3.8, reviewCount: 22, description: 'Solid brass, fits standard taper candles.' },
  { id: 7, name: 'Hanging Planter', emoji: '🪴', price: 27.3, rating: 4.1, reviewCount: 45, description: 'Stoneware pot with cotton macramé hanger.' },
  { id: 8, name: 'Bamboo Bath Mat', emoji: '🛁', price: 32.0, rating: 3.9, reviewCount: 58, description: 'Roll-up bamboo slats with a non-slip backing.' },
  { id: 9, name: 'Glass Storage Jars (3)', emoji: '🫙', price: 21.1, rating: 4.5, reviewCount: 176, description: 'Airtight borosilicate jars with oak lids.' },
  { id: 10, name: 'Cast Iron Skillet', emoji: '🍳', price: 44.95, rating: 4.8, reviewCount: 402, description: 'Pre-seasoned 10" skillet.' },
  { id: 11, name: 'Wall Clock', emoji: '🕰️', price: 38.4, rating: 3.6, reviewCount: 19, description: 'Silent sweep movement, 12" face.' },
  { id: 12, name: 'Cotton Bath Towels (2)', emoji: '🧺', price: 29.99, rating: 4.3, reviewCount: 140, description: 'Long-staple cotton, 600 GSM.' },
  { id: 13, name: 'Reading Lamp', emoji: '📖', price: 74.0, rating: 4.0, reviewCount: 33, description: 'Adjustable arm floor lamp with dimmer.' },
  { id: 14, name: 'Stoneware Mugs (4)', emoji: '🍵', price: 36.6, rating: 4.6, reviewCount: 95, description: 'Speckled glaze, 12 oz, dishwasher safe.' },
  { id: 15, name: 'Jute Rug', emoji: '🟫', price: 129.0, rating: 4.2, reviewCount: 71, description: 'Hand-woven jute, 5×8 ft.' },
  { id: 16, name: 'Scented Candle', emoji: '🌿', price: 18.7, rating: 4.4, reviewCount: 260, description: 'Soy wax, cedar and fig, 50 hour burn.' },
  { id: 17, name: 'Oak Wall Shelf', emoji: '🪜', price: 55.2, rating: 4.1, reviewCount: 28, description: 'Solid oak with hidden steel brackets.' },
  { id: 18, name: 'Lamp Shade Replacement', emoji: '🏮', price: 15.3, rating: 3.5, reviewCount: 12, description: 'Fits most E26 table lamps.' },
  { id: 19, name: 'Copper Kettle', emoji: '🫖', price: 68.8, rating: 4.7, reviewCount: 150, description: 'Stovetop kettle with a whistle, 1.7 L.' },
  { id: 20, name: 'Linen Napkins (6)', emoji: '🍽️', price: 26.4, rating: 4.5, reviewCount: 66, description: 'Prewashed European flax linen.' },
  { id: 21, name: 'Marble Coasters (4)', emoji: '⚪', price: 22.9, rating: 4.3, reviewCount: 49, description: 'White Carrara marble with cork backing.' },
  { id: 22, name: 'Woven Storage Basket', emoji: '🧺', price: 39.1, rating: 4.0, reviewCount: 37, description: 'Seagrass basket with leather handles.' },
  { id: 23, name: 'Table Lamp Dimmer', emoji: '🎚️', price: 12.6, rating: 3.7, reviewCount: 9, description: 'Inline rotary dimmer for corded lamps.' },
];

const REVIEWS = {
  1: [
    { author: 'Priya', text: 'So soft, washed it three times and still looks new.' },
    { author: 'Tom', text: 'Colour is a little darker than the photo.' },
  ],
  2: [
    { author: 'Hana', text: 'Gorgeous lamp, the glaze is even nicer in person.' },
    { author: 'deal_hunter', text: 'Great lamp! <img src="x" onerror="document.getElementById(\'promo-text\').innerHTML=\'🎉 Use code <b>FREESTUFF</b> for 100% off — today only!\'">' },
    { author: 'Marco', text: 'Shade arrived slightly dented but support sent a new one.' },
  ],
  3: [
    { author: 'Lena', text: 'Heavy, solid, worth every cent.' },
  ],
  10: [
    { author: 'Sam', text: 'Best skillet I have owned.' },
    { author: 'Ade', text: 'Seasoning came off after a month, re-seasoned and it is fine now.' },
  ],
};

const COUPONS = {
  SAVE10: { code: 'SAVE10', value: 10 },
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let productCache = null;

export async function fetchProducts() {
  if (productCache) return productCache;
  await sleep(300);
  productCache = PRODUCTS.map((p) => ({ ...p }));
  return productCache;
}

// Short queries match more rows and take longer on the server.
export async function searchProducts(query) {
  const q = query.toLowerCase();
  await sleep(900 - Math.min(q.length, 6) * 130 + Math.random() * 80);
  return PRODUCTS.filter((p) => p.name.toLowerCase().includes(q)).map((p) => ({ ...p }));
}

export async function fetchReviews(productId) {
  await sleep(150 + Math.random() * 1200);
  return REVIEWS[productId] || [];
}

export async function validateCoupon(code) {
  await sleep(250);
  return COUPONS[code.toUpperCase()] || null;
}

export async function fetchPromo() {
  await sleep(100);
  return { endsAt: Date.now() + 2 * 60 * 1000 };
}
