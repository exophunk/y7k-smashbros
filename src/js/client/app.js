import Game from 'client/Game';

globalThis.isClient = true;
globalThis.isServer = false;
globalThis.isTouchDevice = Modernizr.touchevents;
globalThis.game = new Game();

game.start();

let btnMute = document.querySelector('.btn-mute');
btnMute.addEventListener('click',() => {
    game.sound.mute = !game.sound.mute;
    btnMute.classList.toggle('muted');
});

let btnCredits = document.querySelector('.btn-credits');
btnCredits.addEventListener('click',() => {
    let creditsModal = document.querySelector('.credits-modal');
    creditsModal.style.display = 'block';
});

let modalBackground = document.querySelector('.credits-modal .bg');
modalBackground.addEventListener('click',() => {
    let creditsModal = document.querySelector('.credits-modal');
    creditsModal.style.display = 'none';
});
