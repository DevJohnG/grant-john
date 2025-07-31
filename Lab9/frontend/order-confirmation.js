document.addEventListener('DOMContentLoaded', () => {
    const orderData = JSON.parse(localStorage.getItem('orderConfirmation'));
    const params = new URLSearchParams(window.location.search);

    if (orderData) {
        document.getElementById('productName').textContent = orderData.productName || 'N/A';
        document.getElementById('customization').textContent = orderData.customization || 'Sin personalización';
        document.getElementById('total').textContent = formatCurrency(orderData.total);
    }

    if (params.has('payment_intent')) {
        document.getElementById('transactionId').textContent = params.get('payment_intent');
    }

    localStorage.removeItem('orderConfirmation');
    localStorage.removeItem('selectedProduct');
});

function formatCurrency(amount) {
    if (typeof amount !== 'number') {
        return 'B/. 0.00';
    }
    return new Intl.NumberFormat('es-PA', {
        style: 'currency',
        currency: 'USD',
        currencyDisplay: 'symbol'
    }).format(amount).replace('US$', 'B/.');
}
