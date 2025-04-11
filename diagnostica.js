document.addEventListener('DOMContentLoaded', () => {
  
    const revealButton = document.getElementById('boton');
    const hiddenInfo = document.getElementById('masinfo');

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
});