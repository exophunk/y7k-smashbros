// Browser bars and the software keyboard can resize the visual viewport without
// resizing the layout viewport. Keep Phaser's parent inside the visible area.
export default function fitMobileViewport(game) {
    const viewport = window.visualViewport;
    const style = document.documentElement.style;
    let frame;

    const update = () => {
        frame = null;
        style.setProperty('--viewport-width', `${viewport ? viewport.width : window.innerWidth}px`);
        style.setProperty('--viewport-height', `${viewport ? viewport.height : window.innerHeight}px`);
        style.setProperty('--viewport-top', `${viewport ? viewport.offsetTop : 0}px`);
        style.setProperty('--viewport-left', `${viewport ? viewport.offsetLeft : 0}px`);
        game.scale.refresh();
    };
    const scheduleUpdate = () => {
        if (frame == null) frame = requestAnimationFrame(update);
    };

    window.addEventListener('resize', scheduleUpdate);
    window.addEventListener('orientationchange', scheduleUpdate);
    if (viewport) {
        viewport.addEventListener('resize', scheduleUpdate);
        viewport.addEventListener('scroll', scheduleUpdate);
    }
    update();
}
