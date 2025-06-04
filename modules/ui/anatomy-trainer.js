// anatomy-trainer.js
// Componente de entrenador interactivo de anatomía neurológica

import { preguntas } from '../../modules/business/anatomy-trainer-data.js';

let preguntaActual = 0;
let seleccion = null;
let feedback = '';

function mostrarFeedback(respuestaCorrecta, seleccion) {
  if (seleccion === respuestaCorrecta) {
    return '¡Correcto!';
  } else {
    return 'Incorrecto. Revisa la localización de los núcleos y los síntomas clínicos.';
  }
}

function renderPregunta() {
  const p = preguntas[preguntaActual];
  const pregunta = p.pregunta;
  const opciones = p.opciones;
  const respuestaCorrecta = p.respuesta_correcta;
  const explicacion = p.feedback;
  const regla = p.regla_mnemonica;

  function seleccionarOpcion(idx) {
    seleccion = idx;
    feedback = mostrarFeedback(respuestaCorrecta, seleccion);
    render();
  }

  function siguientePregunta() {
    if (preguntaActual < preguntas.length - 1) {
      preguntaActual++;
      seleccion = null;
      feedback = '';
      render();
    }
  }

  function anteriorPregunta() {
    if (preguntaActual > 0) {
      preguntaActual--;
      seleccion = null;
      feedback = '';
      render();
    }
  }

  function render() {
    let html = `<h2>Ejercicio de Autoevaluación</h2>`;
    html += `<p><strong>Pregunta ${preguntaActual + 1} de ${preguntas.length}:</strong> ${pregunta}</p>`;
    opciones.forEach((op, idx) => {
      html += `<button onclick='seleccionarOpcion(${idx})' ${seleccion !== null ? 'disabled' : ''}>${op}</button><br/>`;
    });
    html += `<p><strong>Regla mnemotécnica:</strong> <span class='regla-mnemonica'>${regla}</span></p>`;
    if (seleccion !== null) {
      html += `<p><strong>Feedback:</strong> ${feedback}</p>`;
      html += `<p><em>${explicacion}</em></p>`;
      html += `<button onclick='siguientePregunta()'>Siguiente</button>`;
      html += `<button onclick='anteriorPregunta()'>Anterior</button>`;
    }
    document.getElementById('anatomy-trainer').innerHTML = html;
  }

  // Exponer funciones para el onclick
  window.seleccionarOpcion = seleccionarOpcion;
  window.siguientePregunta = siguientePregunta;
  window.anteriorPregunta = anteriorPregunta;
  render();
}

// Inicializar el componente al cargar
window.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('anatomy-trainer')) {
    renderPregunta();
  }
}); 