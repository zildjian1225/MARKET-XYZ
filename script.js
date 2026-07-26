/**
 * ========================================
 * MARKET XYZ - Main Application
 * ========================================
 * A complete marketplace web app with:
 * - Product management (CRUD)
 * - Shopping cart
 * - Search & filter
 * - Dark mode
 * - LocalStorage persistence
 * - PWA support
 * ========================================
 */

// ========================================
// STATE MANAGEMENT
// ========================================

/** @type {Array} - All products stored in localStorage */
let products = [];

/** @type {Array} - Shopping cart items */
let cart = [];

/** @type {Object} - User profile data */
let profile = {};

/** @type {string} - Current theme ('light' or 'dark') */
let currentTheme = 'light';

/**
 * Initialize the application
 * Loads data from localStorage and sets up event listeners
 */
function initApp() {
    // Show loading screen
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        setTimeout(() => {
            loadingScreen.classList.add('hidden');
        }, 500);
    }

    // Load data from localStorage
    loadData();
    
    // Setup theme
    setupTheme();
    
    // Setup navigation
    setupNavigation();
    
    // Setup page-specific functionality
    const currentPage = getCurrentPage();
    switch (currentPage) {
        case 'home':
            renderProducts();
            setupSearchAndFilter();
            break;
        case 'upload':
            setupUploadForm();
            break;
        case 'detail':
            renderProductDetail();
            break;
        case 'cart':
            renderCart();
            setupCheckout();
            break;
        case 'profile':
            renderProfile();
            setupProfileEdit();
            break;
    }
    
    // Setup theme toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
}

// ========================================
// DATA PERSISTENCE
// ========================================

/**
 * Load all data from localStorage
 */
function loadData() {
    try {
        const storedProducts = localStorage.getItem('market_products');
        products = storedProducts ? JSON.parse(storedProducts) : [];
        
        const storedCart = localStorage.getItem('market_cart');
        cart = storedCart ? JSON.parse(storedCart) : [];
        
        const storedProfile = localStorage.getItem('market_profile');
        profile = storedProfile ? JSON.parse(storedProfile) : {
            name: 'Pengguna',
            email: 'pengguna@email.com'
        };
        
        const storedTheme = localStorage.getItem('market_theme');
        currentTheme = storedTheme || 'light';
    } catch (error) {
        console.error('Error loading data:', error);
        products = [];
        cart = [];
        profile = { name: 'Pengguna', email: 'pengguna@email.com' };
    }
}

/**
 * Save products to localStorage
 */
function saveProducts() {
    try {
        localStorage.setItem('market_products', JSON.stringify(products));
    } catch (error) {
        console.error('Error saving products:', error);
    }
}

/**
 * Save cart to localStorage
 */
function saveCart() {
    try {
        localStorage.setItem('market_cart', JSON.stringify(cart));
    } catch (error) {
        console.error('Error saving cart:', error);
    }
}

/**
 * Save profile to localStorage
 */
function saveProfile() {
    try {
        localStorage.setItem('market_profile', JSON.stringify(profile));
    } catch (error) {
        console.error('Error saving profile:', error);
    }
}

// ========================================
// THEME MANAGEMENT
// ========================================

/**
 * Setup theme based on stored preference
 */
function setupTheme() {
    if (currentTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    } else {
        document.documentElement.removeAttribute('data-theme');
    }
}

/**
 * Toggle between light and dark themes
 */
function toggleTheme() {
    if (currentTheme === 'light') {
        currentTheme = 'dark';
        document.documentElement.setAttribute('data-theme', 'dark');
    } else {
        currentTheme = 'light';
        document.documentElement.removeAttribute('data-theme');
    }
    localStorage.setItem('market_theme', currentTheme);
}

// ========================================
// NAVIGATION
// ========================================

/**
 * Get current page name from URL
 * @returns {string} Page name
 */
function getCurrentPage() {
    const path = window.location.pathname;
    if (path.includes('upload.html')) return 'upload';
    if (path.includes('detail.html')) return 'detail';
    if (path.includes('cart.html')) return 'cart';
    if (path.includes('profile.html')) return 'profile';
    return 'home';
}

/**
 * Setup navigation active states
 */
function setupNavigation() {
    const currentPage = getCurrentPage();
    const links = document.querySelectorAll('.nav-link');
    links.forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === currentPage) {
            link.classList.add('active');
        }
    });
}

// ========================================
// TOAST NOTIFICATIONS
// ========================================

/**
 * Show a toast notification
 * @param {string} message - Message to display
 * @param {string} type - 'success', 'error', or 'info'
 */
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.textContent = message;
    toast.className = 'toast';
    toast.classList.add(type);
    
    // Force reflow for animation
    void toast.offsetWidth;
    
    toast.classList.add('show');
    
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ========================================
// HOME PAGE - PRODUCTS
// ========================================

/**
 * Render products to the grid
 * @param {Array} productsToRender - Array of products to render (default: all products)
 */
function renderProducts(productsToRender = null) {
    const grid = document.getElementById('productsGrid');
    const count = document.getElementById('productCount');
    
    if (!grid) return;
    
    const items = productsToRender || products;
    
    // Update count
    if (count) {
        count.textContent = `${items.length} produk`;
    }
    
    if (items.length === 0) {
        grid.innerHTML = `
            <div class="empty-state glass" style="grid-column: 1/-1; padding: 3rem; text-align: center;">
                <p style="font-size: 1.1rem; color: var(--text-secondary);">Belum ada produk. <a href="upload.html" style="color: var(--accent);">Upload produk pertama!</a></p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = items.map((product, index) => `
        <div class="product-card" style="animation-delay: ${index * 0.05}s">
            ${product.image ? 
                `<img src="${product.image}" alt="${product.name}" class="product-image" loading="lazy">` :
                `<div class="product-image-placeholder">📷 No Image</div>`
            }
            <div class="product-info">
                <h3 class="product-name">${escapeHtml(product.name)}</h3>
                <p class="product-price">Rp ${formatPrice(product.price)}</p>
                <div class="product-meta">
                    <span>${escapeHtml(product.category || 'Umum')}</span>
                    <span>${product.condition || 'Baru'}</span>
                </div>
                <div class="product-actions">
                    <a href="detail.html?id=${product.id}" class="btn-secondary">Detail</a>
                    <button onclick="addToCart('${product.id}')" class="btn-primary">Beli</button>
                </div>
            </div>
        </div>
    `).join('');
}

/**
 * Setup search and filter functionality
 */
function setupSearchAndFilter() {
    const searchInput = document.getElementById('searchInput');
    const filterSelect = document.getElementById('categoryFilter');
    
    if (!searchInput || !filterSelect) return;
    
    function filterProducts() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const category = filterSelect.value;
        
        let filtered = products;
        
        if (searchTerm) {
            filtered = filtered.filter(p => 
                p.name.toLowerCase().includes(searchTerm) ||
                p.description.toLowerCase().includes(searchTerm)
            );
        }
        
        if (category !== 'all') {
            filtered = filtered.filter(p => p.category === category);
        }
        
        renderProducts(filtered);
    }
    
    searchInput.addEventListener('input', filterProducts);
    filterSelect.addEventListener('change', filterProducts);
}

// ========================================
// UPLOAD PAGE
// ========================================

/**
 * Setup upload form functionality
 */
function setupUploadForm() {
    const form = document.getElementById('uploadForm');
    const imageInput = document.getElementById('productImage');
    const preview = document.getElementById('imagePreview');
    const uploadArea = document.getElementById('imageUploadArea');
    
    if (!form) return;
    
    // Image preview
    if (imageInput && preview) {
        imageInput.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    preview.src = e.target.result;
                    preview.style.display = 'block';
                    const placeholder = uploadArea.querySelector('.upload-placeholder');
                    if (placeholder) placeholder.style.display = 'none';
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    // Form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('productName')?.value.trim();
        const price = document.getElementById('productPrice')?.value;
        const category = document.getElementById('productCategory')?.value;
        const condition = document.getElementById('productCondition')?.value;
        const description = document.getElementById('productDescription')?.value.trim();
        const imageFile = document.getElementById('productImage')?.files[0];
        
        // Validation
        if (!name) {
            showToast('Nama produk harus diisi!', 'error');
            return;
        }
        if (!price || price <= 0) {
            showToast('Harga harus diisi dengan angka yang valid!', 'error');
            return;
        }
        if (!category) {
            showToast('Pilih kategori produk!', 'error');
            return;
        }
        if (!description) {
            showToast('Deskripsi produk harus diisi!', 'error');
            return;
        }
        
        // Create product
        const product = {
            id: generateId(),
            name: name,
            price: parseFloat(price),
            category: category,
            condition: condition || 'baru',
            description: description,
            image: '',
            createdAt: new Date().toISOString(),
            sold: false
        };
        
        // Handle image
        if (imageFile) {
            const reader = new FileReader();
            reader.onload = function(e) {
                product.image = e.target.result;
                saveProductAndRedirect(product);
            };
            reader.readAsDataURL(imageFile);
        } else {
            saveProductAndRedirect(product);
        }
    });
}

/**
 * Save product and redirect to home
 * @param {Object} product - Product to save
 */
function saveProductAndRedirect(product) {
    products.unshift(product);
    saveProducts();
    showToast('Produk berhasil dipublikasikan! 🎉', 'success');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

// ========================================
// DETAIL PAGE
// ========================================

/**
 * Render product detail page
 */
function renderProductDetail() {
    const container = document.getElementById('productDetail');
    if (!container) return;
    
    const params = new URLSearchParams(window.location.search);
    const productId = params.get('id');
    
    if (!productId) {
        container.innerHTML = '<p>Produk tidak ditemukan.</p>';
        return;
    }
    
    const product = products.find(p => p.id === productId);
    
    if (!product) {
        container.innerHTML = '<p>Produk tidak ditemukan.</p>';
        return;
    }
    
    container.innerHTML = `
        ${product.image ? 
            `<img src="${product.image}" alt="${product.name}" class="detail-image">` :
            `<div class="detail-image" style="height:200px;display:flex;align-items:center;justify-content:center;background:var(--bg-secondary);color:var(--text-secondary);">📷 No Image</div>`
        }
        <h1 class="detail-name">${escapeHtml(product.name)}</h1>
        <p class="detail-price">Rp ${formatPrice(product.price)}</p>
        <span class="detail-condition">${product.condition || 'Baru'}</span>
        <p class="detail-description">${escapeHtml(product.description)}</p>
        <div class="detail-actions">
            <button onclick="addToCart('${product.id}')" class="btn-primary">🛒 Tambah ke Keranjang</button>
            <button onclick="handleChat('${product.id}')" class="btn-secondary">💬 Chat Penjual</button>
        </div>
    `;
}

// ========================================
// CART PAGE
// ========================================

/**
 * Render cart items
 */
function renderCart() {
    const container = document.getElementById('cartItems');
    const totalItems = document.getElementById('totalItems');
    const totalPrice = document.getElementById('totalPrice');
    
    if (!container) return;
    
    if (cart.length === 0) {
        container.innerHTML = `
            <div class="empty-state glass" style="padding: 3rem; text-align: center;">
                <p style="font-size: 1.1rem; color: var(--text-secondary);">Keranjang kosong. <a href="index.html" style="color: var(--accent);">Belanja sekarang!</a></p>
            </div>
        `;
        if (totalItems) totalItems.textContent = '0';
        if (totalPrice) totalPrice.textContent = 'Rp 0';
        return;
    }
    
    container.innerHTML = cart.map((item, index) => {
        const product = products.find(p => p.id === item.id);
        if (!product) return '';
        
        return `
            <div class="cart-item">
                ${product.image ? 
                    `<img src="${product.image}" alt="${product.name}" class="cart-item-image">` :
                    `<div class="cart-item-image" style="display:flex;align-items:center;justify-content:center;background:var(--bg-secondary);color:var(--text-secondary);font-size:1.5rem;">📷</div>`
                }
                <div class="cart-item-info">
                    <div class="cart-item-name">${escapeHtml(product.name)}</div>
                    <div class="cart-item-price">Rp ${formatPrice(product.price)}</div>
                </div>
                <div class="cart-item-actions">
                    <button onclick="removeFromCart('${product.id}')" class="btn-danger">Hapus</button>
                </div>
            </div>
        `;
    }).join('');
    
    // Update totals
    const total = cart.reduce((sum, item) => {
        const product = products.find(p => p.id === item.id);
        return sum + (product ? product.price : 0);
    }, 0);
    
    if (totalItems) totalItems.textContent = cart.length;
    if (totalPrice) totalPrice.textContent = `Rp ${formatPrice(total)}`;
}

/**
 * Setup checkout functionality
 */
function setupCheckout() {
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (!checkoutBtn) return;
    
    checkoutBtn.addEventListener('click', function() {
        if (cart.length === 0) {
            showToast('Keranjang kosong!', 'error');
            return;
        }
        
        // Simulate checkout
        const total = cart.reduce((sum, item) => {
            const product = products.find(p => p.id === item.id);
            return sum + (product ? product.price : 0);
        }, 0);
        
        // Mark products as sold
        cart.forEach(item => {
            const product = products.find(p => p.id === item.id);
            if (product) {
                product.sold = true;
            }
        });
        
        // Clear cart
        cart = [];
        saveCart();
        saveProducts();
        
        showToast(`Checkout berhasil! Total: Rp ${formatPrice(total)} 🎉`, 'success');
        renderCart();
    });
}

// ========================================
// PROFILE PAGE
// ========================================

/**
 * Render profile page
 */
function renderProfile() {
    const nameEl = document.getElementById('profileName');
    const emailEl = document.getElementById('profileEmail');
    const totalProducts = document.getElementById('totalProducts');
    const totalSold = document.getElementById('totalSold');
    const userProducts = document.getElementById('userProducts');
    
    if (nameEl) nameEl.textContent = profile.name || 'Pengguna';
    if (emailEl) emailEl.textContent = profile.email || 'pengguna@email.com';
    
    // Count products
    const userProductList = products.filter(p => p.createdBy === profile.email || true); // All products for demo
    const soldProducts = userProductList.filter(p => p.sold);
    
    if (totalProducts) totalProducts.textContent = userProductList.length;
    if (totalSold) totalSold.textContent = soldProducts.length;
    
    // Render user products
    if (userProducts) {
        if (userProductList.length === 0) {
            userProducts.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 2rem; color: var(--text-secondary);">
                    Belum ada produk yang dijual.
                    <br><a href="upload.html" style="color: var(--accent);">Upload produk sekarang!</a>
                </div>
            `;
        } else {
            userProducts.innerHTML = userProductList.map(product => `
                <div class="product-card">
                    ${product.image ? 
                        `<img src="${product.image}" alt="${product.name}" class="product-image" style="height:150px;">` :
                        `<div class="product-image-placeholder" style="height:150px;">📷</div>`
                    }
                    <div class="product-info">
                        <h3 class="product-name">${escapeHtml(product.name)}</h3>
                        <p class="product-price">Rp ${formatPrice(product.price)}</p>
                        <p style="font-size:0.85rem;color:var(--text-secondary);">
                            ${product.sold ? '✅ Terjual' : '📌 Tersedia'}
                        </p>
                    </div>
                </div>
            `).join('');
        }
    }
}

/**
 * Setup profile edit modal
 */
function setupProfileEdit() {
    const editBtn = document.getElementById('editProfileBtn');
    const modal = document.getElementById('editModal');
    const closeBtn = document.querySelector('.modal-close');
    const form = document.getElementById('editProfileForm');
    const editName = document.getElementById('editName');
    const editEmail = document.getElementById('editEmail');
    
    if (!editBtn || !modal) return;
    
    // Open modal
    editBtn.addEventListener('click', function() {
        if (editName) editName.value = profile.name || '';
        if (editEmail) editEmail.value = profile.email || '';
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
    
    // Close modal
    function closeModal() {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) closeModal();
    });
    
    // Save profile
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = editName?.value.trim();
            const email = editEmail?.value.trim();
            
            if (!name) {
                showToast('Nama harus diisi!', 'error');
                return;
            }
            if (!email || !email.includes('@')) {
                showToast('Email tidak valid!', 'error');
                return;
            }
            
            profile.name = name;
            profile.email = email;
            saveProfile();
            
            renderProfile();
            closeModal();
            showToast('Profil berhasil diperbarui!', 'success');
        });
    }
}

// ========================================
// CART OPERATIONS
// ========================================

/**
 * Add a product to cart
 * @param {string} productId - ID of product to add
 */
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) {
        showToast('Produk tidak ditemukan!', 'error');
        return;
    }
    
    if (product.sold) {
        showToast('Produk ini sudah terjual!', 'error');
        return;
    }
    
    // Check if already in cart
    if (cart.some(item => item.id === productId)) {
        showToast('Produk sudah ada di keranjang!', 'info');
        return;
    }
    
    cart.push({ id: productId });
    saveCart();
    showToast(`${product.name} ditambahkan ke keranjang! 🛒`, 'success');
}

/**
 * Remove a product from cart
 * @param {string} productId - ID of product to remove
 */
function removeFromCart(productId) {
    const product = products.find(p => p.id === productId);
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    renderCart();
    if (product) {
        showToast(`${product.name} dihapus dari keranjang.`, 'info');
    }
}

// ========================================
// CHAT SIMULATION
// ========================================

/**
 * Handle chat simulation
 * @param {string} productId - ID of product
 */
function handleChat(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) {
        showToast('Produk tidak ditemukan!', 'error');
        return;
    }
    showToast(`💬 Chat dengan penjual untuk produk "${product.name}"`, 'info');
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Generate a unique ID
 * @returns {string} Unique ID
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

/**
 * Format price to Rupiah
 * @param {number} price - Price to format
 * @returns {string} Formatted price
 */
function formatPrice(price) {
    return new Intl.NumberFormat('id-ID').format(price);
}

/**
 * Escape HTML to prevent XSS
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ========================================
// SERVICE WORKER REGISTRATION
// ========================================

/**
 * Register service worker for PWA support
 */
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/service-worker.js')
                .then(registration => {
                    console.log('Service Worker registered successfully');
                })
                .catch(error => {
                    console.log('Service Worker registration failed:', error);
                });
        });
    }
}

// ========================================
// INITIALIZE APP
// ========================================

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initApp();
        registerServiceWorker();
    });
} else {
    initApp();
    registerServiceWorker();
}

// Make functions globally accessible for inline event handlers
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.handleChat = handleChat;
window.renderProducts = renderProducts;
