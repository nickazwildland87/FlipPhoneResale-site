// Basic cart, checkout, and quote logic using localStorage
const CART_KEY = 'fpr_cart';

function getCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  updateCartCount();
}

function updateCartCount() {
  const el = document.getElementById('cartCount');
  if (!el) return;
  const count = getCart().length;
  el.textContent = String(count);
}

// Add item to cart
function addToCart(item) {
  const cart = getCart();
  // prevent duplicates by inventory id
  if (!cart.find(i => i.id === item.id)) {
    cart.push({ ...item, qty: 1 });
    setCart(cart);
    alert(`Added: ${item.title}`);
  } else {
    alert('Item already in cart.');
  }
}

// Render cart page
function renderCart() {
  updateCartCount();
  const container = document.getElementById('cartItems');
  if (!container) return;
  const cart = getCart();

  if (cart.length === 0) {
    container.innerHTML = '<p>Your cart is empty.</p>';
    return;
  }

  let total = 0;
  const rows = cart.map((item, idx) => {
    total += item.price * item.qty;
    return `
      <div class="row" style="justify-content:space-between">
        <div>
          <div><strong>${item.title}</strong></div>
          <div class="small">SKU: ${item.sku} · Inv: ${item.id}</div>
          <div class="small">Qty: ${item.qty} · Price: $${item.price}</div>
        </div>
        <div class="row">
          <button class="btn alt" onclick="changeQty(${idx}, -1)">−</button>
          <button class="btn alt" onclick="changeQty(${idx}, 1)">+</button>
          <button class="btn" onclick="removeItem(${idx})">Remove</button>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    ${rows}
    <hr style="border-color:#222738"/>
    <div class="row" style="justify-content:space-between">
      <strong>Total</strong>
      <strong>$${total.toFixed(2)}</strong>
    </div>
  `;
}

function changeQty(index, delta) {
  const cart = getCart();
  const item = cart[index];
  if (!item) return;
  item.qty = Math.max(1, item.qty + delta);
  setCart(cart);
  renderCart();
}

function removeItem(index) {
  const cart = getCart();
  cart.splice(index, 1);
  setCart(cart);
  renderCart();
}

// Render checkout items and total
function renderCheckout() {
  updateCartCount();
  const container = document.getElementById('checkoutItems');
  if (!container) return;
  const cart = getCart();

  if (cart.length === 0) {
    container.innerHTML = '<p>Your cart is empty. <a href="shop.html">Shop now</a></p>';
    return;
  }

  let total = 0;
  const lines = cart.map(item => {
    const line = item.price * item.qty;
    total += line;
    return `<div class="row" style="justify-content:space-between">
      <div>
        <div><strong>${item.title}</strong></div>
        <div class="small">SKU: ${item.sku} · Inv: ${item.id}</div>
        <div class="small">Qty: ${item.qty} · Price: $${item.price}</div>
      </div>
      <div><strong>$${line.toFixed(2)}</strong></div>
    </div>`;
  }).join('');

  container.innerHTML = `${lines}
    <hr style="border-color:#222738"/>
    <div class="row" style="justify-content:space-between">
      <strong>Order total</strong>
      <strong>$${total.toFixed(2)}</strong>
    </div>`;
}

// Place order (mock)
function placeOrder() {
  const name = document.getElementById('custName').value.trim();
  const email = document.getElementById('custEmail').value.trim();
  const addr = document.getElementById('custAddr').value.trim();
  const pay = document.getElementById('payMethod').value;

  if (!name || !email || !addr) {
    alert('Please complete all fields.');
    return;
  }

  const cart = getCart();
  if (cart.length === 0) {
    alert('Your cart is empty.');
    return;
  }

  // Generate a simple order ID
  const orderId = 'FPR-ORD-' + new Date().toISOString().replace(/[-:.TZ]/g,'').slice(0,14);
  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

  const summary = `
    <p><strong>Order placed:</strong> ${orderId}</p>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Address:</strong> ${addr}</p>
    <p><strong>Payment:</strong> ${pay}</p>
    <hr style="border-color:#222738"/>
    <p><strong>Items:</strong></p>
    <ul>
      ${cart.map(i => `<li>${i.title} — SKU: ${i.sku} · Inv: ${i.id} · Qty: ${i.qty} · $${i.price}</li>`).join('')}
    </ul>
    <p><strong>Total:</strong> $${total.toFixed(2)}</p>
    <p class="small">Save or print this page for your records.</p>
  `;

  document.getElementById('orderResult').innerHTML = summary;

  // Clear cart
  setCart([]);
  renderCheckout();
  alert('Order placed. Your order ID: ' + orderId);
}

// Sell quote calculator
function calcQuote() {
  const type = document.getElementById('sellType').value;
  const price = parseFloat(document.getElementById('marketPrice').value || '0');
  const condition = document.getElementById('condition').value;

  if (!price || price <= 0) {
    document.getElementById('quoteOut').textContent = 'Enter a valid market price.';
    return;
  }

  // Baseline percentages by condition
  const baseMap = {
    'like-new': 0.6,
    'good': 0.5,
    'fair': 0.4,
    'poor': 0.25
  };

  // Type adjustment
  const typeAdj = {
    'phone': 1.0,
    'tablet': 0.95,
    'laptop': 1.1,
    'watch': 0.8,
    'other': 0.7
  };

  const pct = (baseMap[condition] || 0.4) * (typeAdj[type] || 1.0);
  const offer = Math.max(10, Math.round(price * pct));

  document.getElementById('quoteOut').textContent = `Estimated offer: $${offer}`;
}

// Initialize cart count on page load
document.addEventListener('DOMContentLoaded', updateCartCount);

