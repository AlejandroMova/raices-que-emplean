// Raíces que emplean: prototipo navegable. SPA con hash routing, sin dependencias.
// Cada pantalla es una "diapositiva" (tema oscuro, menta o lima) que se pinta con innerHTML.

const KEY = 'rqe-estado';
const KEY_PERFILES = 'rqe-perfiles';
const PASOS = 5;

// ---------- Estado + localStorage (solo para no perder lo llenado al recargar) ----------
const leer = (k, def) => { try { return JSON.parse(localStorage.getItem(k)) ?? def; } catch { return def; } };
const escribir = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* sin almacenamiento: el estado vive en memoria */ } };

const vacio = () => ({
  id: Date.now().toString(36), quien: 'joven', nombre: '', edad: '', famNombre: '', parentesco: '',
  fort: [], tareas: {}, apoyos: [], dias: [], horario: '', notas: '', consent: false, insc: [],
});
let S = { ...vacio(), ...leer(KEY, {}) };

function guardar() {
  escribir(KEY, S);
  if (S.consent && S.nombre) { // el perfil completo queda disponible para la vista "Acompañantes"
    const otros = leer(KEY_PERFILES, []).filter(p => p.id !== S.id);
    escribir(KEY_PERFILES, [...otros, S]);
  }
}

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const porId = (lista, id) => lista.find(x => x.id === id);

// ---------- Scoring (sin IA): suma de pesos de fortalezas + peso de la tarea × carita ----------
function puntuar() {
  return BOOTCAMPS.map(b => {
    const aportes = [];
    S.fort.forEach(id => { const p = b.fortalezas[id]; if (p) aportes.push({ p, razon: porId(FORTALEZAS, id).razon }); });
    TAREAS.forEach(t => {
      const cara = S.tareas[t.id] || 0, peso = b.tareas[t.id] || 0;
      if (peso && cara) aportes.push({ p: peso * cara, razon: t.razon });
    });
    const total = aportes.reduce((s, a) => s + a.p, 0);
    const razones = aportes.filter(a => a.p > 0).sort((x, y) => y.p - x.p).slice(0, 2).map(a => a.razon);
    return { b, total, razones };
  }).sort((x, y) => y.total - x.total);
}

// ---------- Mascota (SVG propio): cápsula con cara mínima, brazos y piernas de línea gruesa ----------
const tubo = (d, w = 7) => `<path d="${d}" class="tb" stroke-width="${w + 10}"/><path d="${d}" class="tf" stroke-width="${w}"/>`;
const mano = (x, y) => `<circle cx="${x}" cy="${y}" r="9" class="mano"/>`;

function mascota(pose = 'saluda', tono = 'dark', lentes = false) {
  const sentado = pose === 'laptop';
  const piernas = sentado
    ? tubo('M90 182 Q92 206 140 208 L150 244') + tubo('M116 186 Q122 214 164 214 L170 246')
    : tubo('M92 182 V244 H76') + tubo('M128 182 V244 H144');
  const cara = lentes
    ? `<rect x="80" y="70" width="27" height="18" rx="6" class="gafas"/><rect x="113" y="70" width="27" height="18" rx="6" class="gafas"/><path d="M107 76 h6" class="ln"/><path d="M100 98 q10 8 20 0" class="ln"/>`
    : `<circle cx="96" cy="80" r="4" class="pt"/><circle cx="124" cy="80" r="4" class="pt"/><path d="M98 94 q12 12 24 0" class="ln"/>`;
  const poses = {
    saluda: tubo('M150 112 Q188 100 190 64') + mano(190, 58) + tubo('M70 114 Q42 140 50 172') + mano(50, 176)
      + '<path class="ln" d="M206 46 q9 9 0 20 M214 38 q14 14 0 32"/>',
    libro: '<path class="papel" d="M110 128 L74 120 V162 L110 170 L146 162 V120 Z M110 128 V170"/>'
      + tubo('M70 118 Q52 156 84 156') + tubo('M150 118 Q168 156 136 156'),
    laptop: '<g transform="rotate(-10 170 150)"><rect x="146" y="136" width="52" height="34" rx="4" class="papel"/><path class="ln" d="M166 156 q4 -8 8 0 q4 -8 8 0 q-8 12 -16 0"/></g>'
      + tubo('M150 114 Q176 132 166 160') + tubo('M70 114 Q40 112 40 86') + mano(40, 78) + '<path class="ln" d="M40 66 V50"/>',
    idea: '<g class="bombilla"><circle cx="172" cy="34" r="19"/><path d="M164 52 h16 v8 h-16 z"/></g><path class="ln" d="M172 4 v-4 M200 14 l6 -4 M144 14 l-6 -4 M206 34 h6 M132 34 h6"/>'
      + tubo('M150 108 Q186 100 174 62') + mano(174, 56) + tubo('M70 116 Q48 138 68 156') + mano(68, 158),
    pulgar: tubo('M150 112 Q194 112 188 78') + '<circle cx="188" cy="72" r="11" class="mano"/><path class="ln" d="M188 62 V52" style="stroke-width:9"/>'
      + tubo('M70 116 Q46 150 56 176') + mano(56, 180),
    celular: tubo('M150 110 Q184 100 176 64') + mano(176, 60) + '<rect x="160" y="16" width="26" height="44" rx="6" class="papel" transform="rotate(10 173 38)"/>'
      + tubo('M70 114 Q32 104 38 70') + mano(38, 64) + '<path class="ln" d="M14 52 q-6 8 0 16 M8 46 q-12 14 0 28"/>',
  };
  return `<svg class="mascota m-${tono}" viewBox="0 0 230 270" aria-hidden="true" focusable="false">${piernas}
    <path class="cuerpo" d="M68 72 a42 42 0 0 1 84 0 V150 a42 42 0 0 1 -84 0 Z"/>${cara}${poses[pose]}</svg>`;
}

// ---------- Fondos: hexágono/polígono irregular + flor de 5 pétalos que se salen del borde ----------
const HEX = s => `<svg class="forma hex" style="${s}" viewBox="0 0 200 200"><polygon points="22,58 118,6 186,66 170,178 60,190 6,122"/></svg>`;
const FLOR = s => `<svg class="forma flor" style="${s}" viewBox="0 0 200 200"><g transform="translate(100 100)"><circle r="40"/>${[0, 1, 2, 3, 4].map(i => `<ellipse cx="0" cy="-50" rx="33" ry="48" transform="rotate(${i * 72})"/>`).join('')}</g></svg>`;
const FONDOS = [
  ['left:-16vw;top:-14vh;width:min(62vw,860px);transform:rotate(-8deg)', 'right:-10vw;top:-12vh;width:min(46vw,640px);transform:rotate(12deg)'],
  ['right:-14vw;top:-8vh;width:min(54vw,760px);transform:rotate(14deg)', 'left:-14vw;bottom:-16vh;width:min(48vw,680px);transform:rotate(-10deg)'],
  ['left:-12vw;bottom:-22vh;width:min(58vw,820px);transform:rotate(20deg)', 'right:-8vw;bottom:-14vh;width:min(40vw,560px);transform:rotate(30deg)'],
  ['right:-16vw;bottom:-12vh;width:min(60vw,840px);transform:rotate(-4deg)', 'left:-10vw;top:-12vh;width:min(42vw,600px);transform:rotate(-20deg)'],
];
const fondo = n => `<div class="fondo" aria-hidden="true">${HEX(FONDOS[n % 4][0])}${FLOR(FONDOS[n % 4][1])}</div>`;

// ---------- Piezas reutilizables ----------
// Título ondulado: cada línea es un span para poder escalonar tamaños y giros.
const T = (lineas, cls = '') => `<h1 class="titulo ${cls}" tabindex="-1">${lineas.map((l, i) => `<span class="l l${i}">${esc(l)}</span>`).join(' ')}</h1>`;
const etq = t => `<p class="etq">${t}</p>`;
const atras = href => `<a class="btn btn-sec chico" href="${href}"><span aria-hidden="true">←</span> Atrás</a>`;
const slide = (tema, n, cls, inner) => `<section class="slide t-${tema} ${cls}">${fondo(n)}<div class="wrap">${inner}</div></section>`;

// Tarjeta hexagonal (borde grueso verde). `extra` = atributos del input; tipo radio o checkbox.
const hexIn = (contenido) => `<svg class="hexbg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><polygon points="26,3 74,3 98,50 74,97 26,97 2,50"/></svg><span class="hex-in">${contenido}</span>`;
const hexOpcion = (tipo, name, value, checked, emoji, texto, attrs) =>
  `<label class="hexw"><input class="vh" type="${tipo}" name="${name}" value="${esc(value)}" ${checked ? 'checked' : ''} ${attrs}>${hexIn(`<span class="hex-emoji" aria-hidden="true">${emoji}</span><span class="hex-txt">${esc(texto)}</span>`)}<span class="visto" aria-hidden="true">✓</span></label>`;
const chip = (name, value, checked, emoji, texto, attrs) =>
  `<label class="chip"><input class="vh" type="checkbox" name="${name}" value="${esc(value)}" ${checked ? 'checked' : ''} ${attrs}><span>${emoji ? `<span class="emo" aria-hidden="true">${emoji}</span>` : ''}${esc(texto)}</span></label>`;
const campo = (id, etiqueta, ctrl) => `<div class="campo"><label for="${id}">${etiqueta}</label>${ctrl}</div>`;

// Marco circular para foto. Reemplazar con foto real de Casa CAI, con consentimiento.
const marcoFoto = (emoji, mascotaHtml = '') => `<div class="foto-wrap">
  <!-- reemplazar con foto real de Casa CAI, con consentimiento -->
  <div class="foto" role="img" aria-label="Imagen de ejemplo"><svg viewBox="0 0 200 200" aria-hidden="true"><rect width="200" height="200" fill="#86CDAE"/>
    <rect x="30" y="120" width="140" height="60" rx="8" fill="#1B7A55"/>
    ${[55, 100, 145].map(x => `<rect x="${x - 16}" y="132" width="32" height="30" rx="5" fill="#0d5236"/><path d="M${x} 134 v-26 M${x} 120 q-14 -4 -14 -16 q14 0 14 16 M${x} 114 q14 -4 14 -16 q-14 0 -14 16" stroke="#C5F25A" stroke-width="5" fill="none" stroke-linecap="round"/>`).join('')}</svg>
    <span class="foto-emoji" aria-hidden="true">${emoji}</span></div>${mascotaHtml}</div>`;

// ---------- Pantallas ----------
function pInicio() {
  const hayDatos = S.nombre || S.fort.length;
  return slide('dark', 0, 'inicio', `
    <div class="inicio-top"><p class="etq">Casa CAI · Encuentro A.C.</p><p class="frase">Del participar al trabajar</p></div>
    <div class="inicio-main">
      ${T(['Raíces', 'que', 'emplean'], 'gigante')}
      <div class="inicio-der">
        ${mascota('saluda', 'dark')}
        <a class="btn btn-lima grande" href="#/form/1">Empezar</a>
        ${hayDatos ? '<button class="btn btn-sec chico" data-act="reset">Empezar de nuevo</button>' : ''}
      </div>
    </div>
    <p class="caja inicio-caja"><b>1. Conocer:</b> nos cuentas qué te gusta. <b>2. Conectar:</b> te decimos dónde practicar para trabajar en hidroponía.</p>`);
}

const TEMAS_FORM = ['mint', 'dark', 'lime', 'mint', 'dark'];

function pForm(n) {
  const paso = PASOS_FORM[n - 1]();
  const progreso = `<div class="progreso"><span class="etq">Paso ${n} de ${PASOS}</span><div class="barra" role="progressbar" aria-label="Paso ${n} de ${PASOS}" aria-valuemin="1" aria-valuemax="${PASOS}" aria-valuenow="${n}"><span style="width:${n / PASOS * 100}%"></span></div></div>`;
  return slide(TEMAS_FORM[n - 1], n, `form paso-${n}`, `
    <div class="topbar">${progreso}</div>
    <div class="split" id="formulario" data-quien="${S.quien}">
      <div class="izq">${T(paso.titulo)}${paso.mascota}${paso.ayuda ? `<p class="caja chica">${paso.ayuda}</p>` : ''}</div>
      <div class="der">${paso.cuerpo}
        <p class="error" id="error" role="alert" tabindex="-1" hidden></p>
        <div class="nav">${atras(n === 1 ? '#/inicio' : `#/form/${n - 1}`)}<button class="btn btn-prim" data-act="next">${n === PASOS ? 'Ver bootcamps' : 'Siguiente'} <span aria-hidden="true">→</span></button></div>
      </div>
    </div>`);
}

const PASOS_FORM = [
  () => ({
    titulo: ['¿Quién', 'llena?'], mascota: mascota('libro', 'lime'),
    ayuda: 'Lee con calma. Puedes llenar esto solo o con tu familia.',
    cuerpo: `<fieldset class="grupo"><legend>¿Quién llena el formulario?</legend><div class="hexfila">
        ${hexOpcion('radio', 'quien', 'joven', S.quien === 'joven', '🧑', 'Soy el joven', 'data-k="quien"')}
        ${hexOpcion('radio', 'quien', 'familiar', S.quien === 'familiar', '👨‍👩‍👧', 'Soy un familiar', 'data-k="quien"')}</div></fieldset>
      ${campo('nombre', 'Nombre del joven', `<input id="nombre" data-k="nombre" value="${esc(S.nombre)}" autocomplete="off">`)}
      ${campo('edad', 'Edad del joven', `<input id="edad" data-k="edad" type="number" inputmode="numeric" min="14" max="99" value="${esc(S.edad)}">`)}
      <div class="fam">
        ${campo('famNombre', 'Tu nombre', `<input id="famNombre" data-k="famNombre" value="${esc(S.famNombre)}" autocomplete="off">`)}
        ${campo('parentesco', 'Tu parentesco con el joven', `<select id="parentesco" data-k="parentesco"><option value="">Elige uno</option>${PARENTESCOS.map(p => `<option ${S.parentesco === p ? 'selected' : ''}>${p}</option>`).join('')}</select>`)}
      </div>`,
  }),
  () => ({
    titulo: ['Mis', 'fortalezas'], mascota: mascota('laptop', 'dark'),
    ayuda: 'Toca todas las tarjetas que sí. Si llena un familiar: elige lo que le gusta al joven.',
    cuerpo: `<fieldset class="grupo"><legend class="sr">Elige tus fortalezas</legend><div class="hexgrid">
      ${FORTALEZAS.map(f => hexOpcion('checkbox', 'fort', f.id, S.fort.includes(f.id), f.emoji, f.texto, 'data-list="fort"')).join('')}</div></fieldset>`,
  }),
  () => ({
    titulo: ['¿Qué quiero', 'probar?'], mascota: mascota('laptop', 'lime'),
    ayuda: 'Elige una carita en cada tarea. Si no sabes, deja “Tal vez”.',
    cuerpo: TAREAS.map(t => `<fieldset class="tarea"><legend><span aria-hidden="true">${t.emoji}</span> ${t.texto}</legend><div class="caritas">
      ${CARITAS.map(c => `<label class="carita"><input class="vh" type="radio" name="t-${t.id}" value="${c.v}" data-task="${t.id}" ${(S.tareas[t.id] || 0) === c.v ? 'checked' : ''}><span class="cara"><span class="cara-e" aria-hidden="true">${c.emoji}</span><span class="cara-t">${c.texto}</span></span></label>`).join('')}
      </div></fieldset>`).join(''),
  }),
  () => ({
    titulo: ['Apoyos', 'y notas'], mascota: mascota('idea', 'lime'),
    ayuda: 'Esto nos ayuda a preparar todo para ti.',
    cuerpo: `<fieldset class="grupo"><legend>¿Qué te ayuda?</legend><div class="chips">
        ${APOYOS.map(a => chip('apoyos', a.id, S.apoyos.includes(a.id), a.emoji, a.texto, 'data-list="apoyos"')).join('')}</div></fieldset>
      <fieldset class="grupo"><legend>¿Qué días puedes?</legend><div class="chips">
        ${DIAS.map(d => chip('dias', d, S.dias.includes(d), '', d, 'data-list="dias"')).join('')}</div></fieldset>
      ${campo('horario', '¿En qué horario?', `<select id="horario" data-k="horario"><option value="">Elige uno</option>${HORARIOS.map(h => `<option ${S.horario === h ? 'selected' : ''}>${h}</option>`).join('')}</select>`)}
      ${campo('notas', 'Algo más que quieras contarnos (opcional)', `<textarea id="notas" data-k="notas" rows="4">${esc(S.notas)}</textarea>`)}`,
  }),
  () => ({
    titulo: ['Tu', 'permiso'], mascota: mascota('pulgar', 'dark'),
    cuerpo: `<ul class="aviso caja-clara">
        <li><span aria-hidden="true">🔒</span> Tu perfil es un <b>dato sensible</b>. Es privado.</li>
        <li><span aria-hidden="true">👀</span> Solo lo ven las personas de Casa CAI que te acompañan.</li>
        <li><span aria-hidden="true">💻</span> En este prototipo <b>no sale de tu navegador</b>.</li>
        <li><span aria-hidden="true">🗑️</span> Puedes borrarlo cuando quieras.</li></ul>
      <label class="consent"><input type="checkbox" data-k="consent" ${S.consent ? 'checked' : ''}><span>Entiendo y doy mi permiso para armar el perfil de ${esc(S.nombre) || 'el joven'}.</span></label>`,
  }),
];

function validar(n) {
  if (n === 1) {
    if (!S.nombre.trim()) return 'Falta el nombre del joven.';
    if (!S.edad || +S.edad < 14 || +S.edad > 99) return 'Falta la edad del joven (un número entre 14 y 99).';
    if (S.quien === 'familiar' && !S.famNombre.trim()) return 'Falta tu nombre.';
    if (S.quien === 'familiar' && !S.parentesco) return 'Falta tu parentesco con el joven.';
  }
  if (n === 2 && !S.fort.length) return 'Elige al menos una tarjeta.';
  if (n === 5 && !S.consent) return 'Necesitamos tu permiso para seguir. Marca la casilla.';
  return '';
}

const hoyListo = () => S.consent && S.fort.length && S.nombre;

function pResultados() {
  const lista = puntuar(), top = Math.max(1, lista[0].total);
  const recs = lista.filter(x => x.total > 0).slice(0, 2), otras = lista.filter(x => !recs.includes(x));
  const puntos = x => '●'.repeat(Math.max(x.total > 0 ? 1 : 0, Math.round(5 * x.total / top))).padEnd(5, '○');
  const tarjeta = (x, rec) => {
    const inscrito = S.insc.some(i => i.id === x.b.id);
    return `<a class="hexw hexb ${rec ? 'rec' : ''}" href="#/bootcamp/${x.b.id}" aria-label="${esc(x.b.nombre)}${rec ? ', recomendado' : ''}">${hexIn(`
      ${rec ? '<span class="insignia">⭐ Recomendado</span>' : ''}<span class="hex-emoji" aria-hidden="true">${x.b.emoji}</span>
      <span class="hex-nombre">${esc(x.b.nombre)}</span>
      ${rec && x.razones.length ? `<span class="hex-razon">Porque ${esc(x.razones.join(' y '))}</span>` : ''}
      <span class="puntos" aria-label="Afinidad ${puntos(x).replace(/○/g, '').length} de 5">${puntos(x)}</span>
      ${inscrito ? '<span class="insignia ok">✔ Inscrito</span>' : ''}`)}</a>`;
  };
  const chips = S.fort.map(id => { const f = porId(FORTALEZAS, id); return `<li><span aria-hidden="true">${f.emoji}</span> ${esc(f.texto)}</li>`; }).join('');
  const gustan = TAREAS.filter(t => S.tareas[t.id] === 1).map(t => `<li><span aria-hidden="true">😊</span> ${t.texto}</li>`).join('');
  return slide('mint', 3, 'resultados', `
    <div class="topbar">${atras('#/form/5')}</div>
    <div class="res-cab">
      <div>${etq('Tu perfil')}${T(['Fortalezas', `de ${S.nombre.trim().split(/\s+/)[0]}`], 'mediano')}
        <ul class="lista-chips">${chips}${gustan}</ul></div>
      ${mascota('pulgar', 'lime', true)}
    </div>
    ${recs.length ? `<h2 class="seccion">${etq('Recomendado para ti')}</h2><div class="hexgrid grande">${recs.map(x => tarjeta(x, true)).join('')}</div>`
      : '<p class="caja">Todos los bootcamps te pueden servir. Empieza por el que más te llame.</p>'}
    <h2 class="seccion">${etq('Otras opciones')}</h2><div class="hexgrid">${otras.map(x => tarjeta(x, false)).join('')}</div>
    ${S.insc.length ? '<div class="nav centro"><a class="btn btn-prim" href="#/confirmacion">Ver mis inscripciones</a></div>' : ''}`);
}

function pBootcamp(id) {
  const b = porId(BOOTCAMPS, id);
  if (!b) return pResultados();
  const actual = S.insc.find(i => i.id === id);
  const lista = (t, arr) => `<h2 class="sub">${t}</h2><ul class="vin">${arr.map(x => `<li>${esc(x)}</li>`).join('')}</ul>`;
  return slide('lime', 1, 'detalle', `
    <div class="topbar">${atras('#/resultados')}</div>
    <div class="split">
      <div class="izq">
        ${T([b.nombre], 'mediano')}
        <p class="caja">⏱️ Dura <b>${b.duracion}</b>. ${esc(b.descripcion)}</p>
        ${lista('Qué se practica', b.practica)}${lista('Qué vas a aprender', b.aprende)}${lista('Qué llevar', b.lleva)}
        <h2 class="sub">Quién te acompaña</h2><p>🤝 ${esc(b.acompana)}</p>
      </div>
      <div class="der">
        ${marcoFoto(b.emoji, mascota('celular', 'yellow'))}
        <fieldset class="grupo tarjeta"><legend>${actual ? 'Tu fecha' : 'Elige tu fecha'}</legend>
          ${FECHAS.map(f => `<label class="fecha"><input class="vh" type="radio" name="fecha" value="${esc(f)}" ${actual && actual.fecha === f ? 'checked' : ''}><span>📅 ${f}</span></label>`).join('')}
          <p class="error" id="error" role="alert" tabindex="-1" hidden></p>
          <button class="btn btn-prim grande" data-act="inscribir" data-id="${b.id}">${actual ? 'Cambiar fecha' : 'Inscribirme'}</button>
        </fieldset>
      </div>
    </div>`);
}

function perfilImprimible() {
  const fort = S.fort.map(id => { const f = porId(FORTALEZAS, id); return `<li>${f.emoji} ${esc(f.texto)}</li>`; }).join('');
  const tareas = TAREAS.map(t => `<li>${t.emoji} ${t.texto}: ${CARITAS.find(c => c.v === (S.tareas[t.id] || 0)).emoji} ${CARITAS.find(c => c.v === (S.tareas[t.id] || 0)).texto}</li>`).join('');
  const apoyos = S.apoyos.map(id => { const a = porId(APOYOS, id); return `<li>${a.emoji} ${a.texto}</li>`; }).join('') || '<li>Sin apoyos marcados</li>';
  const insc = S.insc.map(i => `<li>${porId(BOOTCAMPS, i.id).emoji} <b>${esc(porId(BOOTCAMPS, i.id).nombre)}</b> · ${esc(i.fecha)}</li>`).join('');
  return `<article class="perfil print-area"><header><h2>Perfil de habilidades</h2><p>Raíces que emplean · Casa CAI / Encuentro A.C.</p></header>
    <p class="dato"><b>${esc(S.nombre)}</b>, ${esc(S.edad)} años${S.quien === 'familiar' ? ` · Llenó: ${esc(S.famNombre)} (${esc(S.parentesco)})` : ' · Llenó el joven'}</p>
    <div class="cols"><section><h3>Fortalezas</h3><ul>${fort}</ul></section><section><h3>Tareas que quiere probar</h3><ul>${tareas}</ul></section>
    <section><h3>Apoyos</h3><ul>${apoyos}</ul></section>
    <section><h3>Disponibilidad</h3><p>${S.dias.join(', ') || 'Sin días marcados'} · ${esc(S.horario) || 'Sin horario'}</p>${S.notas ? `<h3>Notas</h3><p>${esc(S.notas)}</p>` : ''}</section></div>
    <section><h3>Bootcamps inscritos</h3><ul>${insc}</ul></section></article>`;
}

function pConfirmacion() {
  return slide('dark', 2, 'confirmacion', `
    <div class="topbar">${atras('#/resultados')}</div>
    <div class="split">
      <div class="izq">${T(['¡Listo,', `${S.nombre.trim().split(/\s+/)[0]}!`])}${mascota('pulgar', 'dark')}
        <p class="caja">Ya estás inscrito. En 2 días pasas de conocer tus fortalezas a practicarlas.</p></div>
      <div class="der">
        ${perfilImprimible()}
        <div class="nav"><button class="btn btn-lima" data-act="imprimir">🖨️ Imprimir perfil</button><a class="btn btn-sec" href="#/resultados">Ver otros bootcamps</a></div>
      </div></div>`);
}

function pAcompanantes() {
  const perfiles = leer(KEY_PERFILES, []);
  const fila = p => `<tr><td><b>${esc(p.nombre)}</b><br>${esc(p.edad)} años</td><td>${p.quien === 'familiar' ? `${esc(p.famNombre)} (${esc(p.parentesco)})` : 'El joven'}</td>
    <td>${p.fort.map(id => porId(FORTALEZAS, id).emoji).join(' ')}</td>
    <td>${p.insc.map(i => `${porId(BOOTCAMPS, i.id).emoji} ${esc(porId(BOOTCAMPS, i.id).nombre)}<br><small>${esc(i.fecha)}</small>`).join('<br>') || '—'}</td></tr>`;
  return slide('mint', 0, 'staff', `
    <div class="topbar">${atras('#/inicio')}</div>
    ${T(['Acompañantes'], 'mediano')}
    <p class="caja">Perfiles guardados en este navegador (localStorage). Son datos sensibles: nada sale de aquí.</p>
    ${perfiles.length ? `<div class="tabla"><table><thead><tr><th>Joven</th><th>Llenó</th><th>Fortalezas</th><th>Inscripciones</th></tr></thead><tbody>${perfiles.map(fila).join('')}</tbody></table></div>
      <button class="btn btn-sec chico" data-act="borrar">Borrar perfiles guardados</button>` : '<p class="vacio">Todavía no hay perfiles completos.</p>'}`);
}

// ---------- Router ----------
const app = document.getElementById('app');
const RANGO = { inicio: 0, form: 1, resultados: 6, bootcamp: 7, confirmacion: 8, acompanantes: 9 };
let rangoPrevio = 0;

function render() {
  let [, r = 'inicio', a] = location.hash.split('/');
  if (!(r in RANGO)) r = 'inicio';
  if ((r === 'resultados' || r === 'bootcamp') && !hoyListo()) { location.hash = '#/form/1'; return; }
  if (r === 'confirmacion' && !S.insc.length) { location.hash = '#/resultados'; return; }
  const paso = Math.min(Math.max(parseInt(a) || 1, 1), PASOS);
  const rango = RANGO[r] + (r === 'form' ? paso / 10 : 0);
  app.innerHTML = { inicio: pInicio, form: () => pForm(paso), resultados: pResultados, bootcamp: () => pBootcamp(a), confirmacion: pConfirmacion, acompanantes: pAcompanantes }[r]();
  app.firstElementChild.classList.add(rango >= rangoPrevio ? 'entra-sig' : 'entra-ant');
  rangoPrevio = rango;
  window.scrollTo(0, 0);
  app.querySelector('h1')?.focus({ preventScroll: true });
}

const mostrarError = msg => {
  const e = document.getElementById('error');
  e.textContent = msg; e.hidden = false; e.focus();
};

// ---------- Eventos (delegados: no re-pintamos al escribir, así no se pierde el foco) ----------
app.addEventListener('input', e => {
  const t = e.target, d = t.dataset;
  if (d.k) {
    S[d.k] = t.type === 'checkbox' ? t.checked : t.value;
    if (d.k === 'quien') document.getElementById('formulario').dataset.quien = t.value;
  } else if (d.list) {
    const arr = S[d.list], i = arr.indexOf(t.value);
    if (t.checked && i < 0) arr.push(t.value);
    if (!t.checked && i >= 0) arr.splice(i, 1);
  } else if (d.task) S.tareas[d.task] = +t.value;
  else return;
  guardar();
  document.getElementById('error')?.setAttribute('hidden', '');
});

app.addEventListener('click', e => {
  const b = e.target.closest('[data-act]');
  if (!b) return;
  const act = b.dataset.act;
  if (act === 'next') {
    const n = +location.hash.split('/')[2] || 1, err = validar(n);
    if (err) return mostrarError(err);
    location.hash = n < PASOS ? `#/form/${n + 1}` : '#/resultados';
  } else if (act === 'inscribir') {
    const f = app.querySelector('input[name=fecha]:checked');
    if (!f) return mostrarError('Falta elegir una fecha.');
    S.insc = [...S.insc.filter(i => i.id !== b.dataset.id), { id: b.dataset.id, fecha: f.value }];
    guardar();
    location.hash = '#/confirmacion';
  } else if (act === 'reset') { S = vacio(); escribir(KEY, S); render(); }
  else if (act === 'imprimir') window.print();
  else if (act === 'borrar') { try { localStorage.removeItem(KEY_PERFILES); } catch { /* nada que borrar */ } render(); }
});

window.addEventListener('hashchange', render);
render();
