// common.js
function addToCart(name, price, image) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const existingIndex = cart.findIndex(item => item.name === name);
  if (existingIndex > -1) {
    cart[existingIndex].quantity += 1;
  } else {
    cart.push({ name, price, image, quantity: 1 });
  }
  localStorage.setItem("cart", JSON.stringify(cart));
  alert(`${name} added to cart.`);
}

function displayCart() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const cartItems = document.getElementById("cart-items");
  const cartTotal = document.getElementById("cart-total");

  cartItems.innerHTML = "";
  let total = 0;

  cart.forEach((item, index) => {
    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
      <img src="${item.image}" alt="${item.name}" style="width:60px;height:auto;border-radius:4px;">
      <span>${item.name} - $${item.price.toFixed(2)}</span>
      <div class="quantity-controls">
        <button onclick="changeQuantity(${index}, -1)">−</button>
        <input type="number" value="${item.quantity}" readonly>
        <button onclick="changeQuantity(${index}, 1)">+</button>
      </div>
      <span>Subtotal: $${(item.price * item.quantity).toFixed(2)}</span>
      <button onclick="removeFromCart(${index})">Remove</button>
    `;
    cartItems.appendChild(div);
    total += item.price * item.quantity;
  });

  cartTotal.textContent = `Total: $${total.toFixed(2)}`;
}

function changeQuantity(index, delta) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart[index].quantity += delta;
  if (cart[index].quantity < 1) cart[index].quantity = 1;
  localStorage.setItem("cart", JSON.stringify(cart));
  displayCart();
}

function removeFromCart(index) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  displayCart();
}

function clearCart() {
  localStorage.removeItem("cart");
}

function displayCheckoutSummary() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const summary = document.getElementById("checkout-summary");

  if (cart.length === 0) {
    summary.innerHTML = "<p>Your cart is empty.</p>";
    return;
  }

  let total = 0;
  summary.innerHTML = "<ul style='list-style:none;padding:0;'>";
  cart.forEach(item => {
    const subtotal = item.price * item.quantity;
    summary.innerHTML += `
      <li style="margin-bottom:10px;display:flex;align-items:center;gap:10px;">
        <img src="${item.image}" alt="${item.name}" style="width:50px;height:auto;border-radius:4px;">
        <span>${item.name} (x${item.quantity}) - $${subtotal.toFixed(2)}</span>
      </li>
    `;
    total += subtotal;
  });
  summary.innerHTML += `</ul><h3>Total: $${total.toFixed(2)}</h3>`;
}




