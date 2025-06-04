// anatomy-trainer-data.js
// Preguntas y respuestas para el entrenador interactivo de anatomía neurológica

export const preguntas = [
  {
    id: 'weber-1',
    modulo: 'tronco-encefalico',
    pregunta: 'Un paciente presenta parálisis del III par craneal derecho y hemiplejia izquierda. ¿Qué estructura anatómica está dañada?',
    opciones: [
      'Núcleo del VI par craneal',
      'Núcleo rojo',
      'Pedúnculo cerebral derecho',
      'Núcleo del XII par craneal'
    ],
    respuesta_correcta: 2,
    feedback: '¡Correcto! El síndrome de Weber se produce por una lesión ventral en el mesencéfalo, afectando el III par ipsilateral y las fibras motoras contralaterales.',
    regla_mnemonica: 'MESE ROJO Y NEGRO'
  },
  {
    id: 'millard-gubler-1',
    modulo: 'tronco-encefalico',
    pregunta: 'Paciente con parálisis facial derecha y hemiplejia izquierda. ¿Qué síndrome presenta?',
    opciones: [
      'Síndrome de Wallenberg',
      'Síndrome de Millard-Gubler',
      'Síndrome de Weber',
      'Síndrome de Claude'
    ],
    respuesta_correcta: 1,
    feedback: '¡Correcto! El síndrome de Millard-Gubler se produce por una lesión pontina inferior, afectando el VII par ipsilateral y las fibras motoras contralaterales.',
    regla_mnemonica: 'MILLARD: MIL (mil) = PONS (puente)'
  },
  {
    id: 'wallenberg-1',
    modulo: 'tronco-encefalico',
    pregunta: 'Paciente con disfagia, vértigo, pérdida sensitiva facial derecha y pérdida sensitiva corporal izquierda. ¿Qué síndrome presenta?',
    opciones: [
      'Síndrome de Wallenberg',
      'Síndrome de Weber',
      'Síndrome de Millard-Gubler',
      'Síndrome de Parinaud'
    ],
    respuesta_correcta: 0,
    feedback: '¡Correcto! El síndrome de Wallenberg se produce por una lesión bulbar lateral, afectando núcleos sensoriales y vías espinotalámicas.',
    regla_mnemonica: 'WALLENBERG: "WALL" (pared) lateral del bulbo'
  },
  {
    id: 'acm-1',
    modulo: 'vascular',
    pregunta: 'Un paciente presenta afasia y hemiparesia derecha. ¿Qué arteria cerebral está afectada?',
    opciones: [
      'Arteria cerebral anterior',
      'Arteria cerebral media',
      'Arteria cerebral posterior',
      'Arteria basilar'
    ],
    respuesta_correcta: 1,
    feedback: '¡Correcto! La arteria cerebral media irriga áreas del lenguaje y la motricidad de la cara y brazo.',
    regla_mnemonica: 'ACM: "A C M" = Afasia, Cara, Mano'
  },
  {
    id: 'aca-1',
    modulo: 'vascular',
    pregunta: 'Paciente con debilidad predominante en miembro inferior izquierdo tras un infarto. ¿Qué arteria cerebral está afectada?',
    opciones: [
      'Arteria cerebral anterior',
      'Arteria cerebral media',
      'Arteria cerebral posterior',
      'Arteria comunicante anterior'
    ],
    respuesta_correcta: 0,
    feedback: '¡Correcto! La arteria cerebral anterior irriga la corteza motora de los miembros inferiores.',
    regla_mnemonica: 'ACA: "A C A" = Afecta la Cadera y la piernA'
  },
  {
    id: 'acp-1',
    modulo: 'vascular',
    pregunta: 'Paciente con alteraciones visuales contralaterales tras un infarto. ¿Qué arteria cerebral está afectada?',
    opciones: [
      'Arteria cerebral anterior',
      'Arteria cerebral media',
      'Arteria cerebral posterior',
      'Arteria basilar'
    ],
    respuesta_correcta: 2,
    feedback: '¡Correcto! La arteria cerebral posterior irriga la corteza visual occipital.',
    regla_mnemonica: 'ACP: "A C P" = Alteración Contralateral de la Percepción visual'
  }
]; 