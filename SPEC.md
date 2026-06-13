# PWA de Rutinas de Gimnasio — Especificación de Producto y Desarrollo

Vas a construir una Progressive Web App local-first para crear, administrar y ejecutar rutinas de gimnasio.

La app va a ser usada inicialmente por dos personas de forma privada, pero debe estar pensada para poder escalar más adelante y eventualmente migrar a un backend/cloud sin tener que rehacer la interfaz.

No usar Supabase, Firebase ni ningún backend pago.

La persistencia de datos debe hacerse localmente usando IndexedDB.

---

## Idioma de la app

Toda la interfaz de usuario debe estar en **español de Argentina**.

Esto incluye:

- Botones
- Labels
- Títulos
- Estados vacíos
- Mensajes de error
- Confirmaciones
- Modales
- Navegación
- Textos de ayuda

Usar un tono claro, simple y natural.

Ejemplos de labels:

```txt
Elegí un perfil
Crear perfil
Mis rutinas
Nueva rutina
Editar rutina
Duplicar rutina
Eliminar rutina
Comenzar rutina
Finalizar rutina
Histórico
Series
Repeticiones
Peso
Tiempo de trabajo
Tiempo de descanso
Rondas
Calentamiento
Core
Fuerza
Guardar
Cancelar
Eliminar
Exportar datos
Importar datos
```

Evitar español neutro demasiado artificial.

Ejemplos:

- Usar “Elegí un perfil”, no “Elige un perfil”.
- Usar “Guardá los cambios”, no “Guarda los cambios”.
- Usar “Rutina eliminada”, no “Rutina borrada exitosamente” si suena muy sistema enterprise.
- Usar “No tenés rutinas todavía”, no “Aún no tienes rutinas”.

---

## Stack técnico

Usar:

- React
- Vite
- TypeScript
- Tailwind CSS
- Dexie.js
- IndexedDB
- React Router
- vite-plugin-pwa
- Recharts o una librería liviana similar para gráficos
- Vitest
- Inter como fuente principal

Opcional:

- TanStack Query puede usarse si ayuda a ordenar el manejo de datos, mutations y cache, pero no sobrecomplicar la app.

---

## Objetivo del producto

Construir una PWA local-first donde las personas usuarias puedan:

- Crear perfiles locales
- Cambiar entre perfiles
- Crear rutinas de gimnasio
- Editar rutinas
- Duplicar rutinas
- Eliminar rutinas
- Agregar ejercicios a una rutina
- Ejecutar una rutina como sesión activa de entrenamiento
- Registrar series, repeticiones y peso durante el entrenamiento
- Registrar ejercicios por tiempo
- Guardar historial de entrenamiento
- Retomar una sesión activa si la app se cerró o refrescó
- Ver evolución de peso por ejercicio
- Exportar todos los datos como JSON
- Importar datos desde JSON reemplazando los datos locales actuales

La app debe sentirse como un cuaderno personal de entrenamiento, no como una red social fitness.

---

## Dirección visual

La interfaz debe ser:

- Minimalista
- Blanco y negro
- Mobile-first
- Limpia y ordenada
- Tipografía Inter
- Controles grandes y fáciles de tocar
- Basada en cards
- Sin gradientes
- Sin colores decorativos
- Sin ruido visual

No construir:

- Features sociales
- Likes
- Comentarios
- Feed
- Comunidad
- Badges
- Gamificación
- IA
- Suscripciones
- Notificaciones

Estilo visual:

- Fondo blanco
- Texto negro
- Bordes simples
- Sombras muy sutiles solo si hacen falta
- Esquinas redondeadas
- Jerarquía clara
- Sensación calma, enfocada y utilitaria

La app tiene que verse pulida, pero no sobrediseñada.

---

## Perfiles locales

No construir login con email/password.

En su lugar, construir un selector de perfiles locales.

Pantalla inicial:

- Mostrar perfiles existentes
- Permitir crear un nuevo perfil
- Permitir cambiar entre perfiles

Cada perfil debe tener:

```ts
type Profile = {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
};
```

El perfil activo debe guardarse localmente.

Todas las rutinas, ejercicios y sesiones deben pertenecer a un `profile_id`.

Ejemplo de interfaz:

```txt
Elegí un perfil

[Eze]
[Vicky]
[+ Crear perfil]
```

---

## Flujo principal

1. La persona abre la app.
2. Elige un perfil local.
3. Entra a la pantalla de rutinas.
4. Si no hay rutinas, ve una card vacía con un ícono `+`.
5. Crea una rutina.
6. Agrega ejercicios a la rutina.
7. Entra al detalle de la rutina.
8. Toca “Comenzar rutina”.
9. Completa series o ejercicios por tiempo.
10. Finaliza la rutina.
11. La app guarda la sesión de entrenamiento.
12. Luego puede ver el histórico de evolución por ejercicio.

---

## Rutas principales

Usar React Router.

Rutas sugeridas:

```txt
/
/perfiles
/rutinas
/rutinas/nueva
/rutinas/:routineId
/rutinas/:routineId/editar
/rutinas/:routineId/sesion
/ejercicios/:exerciseId
/ejercicios/:exerciseId/historico
/ajustes
```

Comportamiento:

- `/` debe redirigir a `/perfiles` si no existe perfil activo.
- Si ya existe perfil activo, `/` debe redirigir a `/rutinas`.
- Las rutas internas deben requerir un perfil activo.
- Si no hay perfil activo, redirigir al selector de perfiles.

Los nombres de rutas pueden estar en español.

Los nombres internos de variables, tipos y archivos pueden estar en inglés para mantener claridad técnica.

---

## Pantalla principal de rutinas

La pantalla de rutinas debe mostrar todas las rutinas del perfil activo.

Si la persona no tiene rutinas:

- Mostrar una card grande vacía.
- La card debe tener un ícono `+`.
- Al tocarla, permite crear una nueva rutina.

Cards de rutina:

- Aspect ratio 5:4
- Imagen de portada
- Título de la rutina
- Descripción breve
- Menú de acciones:
  - Editar
  - Duplicar
  - Eliminar

Al tocar una card, se abre el detalle de la rutina.

A medida que se agregan rutinas, las cards deben apilarse verticalmente, una debajo de la otra.

La card para agregar una nueva rutina debe aparecer siempre al final de la lista.

Si hay más de 10 rutinas cargadas, mostrar un botón flotante `+` fijo cerca del borde inferior derecho de la pantalla, para que la persona no tenga que scrollear hasta el final para crear una rutina nueva.

---

## Entidad Routine

Una rutina debe tener:

```ts
type Routine = {
  id: string;
  profile_id: string;
  title: string;
  description: string;
  cover_image_blob_id?: string;
  created_at: string;
  updated_at: string;
};
```

### Imágenes de portada

Guardar imágenes de portada como Blob en IndexedDB.

No guardar imágenes grandes como base64.

Renderizar las imágenes con:

```ts
URL.createObjectURL(blob)
```

Cuando corresponda, liberar memoria con:

```ts
URL.revokeObjectURL(objectUrl)
```

Crear una tabla o mecanismo local para guardar blobs de imágenes y asociarlos a rutinas.

Ejemplo:

```ts
type ImageBlob = {
  id: string;
  blob: Blob;
  mime_type: string;
  created_at: string;
};
```

---

## Acciones de rutina

La persona debe poder:

- Crear rutina
- Editar rutina
- Duplicar rutina
- Eliminar rutina

Duplicar una rutina también debe duplicar:

- Ejercicios
- Configuraciones de ejercicios por series
- Configuraciones de ejercicios por tiempo
- Imagen de portada si existe

Eliminar una rutina también debe eliminar:

- Ejercicios relacionados
- Configuraciones relacionadas

El historial de entrenamiento no hace falta eliminarlo automáticamente salvo que sea técnicamente necesario. Si se elimina también el historial, dejar ese comportamiento explícito en comentarios del código.

---

## Entidad Exercise

Una rutina contiene múltiples ejercicios.

Cada ejercicio debe tener:

```ts
type Exercise = {
  id: string;
  routine_id: string;
  profile_id: string;
  name: string;
  short_description: string;
  full_description: string;
  video_url?: string;
  video_thumbnail_url?: string;
  category: ExerciseCategory;
  type: ExerciseType;
  sort_order: number;
  created_at: string;
  updated_at: string;
};
```

Categorías:

```ts
type ExerciseCategory = "warmup" | "core" | "strength";
```

Tipos de ejercicio:

```ts
type ExerciseType = "sets" | "timed";
```

Labels visibles en la UI:

```txt
Calentamiento
Core
Fuerza
```

Tipos visibles en la UI:

```txt
Por series
Por tiempo
```

---

## Tipos de ejercicio

Hay dos tipos de ejercicio:

1. Ejercicio por series
2. Ejercicio por tiempo

---

## Ejercicio por series

Configuración del ejercicio por series:

```ts
type SetsExerciseConfig = {
  id: string;
  exercise_id: string;
  sets: number;
  reps: number;
  base_weight: number;
};
```

Campos editables:

- Cantidad de series
- Repeticiones
- Peso base

Durante una sesión activa:

- Mostrar una fila por cada serie.
- Cada fila debe incluir:
  - Número de serie
  - Repeticiones
  - Input editable de peso
  - Botón con check para marcar la serie como completada

La persona debe poder ajustar el peso de cada serie mientras entrena.

El peso modificado durante la sesión debe guardarse en los logs de entrenamiento, no directamente en la plantilla de la rutina.

La rutina guarda el peso base/default.

La sesión guarda el peso real usado.

---

## Ejercicio por tiempo

Configuración del ejercicio por tiempo:

```ts
type TimedExerciseConfig = {
  id: string;
  exercise_id: string;
  work_seconds: number;
  rest_seconds: number;
  rounds: number;
};
```

Campos editables:

- Tiempo de trabajo
- Tiempo de descanso
- Cantidad de rondas

Durante una sesión activa:

- Mostrar una interfaz de temporizador.
- Usar el tiempo de trabajo, descanso y rondas configuradas.
- Permitir:
  - Iniciar
  - Pausar
  - Reiniciar
  - Marcar rondas como completadas

---

## Pantalla de detalle de rutina

Al abrir una rutina, mostrar todos los ejercicios agrupados por categoría en este orden:

1. Calentamiento
2. Core
3. Fuerza

Cada ejercicio debe renderizarse como una row card horizontal.

La row card de ejercicio debe incluir:

- Thumbnail del video a la izquierda
- Nombre del ejercicio
- Tipo de ejercicio: Por series o Por tiempo
- Descripción breve
- Resumen de series/repeticiones/peso si es ejercicio por series
- Resumen de trabajo/descanso/rondas si es ejercicio por tiempo

En la parte inferior de la pantalla, mostrar un botón fijo:

```txt
Comenzar rutina
```

---

## Detalle de video / ejercicio

Cuando la persona toca el thumbnail del video en una row card de ejercicio, abrir una página o modal.

La vista debe incluir:

- Video embebido
- Nombre del ejercicio
- Descripción completa
- Metadata del ejercicio
- Categoría
- Tipo de ejercicio

Para el MVP, un modal está bien.

Si la URL es de YouTube, mostrar un iframe embebido si es posible.

Si la URL no se puede embeber, mostrar un link para abrir el video externamente.

Labels sugeridos:

```txt
Ver ejercicio
Abrir video
Descripción
Categoría
Tipo
```

---

## Comenzar una rutina

Cuando la persona toca “Comenzar rutina”:

- Crear una nueva sesión de entrenamiento.
- Guardar hora de inicio.
- Iniciar contador de duración total basado en timestamps.
- Cambiar la UI a modo rutina activa.
- Mostrar controles de completado para cada ejercicio.
- Persistir incrementalmente el progreso de la sesión.

El modo de rutina activa puede implementarse en esta ruta:

```txt
/rutinas/:routineId/sesion
```

---

## Sesión activa persistente

La sesión activa debe persistirse incrementalmente en IndexedDB.

No guardar todo recién al tocar “Finalizar rutina”.

Durante una sesión activa, persistir:

- Series completadas
- Pesos editados
- Rondas completadas
- Estado de temporizadores
- Hora de inicio
- Última actualización

Si la app se cierra, se refresca o el teléfono bloquea la pantalla, al volver debe detectar que hay una sesión activa y ofrecer:

```txt
Tenés una rutina en curso

[Retomar]
[Descartar]
```

Descartar la sesión debe requerir confirmación.

No perder progreso de entrenamiento.

---

## Timers

No usar `setInterval` como fuente de verdad del tiempo.

El tiempo debe calcularse por diferencia de timestamps.

`setInterval` puede usarse solo para refrescar la UI.

Para temporizadores, usar datos como:

- `started_at`
- `paused_at`
- `total_paused_seconds`
- `Date.now()`

Si Wake Lock API está disponible, puede usarse para intentar mantener la pantalla encendida durante una sesión, pero debe haber fallback seguro si no está disponible.

---

## Modo rutina activa

Durante una rutina activa:

Para ejercicios por series:

- Mostrar botón “Histórico”.
- Mostrar filas de series.
- Cada fila incluye:
  - Número de serie
  - Repeticiones
  - Input editable de peso
  - Botón de check

Para ejercicios por tiempo:

- Mostrar controles de temporizador.
- Mostrar ronda actual.
- Mostrar estado actual: trabajo o descanso.
- Permitir registrar rondas completadas.

La persona debe poder finalizar la rutina en cualquier momento.

---

## Finalizar una rutina

Agregar una acción clara:

```txt
Finalizar rutina
```

Al finalizar:

- Guardar hora de finalización.
- Guardar duración total.
- Guardar todas las series completadas.
- Guardar todas las rondas completadas.
- Guardar todos los valores de peso usados durante la sesión.
- Marcar la sesión como finalizada.
- Dejar de mostrarla como sesión activa.

Estos datos se usan luego para alimentar el histórico de cada ejercicio.

---

## Entidad WorkoutSession

```ts
type WorkoutSession = {
  id: string;
  routine_id: string;
  profile_id: string;
  started_at: string;
  finished_at?: string;
  duration_seconds?: number;
  status: "active" | "finished" | "discarded";
  last_updated_at: string;
};
```

---

## Logs de series

```ts
type WorkoutSetLog = {
  id: string;
  session_id: string;
  exercise_id: string;
  set_number: number;
  reps: number;
  weight: number;
  completed: boolean;
  created_at: string;
  updated_at: string;
};
```

Cada serie completada debe guardarse.

Para el gráfico histórico, usar el mayor peso completado de ese ejercicio en cada sesión.

---

## Logs de ejercicios por tiempo

```ts
type WorkoutTimedLog = {
  id: string;
  session_id: string;
  exercise_id: string;
  round_number: number;
  work_seconds: number;
  rest_seconds: number;
  completed: boolean;
  created_at: string;
  updated_at: string;
};
```

---

## Histórico de ejercicio

Cada ejercicio por series debe tener una pantalla de “Histórico”.

La pantalla debe mostrar:

- Nombre del ejercicio
- Gráfico de línea con evolución de peso
- Fechas en el eje X
- Peso en el eje Y
- Lista opcional de sesiones debajo del gráfico

Regla del gráfico:

Por cada sesión de entrenamiento finalizada, calcular el mayor peso completado para ese ejercicio.

Ejemplo:

```txt
Sesión 1: 20 kg
Sesión 2: 22.5 kg
Sesión 3: 25 kg
```

El gráfico debe mostrar un punto por sesión.

No construir todavía:

- Analíticas avanzadas
- Estimación de 1RM
- Volumen total
- Comparativas complejas

Mantener el histórico simple.

---

## Base de datos local

Usar Dexie.js sobre IndexedDB.

Crear una base local con tablas para:

- profiles
- routines
- routine_images
- exercises
- sets_exercise_config
- timed_exercise_config
- workout_sessions
- workout_set_logs
- workout_timed_logs

Schema sugerido:

```ts
db.version(1).stores({
  profiles: "id, name, created_at, updated_at",
  routines: "id, profile_id, title, created_at, updated_at, [profile_id+created_at]",
  routine_images: "id, created_at",
  exercises: "id, routine_id, profile_id, category, type, sort_order, created_at, updated_at, [routine_id+sort_order]",
  sets_exercise_config: "id, exercise_id",
  timed_exercise_config: "id, exercise_id",
  workout_sessions: "id, routine_id, profile_id, started_at, finished_at, status, [profile_id+started_at], [routine_id+started_at]",
  workout_set_logs: "id, session_id, exercise_id, created_at, updated_at, [session_id+exercise_id], [exercise_id+created_at]",
  workout_timed_logs: "id, session_id, exercise_id, created_at, updated_at, [session_id+exercise_id], [exercise_id+created_at]"
});
```

Usar UUIDs para IDs.

Usar timestamps consistentes.

Preferir fechas en formato ISO string.

---

## Arquitectura de datos

No llamar a Dexie directamente desde los componentes.

Crear funciones de repository para todo acceso a datos.

Carpeta sugerida:

```txt
src/db/
  localDb.ts
  profileRepository.ts
  routineRepository.ts
  exerciseRepository.ts
  workoutRepository.ts
  backupRepository.ts
```

Funciones sugeridas:

Perfiles:

```ts
createProfile()
getProfiles()
getProfileById()
setActiveProfile()
getActiveProfile()
clearActiveProfile()
```

Rutinas:

```ts
createRoutine()
updateRoutine()
duplicateRoutine()
deleteRoutine()
getRoutinesByProfile()
getRoutineById()
```

Ejercicios:

```ts
createExercise()
updateExercise()
deleteExercise()
getExercisesByRoutine()
getExerciseById()
reorderExercises()
```

Sesiones:

```ts
startWorkoutSession()
getActiveWorkoutSession()
resumeWorkoutSession()
discardWorkoutSession()
finishWorkoutSession()
saveWorkoutSetLog()
saveWorkoutTimedLog()
getExerciseHistory()
getWorkoutSessionsByProfile()
```

Backup:

```ts
exportAllData()
importAllDataReplacingCurrentData()
validateImportedData()
clearAllData()
```

La UI debe llamar a hooks o funciones que envuelvan estos repositories.

Esto permite reemplazar IndexedDB por un backend cloud más adelante sin tener que rehacer toda la app.

---

## Backup, exportación e importación

Agregar funcionalidad de backup en una pantalla de ajustes.

La pantalla de ajustes debe incluir:

- Perfil activo actual
- Cambiar perfil
- Exportar todos los datos como JSON
- Importar datos desde JSON
- Limpiar datos locales, con confirmación

Exportación:

- Exportar todos los datos locales desde IndexedDB.
- Descargar como archivo `.json`.
- Incluir `schema_version`.
- Incluir `exported_at`.

Importación:

Para el MVP, la importación debe ser por reemplazo total.

No implementar merge complejo.

Al importar:

- Permitir subir un archivo `.json`.
- Validar estructura básica.
- Mostrar confirmación clara antes de importar.
- Reemplazar todos los datos locales actuales con los datos importados.

Texto de confirmación sugerido:

```txt
Esto va a reemplazar todos los datos actuales. No se puede deshacer.
```

Formato de exportación:

```json
{
  "schema_version": 1,
  "exported_at": "2026-06-13T00:00:00.000Z",
  "profiles": [],
  "routines": [],
  "routine_images": [],
  "exercises": [],
  "sets_exercise_config": [],
  "timed_exercise_config": [],
  "workout_sessions": [],
  "workout_set_logs": [],
  "workout_timed_logs": []
}
```

Labels sugeridos:

```txt
Exportar datos
Importar datos
Descargar backup
Subir backup
Limpiar datos locales
Esto no se puede deshacer
```

---

## Requisitos PWA

Usar `vite-plugin-pwa`.

La app debe:

- Ser instalable en mobile
- Tener manifest
- Tener ícono placeholder
- Cachear el app shell
- Funcionar sin internet después de la primera carga
- Mantener datos locales disponibles offline mediante IndexedDB

Nombre sugerido de app:

```txt
Rutinas
```

O:

```txt
Cuaderno de Rutinas
```

---

## Estructura sugerida de carpetas

```txt
src/
  app/
    App.tsx
    router.tsx
    providers.tsx

  db/
    localDb.ts
    profileRepository.ts
    routineRepository.ts
    exerciseRepository.ts
    workoutRepository.ts
    backupRepository.ts

  types/
    profile.ts
    routine.ts
    exercise.ts
    workout.ts
    backup.ts

  components/
    ui/
      Button.tsx
      Input.tsx
      Textarea.tsx
      Card.tsx
      Modal.tsx
      FloatingActionButton.tsx
      Select.tsx
      ConfirmDialog.tsx

    profiles/
      ProfileSelector.tsx
      ProfileCard.tsx
      CreateProfileForm.tsx

    routines/
      RoutineCard.tsx
      RoutineForm.tsx
      RoutineList.tsx
      EmptyRoutineCard.tsx

    exercises/
      ExerciseRowCard.tsx
      ExerciseForm.tsx
      ExerciseVideoModal.tsx
      CategorySection.tsx

    workout/
      ActiveWorkout.tsx
      SetTracker.tsx
      TimerExercise.tsx
      FinishWorkoutButton.tsx

    history/
      ExerciseHistoryChart.tsx

    settings/
      ExportDataButton.tsx
      ImportDataButton.tsx
      ClearDataButton.tsx

  pages/
    ProfilesPage.tsx
    RoutinesPage.tsx
    NewRoutinePage.tsx
    RoutineDetailPage.tsx
    RoutineEditPage.tsx
    ActiveRoutinePage.tsx
    ExerciseDetailPage.tsx
    ExerciseHistoryPage.tsx
    SettingsPage.tsx

  hooks/
    useProfiles.ts
    useActiveProfile.ts
    useRoutines.ts
    useRoutine.ts
    useExercises.ts
    useWorkoutSession.ts
    useExerciseHistory.ts
    useBackup.ts

  utils/
    dates.ts
    ids.ts
    video.ts
    formatters.ts
    timers.ts

  styles/
    globals.css
```

---

## Componentes reutilizables

Crear componentes UI reutilizables:

- Button
- Input
- Textarea
- Card
- Modal
- FloatingActionButton
- Select
- ConfirmDialog

Mantener los componentes chicos, legibles y tipados.

Evitar poner lógica de negocio directamente dentro de componentes visuales.

---

## Testing

Usar Vitest.

No hace falta testear toda la UI en el MVP.

Sí agregar tests para lógica crítica:

- Repositories
- Crear perfil
- Crear rutina
- Duplicar rutina con ejercicios y configs
- Eliminar rutina en cascada
- Iniciar sesión
- Guardar progreso incremental
- Retomar sesión activa
- Finalizar sesión
- Calcular histórico por ejercicio
- Exportar datos
- Importar datos reemplazando todo

---

## Orden sugerido de implementación

Construir en este orden:

1. Setup del proyecto
2. Setup de Tailwind
3. Setup de fuente Inter
4. Setup PWA
5. Setup de Dexie / IndexedDB
6. Tipos TypeScript
7. Capa de repositories
8. Selector de perfiles
9. CRUD de rutinas
10. CRUD de ejercicios
11. Detalle de rutina agrupado por categoría
12. Modal o detalle de video
13. Sesión activa persistente
14. Tracking de series
15. Guardado incremental de sesión
16. Gráfico de histórico por ejercicio
17. Temporizador para ejercicios por tiempo usando timestamps
18. Exportar/importar backup por reemplazo total
19. Pulido mobile final

---

## Prioridades MVP

Prioridad 1:

- Selector de perfil local
- CRUD de rutinas
- CRUD de ejercicios
- Detalle de rutina
- Comenzar rutina
- Registrar series
- Finalizar rutina
- Guardar sesión
- Retomar sesión activa
- Ver gráfico de evolución de peso

Prioridad 2:

- Temporizador para ejercicios por tiempo
- Importar/exportar JSON
- Mejor manejo de videos embebidos
- Duplicar rutina
- Ordenar ejercicios

Prioridad 3:

- Pulido PWA
- Offline fallback
- Mejor pantalla de ajustes
- Refinamiento de carga de imágenes

---

## Decisiones importantes de producto

La rutina es una plantilla.

La sesión de entrenamiento es lo que pasó realmente entrenando.

La rutina guarda datos por defecto del ejercicio.

La sesión guarda los datos reales usados durante el entrenamiento.

No sobrescribir el peso base de la rutina cuando la persona cambia el peso durante una sesión.

Guardar los pesos reales en los logs de entrenamiento.

Esto es importante para que el histórico funcione bien.

---

## No construir por ahora

No construir:

- Login real
- Email/password auth
- Supabase
- Firebase
- Backend pago
- IA
- Features sociales
- Perfiles públicos
- Amigos
- Comentarios
- Likes
- Suscripciones
- Notificaciones
- Analíticas complejas
- Estimación de 1RM
- Medidas corporales
- Nutrición
- Marketplace de ejercicios
- Admin dashboard
- Sync cloud
- Merge complejo de backups

Mantener la app enfocada.

---

## Criterios de aceptación

La app se considera correcta cuando:

- Una persona puede crear un perfil local.
- Una persona puede cambiar de perfil.
- Una persona puede crear una rutina.
- Una persona puede editar una rutina.
- Una persona puede duplicar una rutina.
- Una persona puede eliminar una rutina.
- Una persona puede agregar ejercicios por series.
- Una persona puede agregar ejercicios por tiempo.
- Una persona puede abrir una rutina.
- Los ejercicios se muestran agrupados por Calentamiento, Core y Fuerza.
- Una persona puede comenzar una rutina.
- Una persona puede completar series.
- Una persona puede editar el peso durante el entrenamiento.
- El progreso se guarda incrementalmente.
- Si se refresca/cierra la app, se puede retomar la sesión activa.
- Una persona puede finalizar la rutina.
- La app guarda la sesión de entrenamiento.
- Una persona puede abrir el histórico de un ejercicio.
- Un gráfico de línea muestra la evolución de peso.
- Los datos persisten después de refrescar la app.
- La app funciona offline después de la primera carga.
- La app puede exportar datos locales como JSON.
- La app puede importar datos desde JSON reemplazando los datos actuales con confirmación.
