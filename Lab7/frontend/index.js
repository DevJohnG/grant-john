(() => {
    const App = (() => {
        const htmlElements = {
            tableBody: document.querySelector(".products-table"),
            buttonShow: document.querySelector('#buttonShow'),
             dialogCancelButton: document.querySelector('#dialogCancelButton'),
            formDialog: document.querySelector('#formDialog'),
            productForm: document.querySelector('#formDialog form'),
            selectCategory: document.querySelector('#category'),
            inputProductName: document.querySelector('#productname'),
            inputProductPrice: document.querySelector('#productprize'),
            formSubmitButton: document.querySelector('#formDialog form input[type="submit"]'),
            currentProductId: null,
        }

        const handlers = {

            handleEditClick: async function (e) {
                const button = e.target;
                const productId = button.getAttribute('data-product-id');
                if (!productId) {
                    console.warn("Product ID not found on edit button.", button);
                    return;
                }

                try {
                    const response = await fetch(`http://localhost:3000/api/v1/products/${productId}`);
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const productToEdit = await response.json();
                    if (productToEdit) {
                        methods.openDialog(true, productToEdit);
                    } else {
                        alert("Producto no encontrado para editar.");
                    }
                } catch (error) {
                    console.error("Error fetching product for edit:", error);
                    alert("Error al cargar los datos del producto para editar.");
                }
            }
        };

        const methods = {

            fetchCategories: async () => {
                try {
                    const response = await fetch("http://localhost:3000/api/v1/categories");
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const data = await response.json();
                    return data.data;
                } catch (error) {
                    console.error("Error fetching categories:", error);
                    alert("Error al cargar categorías.");
                    return [];
                }
            },

            populateCategories: async (selectedCategoryId = null) => {
                const categories = await methods.fetchCategories();
                htmlElements.selectCategory.innerHTML = '';
                categories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category.id;
                    option.textContent = category.name;
                    if (selectedCategoryId && category.id === selectedCategoryId) {
                        option.selected = true;
                    }
                    htmlElements.selectCategory.appendChild(option);
                });
            },

            fetchProducts: async () => {
                try {
                    const response = await fetch("http://localhost:3000/api/v1/products");
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const data = await response.json();
                    return data;
                } catch (error) {
                    console.error("Error fetching products:", error);
                    alert("Error al cargar productos.");
                    return { data: [], count: 0 };
                }
            },
            renderProducts: ({ data, count }) => {
                htmlElements.tableBody.innerHTML = data.map((product) => `
                    <tr>
                        <td>${product.id}</td>
                        <td>${product.category ? product.category.name : 'N/A'}</td>
                        <td>${product.name}</td>
                        <td>${product.price}</td>
                        <td>
                            <button class="editButton" data-product-id="${product.id}">Editar</button>
                            <button class="deleteButton" data-product-id="${product.id}">Borrar</button>
                        </td>
                    </tr>
                `).join("");
            },

            openDialog(isEditing = false, product = null) {
                htmlElements.formDialog.showModal();
                htmlElements.productForm.reset();

                if (isEditing && product) {
                    htmlElements.currentProductId = product.id;
                    htmlElements.selectCategory.value = product.category ? product.category.id : '';
                    htmlElements.inputProductName.value = product.name;
                    htmlElements.inputProductPrice.value = product.price;
                    htmlElements.formSubmitButton.value = "Actualizar";
                    methods.populateCategories(product.category ? product.category.id : null);
                } else {
                    htmlElements.currentProductId = null;
                    htmlElements.formSubmitButton.value = "Agregar";
                    methods.populateCategories();
                }
            },

            hideDialog() {
                htmlElements.formDialog.close();
                htmlElements.productForm.reset();
                htmlElements.currentProductId = null;
            },

            removeRow: async function (e) {
                const button = e.target;
                const productId = button.getAttribute('data-product-id');
                if (!productId) {
                    console.warn("Product ID not found on delete button.", button);
                    return;
                }

                if (!confirm("¿Estás seguro de que quieres eliminar este producto?")) {
                    return;
                }

                try {
                    const response = await fetch(`http://localhost:3000/api/v1/products/${productId}`, {
                        method: 'DELETE'
                    });

                    if (response.ok) {
                        button.closest('tr').remove();
                        alert("Producto eliminado exitosamente.");
                    } else {
                        const errorData = await response.json();
                        alert(`Fallo al eliminar el producto: ${errorData.error || response.statusText}`);
                        console.error("Error deleting product:", response.status, errorData);
                    }
                } catch (error) {
                    console.error("Network or fetch error during deletion:", error);
                    alert("Error de conexión al intentar eliminar el producto.");
                }
            },
            submitProductForm: async function (e) {
                e.preventDefault();

                const categoryId = htmlElements.selectCategory.value;
                const name = htmlElements.inputProductName.value.trim();
                const price = parseFloat(htmlElements.inputProductPrice.value);

                if (!categoryId || !name || isNaN(price) || price <= 0) {
                    alert("Por favor, rellena todos los campos correctamente.");
                    return;
                }

                const productData = {
                    categoryId,
                    name,
                    price
                };

                let url = "http://localhost:3000/api/v1/products";
                let method = 'POST';

                if (htmlElements.currentProductId) {
                    url = `http://localhost:3000/api/v1/products/${htmlElements.currentProductId}`;
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
                        const productResponse = await response.json();
                        alert(`Producto ${htmlElements.currentProductId ? 'actualizado' : 'agregado'} exitosamente.`);
                        methods.hideDialog();
                        const { data, count } = await methods.fetchProducts();
                        methods.renderProducts({ data, count });
                    } else {
                        const errorData = await response.json();
                        alert(`Fallo al ${htmlElements.currentProductId ? 'actualizar' : 'agregar'} el producto: ${errorData.message || response.statusText}`);
                        console.error(`Error ${htmlElements.currentProductId ? 'updating' : 'adding'} product:`, response.status, errorData);
                    }
                } catch (error) {
                    console.error("Network or fetch error during product operation:", error);
                    alert(`Error de conexión al intentar ${htmlElements.currentProductId ? 'actualizar' : 'agregar'} el producto.`);
                }
            }
        };


        return {
            init: async () => {
                await methods.populateCategories();

                const { data, count } = await methods.fetchProducts();
                methods.renderProducts({ data, count });

                htmlElements.buttonShow.addEventListener('click', () => methods.openDialog(false));
                htmlElements.dialogCancelButton.addEventListener('click', methods.hideDialog);

                htmlElements.formDialog.addEventListener('click', (e) => {
                    if (e.target === htmlElements.formDialog) {
                        methods.hideDialog();
                    }
                });

                htmlElements.tableBody.addEventListener('click', function (e) {
                    if (e.target.classList.contains('deleteButton')) {
                        methods.removeRow(e);
                    }
                    else if (e.target.classList.contains('editButton')) {
                        handlers.handleEditClick(e);
                    }
                });

                htmlElements.productForm.addEventListener('submit', methods.submitProductForm);
            }
        }
    })();
    App.init();
})();