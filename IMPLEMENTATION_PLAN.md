# IMPLEMENTATION_PLAN.md

## Objetivo

Implementar la app por fases chicas, verificables y seguras.

No construir toda la app de una vez.

Cada fase debe completarse, probarse y revisarse antes de avanzar a la siguiente.

---

## Fase 1 — Base técnica

### Objetivo

Crear la base del proyecto y dejar lista la arquitectura mínima.

### Alcance

- Crear proyecto con Vite, React y TypeScript.
- Configurar Tailwind CSS.
- Configurar fuente Inter.
- Configurar React Router.
- Configurar Dexie.js.
- Configurar vite-plugin-pwa mínimo.
- Configurar Vitest.
- Crear estructura base de carpetas.
- Crear tipos TypeScript principales.
- Crear `localDb.ts`.
- Crear repositories vacíos o mínimos.
- Crear layout base.
- Crear pantalla placeholder para perfiles.
- Crear pantalla placeholder para rutinas.

### No incluir

- CRUD completo de rutinas.
- CRUD completo de ejercicios.
- Sesiones activas.
- Histórico.
- Backup.
- Pulido visual avanzado.

### Criterios de aceptación

- La app levanta localmente.
- Hay rutas base.
- Tailwind funciona.
- Dexie inicializa sin errores.
- Vitest corre.
- Build pasa.
- Typecheck pasa.

---

## Fase 2 — Perfiles locales

### Objetivo

Permitir crear y seleccionar perfiles locales.

### Alcance

- Crear perfil.
- Listar perfiles.
- Seleccionar perfil activo.
- Persistir perfil activo localmente.
- Cambiar perfil.
- Redirección desde `/`.
- Proteger rutas internas si no hay perfil activo.
- Textos en español de Argentina.

### No incluir

- Rutinas reales.
- Auth con email/password.
- Sync cloud.

### Criterios de aceptación

- Una persona puede crear un perfil.
- Una persona puede seleccionar un perfil.
- El perfil activo persiste al refrescar.
- Si no hay perfil activo, se muestra `/perfiles`.
- Si hay perfil activo, `/` redirige a `/rutinas`.

---

## Fase 3 — Rutinas

### Objetivo

Implementar CRUD completo de rutinas.

### Alcance

- Crear rutina.
- Editar rutina.
- Eliminar rutina.
- Duplicar rutina básica.
- Listar rutinas del perfil activo.
- Empty state.
- Card de rutina con aspect ratio 5:4.
- Card final para agregar rutina.
- Floating add button si hay más de 10 rutinas.
- Imagen de portada como Blob en IndexedDB.
- Render de imagen con `URL.createObjectURL`.
- Liberar Object URLs cuando corresponda.

### No incluir

- Ejercicios.
- Sesiones.
- Histórico.

### Criterios de aceptación

- Las rutinas persisten al refrescar.
- Cada perfil ve solo sus rutinas.
- Se puede crear, editar, duplicar y eliminar.
- Las imágenes de portada funcionan localmente.
- No se usa base64 para imágenes grandes.

---

## Fase 4 — Ejercicios

### Objetivo

Permitir cargar ejercicios dentro de una rutina.

### Alcance

- Crear ejercicio.
- Editar ejercicio.
- Eliminar ejercicio.
- Ordenar ejercicios por `sort_order`.
- Categorías:
  - Calentamiento
  - Core
  - Fuerza
- Tipos:
  - Por series
  - Por tiempo
- Configuración para ejercicios por series.
- Configuración para ejercicios por tiempo.
- Detalle de rutina agrupado por categoría.
- Row card horizontal de ejercicio.
- Modal o página de video/detalle.

### No incluir

- Ejecución de rutina.
- Logs.
- Histórico.

### Criterios de aceptación

- Una rutina puede tener ejercicios.
- Los ejercicios se agrupan por categoría.
- Cada tipo guarda su configuración correcta.
- El detalle muestra resumen correcto.
- El video se puede abrir o enlazar.

---

## Fase 5 — Sesión activa persistente

### Objetivo

Comenzar una rutina y persistir el progreso incrementalmente.

### Alcance

- Comenzar rutina.
- Crear `workout_session`.
- Guardar `started_at`.
- Marcar sesión como activa.
- Persistir estado incremental de la sesión.
- Guardar pesos editados.
- Guardar series completadas.
- Guardar rondas completadas.
- Al refrescar o reabrir, detectar sesión activa.
- Mostrar pantalla o modal:
  - “Tenés una rutina en curso”
  - “Retomar”
  - “Descartar”
- Descartar sesión activa con confirmación.

### No incluir

- Histórico gráfico.
- Analíticas avanzadas.
- Timer sofisticado si no es necesario todavía.

### Criterios de aceptación

- Si se cierra/refresca la app durante una rutina, el progreso no se pierde.
- Se puede retomar una sesión.
- Se puede descartar una sesión.
- Los datos se guardan incrementalmente.

---

## Fase 6 — Tracking completo de entrenamiento

### Objetivo

Completar la experiencia usable durante el entrenamiento.

### Alcance

- UI completa para ejercicios por series.
- Una fila por serie.
- Input editable de peso.
- Check para completar serie.
- Logs persistentes de series.
- UI para ejercicios por tiempo.
- Timer basado en timestamps, no en acumulación de ticks.
- Pausa/reanudación.
- Rondas completadas.
- Finalizar rutina.
- Guardar `finished_at`.
- Calcular `duration_seconds`.

### No incluir

- Histórico gráfico.
- Backup.

### Criterios de aceptación

- Se puede completar una rutina real.
- Se guardan pesos reales usados.
- Se guarda duración total.
- El timer no depende de `setInterval` como fuente de verdad.
- La sesión finalizada ya no aparece como activa.

---

## Fase 7 — Histórico de ejercicio

### Objetivo

Mostrar evolución de peso por ejercicio.

### Alcance

- Pantalla de histórico.
- Gráfico de línea.
- Cálculo de mayor peso completado por sesión.
- Lista simple de sesiones debajo del gráfico.
- Tests del cálculo.

### No incluir

- Estimación 1RM.
- Volumen total.
- Comparativas complejas.

### Criterios de aceptación

- Cada ejercicio por series tiene histórico.
- El gráfico muestra un punto por sesión.
- El valor por sesión es el mayor peso completado.
- El cálculo está testeado.

---

## Fase 8 — Backup y ajustes

### Objetivo

Permitir respaldar y restaurar datos.

### Alcance

- Pantalla de ajustes.
- Exportar todos los datos como JSON.
- Incluir `schema_version`.
- Incluir `exported_at`.
- Importar backup JSON.
- Validar estructura básica.
- Confirmar reemplazo total.
- Reemplazar todos los datos locales al importar.
- Limpiar datos locales con confirmación.

### No incluir

- Merge complejo.
- Resolución de conflictos.
- Sync cloud.

### Criterios de aceptación

- Se puede descargar backup.
- Se puede importar backup.
- Importar reemplaza todos los datos actuales con confirmación.
- Los datos importados funcionan después de refrescar.

---

## Fase 9 — PWA y mobile polish

### Objetivo

Pulir la experiencia mobile e instalable.

### Alcance

- Manifest final.
- Íconos placeholder o finales.
- App shell cache.
- Offline fallback básico.
- Revisión mobile.
- Botones cómodos para tocar.
- Estados vacíos.
- Confirmaciones.
- Revisión de textos en español de Argentina.
- Revisión visual blanco y negro.

### Criterios de aceptación

- La app es instalable.
- La app carga offline después de la primera carga.
- La UI es usable en celular.
- Los textos se sienten naturales en Argentina.
- No hay features fuera de scope.
