/* APA La Plata — comportamiento del sitio */

const CLAVE_FAVORITOS = "apa_favoritos";

function obtenerFavoritos() {
  try {
    const guardado = JSON.parse(localStorage.getItem(CLAVE_FAVORITOS));
    return Array.isArray(guardado) ? guardado : [];
  } catch {
    return [];
  }
}

function esFavorito(id) {
  return obtenerFavoritos().includes(id);
}

function alternarFavorito(id) {
  const favoritos = obtenerFavoritos();
  const indice = favoritos.indexOf(id);
  if (indice === -1) favoritos.push(id);
  else favoritos.splice(indice, 1);
  localStorage.setItem(CLAVE_FAVORITOS, JSON.stringify(favoritos));
  actualizarContadorFavoritos();
  return indice === -1;
}

function actualizarContadorFavoritos() {
  const cantidad = obtenerFavoritos().length;
  document.querySelectorAll("[data-favoritos-contador]").forEach((el) => {
    el.textContent = String(cantidad);
    el.classList.toggle("visible", cantidad > 0);
  });
}

function iniciarFavoritos() {
  actualizarContadorFavoritos();
  document.addEventListener("click", (evento) => {
    const boton = evento.target.closest("[data-favorito]");
    if (!boton) return;
    const id = boton.dataset.favorito;
    const activo = alternarFavorito(id);
    document.querySelectorAll(`[data-favorito="${id}"]`).forEach((b) => {
      b.classList.toggle("activo", activo);
      b.setAttribute("aria-pressed", String(activo));
    });
  });
}

const observadorRevelado = new IntersectionObserver(
  (entradas) => {
    entradas.forEach((entrada) => {
      if (entrada.isIntersecting) {
        entrada.target.classList.add("visible");
        observadorRevelado.unobserve(entrada.target);
      }
    });
  },
  { threshold: 0.15 }
);

function observarRevelados(raiz) {
  (raiz || document).querySelectorAll("[data-revelar]:not([data-observado])").forEach((el) => {
    el.dataset.observado = "1";
    observadorRevelado.observe(el);
  });
}

function animarContador(el) {
  const final = parseFloat(el.dataset.contador);
  const desde = parseFloat(el.dataset.desde || "0");
  const sufijo = el.dataset.sufijo || "";
  const duracion = 1200;
  const inicio = performance.now();
  function paso(ahora) {
    const progreso = Math.min((ahora - inicio) / duracion, 1);
    const facilitado = 1 - Math.pow(1 - progreso, 3);
    const valor = Math.round(desde + (final - desde) * facilitado);
    el.textContent = `${valor}${sufijo}`;
    if (progreso < 1) requestAnimationFrame(paso);
  }
  requestAnimationFrame(paso);
}

function iniciarContadores() {
  const elementos = document.querySelectorAll("[data-contador]");
  if (!elementos.length) return;
  const observador = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((entrada) => {
        if (entrada.isIntersecting) {
          animarContador(entrada.target);
          observador.unobserve(entrada.target);
        }
      });
    },
    { threshold: 0.5 }
  );
  elementos.forEach((el) => observador.observe(el));
}

function iniciarHeaderFlotante() {
  const header = document.querySelector(".EncabezadoPrincipal");
  if (!header) return;
  const actualizar = () => {
    header.classList.toggle("EncabezadoPrincipal--flotante", window.scrollY > 8);
  };
  actualizar();
  window.addEventListener("scroll", actualizar, { passive: true });
}

function iniciarVolverArriba() {
  const boton = document.createElement("button");
  boton.className = "BtnVolverArriba";
  boton.type = "button";
  boton.setAttribute("aria-label", "Volver arriba");
  boton.innerHTML =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>';
  document.body.appendChild(boton);

  const actualizar = () => {
    boton.classList.toggle("visible", window.scrollY > 600);
  };
  actualizar();
  window.addEventListener("scroll", actualizar, { passive: true });
  boton.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

function iniciarMenu() {
  const boton = document.querySelector(".EncabezadoPrincipal-toggle");
  const menu = document.querySelector(".EncabezadoPrincipal-menu");
  if (!boton || !menu) return;
  boton.addEventListener("click", () => {
    const abierto = menu.classList.toggle("abierto");
    boton.setAttribute("aria-expanded", String(abierto));
  });
}

function tarjetaAnimalHTML(animal) {
  const etiquetaClase =
    animal.estado === "disponible" ? "EtiquetaEstado_Disponible" : "EtiquetaEstado_EnProceso";
  const etiquetaTexto = animal.estado === "disponible" ? "Disponible" : "En proceso";
  const favorito = esFavorito(animal.id);
  return `
    <article class="TarjetaAnimal" data-id="${animal.id}" data-revelar>
      <div class="TarjetaAnimal-fila">
        <div class="TarjetaAnimal-imagenWrap">
          <img class="ImagenAnimal" src="${animal.imagen}" alt="Foto de ${animal.nombre}">
          <button class="BtnFavorito${favorito ? " activo" : ""}" data-favorito="${animal.id}" aria-pressed="${favorito}" aria-label="Marcar a ${animal.nombre} como favorito">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20s-7-4.3-9.3-8.6C1.2 8.6 2.7 5 6 5c2 0 3.4 1.1 4 2.2.6-1.1 2-2.2 4-2.2 3.3 0 4.8 3.6 3.3 6.4C19 15.7 12 20 12 20z"/></svg>
          </button>
        </div>
        <div class="TarjetaAnimal-cuerpo">
          <div class="TarjetaAnimal-encabezado">
            <span class="TarjetaAnimal-nombre">${animal.nombre}</span>
            <span class="${etiquetaClase}">${etiquetaTexto}</span>
          </div>
          <span class="TextoPequeno">${animal.edadTexto}</span>
          <p class="TarjetaAnimal-temperamento">${animal.temperamento}</p>
          <a class="BtnPrimario" href="animal.html?id=${animal.id}">
            <img class="IconoPata" src="assets/img/pata.svg" alt="" aria-hidden="true"> Quiero adoptar
          </a>
        </div>
      </div>
    </article>
  `;
}

function renderGrilla(contenedor, animales) {
  contenedor.innerHTML = animales.map(tarjetaAnimalHTML).join("");
  observarRevelados(contenedor);
}

function iniciarGrillaInicio() {
  const contenedor = document.querySelector("[data-grilla-inicio]");
  if (!contenedor) return;
  renderGrilla(contenedor, ANIMALES.slice(0, 3));
}

function iniciarCatalogo() {
  const contenedor = document.querySelector("[data-grilla-catalogo]");
  const barraFiltros = document.querySelector(".BarraFiltros");
  const resultado = document.querySelector("[data-resultado-conteo]");
  const vacio = document.querySelector("[data-grilla-vacio]");
  if (!contenedor || !barraFiltros) return;

  const tituloFiltros = barraFiltros.querySelector(".BarraFiltros-titulo");
  if (tituloFiltros) {
    tituloFiltros.addEventListener("click", () => {
      if (window.innerWidth >= 1024) return;
      barraFiltros.classList.toggle("abierto");
    });
  }

  const checks = barraFiltros.querySelectorAll("input[type=checkbox]");
  const favoritosFiltro = barraFiltros.querySelector("[data-favoritos-filtro]");
  const limpiarBtn = barraFiltros.querySelector("[data-limpiar-filtros]");

  if (favoritosFiltro && new URLSearchParams(window.location.search).get("favoritos") === "1") {
    favoritosFiltro.checked = true;
  }

  function filtrar() {
    const tamanos = Array.from(checks)
      .filter((c) => c.dataset.grupo === "tamano" && c.checked)
      .map((c) => c.value);
    const edades = Array.from(checks)
      .filter((c) => c.dataset.grupo === "edad" && c.checked)
      .map((c) => c.value);
    const soloFavoritos = favoritosFiltro ? favoritosFiltro.checked : false;

    const filtrados = ANIMALES.filter((a) => {
      const pasaTamano = tamanos.length === 0 || tamanos.includes(a.tamano);
      const pasaEdad = edades.length === 0 || edades.includes(a.edadCategoria);
      const pasaFavorito = !soloFavoritos || esFavorito(a.id);
      return pasaTamano && pasaEdad && pasaFavorito;
    });

    renderGrilla(contenedor, filtrados);
    if (resultado) {
      resultado.textContent = `${filtrados.length} de ${ANIMALES.length} perros en adopción`;
    }
    if (vacio) {
      vacio.classList.toggle("activo", filtrados.length === 0);
      vacio.textContent = soloFavoritos && filtrados.length === 0
        ? "Todavía no marcaste ningún perro como favorito. Tocá el corazón de una tarjeta para guardarlo acá."
        : "No hay perros que coincidan con esos filtros por ahora. Probá quitar alguno o escribinos por Instagram, sumamos perros todo el tiempo.";
    }
  }

  checks.forEach((c) => c.addEventListener("change", filtrar));
  if (limpiarBtn) {
    limpiarBtn.addEventListener("click", () => {
      checks.forEach((c) => (c.checked = false));
      filtrar();
    });
  }
  document.addEventListener("click", (evento) => {
    if (evento.target.closest("[data-favorito]")) filtrar();
  });

  filtrar();
}

function iniciarDetalleAnimal() {
  const contenedor = document.querySelector("[data-detalle-animal]");
  if (!contenedor) return;
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const animal = ANIMALES.find((a) => a.id === id) || ANIMALES[0];

  const etiquetaClase =
    animal.estado === "disponible" ? "EtiquetaEstado_Disponible" : "EtiquetaEstado_EnProceso";
  const etiquetaTexto = animal.estado === "disponible" ? "Disponible" : "En proceso";
  const favorito = esFavorito(animal.id);

  document.title = `${animal.nombre} — APA La Plata`;

  const imagen = contenedor.querySelector("#detalle-imagen");
  imagen.src = animal.imagen;
  imagen.alt = `Foto de ${animal.nombre}`;

  const estado = contenedor.querySelector("#detalle-estado");
  estado.className = etiquetaClase;
  estado.textContent = etiquetaTexto;

  contenedor.querySelector("#detalle-nombre").textContent = animal.nombre;
  contenedor.querySelector("#detalle-descripcion").textContent = animal.descripcion;
  contenedor.querySelector("#detalle-edad").textContent = animal.edadTexto;
  contenedor.querySelector("#detalle-tamano").textContent = capitalizar(animal.tamano);
  contenedor.querySelector("#detalle-sexo").textContent = capitalizar(animal.sexo);
  contenedor.querySelector("#detalle-temperamento").textContent = animal.temperamento;

  const favBoton = contenedor.querySelector("#detalle-favorito");
  favBoton.dataset.favorito = animal.id;
  favBoton.setAttribute("aria-pressed", String(favorito));
  favBoton.setAttribute("aria-label", `Marcar a ${animal.nombre} como favorito`);
  favBoton.classList.toggle("activo", favorito);

  const btnAdoptar = contenedor.querySelector("#detalle-btn-adoptar");
  btnAdoptar.href = `contacto.html?animal=${animal.id}`;
  btnAdoptar.innerHTML = `<img class="IconoPata" src="assets/img/pata.svg" alt="" aria-hidden="true"> Quiero adoptar a ${animal.nombre}`;

  const mensajeWhatsapp = encodeURIComponent(
    `Mirá a ${animal.nombre} en APA La Plata, está esperando una familia: ${window.location.href}`
  );
  contenedor.querySelector("#detalle-whatsapp").href = `https://wa.me/?text=${mensajeWhatsapp}`;

  const contenedorRelacionados = document.querySelector("[data-relacionados]");
  if (contenedorRelacionados) {
    renderGrilla(contenedorRelacionados, ANIMALES.filter((a) => a.id !== animal.id).slice(0, 3));
  }
}

function capitalizar(texto) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function iniciarFormularioContacto() {
  const form = document.querySelector("[data-form-contacto]");
  if (!form) return;

  const params = new URLSearchParams(window.location.search);
  const animalId = params.get("animal");
  if (animalId) {
    const animal = ANIMALES.find((a) => a.id === animalId);
    const mensaje = form.querySelector("#mensaje");
    if (animal && mensaje) {
      mensaje.value = `Hola, quiero consultar por la adopción de ${animal.nombre}.`;
    }
  }

  form.addEventListener("submit", (evento) => {
    evento.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    const confirmacion = form.querySelector("[data-form-confirmacion]");
    if (confirmacion) confirmacion.classList.add("activo");
    form.reset();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  iniciarFavoritos();
  iniciarMenu();
  iniciarHeaderFlotante();
  iniciarGrillaInicio();
  iniciarCatalogo();
  iniciarDetalleAnimal();
  iniciarFormularioContacto();
  iniciarVolverArriba();
  observarRevelados();
  iniciarContadores();
});
