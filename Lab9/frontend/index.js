(() => {

    const API_BASE_URL = 'http://localhost:5000/api/v1';

    const App = (() => {
  
        const htmlElements = {
            tableBody: document.querySelector(".products-table"),
            buttonShow: document.querySelector('#buttonShow'),
            dialogCancelButton: document.querySelector('#dialogCancelButton'),
            formDialog: document.querySelector('#formDialog'),
            productForm: document.querySelector('#formDialog form'),
            selectCategory: document.querySelector('#category'),
            selectSubCategory: document.querySelector('#subCategory'),
            inputProductName: document.querySelector('#productname'),
            inputProductPrice: document.querySelector('#productprize'),
            inputImageUrl: document.querySelector('#imageUrl'),
            formSubmitButton: document.querySelector('#formDialog form input[type="submit"]'),
            currentProductId: null,
            searchInput: document.querySelector('#searchInput'),
            sortSelect: document.querySelector('#sortSelect'),

            loadingSpinner: document.createElement('div'),
            feedbackDialog: document.createElement('dialog'),
            feedbackMessage: document.createElement('p'),
            feedbackCloseButton: document.createElement('button')
        };

        htmlElements.loadingSpinner.className = 'loading-spinner';
        htmlElements.loadingSpinner.textContent = 'Cargando...';
        htmlElements.loadingSpinner.style.display = 'none';

        htmlElements.feedbackDialog.className = 'feedback-dialog';
        htmlElements.feedbackMessage.className = 'feedback-message';
        htmlElements.feedbackCloseButton.textContent = 'Cerrar';
        htmlElements.feedbackCloseButton.className = 'buttonStyle feedback-close-button';
        htmlElements.feedbackDialog.appendChild(htmlElements.feedbackMessage);
        htmlElements.feedbackDialog.appendChild(htmlElements.feedbackCloseButton);

        document.body.appendChild(htmlElements.feedbackDialog);
        document.body.prepend(htmlElements.loadingSpinner);

        htmlElements.feedbackCloseButton.addEventListener('click', () => {
            htmlElements.feedbackDialog.close();
        });

        let categoriesCache = [];
        let productsCache = [];

        const uiFeedback = {
            showLoading: (show) => {
                htmlElements.loadingSpinner.style.display = show ? 'block' : 'none';
                htmlElements.productForm.style.pointerEvents = show ? 'none' : 'auto';
                htmlElements.formSubmitButton.disabled = show;
                htmlElements.dialogCancelButton.disabled = show;
            },
            showMessage: (message, type = 'info') => {
                htmlElements.feedbackMessage.textContent = message;
                htmlElements.feedbackDialog.className = 'feedback-dialog'; 
                htmlElements.feedbackDialog.classList.add(`${type}-message`);

                if (!htmlElements.feedbackDialog.open) {
                    htmlElements.feedbackDialog.showModal();
                }
 
                setTimeout(() => {
                    if (htmlElements.feedbackDialog.open) {
                        htmlElements.feedbackDialog.close();
                    }
                }, 5000);
            },
            showError: (message) => uiFeedback.showMessage(message, 'error'),
            showSuccess: (message) => uiFeedback.showMessage(message, 'success'),
            clearMessages: () => {
                if (htmlElements.feedbackDialog.open) {
                    htmlElements.feedbackDialog.close();
                }
            }
        };

        const handlers = {
            handleEditClick: async function (e) {
                uiFeedback.clearMessages();
                uiFeedback.showLoading(true);
                const button = e.target;
                const productId = button.getAttribute('data-product-id');

                if (!productId) {
                    console.warn("Product ID not found on edit button.", button);
                    uiFeedback.showError("Error interno: ID de producto no encontrado.");
                    uiFeedback.showLoading(false);
                    return;
                }

                try {
                    const response = await fetch(`${API_BASE_URL}/products/${productId}`);
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
                    }
                    const productToEdit = await response.json();

                    if (productToEdit) {
                        await methods.populateCategories(productToEdit.category ? productToEdit.category._id : null);

                        const categoryObject = categoriesCache.find(c => c._id === (productToEdit.category ? productToEdit.category._id : null));
                        if (categoryObject) {
                            methods.populateSubCategories(categoryObject, productToEdit.subCategory);
                        } else {
                            htmlElements.selectSubCategory.innerHTML = '<option value="">Seleccione una subcategoría</option>';
                            htmlElements.selectSubCategory.disabled = true;
                        }

                        methods.openDialog(true, productToEdit);
                    } else {
                        uiFeedback.showError("Producto no encontrado para editar.");
                    }
                } catch (error) {
                    console.error("Error fetching product for edit:", error);
                    uiFeedback.showError(`Error al cargar los datos del producto: ${error.message}`);
                } finally {
                    uiFeedback.showLoading(false);
                }
            },

            handleDeleteClick: async function (e) {
                uiFeedback.clearMessages();
                const button = e.target;
                const productId = button.getAttribute('data-product-id');

                if (!productId) {
                    console.warn("Product ID not found on delete button.", button);
                    uiFeedback.showError("Error interno: ID de producto no encontrado para eliminar.");
                    return;
                }

                if (!confirm("¿Estás seguro de que quieres eliminar este producto? Esta acción es irreversible.")) {
                    return;
                }

                uiFeedback.showLoading(true);
                try {
                    const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
                        method: 'DELETE'
                    });

                    if (response.ok || response.status === 204) {
                        button.closest('tr').remove();
                        uiFeedback.showSuccess("Producto eliminado exitosamente.");
                    } else {
                        const errorData = await response.json();
                        uiFeedback.showError(`Fallo al eliminar el producto: ${errorData.error || errorData.message || response.statusText}`);
                        console.error("Error deleting product:", response.status, errorData);
                    }
                } catch (error) {
                    console.error("Network or fetch error during deletion:", error);
                    uiFeedback.showError("Error de conexión al intentar eliminar el producto.");
                } finally {
                    uiFeedback.showLoading(false);
                }
            },

            handleFormSubmit: async function (e) {
                e.preventDefault();
                uiFeedback.clearMessages();
                uiFeedback.showLoading(true);

                const category = htmlElements.selectCategory.value;
                const subCategory = htmlElements.selectSubCategory.value;
                const name = htmlElements.inputProductName.value.trim();
                const price = parseFloat(htmlElements.inputProductPrice.value);
                const imageUrl = htmlElements.inputImageUrl.value.trim();

                if (!category) {
                    uiFeedback.showError("Por favor, selecciona una categoría.");
                    uiFeedback.showLoading(false);
                    return;
                }
                if (!name) {
                    uiFeedback.showError("El nombre del producto es requerido.");
                    uiFeedback.showLoading(false);
                    return;
                }
                if (name.length < 3 || name.length > 50) {
                    uiFeedback.showError("El nombre debe tener entre 3 y 50 caracteres.");
                    uiFeedback.showLoading(false);
                    return;
                }
                if (isNaN(price) || price <= 0) {
                    uiFeedback.showError("Por favor, introduce un precio válido (mayor que 0).");
                    uiFeedback.showLoading(false);
                    return;
                }
                if (imageUrl && !imageUrl.startsWith('http')) {
                    uiFeedback.showError("La URL de la imagen debe ser una URL válida (ej. empezar con http:// o https://).");
                    uiFeedback.showLoading(false);
                    return;
                }

                const productData = {
                    category,
                    subCategory: subCategory || undefined,
                    name,
                    price,
                    imageUrl,
                };

                let url = `${API_BASE_URL}/products`;
                let method = 'POST';

                if (htmlElements.currentProductId) {
                    url = `${API_BASE_URL}/products/${htmlElements.currentProductId}`;
                    method = 'PUT';
                }

                try {
                    const response = await fetch(url, {
                        method: method,
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(productData)
                    });

                    if (response.ok) {
                        uiFeedback.showSuccess(`Producto ${htmlElements.currentProductId ? 'actualizado' : 'agregado'} exitosamente.`);
                        methods.closeDialog();
                        await methods.fetchAndRenderProducts();
                    } else {
                        const errorData = await response.json();
                        uiFeedback.showError(`Fallo al ${htmlElements.currentProductId ? 'actualizar' : 'agregar'} el producto: ${errorData.message || response.statusText}`);
                        console.error(`Error ${htmlElements.currentProductId ? 'updating' : 'adding'} product:`, response.status, errorData);
                    }
                } catch (error) {
                    console.error("Network or fetch error during product operation:", error);
                    uiFeedback.showError(`Error de conexión al intentar ${htmlElements.currentProductId ? 'actualizar' : 'agregar'} el producto.`);
                } finally {
                    uiFeedback.showLoading(false);
                }
            },

            handleCategoryChange: function (e) {
                const selectedCategoryId = e.target.value;
                const selectedCategoryObject = categoriesCache.find(cat => cat._id === selectedCategoryId);

                if (selectedCategoryObject) {
                    methods.populateSubCategories(selectedCategoryObject);
                } else {
                    htmlElements.selectSubCategory.innerHTML = '<option value="">Seleccione una subcategoría</option>';
                    htmlElements.selectSubCategory.disabled = true;
                }
            }
        };

        const methods = {
            fetchCategories: async () => {
                try {
                    const response = await fetch(`${API_BASE_URL}/categories`);
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
                    }
                    const data = await response.json();
                    categoriesCache = data.data;
                    return categoriesCache;
                } catch (error) {
                    console.error("Error fetching categories:", error);
                    uiFeedback.showError("Error al cargar categorías.");
                    return [];
                }
            },

            populateCategories: async (selectedCategoryId = null) => {
                const categories = categoriesCache;

                htmlElements.selectCategory.innerHTML = '<option value="">Seleccione una categoría</option>';
                categories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category._id;
                    option.textContent = category.name;
                    if (selectedCategoryId && category._id === selectedCategoryId) {
                        option.selected = true;
                    }
                    htmlElements.selectCategory.appendChild(option);
                });

                htmlElements.selectSubCategory.innerHTML = '<option value="">Seleccione una subcategoría</option>';
                htmlElements.selectSubCategory.disabled = true;

            },

            populateSubCategories: (categoryObject, selectedSubCategoryName = null) => {
                htmlElements.selectSubCategory.innerHTML = '<option value="">Seleccione una subcategoría</option>';

                if (!categoryObject || !categoryObject.subcategories || categoryObject.subcategories.length === 0) {
                    htmlElements.selectSubCategory.disabled = true;
                    return;
                }

                htmlElements.selectSubCategory.disabled = false;
                categoryObject.subcategories.forEach(subCategory => {
                    const option = document.createElement('option');
                    option.value = subCategory.name;
                    option.textContent = subCategory.name;
                    if (selectedSubCategoryName && selectedSubCategoryName === subCategory.name) {
                        option.selected = true;
                    }
                    htmlElements.selectSubCategory.appendChild(option);
                });
            },

            fetchProducts: async () => {
                try {
                    const response = await fetch(`${API_BASE_URL}/products`);
                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
                    }
                    const data = await response.json();
                    return data;
                } catch (error) {
                    console.error("Error fetching products:", error);
                    uiFeedback.showError("Error al cargar productos.");
                    return { data: [], count: 0 };
                }
            },

            renderProducts: ({ data }) => {
                htmlElements.tableBody.innerHTML = '';
                if (data.length === 0) {
                    htmlElements.tableBody.innerHTML = '<tr><td colspan="7">No hay productos disponibles.</td></tr>';
                    return;
                }

                data.forEach(product => {
                    const row = htmlElements.tableBody.insertRow();
                    row.dataset.id = product._id;

                    row.insertCell().textContent = product._id;
                    row.insertCell().textContent = product.category ? product.category.name : 'N/A';
                    row.insertCell().textContent = product.subCategory ? product.subCategory : 'N/A';
                    row.insertCell().textContent = product.name;
                    row.insertCell().textContent = `B/. ${product.price.toFixed(2)}`;

                    const imageCell = row.insertCell();
                    if (product.imageUrl) {
                        const img = document.createElement('img');
                        img.src = product.imageUrl;
                        img.alt = product.name;
                        img.style.width = '225px';
                        img.style.height = '225px';
                        img.style.borderRadius = '20px';
                        img.style.objectFit = 'cover';
                        imageCell.appendChild(img);
                    } else {
                        imageCell.textContent = 'Sin Imagen';
                    }

                    const actionsCell = row.insertCell();
                    const editButton = document.createElement('button');
                    editButton.textContent = 'Editar';
                    editButton.classList.add('buttonStyle', 'editButton');
                    editButton.setAttribute('data-product-id', product._id);

                    const deleteButton = document.createElement('button');
                    deleteButton.textContent = 'Borrar';
                    deleteButton.classList.add('buttonStyle', 'deleteButton');
                    deleteButton.setAttribute('data-product-id', product._id);

                    actionsCell.appendChild(editButton);
                    actionsCell.appendChild(deleteButton);
                });
            },

            applyFiltersAndSort: () => {
                let filteredProducts = [...productsCache];

                const searchTerm = htmlElements.searchInput.value.toLowerCase().trim();
                if (searchTerm) {
                    filteredProducts = filteredProducts.filter(product =>
                        product.name.toLowerCase().includes(searchTerm) ||
                        product._id.toLowerCase().includes(searchTerm) ||
                        (product.category && product.category.name.toLowerCase().includes(searchTerm)) ||
                        (product.subCategory && product.subCategory.toLowerCase().includes(searchTerm))
                    );
                }

                const sortValue = htmlElements.sortSelect.value;
                if (sortValue !== 'default') {
                    const [key, order] = sortValue.split('-');
                    filteredProducts.sort((a, b) => {
                        let valA, valB;

                        switch (key) {
                            case 'category':
                                valA = a.category ? a.category.name.toLowerCase() : '';
                                valB = b.category ? b.category.name.toLowerCase() : '';
                                break;
                            case 'subcategory':
                                valA = a.subCategory ? a.subCategory.toLowerCase() : '';
                                valB = b.subCategory ? b.subCategory.toLowerCase() : '';
                                break;
                            case 'price':
                                valA = a.price;
                                valB = b.price;
                                break;
                            default:
                                return 0;
                        }

                        if (valA < valB) return order === 'asc' ? -1 : 1;
                        if (valA > valB) return order === 'asc' ? 1 : -1;
                        return 0;
                    });
                }

                methods.renderProducts({ data: filteredProducts });
            },

            fetchAndRenderProducts: async () => {
                uiFeedback.showLoading(true);
                const { data, count } = await methods.fetchProducts();
                productsCache = data;
                methods.applyFiltersAndSort();
                uiFeedback.showLoading(false);
            },

            openDialog: async (isEditing = false, product = null) => {
                methods.resetForm();
                uiFeedback.clearMessages();

                await methods.populateCategories();

                if (isEditing && product) {
                    htmlElements.currentProductId = product._id;
                    htmlElements.inputProductName.value = product.name;
                    htmlElements.inputProductPrice.value = product.price;
                    htmlElements.selectCategory.value = product.category ? product.category._id : '';
                    htmlElements.inputImageUrl.value = product.imageUrl || '';
                    htmlElements.formSubmitButton.value = "Actualizar";

                    if (product.category && product.category._id) {
                        const selectedCategoryObject = categoriesCache.find(c => c._id === product.category._id);
                        if (selectedCategoryObject) {
                            methods.populateSubCategories(selectedCategoryObject, product.subCategory);
                        }
                    }
                } else {
                    htmlElements.currentProductId = null;
                    htmlElements.formSubmitButton.value = "Agregar";
                }
                htmlElements.formDialog.showModal();
            },

            closeDialog: () => {
                htmlElements.formDialog.close();
                methods.resetForm();
            },

            resetForm: () => {
                htmlElements.productForm.reset();
                htmlElements.currentProductId = null;
                htmlElements.formSubmitButton.value = "Agregar";
                htmlElements.selectSubCategory.innerHTML = '<option value="">Seleccione una subcategoría</option>';
                htmlElements.selectSubCategory.disabled = true;
            },

            setupEventListeners: () => {
                htmlElements.buttonShow.addEventListener('click', () => methods.openDialog(false));
                htmlElements.dialogCancelButton.addEventListener('click', () => methods.closeDialog());
                htmlElements.productForm.addEventListener('submit', handlers.handleFormSubmit);
                htmlElements.tableBody.addEventListener('click', function (e) {
                    if (e.target.classList.contains('editButton')) {
                        handlers.handleEditClick(e);
                    } else if (e.target.classList.contains('deleteButton')) {
                        handlers.handleDeleteClick(e);
                    }
                });
                htmlElements.selectCategory.addEventListener('change', handlers.handleCategoryChange);
                htmlElements.formDialog.addEventListener('click', (e) => {
                    if (e.target === htmlElements.formDialog) {
                        methods.closeDialog();
                    }
                });

                htmlElements.searchInput.addEventListener('input', methods.applyFiltersAndSort);
                htmlElements.sortSelect.addEventListener('change', methods.applyFiltersAndSort);
            },
        };

        const initApp = async () => {
            await methods.fetchCategories();
            await methods.populateCategories();
            await methods.fetchAndRenderProducts();
            methods.setupEventListeners();
        };

        return {
            init: initApp
        };
    })();

    document.addEventListener('DOMContentLoaded', () => {
        App.init();
    });
})();