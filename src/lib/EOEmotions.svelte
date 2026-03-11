<svelte:options
  customElement={{
    tag: "eo-emotions",
    shadow: "none",
  }}
/>

<script>
  import { onMount } from "svelte";

  export let noteId = "";

  const API_URL = "https://strapi.elobservador.com.uy/api/eo-emotions";

  let idNota = "";
  let registro = null;
  let votoActual = null;
  let userPercentResult = 0;
  let containerEl; // referencia al propio elemento
  const article = document.getElementById("article");

  onMount(async () => {
    // Subimos al host del web component (el <eo-emotions> en el DOM)
    idNota = containerEl.closest("eo-emotions")?.getAttribute("id-nota") ?? containerEl.getRootNode()?.host?.getAttribute("id-nota") ?? "";

    votoActual = localStorage.getItem(`eo-emotions-${idNota}`);
    registro = await fetchNota(idNota);

    if (votoActual && registro) {
      setResult(votoActual);
    }

    const host = containerEl.closest("eo-emotions");

    if (host) {
      host.addEventListener(
        "click",
        (e) => {
          e.stopImmediatePropagation();
          e.stopPropagation();
        },
        true,
      ); // <-- capture: true, intercepta ANTES de que baje al DOM
    }

    // ── Fallback: interceptar en el article si viene de eo-emotions ──
    article.addEventListener(
      "click",
      (e) => {
        if (e.target.closest("eo-emotions")) {
          e.stopPropagation();
          e.stopImmediatePropagation();
        }
      },
      true,
    );
  });

  const trackGA = (event) => {
    let action;

    if (event == "happy") {
      action = "happy";
    } else if (event == "angry") {
      action = "angry";
    } else if (event == "like") {
      action = "like";
    } else if (event == "dislike") {
      action = "dislike";
    }

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
        tituloNota: "",
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
      if (!registro) {
        await crearNota(emocion);
      } else {
        await actualizarNota(emocion);
      }

      trackGA(emocion);

      // Refrescamos el registro desde Strapi para tener los valores reales
      registro = await fetchNota(idNota);

      localStorage.setItem(`eo-emotions-${idNota}`, emocion);
      votoActual = emocion;
      setResult(emocion);
    } catch (error) {
      console.error("Error al votar:", error);
    }
  }
</script>

<div class="EO-emotions-container" bind:this={containerEl} on:click|stopPropagation>
  {#if votoActual}
    <div class="result">
      ¡<b>{userPercentResult}%</b> de las personas reaccionaron cómo vos!
    </div>
  {/if}
  <div class="icons" class:voted={votoActual !== null}>
    <button class="emoji" class:selected={votoActual === "happy"} class:inactive={votoActual !== null && votoActual !== "happy"} on:click|stopPropagation={() => handleClick("happy")}>😍</button>

    <button class="emoji" class:selected={votoActual === "like"} class:inactive={votoActual !== null && votoActual !== "like"} on:click|stopPropagation={() => handleClick("like")}>👍</button>

    <button class="emoji" class:selected={votoActual === "dislike"} class:inactive={votoActual !== null && votoActual !== "dislike"} on:click|stopPropagation={() => handleClick("dislike")}>👎</button>

    <button class="emoji" class:selected={votoActual === "angry"} class:inactive={votoActual !== null && votoActual !== "angry"} on:click|stopPropagation={() => handleClick("angry")}>😡</button>
  </div>
</div>

<style lang="scss">
  @import url("https://fonts.googleapis.com/css2?family=Anek+Latin:wght@100..800&display=swap");

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
