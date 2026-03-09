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
let filteredProducts = [];
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
const searchInput = document.getElementById('searchInput');
const sortSelect = document.getElementById('sortSelect');
const resultsInfo = document.getElementById('resultsInfo');
const resultsCount = document.getElementById('resultsCount');

// ============================================
// Initialize App
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    initializeFirebase();
    loadProducts();
    updateCartUI();
    setupSearchAndSort();
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
        resultsInfo.classList.add('hidden');

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

        // Initialize filtered products
        filteredProducts = [...products];

        displayProducts(filteredProducts);
        updateResultsInfo();

    } catch (error) {
        console.error('Error loading products:', error);
        loadingState.classList.add('hidden');
        errorState.classList.remove('hidden');
    }
}

// ============================================
// Search & Sort Functionality
// ============================================

// Setup search and sort event listeners
function setupSearchAndSort() {
    // Search input event
    searchInput.addEventListener('input', handleSearch);

    // Sort select event
    sortSelect.addEventListener('change', handleSort);
}

// Handle search functionality
function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase().trim();

    // Filter products based on search term
    if (searchTerm === '') {
        filteredProducts = [...products];
    } else {
        filteredProducts = products.filter(product => {
            const name = product.name ? product.name.toLowerCase() : '';
            const description = product.description ? product.description.toLowerCase() : '';
            return name.includes(searchTerm) || description.includes(searchTerm);
        });
    }

    // Apply current sort after search
    applySort(sortSelect.value);

    // Display filtered results
    displayProducts(filteredProducts);
    updateResultsInfo();
}

// Handle sort functionality
function handleSort(e) {
    const sortValue = e.target.value;
    applySort(sortValue);
    displayProducts(filteredProducts);
    updateResultsInfo();
}

// Apply sorting to filtered products
function applySort(sortValue) {
    switch (sortValue) {
        case 'price-low':
            filteredProducts.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
            break;
        case 'price-high':
            filteredProducts.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
            break;
        case 'name-asc':
            filteredProducts.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
            break;
        case 'name-desc':
            filteredProducts.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
            break;
        default:
            // Default: keep original order
            filteredProducts = [...products];
            // Re-apply search filter if any
            const searchTerm = searchInput.value.toLowerCase().trim();
            if (searchTerm !== '') {
                filteredProducts = filteredProducts.filter(product => {
                    const name = product.name ? product.name.toLowerCase() : '';
                    const description = product.description ? product.description.toLowerCase() : '';
                    return name.includes(searchTerm) || description.includes(searchTerm);
                });
            }
            break;
    }
}

// Update results info display
function updateResultsInfo() {
    const searchTerm = searchInput.value.trim();
    const sortValue = sortSelect.value;

    // Only show results info if there's a search term or non-default sort
    if (searchTerm !== '' || sortValue !== 'default') {
        resultsInfo.classList.remove('hidden');
        resultsCount.textContent = filteredProducts.length;

        if (filteredProducts.length === 0) {
            resultsInfo.innerHTML = '<span>0</span> produk ditemukan';
        } else {
            resultsInfo.innerHTML = 'Menampilkan <span>' + filteredProducts.length + '</span> produk';
        }
    } else {
        resultsInfo.classList.add('hidden');
    }
}

// ============================================
// Display Products in Grid
// ============================================
function displayProducts(products) {
    productsGrid.innerHTML = '';

    // Handle empty results
    if (products.length === 0) {
        productsGrid.classList.add('hidden');
        emptyState.classList.remove('hidden');
        emptyState.innerHTML = '<p>Produk tidak ditemukan. Coba kata kunci lain.</p>';
        return;
    }

    emptyState.classList.add('hidden');
    productsGrid.classList.remove('hidden');

    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';

        // Determine stock status
        let stockClass = 'stock-available';
        let stockText = 'Tersedia';

        if (product.stock <= 0) {
            stockClass = 'stock-out';
            stockText = 'Stok Habis';
        } else if (product.stock <= 5) {
            stockClass = 'stock-low';
            stockText = `Tersisa ${product.stock}!`;
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
                <p class="product-description">${product.description || 'Tidak ada deskripsi'}</p>

                <div class="product-footer">
                    <span class="product-price">Rp ${parseFloat(product.price).toLocaleString('id-ID')}</span>
                    <span class="stock-status ${stockClass}">${stockText}</span>
                </div>

                <button onclick="addToCart('${product.id}')"
                        class="btn-add-to-cart"
                        ${product.stock <= 0 ? 'disabled' : ''}>
                    ${product.stock > 0 ? 'Tambah ke Keranjang' : 'Habis'}
                </button>
            </div>
        `;

        productsGrid.appendChild(card);
    });
}

// ============================================
// Cart Functions
// ============================================

// Add product to cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);

    if (!product) {
        showToast('Produk tidak ditemukan!', 'error');
        return;
    }

    if (product.stock <= 0) {
        showToast('Produk sedang stok habis!', 'error');
        return;
    }

    // Check if product already in cart
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        // Check stock limit
        if (existingItem.quantity < product.stock) {
            existingItem.quantity++;
        } else {
            showToast('Stok maksimum tercapai!', 'error');
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
    showToast(`${product.name} ditambahkan ke keranjang!`, 'success');
}

// Remove product from cart
function removeFromCart(productId) {
    try {
        cart = cart.filter(item => item.id !== productId);
        saveCart();
        updateCartUI();
        showToast('Item dihapus dari keranjang', 'info');
    } catch (error) {
        console.error('Error removing item from cart:', error);
        showToast('Gagal menghapus item', 'error');
    }
}

// Update product quantity
function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);

    if (item) {
        const newQuantity = item.quantity + change;

        if (newQuantity <= 0) {
            removeFromCart(productId);
        } else if (newQuantity <= item.stock) {
            item.quantity = newQuantity;
            saveCart();
            updateCartUI();
        } else {
            showToast('Stok maksimum tercapai!', 'error');
        }
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
                    <button type="button" onclick="updateQuantity('${item.id}', -1)"
                            class="btn-quantity"
                            ${item.quantity <= 1 ? 'disabled' : ''}>
                        -
                    </button>
                    <span class="quantity-value">${item.quantity}</span>
                    <button type="button" onclick="updateQuantity('${item.id}', 1)"
                            class="btn-quantity"
                            ${isMaxQuantity ? 'disabled' : ''}>
                        +
                    </button>
                </div>
            </div>

            <!-- Remove Button -->
            <button type="button" onclick="removeFromCart('${item.id}')"
                    class="btn-remove"
                    title="Hapus item">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" width="20" height="20">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
            </button>
        `;

        cartItems.appendChild(cartItem);
    });
}

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

// Store current transaction data for invoice
let currentTransaction = {
    orderId: '',
    amount: 0,
    items: [],
    date: ''
};

checkoutBtn.addEventListener('click', async (event) => {
    // Prevent default button behavior
    event.preventDefault();
    event.stopPropagation();

    if (cart.length === 0) {
        showToast('Keranjang Anda kosong!', 'error');
        return;
    }

    if (isProcessingPayment) {
        return;
    }

    // Calculate total amount
    const totalAmount = calculateTotal();

    // Generate unique order ID
    const orderId = `ORDER-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Store transaction data for invoice
    currentTransaction = {
        orderId: orderId,
        amount: totalAmount,
        items: [...cart],
        date: new Date().toLocaleString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    };

    // Get customer name (could be from user input in a real app)
    const customerName = 'Customer'; // In production, get from user input

    try {
        // Show loading state
        isProcessingPayment = true;
        checkoutBtn.disabled = true;
        checkoutBtn.textContent = 'Memproses...';

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
                        handlePaymentSuccess(result, orderId, totalAmount);
                    },
                    onPending: function(result) {
                        console.log('Payment pending:', result);
                        showToast('Pembayaran tertunda. Silakan selesaikan pembayaran Anda.', 'info');
                    },
                    onError: function(result) {
                        console.error('Payment error:', result);
                        showToast('Pembayaran gagal. Silakan coba lagi.', 'error');
                    },
                    onClose: function() {
                        console.log('Payment popup closed');
                    }
                });
            } else {
                // Fallback: If Snap is not loaded, redirect to URL
                if (transaction.redirect_url) {
                    window.location.href = transaction.redirect_url;
                } else {
                    handlePaymentSuccess({}, orderId, totalAmount);
                }
            }
        } else {
            handlePaymentSuccess({}, orderId, totalAmount);
        }

        // Reset button state
        isProcessingPayment = false;
        checkoutBtn.disabled = false;
        checkoutBtn.textContent = 'Bayar Sekarang';

    } catch (error) {
        console.error('Checkout error:', error);
        showToast('Kesalahan checkout: ' + error.message, 'error');

        // Reset payment state on error
        isProcessingPayment = false;
        checkoutBtn.disabled = false;
        checkoutBtn.textContent = 'Bayar Sekarang';
    }
});

// Handle successful payment
function handlePaymentSuccess(result, orderId, amount) {
    // Reduce stock in Firestore
    reduceStockOnPurchase(currentTransaction.items);

    // Close cart modal
    closeCartModal();

    // Show success modal with invoice
    showPaymentSuccessModal(orderId, amount);

    // Clear cart
    cart = [];
    saveCart();
    updateCartUI();
}

// Reduce stock in Firestore after successful purchase
async function reduceStockOnPurchase(items) {
    if (!window.db) {
        console.warn('Firestore not initialized');
        return;
    }

    try {
        const db = window.db;
        const batch = db.batch();

        for (const item of items) {
            const productRef = db.collection('products').doc(item.id);

            // Get current stock
            const productDoc = await productRef.get();

            if (productDoc.exists) {
                const currentStock = productDoc.data().stock || 0;
                const newStock = Math.max(0, currentStock - item.quantity);

                // Update stock
                batch.update(productRef, { stock: newStock });
            }
        }

        // Commit batch update
        await batch.commit();
        console.log('Stock updated successfully');

        // Reload products to reflect new stock
        loadProducts();

    } catch (error) {
        console.error('Error reducing stock:', error);
    }
}

// Show payment success modal with invoice
function showPaymentSuccessModal(orderId, amount) {
    // Create modal HTML
    const modalHTML = `
        <div id="paymentSuccessModal" class="payment-modal">
            <div class="payment-modal-content">
                <div class="payment-success-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h2 class="payment-success-title">Pembayaran Berhasil!</h2>
                <p class="payment-success-message">Terima kasih atas pesanan Anda</p>

                <div class="invoice">
                    <h3 class="invoice-title">Invoice</h3>
                    <div class="invoice-details">
                        <p><strong>Order ID:</strong> ${orderId}</p>
                        <p><strong>Tanggal:</strong> ${currentTransaction.date}</p>
                    </div>
                    <table class="invoice-table">
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>Jml</th>
                                <th>Harga</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${currentTransaction.items.map(item => `
                                <tr>
                                    <td>${item.name}</td>
                                    <td>${item.quantity}</td>
                                    <td>Rp ${(item.price * item.quantity).toLocaleString('id-ID')}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="2"><strong>Total</strong></td>
                                <td><strong>Rp ${amount.toLocaleString('id-ID')}</strong></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                <div class="payment-modal-actions">
                    <button onclick="printInvoice()" class="btn-print-invoice">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                        Cetak Invoice
                    </button>
                    <button onclick="closePaymentModalAndRedirect()" class="btn-back-home">
                        Kembali ke Beranda
                    </button>
                </div>
            </div>
        </div>
    `;

    // Remove existing modal if any
    const existingModal = document.getElementById('paymentSuccessModal');
    if (existingModal) {
        existingModal.remove();
    }

    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Show modal with animation
    setTimeout(() => {
        document.getElementById('paymentSuccessModal').classList.add('active');
    }, 100);
}

// Close payment modal and redirect to home
function closePaymentModalAndRedirect() {
    const modal = document.getElementById('paymentSuccessModal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.remove();
            // Redirect to home page
            window.location.href = window.location.origin + window.location.pathname;
        }, 300);
    } else {
        window.location.href = window.location.origin + window.location.pathname;
    }
}

// Print invoice function
function printInvoice() {
    const printContent = `
        <html>
        <head>
            <title>Invoice - ${currentTransaction.orderId}</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                .invoice-header { text-align: center; margin-bottom: 20px; }
                .invoice-info { margin-bottom: 20px; }
                table { width: 100%; border-collapse: collapse; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
                .total { font-weight: bold; font-size: 18px; }
            </style>
        </head>
        <body>
            <div class="invoice-header">
                <h1>Snack Store</h1>
                <p>Invoice</p>
            </div>
            <div class="invoice-info">
                <p><strong>Order ID:</strong> ${currentTransaction.orderId}</p>
                <p><strong>Tanggal:</strong> ${currentTransaction.date}</p>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Jml</th>
                        <th>Harga</th>
                    </tr>
                </thead>
                <tbody>
                    ${currentTransaction.items.map(item => `
                        <tr>
                            <td>${item.name}</td>
                            <td>${item.quantity}</td>
                            <td>Rp ${(item.price * item.quantity).toLocaleString('id-ID')}</td>
                        </tr>
                    `).join('')}
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="2"><strong>Total</strong></td>
                        <td><strong>Rp ${currentTransaction.amount.toLocaleString('id-ID')}</strong></td>
                    </tr>
                </tfoot>
            </table>
        </body>
        </html>
    `;

    // Open print window
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
}

// Make functions available globally
window.closePaymentModalAndRedirect = closePaymentModalAndRedirect;
window.printInvoice = printInvoice;

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
    toast.className = `toast ${type}`;
    toast.textContent = message;

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
