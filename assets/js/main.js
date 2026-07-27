/* APA La Plata — comportamiento del sitio */

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
  return `
    <article class="TarjetaAnimal" data-id="${animal.id}" data-revelar>
      <img class="ImagenAnimal" src="${animal.imagen}" alt="Foto de ${animal.nombre}">
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
  const limpiarBtn = barraFiltros.querySelector("[data-limpiar-filtros]");

  function filtrar() {
    const tamanos = Array.from(checks)
      .filter((c) => c.dataset.grupo === "tamano" && c.checked)
      .map((c) => c.value);
    const edades = Array.from(checks)
      .filter((c) => c.dataset.grupo === "edad" && c.checked)
      .map((c) => c.value);

    const filtrados = ANIMALES.filter((a) => {
      const pasaTamano = tamanos.length === 0 || tamanos.includes(a.tamano);
      const pasaEdad = edades.length === 0 || edades.includes(a.edadCategoria);
      return pasaTamano && pasaEdad;
    });

    renderGrilla(contenedor, filtrados);
    if (resultado) {
      resultado.textContent = `${filtrados.length} de ${ANIMALES.length} perros en adopción`;
    }
    if (vacio) vacio.classList.toggle("activo", filtrados.length === 0);
  }

  checks.forEach((c) => c.addEventListener("change", filtrar));
  if (limpiarBtn) {
    limpiarBtn.addEventListener("click", () => {
      checks.forEach((c) => (c.checked = false));
      filtrar();
    });
  }

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

  document.title = `${animal.nombre} — APA La Plata`;

  contenedor.innerHTML = `
    <img class="DetalleAnimal-imagen" src="${animal.imagen}" alt="Foto de ${animal.nombre}">
    <div>
      <span class="${etiquetaClase}">${etiquetaTexto}</span>
      <h1 class="TextoDisplay" style="margin-top: var(--espacio-xs);">${animal.nombre}</h1>
      <p class="TextoSuave" style="margin-top: var(--espacio-xs);">${animal.descripcion}</p>
      <dl class="DetalleAnimal-ficha">
        <div><dt>Edad aproximada</dt><dd>${animal.edadTexto}</dd></div>
        <div><dt>Tamaño</dt><dd>${capitalizar(animal.tamano)}</dd></div>
        <div><dt>Sexo</dt><dd>${capitalizar(animal.sexo)}</dd></div>
        <div><dt>Temperamento</dt><dd>${animal.temperamento}</dd></div>
      </dl>
      <div class="HeroInicio-acciones">
        <a class="BtnPrimario" href="contacto.html?animal=${animal.id}">
          <img class="IconoPata" src="assets/img/pata.svg" alt="" aria-hidden="true"> Quiero adoptar a ${animal.nombre}
        </a>
        <a class="BtnSecundario" href="adopcion.html" style="border-color: var(--color-primario); color: var(--texto-base);">Volver al listado</a>
      </div>
    </div>
  `;
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
  iniciarMenu();
  iniciarHeaderFlotante();
  iniciarGrillaInicio();
  iniciarCatalogo();
  iniciarDetalleAnimal();
  iniciarFormularioContacto();
  observarRevelados();
  iniciarContadores();
});
