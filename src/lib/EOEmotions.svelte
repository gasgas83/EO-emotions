<svelte:options
  customElement={{
    tag: "eo-emotions",
    shadow: "none",
  }}
/>

<script>
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";

  export let noteId = "";

  const API_URL = "https://strapi.elobservador.com.uy/api/eo-emotions";

  let idNota = "";
  let tituloNota = "";
  let registro = null;
  let votoActual = null;
  let userPercentResult = 0;
  let mostrarResultado = false;
  let containerEl; // referencia al propio elemento

  onMount(async () => {
    // Subimos al host del web component (el <eo-emotions> en el DOM)
    idNota = containerEl.closest("eo-emotions")?.getAttribute("id-nota") ?? containerEl.getRootNode()?.host?.getAttribute("id-nota") ?? "";
    tituloNota = containerEl.closest("eo-emotions")?.getAttribute("titulo-nota") ?? containerEl.getRootNode()?.host?.getAttribute("titulo-nota") ?? "";

    votoActual = localStorage.getItem(`eo-emotions-${idNota}`);
    registro = await fetchNota(idNota);

    if (votoActual && registro) {
      setResult(votoActual);
    }
  });

  const trackGA = (action) => {
    gtag("event", "eo_components", {
      event_category: "emotions",
      event_action: action,
    });
  };

  async function fetchNota(id) {
    try {
      const res = await fetch(`${API_URL}?filters[idNota][$eq]=${id}`);
      const json = await res.json();
      return json.data.length > 0 ? json.data[0] : null;
    } catch (error) {
      console.error("Error al buscar nota:", error);
      return null;
    }
  }

  async function crearNota(emocion) {
    const body = {
      data: {
        idNota,
        tituloNota,
        happy: emocion === "happy" ? 1 : 0,
        like: emocion === "like" ? 1 : 0,
        dislike: emocion === "dislike" ? 1 : 0,
        angry: emocion === "angry" ? 1 : 0,
      },
    };

    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    return await res.json();
  }

  async function actualizarNota(emocion) {
    const valorActual = parseInt(registro[emocion] || 0);

    const body = {
      data: { [emocion]: valorActual + 1 },
    };

    const res = await fetch(`${API_URL}/${registro.documentId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    return await res.json();
  }

  function setResult(emocion) {
    if (!registro) return;

    const emociones = ["happy", "like", "dislike", "angry"];
    const totalVotos = emociones.reduce((sum, key) => sum + parseInt(registro[key] || 0), 0);
    const votosEmocion = parseInt(registro[emocion] || 0);
    userPercentResult = totalVotos > 0 ? Math.round((votosEmocion / totalVotos) * 100) : 0;
  }

  async function handleClick(emocion) {
    if (votoActual) return;

    try {
      let res;
      if (!registro) {
        res = await crearNota(emocion);
      } else {
        res = await actualizarNota(emocion);
      }

      trackGA(emocion);

      registro = res.data;
      localStorage.setItem(`eo-emotions-${idNota}`, emocion);
      votoActual = emocion;
      setResult(emocion);
      mostrarResultado = true;
      setTimeout(() => {
        mostrarResultado = false;
      }, 30000);
    } catch (error) {
      console.error("Error al votar:", error);
    }
  }
</script>

<div class="EO-emotions-container" bind:this={containerEl}>
  {#if mostrarResultado}
    <div class="result" transition:fade={{ duration: 800 }}>
      ¡<b>{userPercentResult}%</b> de las personas reaccionaron cómo vos!
    </div>
  {/if}
  <div class="icons" class:voted={votoActual !== null}>
    <button class="emoji" class:selected={votoActual === "happy"} class:inactive={votoActual !== null && votoActual !== "happy"} on:click|stopPropagation|preventDefault={() => handleClick("happy")}>😍</button>

    <button class="emoji" class:selected={votoActual === "like"} class:inactive={votoActual !== null && votoActual !== "like"} on:click|stopPropagation|preventDefault={() => handleClick("like")}>👍</button>

    <button class="emoji" class:selected={votoActual === "dislike"} class:inactive={votoActual !== null && votoActual !== "dislike"} on:click|stopPropagation|preventDefault={() => handleClick("dislike")}>👎</button>

    <button class="emoji" class:selected={votoActual === "angry"} class:inactive={votoActual !== null && votoActual !== "angry"} on:click|stopPropagation|preventDefault={() => handleClick("angry")}>😡</button>
  </div>
</div>

<style lang="scss">
  .EO-emotions-container {
    font-family: "Anek Latin", sans-serif;
    background-color: transparent;
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 250px;
    position: relative;

    div.result {
      // height: 40px;
      color: #f254d0;
      border: 1px solid #f254d0;
      background-color: #380c2f;
      border-radius: 15px;
      font-family: "Instrument Sans", sans-serif;
      font-size: 15px;
      position: absolute;
      border-bottom-left-radius: 0;
      top: -46px;
      width: 380px;
      padding: 6px 10px;
      padding-bottom: 6px;

      @container (max-width: 390px) {
        width: 325px;
        font-size: 14px;
      }

      @media (max-width: 640px) {
        width: 86vw;
        text-align: center;
        font-size: 14px;
      }

      @media (max-width: 350px) {
        font-size: 13px;
      }
    }

    div.icons {
      display: flex;
      gap: 15px;

      .emoji {
        cursor: pointer;
        opacity: 0.7;
        transition: all 0.3s ease;
        background-color: transparent;
        border: none;
        font-size: 25px;

        &:hover {
          opacity: 1;
          transform: scale(1.2) rotate(-5deg);
        }

        &.inactive {
          opacity: 0;
          max-width: 0;
          overflow: hidden;
          padding: 0;
          margin: 0;
          pointer-events: none;
          transform: scale(0);
        }

        &.selected {
          opacity: 1;
          order: -1;
          transform: scale(1.2);
          pointer-events: none;
          cursor: default;
        }
      }

      &.voted {
        gap: 0;
      }
    }
  }
</style>
