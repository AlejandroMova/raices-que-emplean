# Raíces que emplean (prototipo)

Prototipo navegable: formulario de fortalezas → bootcamps recomendados → inscripción → confirmación con perfil imprimible.

## Cómo correrlo
- Abre `index.html` en el navegador, o corre `python3 -m http.server 8000` en esta carpeta y entra a `http://localhost:8000`.
- Necesita internet solo para las fuentes (Google Fonts); sin ellas se ve con fuentes del sistema.
- Todo se guarda en `localStorage`; nada sale del navegador. "Empezar de nuevo" en el inicio borra lo llenado.

## Qué editar
- `data.js`: fortalezas, tareas, apoyos, fechas y los 5 bootcamps con sus pesos.
- Afinidad = suma de pesos de las fortalezas elegidas + peso de la tarea × carita (😟 -1, 😐 0, 😊 +1). Los 2 mejores con puntaje mayor a 0 salen como "Recomendado".
- Las fotos son marcos con ilustración de ejemplo; reemplazar con fotos reales de Casa CAI, con consentimiento.
- Vista de acompañantes: enlace "Acompañantes" en el pie de página.
