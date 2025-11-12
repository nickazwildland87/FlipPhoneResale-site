// ==================== PRODUCT DATA ============
let products = [];

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
    }
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartCount();
    displayCart(); // Update the modal if it's open
}

function updateCartCount() {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    const cartCountElements = document.querySelectorAll('#cart-count');
    cartCountElements.forEach(el => el.textContent = count);
    localStorage.setItem('cart', JSON.stringify(cart));
}

function displayCart() {
    const cartItemsContainer = document.getElementById('cart-items');
    if (!cartItemsContainer) return; // Exit if element not found
    
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

// Called from Cart Modal
function checkout() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    // Save cart to localStorage so checkout.html can read it
    localStorage.setItem('cart', JSON.stringify(cart));
    // Redirect to the checkout page
    window.location.href = 'checkout.html';
}

// ==================== CHECKOUT & RECEIPT LOGIC ====================

// Called from checkout.html form submission
function processCheckout(event) {
    event.preventDefault(); // Stop the form from submitting
    
    const form = event.target;
    const customerName = form.querySelector('#fullName').value;
    const customerEmail = form.querySelector('#email').value;

    const savedCart = localStorage.getItem('cart');
    if (!savedCart || JSON.parse(savedCart).length === 0) {
        alert("Your cart is empty. Cannot process order.");
        window.location.href = 'shop.html';
        return;
    }

    // Save the final order details for the receipt page
    const finalOrder = {
        cart: JSON.parse(savedCart),
        customerName: customerName,
        customerEmail: customerEmail,
        orderId: new Date().getTime(), // Simple unique order ID
        total: document.getElementById('checkout-total').textContent
    };
    localStorage.setItem('finalOrder', JSON.stringify(finalOrder));

    // Clear the active cart
    cart = [];
    localStorage.removeItem('cart'); // Clear the working cart
    updateCartCount(); // Update the navbar count to 0

    // Redirect to the receipt page
    window.location.href = 'receipt.html';
}

// Called from receipt.html button
function clearReceipt() {
    localStorage.removeItem('finalOrder');
    window.location.href = 'index.html';
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
    
    const searchTerm = document.getElementById('search').value.toLowerCase();
    if(searchTerm) {
        sorted = products.filter(product =>
            product.name.toLowerCase().includes(searchTerm) ||
            product.condition.toLowerCase().includes(searchTerm) ||
            (product.category && product.category.toLowerCase().includes(searchTerm))
        );
    }

    switch (sortValue) {
        case 'price-low':
            sorted.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            sorted.sort((a, b) => b.price - b.price);
            break;
        case 'newest':
            sorted.reverse(); 
            break;
        case 'featured':
        default:
             break;
    }
    displayProducts(sorted);
}

// ==================== NEWSLETTER ====================
function subscribeNewsletter(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const messageDiv = document.getElementById('newsletter-message');
    if (!email || !email.includes('@')) {
        messageDiv.innerHTML = '<p style="color: #ff6b6b;">Please enter a valid email.</p>';
        return;
    }
    messageDiv.innerHTML = '<p style="color: #4CAF50;">✓ Thank you for subscribing! Check your email for exclusive deals.</p>';
    document.getElementById('email').value = '';
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

// ==================== SELL FORM (from sell.html) ====================
function processSellForm(event) {
    event.preventDefault();
    const form = event.target;
    const successDiv = document.getElementById('sell-success');
    if (!successDiv) return; 

    const device = form.device.value.trim();
    const condition = form.condition.value;
    const contact = form.contact.value.trim();
    
    if (!device || !condition || !contact) {
        successDiv.innerHTML = "<span style='color:#ff6b6b'>Please complete all required fields.</span>";
        return;
    }
    
    successDiv.textContent = "Thank you! We received your request. We'll email you within 1 business day with a competitive cash offer.";
    form.reset();
    
    setTimeout(() => {
        successDiv.textContent = "";
    }, 7000);
}

// ==================== FAQ ACCORDION ====================
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

// ==================== UTILITY FUNCTIONS ====================
function scrollToShop() {
    const shopElement = document.getElementById('shop') || document.querySelector('.products-grid');
    if (shopElement) {
        shopElement.scrollIntoView({ behavior: 'smooth' });
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
    
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = `@keyframes slideDown { from { top: -100px; opacity: 0; } to { top: 80px; opacity: 1; } }`;
    document.head.appendChild(styleSheet);

    setTimeout(() => {
        notification.remove();
        styleSheet.remove();
    }, 3000);
}
// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', async function() { // <-- Made async
    
        // === NEW LOGIC: FETCH PRODUCTS ON PAGE LOAD ===
            try {
                    // This is the public URL of your backend server
                            const renderBackendURL = https://flipphone-backend.onrender.com
                                    
                                            const response = await fetch(renderBackendURL);
                                                    if (!response.ok) {
                                                                throw new Error(`Network response was not ok (status: ${response.status})`);
                                                                        }
                                                                                
                                                                                        // Fill our (now empty) global 'products' array with data from the server
                                                                                                products = await response.json();
                                                                                                        
                                                                                                                // Now that 'products' is full, we can run the original display function
                                                                                                                        if (document.getElementById('products-grid')) {
                                                                                                                                    displayProducts(); 
                                                                                                                                            }
                                                                                                                                                    
                                                                                                                                                        } catch (error) {
                                                                                                                                                                console.error("Failed to fetch products:", error);
                                                                                                                                                                        // If the backend fails, show an error on the page
                                                                                                                                                                                const grid = document.getElementById('products-grid');
                                                                                                                                                                                        if (grid) {
                                                                                                                                                                                                    grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #ff6b6b; padding: 2rem;">Error: Could not load products from the server. Please try again later.</p>';
                                                                                                                                                                                                            }
                                                                                                                                                                                                                }
                                                                                                                                                                                                                    // === END NEW LOGIC ===


                                                                                                                                                                                                                        // --- All your original, good code below ---

                                                                                                                                                                                                                            // Load cart from localStorage
                                                                                                                                                                                                                                const savedCart = localStorage.getItem('cart');
                                                                                                                                                                                                                                    if (savedCart) {
                                                                                                                                                                                                                                            try {
                                                                                                                                                                                                                                                        cart = JSON.parse(savedCart);
                                                                                                                                                                                                                                                                } catch (e) {
                                                                                                                                                                                                                                                                            console.error('Cart data corrupted, starting fresh');
                                                                                                                                                                                                                                                                                        cart = [];
                                                                                                                                                                                                                                                                                                    localStorage.removeItem('cart');
                                                                                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                                                                                                    updateCartCount(); // Update count on every page load

                                                                                                                                                                                                                                                                                                                        
                                                                                                                                                                                                                                                                                                                            // POPULATE CHECKOUT.HTML SUMMARY
                                                                                                                                                                                                                                                                                                                                const checkoutItemsContainer = document.getElementById('checkout-items');
                                                                                                                                                                                                                                                                                                                                    if (checkoutItemsContainer && savedCart) {
                                                                                                                                                                                                                                                                                                                                            let html = '';
                                                                                                                                                                                                                                                                                                                                                    let total = 0;
                                                                                                                                                                                                                                                                                                                                                            cart.forEach(item => {
                                                                                                                                                                                                                                                                                                                                                                        const itemTotal = item.price * item.quantity;
                                                                                                                                                                                                                                                                                                                                                                                    total += itemTotal;
                                                                                                                                                                                                                                                                                                                                                                                                html += `
                                                                                                                                                                                                                                                                                                                                                                                                                <div class="order-item">
                                                                                                                                                                                                                                                                                                                                                                                                                                    <span>${item.name} (x${item.quantity})</span>
                                                                                                                                                                                                                                                                                                                                                                                                                                                        <strong>$${itemTotal.toFixed(2)}</strong>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                        </div>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    `;
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            });
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    checkoutItemsContainer.innerHTML = html;
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            document.getElementById('checkout-total').textContent = total.toFixed(2);
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        // POPULATE RECEIPT.HTML
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            const receiptSummary = document.getElementById('receipt-summary');
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                if (receiptSummary) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        const orderData = JSON.parse(localStorage.getItem('finalOrder'));
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                if (orderData) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            let itemsHtml = '<ul class="receipt-list">';
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        orderData.cart.forEach(item => {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        const subtotal = item.price * item.quantity;
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        itemsHtml += `
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            <li class="receipt-item">
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    <img src="${item.image}" alt="${item.name}">
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            <span>${item.name} (x${item.quantity}) - <strong>$${subtotal.toFixed(2)}</strong></span>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                </li>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                `;
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            });
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        itemsHtml += '</ul>';
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                receiptSummary.innerHTML = `
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                <p>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    <strong>Order ID:</strong> ${orderData.orderId}<br>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        <strong>Name:</strong> ${orderData.customerName}<br>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            <strong>Email:</strong> ${orderData.customerEmail}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            </p>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            ${itemsHtml}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            <h3>Total Paid: $${orderData.total}</h3>
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        `;
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                } else {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            receiptSummary.innerHTML = "<p>No order details found. Please return to the shop.</p>";
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        }


                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            // Cart link click
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                const cartLink = document.querySelector('.cart-link');
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    if (cartLink) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            cartLink.addEventListener('click', function(e) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        e.preventDefault();
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    openCart();
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            });
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                }

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    // Close modal when clicking outside
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        const modal = document.getElementById('cartModal');
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            if (modal) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    modal.addEventListener('click', function(event) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                if (event.target === modal) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                closeCart();
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    });
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        }

                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            // Mobile menu fix
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                const hamburger = document.querySelector('.hamburger');
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    const navMenu = document.querySelector('.nav-menu');
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        if (hamburger && navMenu) {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                hamburger.addEventListener('click', function() {
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            navMenu.classList.toggle('nav-open');
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    });
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        }
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        });

    
    // Load cart from localStorage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        try {
            cart = JSON.parse(savedCart);
        } catch (e) {
            console.error('Cart data corrupted, starting fresh');
            cart = [];
            localStorage.removeItem('cart');
        }
    }
    updateCartCount(); // Update count on every page load

    // Display products on pages that have the grid
    if (document.getElementById('products-grid')) {
        displayProducts();
    }
    
    // POPULATE CHECKOUT.HTML SUMMARY
    const checkoutItemsContainer = document.getElementById('checkout-items');
    if (checkoutItemsContainer && savedCart) {
        let html = '';
        let total = 0;
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            html += `
                <div class="order-item">
                    <span>${item.name} (x${item.quantity})</span>
                    <strong>$${itemTotal.toFixed(2)}</strong>
                </div>
            `;
        });
        checkoutItemsContainer.innerHTML = html;
        document.getElementById('checkout-total').textContent = total.toFixed(2);
    }
    
    // === NEW LOGIC: POPULATE RECEIPT.HTML ===
    const receiptSummary = document.getElementById('receipt-summary');
    if (receiptSummary) {
        const orderData = JSON.parse(localStorage.getItem('finalOrder'));
        if (orderData) {
            let itemsHtml = '<ul class="receipt-list">';
            orderData.cart.forEach(item => {
                const subtotal = item.price * item.quantity;
                itemsHtml += `
                    <li class="receipt-item">
                        <img src="${item.image}" alt="${item.name}">
                        <span>${item.name} (x${item.quantity}) - <strong>$${subtotal.toFixed(2)}</strong></span>
                    </li>
                `;
            });
            itemsHtml += '</ul>';
            
            receiptSummary.innerHTML = `
                <p>
                    <strong>Order ID:</strong> ${orderData.orderId}<br>
                    <strong>Name:</strong> ${orderData.customerName}<br>
                    <strong>Email:</strong> ${orderData.customerEmail}
                </p>
                ${itemsHtml}
                <h3>Total Paid: $${orderData.total}</h3>
            `;
        } else {
            receiptSummary.innerHTML = "<p>No order details found. Please return to the shop.</p>";
        }
    }
    // === END NEW LOGIC ===


    // Cart link click
    const cartLink = document.querySelector('.cart-link');
    if (cartLink) {
        cartLink.addEventListener('click', function(e) {
            e.preventDefault();
            openCart();
        });
    }

    // Close modal when clicking outside
    const modal = document.getElementById('cartModal');
    if (modal) {
        modal.addEventListener('click', function(event) {
            if (event.target === modal) {
                closeCart();
            }
        });
    }

    // Mobile menu fix
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('nav-open');
        });
    }
});
