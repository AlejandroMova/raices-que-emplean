// Datos editables del prototipo. Todo lo que ves en pantalla sale de aquí.
// Afinidad = suma de pesos de las fortalezas elegidas + peso de la tarea × carita (😟 -1, 😐 0, 😊 +1).

const FORTALEZAS = [
  { id: 'manos',   emoji: '🤲', texto: 'Me gusta trabajar con las manos en cosas pequeñas', razon: 'te gusta trabajar con las manos' },
  { id: 'numeros', emoji: '🔢', texto: 'Me gustan los números y medir',                     razon: 'te gustan los números y medir' },
  { id: 'pasos',   emoji: '📋', texto: 'Sigo pasos en orden',                               razon: 'sigues pasos en orden' },
  { id: 'pie',     emoji: '🚶', texto: 'Me gusta estar de pie y moverme',                   razon: 'te gusta estar de pie y moverte' },
  { id: 'cuidado', emoji: '✨', texto: 'Soy cuidadoso y ordenado',                          razon: 'eres cuidadoso y ordenado' },
  { id: 'equipo',  emoji: '🤝', texto: 'Me gusta trabajar en equipo',                       razon: 'te gusta trabajar en equipo' },
  { id: 'foco',    emoji: '🎯', texto: 'Me concentro por mucho tiempo',                     razon: 'te concentras por mucho tiempo' },
  { id: 'plantas', emoji: '🌱', texto: 'Me gustan las plantas',                             razon: 'te gustan las plantas' },
];

const TAREAS = [
  { id: 'sembrar',  emoji: '🌱', texto: 'Sembrar',               razon: 'quieres probar sembrar' },
  { id: 'medir',    emoji: '📏', texto: 'Medir y registrar',     razon: 'quieres probar medir y registrar' },
  { id: 'cosechar', emoji: '✂️', texto: 'Cosechar',              razon: 'quieres probar cosechar' },
  { id: 'empacar',  emoji: '📦', texto: 'Empacar y etiquetar',   razon: 'quieres probar empacar y etiquetar' },
];

const CARITAS = [
  { v: -1, emoji: '😟', texto: 'No me gusta' },
  { v: 0,  emoji: '😐', texto: 'Tal vez' },
  { v: 1,  emoji: '😊', texto: 'Me gusta' },
];

const APOYOS = [
  { id: 'picto',    emoji: '🖼️', texto: 'Dibujos y pictogramas' },
  { id: 'cortas',   emoji: '📝', texto: 'Instrucciones cortas' },
  { id: 'despacio', emoji: '🐢', texto: 'Ir despacio' },
  { id: 'cerca',    emoji: '🤝', texto: 'Un acompañante cerca' },
];

const DIAS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const HORARIOS = ['Mañana', 'Tarde', 'Cualquier horario'];
const PARENTESCOS = ['Mamá', 'Papá', 'Hermano o hermana', 'Abuelo o abuela', 'Tutor o tutora', 'Otro'];

// Fechas ficticias (cada bootcamp dura 2 días seguidos).
const FECHAS = ['Sáb 14 y dom 15 de noviembre', 'Sáb 21 y dom 22 de noviembre', 'Sáb 28 y dom 29 de noviembre'];

const BOOTCAMPS = [
  {
    id: 'sembrar', emoji: '🌱', nombre: 'Sembrar', duracion: '2 días',
    descripcion: 'Pones semillas en el sustrato y cuidas las plantitas cuando son pequeñas.',
    practica: ['Poner semillas en lana de roca o esponja', 'Pasar plántulas a su lugar', 'Regar con cuidado'],
    aprende: ['Cómo se ve una semilla lista', 'Cuántas semillas va en cada lugar', 'Trabajar despacio y con cuidado'],
    lleva: ['Ropa cómoda', 'Zapato cerrado', 'Botella de agua'],
    acompana: 'Una persona de Casa CAI contigo todo el tiempo',
    fortalezas: { manos: 3, plantas: 3, cuidado: 2, foco: 1, pasos: 1 },
    tareas: { sembrar: 3 },
  },
  {
    id: 'medir', emoji: '📏', nombre: 'Medir y registrar', duracion: '2 días',
    descripcion: 'Mides el agua de las plantas y anotas lo que ves en hojas con dibujos.',
    practica: ['Medir pH y EC/TDS del agua', 'Llenar hojas de registro con pictogramas', 'Avisar cuando un número cambia'],
    aprende: ['Leer un medidor paso a paso', 'Anotar sin prisa', 'Pedir ayuda cuando algo no se entiende'],
    lleva: ['Ropa cómoda', 'Lápiz favorito', 'Botella de agua'],
    acompana: 'Una persona de Casa CAI revisa tus hojas contigo',
    fortalezas: { numeros: 3, pasos: 2, foco: 2, cuidado: 1 },
    tareas: { medir: 3 },
  },
  {
    id: 'cosechar', emoji: '✂️', nombre: 'Cosechar', duracion: '2 días',
    descripcion: 'Cortas las hojas listas con cuidado, las pones en charolas y las pesas.',
    practica: ['Cortar hojas sin dañar la planta', 'Acomodar en charolas', 'Pesar en la báscula'],
    aprende: ['Saber cuándo está lista una planta', 'Usar las tijeras con seguridad', 'Mantener limpia tu mesa'],
    lleva: ['Ropa cómoda', 'Zapato cerrado', 'Cabello recogido'],
    acompana: 'Una persona de Casa CAI te enseña el primer corte',
    fortalezas: { cuidado: 3, manos: 2, plantas: 2, pie: 1, pasos: 1 },
    tareas: { cosechar: 3 },
  },
  {
    id: 'empacar', emoji: '📦', nombre: 'Empacar y etiquetar', duracion: '2 días',
    descripcion: 'Pones la cosecha en bolsas, pegas etiquetas y cuentas cuántas hay.',
    practica: ['Llenar bolsas', 'Pegar etiquetas en orden', 'Contar y anotar cuántas bolsas hay'],
    aprende: ['Seguir una lista de pasos', 'Contar sin perderte', 'Dejar todo ordenado'],
    lleva: ['Ropa cómoda', 'Zapato cerrado', 'Botella de agua'],
    acompana: 'Una persona de Casa CAI cuenta contigo la primera caja',
    fortalezas: { pasos: 2, cuidado: 2, pie: 2, numeros: 1, manos: 1 },
    tareas: { empacar: 3 },
  },
  {
    id: 'sistema', emoji: '💧', nombre: 'Cuidado del sistema y equipo', duracion: '2 días',
    descripcion: 'Limpias, revisas el agua y cuidas el sistema junto con tu equipo.',
    practica: ['Limpiar charolas y tubos', 'Revisar que el agua esté bien', 'Trabajar en equipo con un acompañante'],
    aprende: ['Qué se limpia y cuándo', 'Avisar si algo se ve raro', 'Repartir tareas con tu equipo'],
    lleva: ['Ropa que se pueda mojar', 'Zapato cerrado', 'Botella de agua'],
    acompana: 'Una persona de Casa CAI trabaja a tu lado',
    fortalezas: { equipo: 3, pie: 2, pasos: 2, cuidado: 1, plantas: 1 },
    tareas: { sembrar: 1, medir: 1, cosechar: 1, empacar: 1 },
  },
];
