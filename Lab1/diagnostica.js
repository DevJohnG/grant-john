document.addEventListener('DOMContentLoaded', () => {
    const revealButton = document.getElementById('boton');
    const hiddenInfo = document.getElementById('masinfo');
    const imageElement = document.getElementById('perfil');

    hiddenInfo.style.display = 'none';

    revealButton.addEventListener('click', () => {
        if (hiddenInfo.style.display === 'none' || hiddenInfo.style.display === '') {
            hiddenInfo.style.display = 'block';
            revealButton.textContent = 'MOSTRAR MENOS';
        } else {
            hiddenInfo.style.display = 'none';
            revealButton.textContent = 'MOSTRAR MÁS';
        }
    });

    imageElement.addEventListener('click', () => {
        if (imageElement.src.includes('FotoJohn.png')) { 
            imageElement.src = 'FotoCarnet.jpg';
        } else {
            imageElement.src = 'FotoJohn.png';
        }
    });
});