/**
 * ============================================
 * Snack Store - Frontend JavaScript
 * ============================================
 */

// ============================================
// Firebase Configuration
// ============================================
const firebaseConfig = {
    apiKey: "AIzaSyCSNGfBIXPIcs0obQC94caWHBjVpIQ29cc",
    authDomain: "snack-store-389a6.firebaseapp.com",
    projectId: "snack-store-389a6",
    storageBucket: "snack-store-389a6.firebasestorage.app",
    messagingSenderId: "183786840719",
    appId: "1:183786840719:web:ae399302e4f4da9067c6fa",
    measurementId: "G-FJE4YQFG6Y"
};

// Vercel API URL
const API_URL = 'https://snack-store-psi.vercel.app/api/create-transaction';

// ============================================
// App State
// ============================================
let cart = [];
let products = [];
let isProcessingPayment = false;

// ============================================
// DOM Elements
// ============================================
const cartButton = document.getElementById('cartButton');
const cartModal = document.getElementById('cartModal');
const cartOverlay = document.getElementById('cartOverlay');
const closeCart = document.getElementById('closeCart');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const cartCount = document.getElementById('cartCount');
const checkoutBtn = document.getElementById('checkoutBtn');
const productsGrid = document.getElementById('productsGrid');
const loadingState = document.getElementById('loadingState');
const errorState = document.getElementById('errorState');
const emptyState = document.getElementById('emptyState');
const emptyCart = document.getElementById('emptyCart');

// ============================================
// Initialize App
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    initializeFirebase();
    loadProducts();
    updateCartUI();
});

// ============================================
// Firebase Initialization
// ============================================
function initializeFirebase() {
    // Initialize Firebase (using compat version for CDN)
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }

    // Initialize Firestore
    const db = firebase.firestore();

    // Make db available globally for product loading
    window.db = db;
}

// ============================================
// Firebase: Load Products from Firestore
// ============================================
async function loadProducts() {
    try {
        // Show loading state
        loadingState.classList.remove('hidden');
        productsGrid.classList.add('hidden');
        errorState.classList.add('hidden');
        emptyState.classList.add('hidden');

        // Fetch products from Firestore
        const snapshot = await window.db.collection('products').get();

        // Hide loading state
        loadingState.classList.add('hidden');

        if (snapshot.empty) {
            // Show empty state
            emptyState.classList.remove('hidden');
            return;
        }

        // Convert to array and display
        products = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        displayProducts(products);

    } catch (error) {
        console.error('Error loading products:', error);
        loadingState.classList.add('hidden');
        errorState.classList.remove('hidden');
    }
}

// ============================================
// Display Products in Grid
// ============================================
function displayProducts(products) {
    productsGrid.innerHTML = '';

    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';

        // Determine stock status
        let stockClass = 'stock-available';
        let stockText = 'In Stock';

        if (product.stock <= 0) {
            stockClass = 'stock-out';
            stockText = 'Out of Stock';
        } else if (product.stock <= 5) {
            stockClass = 'stock-low';
            stockText = `Only ${product.stock} left!`;
        }

        card.innerHTML = `
            <!-- Product Image -->
            <div class="product-image">
                <img src="${product.image || 'https://via.placeholder.com/300x200?text=No+Image'}"
                     alt="${product.name}"
                     loading="lazy">
            </div>

            <!-- Product Info -->
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description || 'No description available'}</p>

                <div class="product-footer">
                    <span class="product-price">Rp ${parseFloat(product.price).toLocaleString('id-ID')}</span>
                    <span class="stock-status ${stockClass}">${stockText}</span>
                </div>

                <button onclick="addToCart('${product.id}')"
                        class="btn-add-to-cart"
                        ${product.stock <= 0 ? 'disabled' : ''}>
                    ${product.stock > 0 ? 'Add to Cart' : 'Sold Out'}
                </button>
            </div>
        `;

        productsGrid.appendChild(card);
    });

    productsGrid.classList.remove('hidden');
}

// ============================================
// Cart Functions
// ============================================

// Add product to cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);

    if (!product) {
        showToast('Product not found!', 'error');
        return;
    }

    if (product.stock <= 0) {
        showToast('Product is out of stock!', 'error');
        return;
    }

    // Check if product already in cart
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        // Check stock limit
        if (existingItem.quantity < product.stock) {
            existingItem.quantity++;
        } else {
            showToast('Maximum stock reached!', 'error');
            return;
        }
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1,
            stock: product.stock
        });
    }

    // Save to localStorage
    saveCart();

    // Update UI
    updateCartUI();

    // Show success feedback
    showToast(`${product.name} added to cart!`, 'success');
}

// Remove product from cart
function removeFromCart(productId) {
    try {
        cart = cart.filter(item => item.id !== productId);
        saveCart();
        updateCartUI();
        showToast('Item removed from cart', 'info');
    } catch (error) {
        console.error('Error removing item from cart:', error);
        showToast('Error removing item', 'error');
    }
}

// Update product quantity
function updateQuantity(productId, change) {
    try {
        const item = cart.find(item => item.id === productId);

        if (item) {
            const newQuantity = item.quantity + change;

            if (newQuantity <= 0) {
                removeFromCart(productId);
            } else if (newQuantity <= item.stock) {
                item.quantity = newQuantity;
                saveCart();
                updateCartUI();
            }
        }
    } catch (error) {
        console.error('Error updating quantity:', error);
        showToast('Error updating quantity', 'error');
    }
}

// Save cart to memory only (not localStorage to avoid cache persistence)
function saveCart() {
    // Cart is now only stored in memory, not saved to localStorage
    // This ensures cart is cleared on each page refresh/live server reload
}

// Calculate cart total
function calculateTotal() {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Update cart UI
function updateCartUI() {
    // Safety check for DOM elements
    if (!cartCount || !cartItems || !emptyCart || !checkoutBtn || !cartTotal) {
        console.warn('Cart DOM elements not found');
        return;
    }

    // Update cart count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;

    // Update cart items display
    if (cart.length === 0) {
        cartItems.classList.add('hidden');
        emptyCart.classList.remove('hidden');
        checkoutBtn.disabled = true;
    } else {
        cartItems.classList.remove('hidden');
        emptyCart.classList.add('hidden');
        checkoutBtn.disabled = false;

        renderCartItems();
    }

    // Update total
    cartTotal.textContent = `Rp ${calculateTotal().toLocaleString('id-ID')}`;
}

// Render cart items
function renderCartItems() {
    // Safety check
    if (!cartItems) {
        console.warn('cartItems element not found');
        return;
    }

    cartItems.innerHTML = '';

    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.dataset.id = item.id;

        const isMaxQuantity = item.quantity >= item.stock;

        cartItem.innerHTML = `
            <!-- Item Image -->
            <img src="${item.image || 'https://via.placeholder.com/80x80?text=No+Image'}"
                 alt="${item.name}"
                 class="cart-item-image">

            <!-- Item Details -->
            <div class="cart-item-details">
                <h4 class="cart-item-name">${item.name}</h4>
                <p class="cart-item-price">Rp ${parseFloat(item.price).toLocaleString('id-ID')}</p>

                <!-- Quantity Controls -->
                <div class="quantity-controls">
                    <button type="button" data-action="decrease" data-id="${item.id}"
                            class="btn-quantity">
                        -
                    </button>
                    <span class="quantity-value">${item.quantity}</span>
                    <button type="button" data-action="increase" data-id="${item.id}"
                            class="btn-quantity"
                            ${isMaxQuantity ? 'disabled' : ''}>
                        +
                    </button>
                </div>
            </div>

            <!-- Remove Button -->
            <button type="button" data-action="remove" data-id="${item.id}"
                    class="btn-remove"
                    title="Remove item">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
            </button>
        `;

        cartItems.appendChild(cartItem);
    });
}

// Event delegation for cart item buttons
document.addEventListener('click', function(event) {
    const target = event.target;

    // Find the closest button if clicked on SVG or other element
    const button = target.closest('button');
    if (!button) return;

    const action = button.dataset.action;
    const productId = button.dataset.id;

    if (!action || !productId) return;

    event.preventDefault();
    event.stopPropagation();

    if (action === 'increase') {
        updateQuantity(productId, 1);
    } else if (action === 'decrease') {
        updateQuantity(productId, -1);
    } else if (action === 'remove') {
        removeFromCart(productId);
    }
});

// ============================================
// Modal Functions
// ============================================

// Open cart modal
function openCartModal() {
    cartModal.classList.add('active');
    cartOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close cart modal
function closeCartModal() {
    cartModal.classList.remove('active');
    cartOverlay.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Open cart modal
cartButton.addEventListener('click', function(e) {
    e.preventDefault();
    openCartModal();
});

// Close cart modal - only when clicking close button or overlay
closeCart.addEventListener('click', function(e) {
    e.preventDefault();
    closeCartModal();
});

cartOverlay.addEventListener('click', function(e) {
    e.preventDefault();
    closeCartModal();
});

// Prevent cart panel clicks from propagating to document
const cartPanel = document.querySelector('.cart-panel');
if (cartPanel) {
    cartPanel.addEventListener('click', function(e) {
        e.stopPropagation();
    });
}

// ============================================
// Midtrans: Create Transaction via Vercel API
// ============================================

async function createMidtransTransaction(orderId, amount, customerName) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                order_id: orderId,
                amount: amount,
                customer_name: customerName
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Failed to create transaction');
        }

        return data;
    } catch (error) {
        console.error('Error creating transaction:', error);
        throw error;
    }
}

// ============================================
// Checkout with Midtrans
// ============================================

checkoutBtn.addEventListener('click', async (event) => {
    // Prevent default button behavior
    event.preventDefault();
    event.stopPropagation();

    if (cart.length === 0) {
        showToast('Your cart is empty!', 'error');
        return;
    }

    if (isProcessingPayment) {
        return;
    }

    // Calculate total amount
    const totalAmount = calculateTotal();

    // Generate unique order ID
    const orderId = `ORDER-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Get customer name (could be from user input in a real app)
    const customerName = 'Customer'; // In production, get from user input

    try {
        // Show loading state
        isProcessingPayment = true;
        checkoutBtn.disabled = true;
        checkoutBtn.textContent = 'Processing...';

        console.log('Creating transaction with:', {
            orderId,
            amount: totalAmount,
            customerName
        });

        // Call Vercel API to create Midtrans transaction
        const transaction = await createMidtransTransaction(
            orderId,
            totalAmount,
            customerName
        );

        console.log('Transaction created:', transaction);

        // Check if Snap token is available
        if (transaction.token) {
            // Use Midtrans Snap to display payment page
            if (window.snap) {
                window.snap.pay(transaction.token, {
                    onSuccess: function(result) {
                        console.log('Payment success:', result);
                        showToast('Payment successful! Thank you for your order.', 'success');
                        clearCart();
                    },
                    onPending: function(result) {
                        console.log('Payment pending:', result);
                        showToast('Payment pending. Please complete your payment.', 'info');
                    },
                    onError: function(result) {
                        console.error('Payment error:', result);
                        showToast('Payment failed. Please try again.', 'error');
                    },
                    onClose: function() {
                        console.log('Payment popup closed');
                        showToast('Payment was cancelled', 'info');
                    }
                });
            } else {
                // Fallback: If Snap is not loaded, redirect to URL
                if (transaction.redirect_url) {
                    window.location.href = transaction.redirect_url;
                } else {
                    showToast('Payment successful! Thank you for your order.', 'success');
                    clearCart();
                }
            }
        } else {
            showToast('Payment successful! Thank you for your order.', 'success');
            clearCart();
        }

        // Reset button state
        isProcessingPayment = false;
        checkoutBtn.disabled = false;
        checkoutBtn.textContent = 'Checkout with Midtrans';

    } catch (error) {
        console.error('Checkout error:', error);
        showToast('Checkout error: ' + error.message, 'error');

        // Reset payment state on error
        isProcessingPayment = false;
        checkoutBtn.disabled = false;
        checkoutBtn.textContent = 'Checkout with Midtrans';
    }
});

// Clear cart after successful checkout
function clearCart() {
    setTimeout(() => {
        cart = [];
        saveCart();
        updateCartUI();
        closeCartModal();
    }, 1000);
}

// ============================================
// Toast Notification
// ============================================
function showToast(message, type = 'info') {
    // Remove existing toast if any
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }

    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;

    // Style based on type
    switch (type) {
        case 'success':
            toast.style.backgroundColor = '#10b981';
            break;
        case 'error':
            toast.style.backgroundColor = '#ef4444';
            break;
        case 'info':
        default:
            toast.style.backgroundColor = '#1f2937';
    }

    document.body.appendChild(toast);

    // Show toast
    setTimeout(() => {
        toast.classList.add('show');
    }, 100);

    // Hide and remove toast
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                document.body.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// ============================================
// Make functions available globally
// ============================================
window.addToCart = addToCart;
window.updateQuantity = updateQuantity;
window.removeFromCart = removeFromCart;
window.openCartModal = openCartModal;
window.closeCartModal = closeCartModal;
