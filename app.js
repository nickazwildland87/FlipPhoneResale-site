// ==================== PRODUCT DATA ====================
const products = [
    {
        id: 1,
        name: "Apple Watch Series 7 45 inch",
        price: 349.00,
        image: "images/apple-watch-series7-45-midnight.jpg",
        rating: "⭐⭐⭐⭐⭐ (128 reviews)",
        condition: "Like New",
        badge: "Bestseller",
        category: "wearables"
    },
    {
        id: 2,
        name: "Bose QC45 White",
        price: 279.00,
        image: "images/bose-qc45-white.jpg",
        rating: "⭐⭐⭐⭐⭐ (94 reviews)",
        condition: "Excellent",
        badge: "Popular",
        category: "audio"
    },
    {
        id: 3,
        name: "Dell XPS 13 16GB RAM 512GB SSD Silver",
        price: 849.00,
        image: "images/dell-xps13-16-512-silver.jpg",
        rating: "⭐⭐⭐⭐⭐ (156 reviews)",
        condition: "Like New",
        badge: "Top Pick",
        category: "laptops"
    },
    {
        id: 4,
        name: "Samsung Galaxy S21 256GB",
        price: 399.00,
        image: "images/galaxy-s21-256-gray.jpg",
        rating: "⭐⭐⭐⭐⭐ (203 reviews)",
        condition: "Excellent",
        badge: "In Stock",
        category: "phones"
    },
    {
        id: 5,
        name: "HP Spectre 360 16GB RAM 512GB SSD",
        price: 1099.00,
        image: "images/hp-spectre-x360-16-512-nightfall.jpg",
        rating: "⭐⭐⭐⭐⭐ (87 reviews)",
        condition: "Like New",
        badge: "Premium",
        category: "laptops"
    },
    {
        id: 6,
        name: "iPad Pro 11 Inch Silver",
        price: 749.00,
        image: "images/ipad-pro-11-128-silver.jpg",
        rating: "⭐⭐⭐⭐⭐ (142 reviews)",
        condition: "Excellent",
        badge: "Hot Deal",
        category: "tablets"
    },
    {
        id: 7,
        name: "iPhone 13 128GB Blue Unlocked",
        price: 499.00,
        image: "images/iphone13-128-blue.jpg",
        rating: "⭐⭐⭐⭐⭐ (267 reviews)",
        condition: "Like New",
        badge: "Best Seller",
        category: "phones"
    },
    {
        id: 8,
        name: "Apple MacBook Air M1 Chip 256GB Space Gray",
        price: 799.00,
        image: "images/macbook-air-m1-256-spacegray.jpg",
        rating: "⭐⭐⭐⭐⭐ (198 reviews)",
        condition: "Excellent",
        badge: "Top Pick",
        category: "laptops"
    },
    {
        id: 9,
        name: "Google Pixel 6 128GB Black Unlocked",
        price: 329.00,
        image: "images/pixel6-128-black.jpg",
        rating: "⭐⭐⭐⭐⭐ (111 reviews)",
        condition: "Like New",
        badge: "Great Value",
        category: "phones"
    },
    {
        id: 10,
        name: "Sony WH1000XM4 Headphones Black",
        price: 249.00,
        image: "images/sony-wh1000xm4-black.jpg",
        rating: "⭐⭐⭐⭐⭐ (189 reviews)",
        condition: "Excellent",
        badge: "Popular",
        category: "audio"
    },
    {
        id: 11,
        name: "Lenovo ThinkPad X1 Carbon Gen 13",
        price: 949.99,
        image: "images/lenovo-thinkpad-x1-carbon.jpg",
        rating: "⭐⭐⭐⭐⭐ (76 reviews)",
        condition: "Like New",
        badge: "Premium",
        category: "laptops"
    },
    {
        id: 12,
        name: "Microsoft Surface Pro 8 256GB Platinum Intel I7",
        price: 899.00,
        image: "images/surface-pro8-8-256-platinum.jpg",
        rating: "⭐⭐⭐⭐⭐ (134 reviews)",
        condition: "Excellent",
        badge: "Top Pick",
        category: "tablets",
        specs: "Intel Core i7, 256GB SSD, 8GB RAM, Windows 11, Touchscreen Display"
    }
];

// ==================== CART MANAGEMENT ====================
let cart = [];

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (product) {
        const existingItem = cart.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({...product, quantity: 1});
        }
        
        updateCartCount();
        showNotification(`${product.name} added to cart!`);
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
            <div class="cart-item" style="display: flex; justify-content: space-between; padding: 1rem; border-bottom: 1px solid #eee; align-items: center;">
                <div>
                    <p style="font-weight: 600; margin-bottom: 0.3rem;">${item.name}</p>
                    <p style="color: #999; font-size: 0.9rem;">Qty: ${item.quantity}</p>
                </div>
                <div style="text-align: right;">
                    <p style="color: #667eea; font-weight: bold;">$${(itemTotal).toFixed(2)}</p>
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
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    alert(`Proceeding to checkout with ${cart.length} item(s) - Total: $${total.toFixed(2)}\n\nThis is a demo. In production, this would redirect to a payment processor.`);
    
    // Clear cart after checkout
    cart = [];
    updateCartCount();
    closeCart();
}

// ==================== PRODUCT DISPLAY ====================
function displayProducts(productsToDisplay = products) {
    const grid = document.getElementById('products-grid');
    
    if (!grid) return;
    
    if (productsToDisplay.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999; padding: 2rem;">No products found</p>';
        return;
    }
    
    grid.innerHTML = productsToDisplay.map(product => `
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
                <button class="add-to-cart" onclick="addToCart(${product.id})">Add to Cart</button>
            </div>
        </div>
    `).join('');
}

// ==================== SEARCH & FILTER ====================
function filterProducts() {
    const searchTerm = document.getElementById('search').value.toLowerCase();
    
    const filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.condition.toLowerCase().includes(searchTerm) ||
        (product.category && product.category.toLowerCase().includes(searchTerm))
    );
    
    displayProducts(filtered);
}

function sortProducts() {
    const sortValue = document.getElementById('sort').value;
    let sorted = [...products];
    
    switch(sortValue) {
        case 'price-low':
            sorted.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            sorted.sort((a, b) => b.price - a.price);
            break;
        case 'newest':
            sorted.reverse();
            break;
        case 'featured':
        default:
            sorted = [...products];
    }
    
    displayProducts(sorted);
}

// ==================== NEWSLETTER ====================
function subscribeNewsletter(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const messageDiv = document.getElementById('newsletter-message');
    
    if (!email.includes('@')) {
        messageDiv.innerHTML = '<p style="color: #ff6b6b;">Please enter a valid email.</p>';
        return;
    }
    
    messageDiv.innerHTML = '<p style="color: #4CAF50;">✓ Thank you for subscribing! Check your email for exclusive deals.</p>';
    document.getElementById('email').value = '';
    
    // Reset message after 4 seconds
    setTimeout(() => {
        messageDiv.innerHTML = '';
    }, 4000);
}

// ==================== CONTACT FORM ====================
function sendContactForm(event) {
    event.preventDefault();
    alert('Thank you for your message! We will get back to you within 24 hours.\n\nThis is a demo. In production, this would send an email.');
    event.target.reset();
}

// ==================== FAQ ACCORDION ====================
function toggleFAQ(button) {
    const answer = button.nextElementSibling;
    const toggle = button.querySelector('.faq-toggle');
    
    // Close all other FAQs
    document.querySelectorAll('.faq-answer').forEach(item => {
        if (item !== answer) {
            item.style.display = 'none';
            item.previousElementSibling.querySelector('.faq-toggle').textContent = '+';
        }
    });
    
    // Toggle current FAQ
    if (answer.style.display === 'none' || answer.style.display === '') {
        answer.style.display = 'block';
        toggle.textContent = '-';
    } else {
        answer.style.display = 'none';
        toggle.textContent = '+';
    }
}

// ==================== UTILITY FUNCTIONS ====================
function scrollToShop() {
    const shopElement = document.getElementById('shop') || document.querySelector('.products-grid');
    if (shopElement) {
        shopElement.scrollIntoView({behavior: 'smooth'});
    }
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        z-index: 1000;
        animation: slideDown 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', function() {
    // Load cart from localStorage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        try {
            cart = JSON.parse(savedCart);
            updateCartCount();
        } catch (e) {
            console.log('Cart data corrupted, starting fresh');
        }
    }
    
    // Display initial products
    displayProducts();
    
    // Cart link click
    const cartLink = document.querySelector('.cart-link');
    if (cartLink) {
        cartLink.addEventListener('click', function(e) {
            e.preventDefault();
            openCart();
        });
    }
    
    // Close modal when clicking outside
    window.onclick = function(event) {
        const modal = document.getElementById('cartModal');
        if (modal && event.target === modal) {
            closeCart();
        }
    };
    
    // Mobile menu toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            if (navMenu.style.maxHeight === '0px' || navMenu.style.maxHeight === '') {
                navMenu.style.maxHeight = '300px';
            } else {
                navMenu.style.maxHeight = '0px';
            }
        });
    }
});
