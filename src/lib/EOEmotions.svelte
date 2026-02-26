<svelte:options
  customElement={{
    tag: "eo-emotions",
    shadow: "none",
  }}
/>

<script>
  import { onMount } from "svelte";

  export let noteId = "";

  const trackGA = (event) => {
    let action;

    if (event == "load") {
      action = "load";
    } else if (event == "enPantalla") {
      action = "visible";
    } else if (event == "desplegado") {
      action = "open_item";
    }

    gtag("event", "eo_components", {
      event_category: "acordeon",
      event_action: action,
      event_label: acordeonTitle,
    });
  };

  onMount(() => {
    const el = document.querySelector("eo-emotions");
    const idNota = el.getAttribute("id-nota");

    console.log(idNota);
  });
</script>

<div class="EO-emotions-container">
  <div class="result"></div>
  <div class="icons">
    <button class="emoji" on:click={() => handleClick("happy")}> 😍 </button>
    <button class="emoji" on:click={() => handleClick("like")}> 😍 </button>
    <button class="emoji" on:click={() => handleClick("dislike")}> 😍 </button>
    <button class="emoji" on:click={() => handleClick("angry")}> 😍 </button>
  </div>
</div>

<style lang="scss">
  @import url("https://fonts.googleapis.com/css2?family=Anek+Latin:wght@100..800&display=swap");
  // @import "https://www.gastondelallana.com.ar/clients/EO/fontsEO.css";

  .EO-emotions-container {
    font-family: "Anek Latin", sans-serif;
    background-color: #1c1c19;
    display: flex;
    width: 100%;
    max-width: 250px;

    div.result {
      height: 40px;
    }

    div.icons {
      display: flex;
      font-size: 25px;
      gap: 15px;

      div.emoji {
        cursor: pointer;
        opacity: 0.7;
        transition: all 0.1s ease;

        &:hover {
          opacity: 1;
          transform: scale(1.2) rotate(-5deg);
        }
      }
    }
    // font-family: "EO-Text", sans-serif;
  }
</style>
