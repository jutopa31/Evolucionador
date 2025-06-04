// post-acv-form.js
// Componente de formulario para evolución médica post-ACV

export function renderPostACVForm(containerId = 'post-acv-form') {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <div class="form-container">
      <h2>Evolución Médica Post-ACV</h2>
      <label for="fecha_evento">Fecha del evento:</label>
      <input type="date" id="fecha_evento">

      <label for="toast">Clasificación TOAST:</label>
      <select id="toast">
        <option value="">Seleccione una clasificación</option>
        <option value="Aterotrombótico">Aterotrombótico</option>
        <option value="Cardioembólico">Cardioembólico</option>
        <option value="Lacunar">Lacunar</option>
        <option value="Otra causa determinada">Otra causa determinada</option>
        <option value="Causa indeterminada">Causa indeterminada</option>
      </select>

      <label for="presion">Control de presión arterial:</label>
      <textarea id="presion" placeholder="Ej: 130/80 mmHg, estable"></textarea>

      <label for="medicacion">Antiagregación o anticoagulación actual:</label>
      <textarea id="medicacion" placeholder="Ej: AAS 100mg/día"></textarea>

      <label for="ldl">Niveles y objetivos de LDL:</label>
      <textarea id="ldl" placeholder="Ej: LDL 70 mg/dl, objetivo < 70"></textarea>

      <label for="sintomas">Síntomas neurológicos residuales:</label>
      <textarea id="sintomas" placeholder="Ej: Hemiparesia leve, disartria"></textarea>

      <label for="emocional">Estado emocional y cognitivo:</label>
      <textarea id="emocional" placeholder="Ej: Sin alteraciones, leve ansiedad"></textarea>

      <label>Estudios complementarios de screening:</label>
      <label><input type="checkbox" id="ecg"> ECG</label>
      <label><input type="checkbox" id="ecocardio"> Ecocardiograma</label>
      <label><input type="checkbox" id="carotidas"> Doppler carotídeo</label>
      <label><input type="checkbox" id="lab"> Análisis de laboratorio (glucemia, perfil lipídico, función renal)</label>
      <label><input type="checkbox" id="holter"> Holter cardíaco</label>

      <button id="generarResumen">Generar Resumen Médico</button>
      <div id="resultado" style="margin-top:20px;"></div>
    </div>
  `;

  container.querySelector('#generarResumen').onclick = function() {
    let resumen = '<strong>Evolución Médica Post-ACV:</strong><br>';
    resumen += '<strong>Fecha del evento:</strong> ' + container.querySelector('#fecha_evento').value + '<br>';
    resumen += '<strong>Clasificación TOAST:</strong> ' + container.querySelector('#toast').value + '<br>';
    resumen += '<strong>Presión arterial:</strong> ' + container.querySelector('#presion').value + '<br>';
    resumen += '<strong>Medicación:</strong> ' + container.querySelector('#medicacion').value + '<br>';
    resumen += '<strong>LDL:</strong> ' + container.querySelector('#ldl').value + '<br>';
    resumen += '<strong>Síntomas residuales:</strong> ' + container.querySelector('#sintomas').value + '<br>';
    resumen += '<strong>Estado emocional/cognitivo:</strong> ' + container.querySelector('#emocional').value + '<br>';

    resumen += '<strong>Estudios complementarios:</strong><br>';
    resumen += container.querySelector('#ecg').checked ? '✔️ ECG<br>' : '';
    resumen += container.querySelector('#ecocardio').checked ? '✔️ Ecocardiograma<br>' : '';
    resumen += container.querySelector('#carotidas').checked ? '✔️ Doppler carotídeo<br>' : '';
    resumen += container.querySelector('#lab').checked ? '✔️ Análisis laboratorio<br>' : '';
    resumen += container.querySelector('#holter').checked ? '✔️ Holter cardíaco<br>' : '';

    container.querySelector('#resultado').innerHTML = resumen;
  };
} 