(() => {
    const API_BASE_URL = 'http://localhost:5000/api/v1';
    const STRIPE_PUBLIC_KEY = 'pk_test_51RfshAInJKwgfh1bSwWZxFvhSnXUFMoWJgXB7OMnqCRLT6IJejEAXln84IJyeE2LJGw9eRkpvfUTlTH29Rlz78k800fshAKGSq';
    
    let stripe;
    let elements;
    let card;
    let selectedProduct = null;

    function initializeStripe() {
        stripe = Stripe(STRIPE_PUBLIC_KEY);
        elements = stripe.elements();
        
        card = elements.create('card', {
            style: {
                base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                        color: '#aab7c4',
                    },
                    fontFamily: 'Montserrat, sans-serif',
                },
                invalid: {
                    color: '#e74c3c',
                },
            },
        });
    }

    const dom = {
        customizeForm: document.getElementById('customizeForm'),
        categoryLabel: document.getElementById('categoryLabel'),
        subcategoryLabel: document.getElementById('subcategoryLabel'),
        productImage: document.getElementById('productImage'),
        productPreviewImage: document.getElementById('productPreviewImage'),
        customPhraseInput: document.getElementById('customPhrase'),
        productPrice: document.getElementById('productPrice'),
        paymentModal: document.getElementById('paymentModal'),
        orderProductName: document.getElementById('orderProductName'),
        orderCustomization: document.getElementById('orderCustomization'),
        orderTotal: document.getElementById('orderTotal'),
        payBtn: document.getElementById('payBtn'),
        payBtnText: document.getElementById('payBtnText'),
        payBtnSpinner: document.getElementById('payBtnSpinner'),
        cardErrors: document.getElementById('card-errors'),
        loadingOverlay: document.getElementById('loadingOverlay'),
        closeModal: document.querySelector('.close')
    };

    function loadSelectedProduct() {
        const productData = localStorage.getItem('selectedProduct');
        if (productData) {
            try {
                selectedProduct = JSON.parse(productData);
                displayProductDetails();
            } catch (e) {
                console.error('Error parsing selected product:', e);
                alert('No se pudo cargar el producto seleccionado.');
            }
        } else {
            alert('No hay ningún producto seleccionado. Por favor, selecciona uno del catálogo.');
        }
    }

    function displayProductDetails() {
        if (!selectedProduct) return;

        dom.categoryLabel.textContent = selectedProduct.category || 'N/A';
        dom.subcategoryLabel.textContent = selectedProduct.subcategory || 'N/A';
        dom.productPrice.textContent = formatCurrency(selectedProduct.price);
        
        if (selectedProduct.image) {
            dom.productImage.src = selectedProduct.image;
            dom.productPreviewImage.src = selectedProduct.image;
        }
    }

    function handleFormSubmit(e) {
        e.preventDefault();
        
        const customizationText = dom.customPhraseInput.value;
        if (!customizationText) {
            alert('Por favor, ingresa una frase o nombre para personalizar.');
            return;
        }

        showPaymentModal(customizationText);
    }

    function showPaymentModal(customizationText) {
        dom.orderProductName.textContent = selectedProduct.name;
        dom.orderCustomization.textContent = customizationText;
        dom.orderTotal.textContent = formatCurrency(selectedProduct.price);
        
        dom.paymentModal.style.display = 'block';
        
        if (card && document.getElementById('card-element')) {
            card.mount('#card-element');
        }
    }

    async function handlePayment() {
        if (!stripe || !card) {
            console.error('Stripe not initialized');
            return;
        }

        showLoading(true);

        const { error, paymentMethod } = await stripe.createPaymentMethod({
            type: 'card',
            card: card,
        });

        if (error) {
            dom.cardErrors.textContent = error.message;
            showLoading(false);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/create-payment-intent`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: Math.round(selectedProduct.price * 100),
                    currency: 'usd',
                    customization_data: {
                        productId: selectedProduct.id,
                        productName: selectedProduct.name,
                        customPhrase: dom.customPhraseInput.value
                    }
                }),
            });

            const { client_secret, error: backendError } = await response.json();

            if (backendError) {
                throw new Error(backendError);
            }

            const { error: paymentError } = await stripe.confirmCardPayment(client_secret, {
                payment_method: paymentMethod.id
            });

            if (paymentError) {
                dom.cardErrors.textContent = paymentError.message;
                showLoading(false);
            } else {
                localStorage.setItem('orderConfirmation', JSON.stringify({
                    productName: selectedProduct.name,
                    customization: dom.customPhraseInput.value,
                    total: selectedProduct.price
                }));
                window.location.href = `order-confirmation.html?payment_intent=${client_secret}`;
            }
        } catch (error) {
            console.error('Error:', error);
            dom.cardErrors.textContent = 'Error procesando el pago. Inténtalo de nuevo.';
            showLoading(false);
        }
    }

    function formatCurrency(amount) {
        return new Intl.NumberFormat('es-PA', {
            style: 'currency',
            currency: 'USD',
            currencyDisplay: 'symbol'
        }).format(amount).replace('US$', 'B/.');
    }

    function showLoading(show = true) {
        dom.loadingOverlay.style.display = show ? 'flex' : 'none';
        dom.payBtn.disabled = show;
        dom.payBtnText.style.display = show ? 'none' : 'inline';
        dom.payBtnSpinner.style.display = show ? 'inline-block' : 'none';
    }

    function setupEventListeners() {
        dom.customizeForm?.addEventListener('submit', handleFormSubmit);
        dom.payBtn?.addEventListener('click', handlePayment);
        dom.closeModal?.addEventListener('click', () => {
            dom.paymentModal.style.display = 'none';
            if (card) card.unmount();
        });
        window.addEventListener('click', (e) => {
            if (e.target === dom.paymentModal) {
                dom.paymentModal.style.display = 'none';
                if (card) card.unmount();
            }
        });
    }

    function init() {
        initializeStripe();
        loadSelectedProduct();
        setupEventListeners();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
