(() => {
    const API_BASE_URL = 'http://localhost:5000/api/v1';
    
    let categories = [];
    let products = [];
    let filteredProducts = [];
    let selectedProduct = null;

    // DOM Elements
    const elements = {
        categoriesGrid: document.getElementById('categoriesGrid'),
        productsGrid: document.getElementById('productsGrid'),
        categoryFilter: document.getElementById('categoryFilter'),
        searchInput: document.getElementById('searchInput'),
        productModal: document.getElementById('productModal'),
        modalProductImage: document.getElementById('modalProductImage'),
        modalProductName: document.getElementById('modalProductName'),
        modalProductCategory: document.getElementById('modalProductCategory'),
        modalProductSubcategory: document.getElementById('modalProductSubcategory'),
        modalProductPrice: document.getElementById('modalProductPrice'),
        loadingOverlay: document.getElementById('loadingOverlay'),
        closeModal: document.querySelector('.close')
    };

    // Category Icons
    const categoryIcons = {
        'Decoración': '🏠',
        'Regalos': '🎁',
        'Accesorios': '✨',
        'Personalizados': '🎨',
        'Default': '📦'
    };

    // Utility functions
    function showLoading(show = true) {
        elements.loadingOverlay.style.display = show ? 'flex' : 'none';
    }

    function showError(message) {
        alert('Error: ' + message);
    }

    function formatCurrency(amount) {
        return new Intl.NumberFormat('es-PA', {
            style: 'currency',
            currency: 'USD',
            currencyDisplay: 'symbol'
        }).format(amount).replace('US$', 'B/.');
    }

    function getUrlParameter(name) {
        name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
        var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
        var results = regex.exec(location.search);
        return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    }

    // Load categories
    async function loadCategories() {
        try {
            const response = await fetch(`${API_BASE_URL}/categories`);
            if (!response.ok) throw new Error('Failed to load categories');
            
            const result = await response.json();
            categories = result.data;
            
            renderCategories();
            populateCategoryFilter();
        } catch (error) {
            console.error('Error loading categories:', error);
            showError('Error al cargar categorías');
        }
    }

    // Load products
    async function loadProducts() {
        try {
            const response = await fetch(`${API_BASE_URL}/products`);
            if (!response.ok) throw new Error('Failed to load products');
            
            const result = await response.json();
            products = result.data;
            filteredProducts = [...products];
            
            renderProducts();
        } catch (error) {
            console.error('Error loading products:', error);
            showError('Error al cargar productos');
        }
    }

    // Render categories
    function renderCategories() {
        if (!elements.categoriesGrid) return;

        elements.categoriesGrid.innerHTML = '';
        
        categories.forEach(category => {
            const categoryCard = document.createElement('div');
            categoryCard.className = 'category-card';
            categoryCard.onclick = () => filterByCategory(category._id);
            
            const icon = categoryIcons[category.name] || categoryIcons['Default'];
            
            categoryCard.innerHTML = `
                <div class="category-image">
                    ${icon}
                </div>
                <div class="category-name">${category.name}</div>
            `;
            
            elements.categoriesGrid.appendChild(categoryCard);
        });
    }

    // Render products
    function renderProducts() {
        if (!elements.productsGrid) return;

        elements.productsGrid.innerHTML = '';
        
        if (filteredProducts.length === 0) {
            elements.productsGrid.innerHTML = `
                <div class="empty-state">
                    <h3>No se encontraron productos</h3>
                    <p>Intenta con diferentes filtros de búsqueda</p>
                </div>
            `;
            return;
        }
        
        filteredProducts.forEach(product => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.onclick = () => openProductModal(product);
            
            productCard.innerHTML = `
                <div class="product-image">
                    ${product.imageUrl ? 
                        `<img src="${product.imageUrl}" alt="${product.name}" style="width: 100%; height: 100%; object-fit: cover;">` : 
                        '📦'
                    }
                </div>
                <div class="product-info">
                    <div class="product-name">${product.name}</div>
                    <div class="product-category">Categoría: ${product.category?.name || 'N/A'}</div>
                    <div class="product-subcategory">Subcategoría: ${product.subCategory || 'N/A'}</div>
                    <div class="product-price">${formatCurrency(product.price)}</div>
                </div>
            `;
            
            elements.productsGrid.appendChild(productCard);
        });
    }

    // Populate category filter
    function populateCategoryFilter() {
        if (!elements.categoryFilter) return;

        elements.categoryFilter.innerHTML = '<option value="">Todas las categorías</option>';
        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category._id;
            option.textContent = category.name;
            elements.categoryFilter.appendChild(option);
        });
    }

    // Filter by category
    function filterByCategory(categoryId) {
        if (categoryId) {
            filteredProducts = products.filter(product => product.category._id === categoryId);
            elements.categoryFilter.value = categoryId;
        } else {
            filteredProducts = [...products];
            elements.categoryFilter.value = '';
        }
        renderProducts();
    }

    // Search products
    function searchProducts(query) {
        const searchTerm = query.toLowerCase();
        filteredProducts = products.filter(product => 
            product.name.toLowerCase().includes(searchTerm) ||
            product.category?.name.toLowerCase().includes(searchTerm) ||
            (product.subCategory && product.subCategory.toLowerCase().includes(searchTerm))
        );
        renderProducts();
    }

    // Open product modal
    function openProductModal(product) {
        selectedProduct = product;
        
        elements.modalProductName.textContent = product.name;
        elements.modalProductCategory.textContent = product.category?.name || 'N/A';
        elements.modalProductSubcategory.textContent = product.subCategory || 'N/A';
        elements.modalProductPrice.textContent = formatCurrency(product.price);
        
        if (product.imageUrl) {
            elements.modalProductImage.src = product.imageUrl;
            elements.modalProductImage.alt = product.name;
        } else {
            elements.modalProductImage.src = 'https://via.placeholder.com/200x200/A47FE0/ffffff?text=Producto';
        }
        
        elements.productModal.style.display = 'block';
    }

    // Close product modal
    window.closeProductModal = function() {
        elements.productModal.style.display = 'none';
        selectedProduct = null;
    };

    // Select product for customization
    window.selectProduct = function() {
        if (selectedProduct) {
            // Store selected product in localStorage
            const productToStore = {
                id: selectedProduct._id,
                name: selectedProduct.name,
                price: selectedProduct.price,
                image: selectedProduct.imageUrl,
                category: selectedProduct.category.name,
                subcategory: selectedProduct.subCategory
            };
            localStorage.setItem('selectedProduct', JSON.stringify(productToStore));
            
            // Redirect to customize page
            window.location.href = 'customize.html';
        }
    };

    // Event listeners
    function setupEventListeners() {
        // Category filter
        elements.categoryFilter?.addEventListener('change', (e) => {
            filterByCategory(e.target.value);
        });
        
        // Search input
        elements.searchInput?.addEventListener('input', (e) => {
            searchProducts(e.target.value);
        });
        
        // Close modal
        elements.closeModal?.addEventListener('click', closeProductModal);
        
        // Close modal when clicking outside
        elements.productModal?.addEventListener('click', (e) => {
            if (e.target === elements.productModal) {
                closeProductModal();
            }
        });
    }

    // Initialize app
    async function init() {
        try {
            showLoading();
            await Promise.all([
                loadCategories(),
                loadProducts()
            ]);
            
            setupEventListeners();
        } catch (error) {
            console.error('Initialization error:', error);
            showError('Error inicializando la aplicación');
        } finally {
            showLoading(false);
        }
    }

    // Scroll to categories section
    window.scrollToCategories = function() {
        document.getElementById('categories').scrollIntoView({ behavior: 'smooth' });
    };

    // Start the app when DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
