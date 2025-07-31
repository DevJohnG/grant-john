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

    const categoryIcons = {
        'Decoración': '🏠',
        'Regalos': '🎁',
        'Accesorios': '✨',
        'Personalizados': '🎨',
        'Default': '📦'
    };

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

    function renderCategories() {
        if (!elements.categoriesGrid) return;

        elements.categoriesGrid.innerHTML = '';

        categories.forEach(category => {
            const categoryCard = document.createElement('div');
            categoryCard.className = 'category-card';
            categoryCard.onclick = () => filterByCategory(category._id);

            const productsInCategory = products.filter(p => p.category._id === category._id);
            let mostExpensiveProduct = null;
            if (productsInCategory.length > 0) {
                mostExpensiveProduct = productsInCategory.reduce((max, p) => p.price > max.price ? p : max);
            }

            const imageUrl = mostExpensiveProduct?.imageUrl;
            const icon = categoryIcons[category.name] || categoryIcons['Default'];

            categoryCard.innerHTML = `
                <div class="category-image">
                    ${imageUrl ? `<img src="${imageUrl}" alt="${category.name}">` : icon}
                </div>
                <div class="category-name">${category.name}</div>
            `;

            elements.categoriesGrid.appendChild(categoryCard);
        });
    }

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

    function searchProducts(query) {
        const searchTerm = query.toLowerCase();
        filteredProducts = products.filter(product =>
            product.name.toLowerCase().includes(searchTerm) ||
            product.category?.name.toLowerCase().includes(searchTerm) ||
            (product.subCategory && product.subCategory.toLowerCase().includes(searchTerm))
        );
        renderProducts();
    }

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

    window.closeProductModal = function () {
        elements.productModal.style.display = 'none';
        selectedProduct = null;
    };

    window.selectProduct = function () {
        if (selectedProduct) {
            const productToStore = {
                id: selectedProduct._id,
                name: selectedProduct.name,
                price: selectedProduct.price,
                image: selectedProduct.imageUrl,
                category: selectedProduct.category.name,
                subcategory: selectedProduct.subCategory
            };
            localStorage.setItem('selectedProduct', JSON.stringify(productToStore));

            window.location.href = 'customize.html';
        }
    };

    // Event listeners
    function setupEventListeners() {
        elements.categoryFilter?.addEventListener('change', (e) => {
            filterByCategory(e.target.value);
        });

        elements.searchInput?.addEventListener('input', (e) => {
            searchProducts(e.target.value);
        });

        elements.closeModal?.addEventListener('click', closeProductModal);

        elements.productModal?.addEventListener('click', (e) => {
            if (e.target === elements.productModal) {
                closeProductModal();
            }
        });
    }

    async function init() {
        try {
            showLoading();
            await loadProducts();
            await loadCategories();

            setupEventListeners();
        } catch (error) {
            console.error('Initialization error:', error);
            showError('Error inicializando la aplicación');
        } finally {
            showLoading(false);
        }
    }

    window.scrollToCategories = function () {
        document.getElementById('categories').scrollIntoView({ behavior: 'smooth' });
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
