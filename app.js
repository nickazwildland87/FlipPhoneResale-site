// ==================== PRODUCT DATA ====================
let products = []; // We fetch this from the server now

// ==================== CART MANAGEMENT ====================
let cart = [];

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    
    if (product) {
        const existingItem = cart.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        updateCartCount();
        showNotification(`${product.name} added to cart!`);
    } else {
        fetchAndAddToCart(productId);
    }
}

async function fetchAndAddToCart(productId) {
    try {
        const renderBackendURL = `https://flipphone-backend.onrender.com/api/products/${productId}`;
        const response = await fetch(renderBackendURL);
        if (!response.ok) throw new Error("Product not found");
        
        const product = await response.json();
        
        const existingItem = cart.find(item => item.id === productId);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        updateCartCount();
        showNotification(`${product.name} added to cart!`);
        
    } catch (error) {
        console.error("Failed to fetch product for cart:", error);
        showNotification("Error: Could not add item to cart.");
    }
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartCount();
    displayCart(); 
}

function updateCartCount() {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    const cartCountElements = document.querySelectorAll('#cart-count');
    cartCountElements.forEach(el => el.textContent = count);
    localStorage.setItem('cart', JSON.stringify(cart));
}

function displayCart() {
    const cartItemsContainer = document.getElementById('cart-items');
    if (!cartItemsContainer) return; 
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p style="text-align: center; color: #999; padding: 2rem;">Your cart is empty</p>';
        document.getElementById('cart-total').textContent = '0.00';
        return;
    }
    let html = '';
    let total = 0;
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        html += `
            <div class="cart-item">
                <div>
                    <p style="font-weight: 600; margin-bottom: 0.3rem;">${item.name}</p>
                    <p style="color: #999; font-size: 0.9rem;">Qty: ${item.quantity}</p>
                </div>
                <div style="text-align: right;">
                    <p style="color: var(--color-primary); font-weight: bold;">$${(itemTotal).toFixed(2)}</p>
                    <button onclick="removeFromCart(${item.id})" style="background: #ff6b6b; color: white; border: none; padding: 0.4rem 0.8rem; border-radius: 4px; cursor: pointer; font-size: 0.85rem;">Remove</button>
                </div>
            </div>
        `;
    });
    cartItemsContainer.innerHTML = html;
    document.getElementById('cart-total').textContent = total.toFixed(2);
}

function openCart() {
    const cartModal = document.getElementById('cartModal');
    if (cartModal) {
        cartModal.style.display = 'block';
        displayCart();
    }
}

function closeCart() {
    const cartModal = document.getElementById('cartModal');
    if (cartModal) {
        cartModal.style.display = 'none';
    }
}

function checkout() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    window.location.href = 'checkout.html';
}

function processCheckout(event) {
    event.preventDefault(); 
    
    const form = event.target;
    const customerName = form.querySelector('#fullName').value;
    const customerEmail = form.querySelector('#email').value;

    const savedCart = localStorage.getItem('cart');
    if (!savedCart || JSON.parse(savedCart).length === 0) {
        alert("Your cart is empty. Cannot process order.");
        window.location.href = 'shop.html';
        return;
    }

    const finalOrder = {
        cart: JSON.parse(savedCart),
        customerName: customerName,
        customerEmail: customerEmail,
        orderId: new Date().getTime(), 
        total: document.getElementById('checkout-total').textContent
    };
    localStorage.setItem('finalOrder', JSON.stringify(finalOrder));

    cart = [];
    localStorage.removeItem('cart'); 
    updateCartCount(); 

    window.location.href = 'receipt.html';
}

function clearReceipt() {
    localStorage.removeItem('finalOrder');
    window.location.href = 'index.html';
}

// ==================== USER AUTHENTICATION LOGIC ====================

async function handleRegister(event) {
    event.preventDefault(); 
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;
    const messageDiv = document.getElementById('auth-message');
    
    if (!email || !password || !passwordConfirm) {
        messageDiv.textContent = 'Please fill out all fields.';
        messageDiv.className = 'auth-message error';
        return;
    }
    if (password !== passwordConfirm) {
        messageDiv.textContent = 'Passwords do not match.';
        messageDiv.className = 'auth-message error';
        return;
    }

    try {
        const renderBackendURL = "https://flipphone-backend.onrender.com/api/users/register";
        
        const response = await fetch(renderBackendURL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email, password: password })
        });

        const data = await response.json();

        if (response.ok) {
            messageDiv.textContent = 'Registration successful! Redirecting to login...';
            messageDiv.className = 'auth-message success';
            setTimeout(() => { window.location.href = 'login.html'; }, 2000);
        } else {
            messageDiv.textContent = data.message;
            messageDiv.className = 'auth-message error';
        }
    } catch (error) {
        console.error('Registration failed:', error);
        messageDiv.textContent = 'An error occurred. Please try again later.';
        messageDiv.className = 'auth-message error';
    }
}

// === ★ NEW LOGIN FUNCTION ★ ===
async function handleLogin(event) {
    event.preventDefault(); 
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const messageDiv = document.getElementById('auth-message');
    
    if (!email || !password) {
        messageDiv.textContent = 'Please enter email and password.';
        messageDiv.className = 'auth-message error';
        return;
    }

    try {
        const renderBackendURL = "https://flipphone-backend.onrender.com/api/users/login";
        
        const response = await fetch(renderBackendURL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email, password: password })
        });

        const data = await response.json();

        if (response.ok) {
            // Success! Save the user info to localStorage
            localStorage.setItem('currentUser', JSON.stringify(data.user));
            
            messageDiv.textContent = 'Login successful! Redirecting...';
            messageDiv.className = 'auth-message success';
            
            // Redirect to home page (or account page later)
            setTimeout(() => { window.location.href = 'index.html'; }, 1500);
        } else {
            messageDiv.textContent = data.message;
            messageDiv.className = 'auth-message error';
        }
    } catch (error) {
        console.error('Login failed:', error);
        messageDiv.textContent = 'An error occurred. Please try again later.';
        messageDiv.className = 'auth-message error';
    }
}


// ==================== PRODUCT DISPLAY ====================
function displayProducts() {
    const grid = document.getElementById('products-grid');
    if (!grid) return; 
    
    if (products.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999; padding: 2rem;">Loading products...</p>';
        return;
    }

    grid.innerHTML = products.map(product => `
        <a href="product.html?id=${product.id}" class="product-card-link">
            <div class="product-card">
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/280x250?text=${encodeURIComponent(product.name)}'">
                    <span class="badge">${product.badge}</span>
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p class="condition">Condition: ${product.condition}</p>
                    <p class="price">$${product.price.toFixed(2)}</p>
                    <p class="rating">${product.rating}</p>
                    ${product.specs ? `<p style="font-size: 0.85rem; color: #667eea; margin-bottom: 0.5rem;"><strong>Specs:</strong> ${product.specs}</p>` : ''}
                    <button class="add-to-cart" onclick="event.preventDefault(); addToCart(${product.id});">Add to Cart</button>
                </div>
            </div>
        </a>
    `).join('');
}

function filterProducts() {
    const searchTerm = document.getElementById('search').value.toLowerCase();
    const filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.condition.toLowerCase().includes(searchTerm) ||
        (product.category && product.category.toLowerCase().includes(searchTerm))
    );
    const grid = document.getElementById('products-grid');
    if (!grid) return;
    
    if (filtered.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999; padding: 2rem;">No products found</p>';
        return;
    }

    grid.innerHTML = filtered.map(product => `
        <a href="product.html?id=${product.id}" class="product-card-link">
            <div class="product-card">
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}">
                    <span class="badge">${product.badge}</span>
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p class="condition">Condition: ${product.condition}</p>
                    <p class="price">$${product.price.toFixed(2)}</p>
                    <p class="rating">${product.rating}</p>
                    <button class="add-to-cart" onclick="event.preventDefault(); addToCart(${product.id});">Add to Cart</button>
                </div>
            </div>
        </a>
    `).join('');
}

function sortProducts() {
    const sortValue = document.getElementById('sort').value;
    let sorted = [...products]; 
    switch (sortValue) {
        case 'price-low': sorted.sort((a, b) => a.price - b.price); break;
        case 'price-high': sorted.sort((a, b) => b.price - b.price); break;
        case 'newest': sorted.reverse(); break;
        default: break;
    }
    const grid = document.getElementById('products-grid');
    if (!grid) return;
    
    grid.innerHTML = sorted.map(product => `
        <a href="product.html?id=${product.id}" class="product-card-link">
            <div class="product-card">
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}">
                    <span class="badge">${product.badge}</span>
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p class="condition">Condition: ${product.condition}</p>
                    <p class="price">$${product.price.toFixed(2)}</p>
                    <p class="rating">${product.rating}</p>
                    <button class="add-to-cart" onclick="event.preventDefault(); addToCart(${product.id});">Add to Cart</button>
                </div>
            </div>
        </a>
    `).join('');
}

function subscribeNewsletter(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const messageDiv = document.getElementById('newsletter-message');
    if (!email || !email.includes('@')) {
        messageDiv.innerHTML = '<p style="color: #ff6b6b;">Please enter a valid email.</p>';
        return;
    }
    messageDiv.innerHTML = '<p style="color: #4CAF50;">✓ Thank you for subscribing!</p>';
    document.getElementById('email').value = '';
    setTimeout(() => { messageDiv.innerHTML = ''; }, 4000);
}

function sendContactForm(event) {
    event.preventDefault();
    alert('Thank you for your message! We will get back to you within 24 hours.');
    event.target.reset();
}

function processSellForm(event) {
    event.preventDefault();
    const form = event.target;
    const successDiv = document.getElementById('sell-success');
    if (!successDiv) return; 
    const device = form.device.value.trim();
    if (!device) {
        successDiv.innerHTML = "<span style='color:#ff6b6b'>Please complete all required fields.</span>";
        return;
    }
    successDiv.textContent = "Thank you! We received your request.";
    form.reset();
    setTimeout(() => { successDiv.textContent = ""; }, 7000);
}

function toggleFAQ(button) {
    const answer = button.nextElementSibling;
    const toggle = button.querySelector('.faq-toggle');
    if (!answer || !toggle) return;
    document.querySelectorAll('.faq-answer').forEach(item => {
        if (item !== answer) {
            item.style.display = 'none';
            const otherToggle = item.previousElementSibling.querySelector('.faq-toggle');
            if(otherToggle) otherToggle.textContent = '+';
        }
    });
    if (answer.style.display === 'none' || answer.style.display === '') {
        answer.style.display = 'block';
        toggle.textContent = '-';
    } else {
        answer.style.display = 'none';
        toggle.textContent = '+';
    }
}

function scrollToShop() {
    const shopElement = document.getElementById('shop') || document.querySelector('.products-grid');
    if (shopElement) {
        shopElement.scrollIntoView({ behavior: 'smooth' });
    }
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed; top: 80px; right: 20px; background: linear-gradient(135deg, #667eea, #764ba2);
        color: white; padding: 1rem 1.5rem; border-radius: 8px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        z-index: 1000; animation: slideDown 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = `@keyframes slideDown { from { top: -100px; opacity: 0; } to { top: 80px; opacity: 1; } }`;
    document.head.appendChild(styleSheet);
    setTimeout(() => { notification.remove(); styleSheet.remove(); }, 3000);
}

async function loadProductDetails() {
    const container = document.getElementById('product-detail-container');
    if (!container) return;
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');
        if (!productId) throw new Error("No product ID found in URL.");
        const renderBackendURL = `https://flipphone-backend.onrender.com/api/products/${productId}`;
        const response = await fetch(renderBackendURL);
        if (!response.ok) throw new Error(`Product not found`);
        const product = await response.json();
        container.innerHTML = `
            <div class="product-detail-image"><img src="${product.image}" alt="${product.name}"></div>
            <div class="product-detail-info">
                <span class="badge">${product.badge}</span>
                <h1>${product.name}</h1>
                <p class="rating">${product.rating}</p>
                <p class="condition">Condition: ${product.condition}</p>
                <p class="price">$${product.price.toFixed(2)}</p>
                ${product.specs ? `<h3 class="specs-title">Specifications</h3><p class="specs-text">${product.specs}</p>` : ''}
                <button class="add-to-cart" onclick="addToCart(${product.id})">Add to Cart</button>
            </div>
        `;
    } catch (error) {
        console.error("Failed to load product details:", error);
        container.innerHTML = '<p style="text-align: center; color: #ff6b6b; padding: 4rem 0;">Error: Could not load product.</p>';
    }
}
loadProductDetails();

document.addEventListener('DOMContentLoaded', async function() { 
    try {
        const renderBackendURL = "https://flipphone-backend.onrender.com/api/products";
        const response = await fetch(renderBackendURL);
        if (!response.ok) throw new Error(`Network response was not ok`);
        products = await response.json(); 
        if (document.getElementById('products-grid')) { displayProducts(); }
    } catch (error) {
        console.error("Failed to fetch products:", error);
        const grid = document.getElementById('products-grid');
        if (grid) grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #ff6b6b; padding: 2rem;">Error: Could not load products.</p>';
    }

    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        try { cart = JSON.parse(savedCart); } 
        catch (e) { cart = []; localStorage.removeItem('cart'); }
    }
    updateCartCount(); 

    const checkoutItemsContainer = document.getElementById('checkout-items');
    if (checkoutItemsContainer && savedCart) {
        let html = '';
        let total = 0;
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            html += `<div class="order-item"><span>${item.name} (x${item.quantity})</span><strong>$${itemTotal.toFixed(2)}</strong></div>`;
        });
        checkoutItemsContainer.innerHTML = html;
        document.getElementById('checkout-total').textContent = total.toFixed(2);
    }
    
    const receiptSummary = document.getElementById('receipt-summary');
    if (receiptSummary) {
        const orderData = JSON.parse(localStorage.getItem('finalOrder'));
        if (orderData) {
            let itemsHtml = '<ul class="receipt-list">';
            orderData.cart.forEach(item => {
                const subtotal = item.price * item.quantity;
                itemsHtml += `<li class="receipt-item"><img src="${item.image}" alt="${item.name}"><span>${item.name} (x${item.quantity}) - <strong>$${subtotal.toFixed(2)}</strong></span></li>`;
            });
            itemsHtml += '</ul>';
            receiptSummary.innerHTML = `<p><strong>Order ID:</strong> ${orderData.orderId}<br><strong>Name:</strong> ${orderData.customerName}<br><strong>Email:</strong> ${orderData.customerEmail}</p>${itemsHtml}<h3>Total Paid: $${orderData.total}</h3>`;
        } else {
            receiptSummary.innerHTML = "<p>No order details found. Please return to the shop.</p>";
        }
    }

    const cartLink = document.querySelector('.cart-link');
    if (cartLink) { cartLink.addEventListener('click', function(e) { e.preventDefault(); openCart(); }); }

    const modal = document.getElementById('cartModal');
    if (modal) { modal.addEventListener('click', function(event) { if (event.target === modal) { closeCart(); } }); }

    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    if (hamburger && navMenu) { hamburger.addEventListener('click', function() { navMenu.classList.toggle('nav-open'); }); }
});
