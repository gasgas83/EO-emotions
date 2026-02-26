import EOAcordeon from './lib/EOEmotions.svelte';

if (!customElements.get('eo-emotions')) {
    customElements.define('eo-emotions', EOAcordeon);
} else {
    console.log('Custom element with name "eo-emotions" already defined');
}// In Svelte 3, do this instead:
// customElements.define('my-element', MyElement);
// import './app.css'
// import App from './App.svelte'

// const app = new App({
//   target: document.getElementById('app'),
// })

// export default app