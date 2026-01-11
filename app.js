// ==================== CONFIGURATION ====================
const API_URL = "https://flipphone-backend.onrender.com/api";

// ==================== STATE MANAGEMENT ====================
let products = [];
let cart = [];

// ==================== INIT & LOADING ====================
document.addEventListener('DOMContentLoaded', async function() {
    // 1. Initialize Cart
    loadCartFromStorage();
    
    // 2. Setup Event Listeners
    setupEventListeners();

    // 3. Check which page we are on and load data
    const grid = document.getElementById('products-grid');
    const detailContainer = document.getElementById('product-detail-container');
    const checkoutContainer = document.getElementById('checkout-items');
    const receiptContainer = document.getElementById('receipt-summary');

    if (grid) {
        await loadProductsWithRetry();
    } else if (detailContainer) {
        await loadProductDetails();
    } else if (checkoutContainer) {
        initCheckoutPage();
    } else if (receiptContainer) {
        initReceiptPage();
    }
});

function setupEventListeners() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const cartLink = document.querySelector('.cart-link');
    const cartModal = document.getElementById('cartModal');
    const closeBtn = document.querySelector('.close');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => navMenu.classList.toggle('nav-open'));
    }
    
    if (cartLink) {
        cartLink.addEventListener('click', (e) => {
            e.preventDefault();
            openCart();
        });
    }

    if (cartModal) {
        cartModal.addEventListener('click', (e) => {
            if (e.target === cartModal) closeCart();
        });
    }
}

// ==================== PRODUCT FETCHING (The "Engine") ====================

// Retry logic to handle "Sleeping" Render servers
async function loadProductsWithRetry(retries = 3) {
    const grid = document.getElementById('products-grid');
    if (!grid) return;

    // Show loading state
    grid.innerHTML = '<div class="loading-spinner">Starting server and fetching inventory...</div>';

    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(`${API_URL}/products`);
            if (!response.ok) throw new Error(`Server responded with ${response.status}`);
            
            products = await response.json();
            displayProducts();
            return; // Success! Exit the function
        } catch (error) {
            console.warn(`Attempt ${i + 1} failed. Retrying...`, error);
            if (i === retries - 1) {
                // Final failure
                grid.innerHTML = `
                    <div style="grid-column: 1/-1; text-align: center; padding: 2rem;">
                        <p style="color: #ff6b6b; font-weight: bold;">Unable to load inventory.</p>
                        <p style="font-size: 0.9rem; color: #666;">The server might be waking up. Please refresh the page.</p>
                        <button onclick="window.location.reload()" style="margin-top:10px; padding: 8px 16px; cursor:pointer;">Try Again</button>
                    </div>`;
            } else {
                // Wait 2 seconds before retrying
                await new Promise(res => setTimeout(res, 2000));
            }
        }
    }
}

function displayProducts() {
    const grid = document.getElementById('products-grid');
    if (!grid) return;

    if (products.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #666;">No products available right now. Check back soon!</p>';
        return;
    }

    grid.innerHTML = products.map(product => {
        // Safety check for missing data
        const price = product.price ? Number(product.price).toFixed(2) : '0.00';
        const image = product.image || 'https://via.placeholder.com/300x300?text=No+Image';
        const badge = product.badge ? `<span class="badge">${product.badge}</span>` : '';

        return `
        <a href="product.html?id=${product.id}" class="product-card-link">
            <div class="product-card">
                <div class="product-image">
                    <img src="${image}" alt="${product.name}" loading="lazy">
                    ${badge}
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <div class="meta-info">
                        <span class="condition">${product.condition || 'Refurbished'}</span>
                        <span class="rating">⭐ ${product.rating || '5.0'}</span>
                    </div>
                    <div class="price-row">
                        <p class="price">$${price}</p>
                        <button class="add-to-cart-btn" onclick="event.preventDefault(); addToCart(${product.id});">
                            Add
                        </button>
                    </div>
                </div>
            </div>
        </a>
        `;
    }).join('');
}

async function loadProductDetails() {
    const container = document.getElementById('product-detail-container');
    if (!container) return;

    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (!productId) {
        container.innerHTML = '<p>Product not specified.</p>';
        return;
    }

    try {
        const response = await fetch(`${API_URL}/products/${productId}`);
        if (!response.ok) throw new Error("Product not found");
        
        const product = await response.json();
        const price = product.price ? Number(product.price).toFixed(2) : '0.00';

        container.innerHTML = `
            <div class="detail-grid">
                <div class="detail-image">
                    <img src="${product.image}" alt="${product.name}">
                </div>
                <div class="detail-info">
                    <span class="badge-lg">${product.badge || 'In Stock'}</span>
                    <h1>${product.name}</h1>
                    <div class="price-block">$${price}</div>
                    
                    <div class="specs-box">
                        <h3>Condition: ${product.condition}</h3>
                        <p>${product.specs || 'Professional refurbished device. Fully tested and certified.'}</p>
                    </div>

                    <button class="add-to-cart-lg" onclick="addToCart(${product.id})">Add to Cart</button>
                    
                    <ul class="trust-list">
                        <li>✅ 30-Day Warranty</li>
                        <li>✅ Unlocked for all carriers</li>
                        <li>✅ Free Charging Cable</li>
                    </ul>
                </div>
            </div>
        `;
    } catch (error) {
        container.innerHTML = '<p class="error">Product not found or removed.</p>';
    }
}

// ==================== CART LOGIC ====================

function loadCartFromStorage() {
    const saved = localStorage.getItem('cart');
    if (saved) {
        try {
            cart = JSON.parse(saved);
        } catch (e) {
            cart = [];
            localStorage.removeItem('cart');
        }
    }
    updateCartUI();
}

function addToCart(productId) {
    // Try to find in loaded products first (faster)
    const product = products.find(p => p.id == productId); // loose comparison for string/int IDs

    if (product) {
        addItemToCartState(product);
    } else {
        // Fallback: fetch single product if not in main list
        fetch(`${API_URL}/products/${productId}`)
            .then(res => res.json())
            .then(p => addItemToCartState(p))
            .catch(err => alert("Could not add item."));
    }
}

function addItemToCartState(product) {
    const existing = cart.find(item => item.id == product.id);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: Number(product.price),
            image: product.image,
            quantity: 1
        });
    }
    saveCart();
    showNotification(`${product.name} added!`);
    openCart(); // Auto open cart on add (Professional UX)
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id != productId);
    saveCart();
    displayCartItems();
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartUI();
}

function updateCartUI() {
    // Update Badge
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    const badges = document.querySelectorAll('#cart-count');
    badges.forEach(el => el.textContent = count);
}

function displayCartItems() {
    const container = document.getElementById('cart-items');
    const totalEl = document.getElementById('cart-total');
    if (!container) return;

    if (cart.length === 0) {
        container.innerHTML = '<p class="empty-cart">Your cart is empty.</p>';
        if (totalEl) totalEl.textContent = '0.00';
        return;
    }

    let total = 0;
    container.innerHTML = cart.map(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        return `
            <div class="cart-item">
                <img src="${item.image}" alt="thumb" style="width:50px; height:50px; object-fit:contain;">
                <div class="cart-details">
                    <p class="name">${item.name}</p>
                    <p class="qty">Qty: ${item.quantity} x $${item.price.toFixed(2)}</p>
                </div>
                <div class="cart-actions">
                    <button onclick="removeFromCart(${item.id})" class="remove-btn">×</button>
                </div>
            </div>
        `;
    }).join('');

    if (totalEl) totalEl.textContent = total.toFixed(2);
}

function openCart() {
    const modal = document.getElementById('cartModal');
    if (modal) {
        modal.style.display = 'block';
        displayCartItems();
    }
}

function closeCart() {
    const modal = document.getElementById('cartModal');
    if (modal) modal.style.display = 'none';
}

function checkout() {
    if (cart.length === 0) {
        alert("Cart is empty");
        return;
    }
    window.location.href = 'checkout.html';
}

// ==================== CHECKOUT & UTILS ====================

function initCheckoutPage() {
    const container = document.getElementById('checkout-items');
    const totalEl = document.getElementById('checkout-total');
    if (!container) return;

    let total = 0;
    container.innerHTML = cart.map(item => {
        total += (item.price * item.quantity);
        return `<div class="order-summary-item">
            <span>${item.name} (x${item.quantity})</span>
            <span>$${(item.price * item.quantity).toFixed(2)}</span>
        </div>`;
    }).join('');
    
    if (totalEl) totalEl.textContent = total.toFixed(2);
}

function processCheckout(event) {
    event.preventDefault();
    const form = event.target;
    
    // Create Order Object
    const order = {
        id: 'ORD-' + Date.now(),
        date: new Date().toLocaleDateString(),
        customer: {
            name: form.querySelector('#fullName')?.value || 'Guest',
            email: form.querySelector('#email')?.value || 'No email'
        },
        items: cart,
        total: document.getElementById('checkout-total')?.textContent || '0.00'
    };

    localStorage.setItem('lastOrder', JSON.stringify(order));
    
    // Clear cart
    cart = [];
    saveCart();
    
    window.location.href = 'receipt.html';
}

function initReceiptPage() {
    const container = document.getElementById('receipt-summary');
    const orderData = JSON.parse(localStorage.getItem('lastOrder'));
    
    if (!orderData) {
        container.innerHTML = "<p>No recent order found.</p>";
        return;
    }

    container.innerHTML = `
        <div class="success-checkmark">✅</div>
        <h2>Order Confirmed!</h2>
        <p>Order ID: <strong>${orderData.id}</strong></p>
        <p>A confirmation has been sent to ${orderData.customer.email}</p>
        <div class="receipt-total">Total Paid: $${orderData.total}</div>
        <button onclick="window.location.href='index.html'" class="cta-button">Return Home</button>
    `;
}

function showNotification(msg) {
    const div = document.createElement('div');
    div.className = 'toast-notification';
    div.textContent = msg;
    document.body.appendChild(div);
    
    // Simple inline styles for the toast if CSS isn't updated yet
    div.style.cssText = `
        position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%);
        background: #333; color: white; padding: 12px 24px; border-radius: 50px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2); z-index: 1000; animation: fadeUp 0.3s ease;
    `;

    setTimeout(() => div.remove(), 3000);
}

// ==================== FILTERS ====================
function filterProducts() {
    const term = document.getElementById('search').value.toLowerCase();
    const filtered = products.filter(p => p.name.toLowerCase().includes(term));
    
    // Temporarily swap the global products array for display (revert isn't handled here for simplicity, 
    // in a real app we'd keep 'allProducts' and 'displayedProducts' separate)
    // For this simple version, we just re-render based on the filter:
    const grid = document.getElementById('products-grid');
    if(filtered.length === 0) {
        grid.innerHTML = '<p style="grid-column:1/-1; text-align:center">No matches found.</p>';
        return;
    }
    
    grid.innerHTML = filtered.map(product => {
        // Reuse card HTML logic here or extract to helper
        return `
        <a href="product.html?id=${product.id}" class="product-card-link">
            <div class="product-card">
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}">
                    <span class="badge">${product.badge}</span>
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p class="price">$${Number(product.price).toFixed(2)}</p>
                    <button class="add-to-cart-btn" onclick="event.preventDefault(); addToCart(${product.id});">Add</button>
                </div>
            </div>
        </a>`;
    }).join('');
}
