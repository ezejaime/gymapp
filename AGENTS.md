# AGENTS.md

## Proyecto

Este proyecto es una PWA local-first para rutinas de gimnasio.

La app está pensada inicialmente para uso privado de dos personas, pero debe estar arquitecturada para poder migrar a backend/cloud más adelante sin rehacer la UI.

La especificación principal vive en:

```txt
SPEC.md
```

El plan de implementación por fases vive en:

```txt
IMPLEMENTATION_PLAN.md
```

Antes de implementar cualquier cambio, leer ambos archivos.

---

## Idioma de la app

Toda la interfaz visible para la persona usuaria debe estar en español de Argentina.

Usar tono claro, simple y natural.

Ejemplos:

- “Elegí un perfil”
- “Crear perfil”
- “Mis rutinas”
- “Nueva rutina”
- “Comenzar rutina”
- “Finalizar rutina”
- “No tenés rutinas todavía”
- “Guardá los cambios”
- “Esto no se puede deshacer”

Evitar español neutro artificial.

No usar:

- “Elige”
- “Tienes”
- “Guarda”
- “Eliminado exitosamente”

Los nombres internos del código pueden estar en inglés.

---

## Stack

Usar:

- React
- Vite
- TypeScript
- Tailwind CSS
- Dexie.js
- IndexedDB
- React Router
- vite-plugin-pwa
- Recharts
- Vitest

No usar:

- Supabase
- Firebase
- Backend pago
- Auth real
- Features sociales
- IA
- Notificaciones
- Suscripciones

---

## Arquitectura obligatoria

No llamar a Dexie directamente desde componentes.

Todo acceso a datos debe pasar por una capa de repositories.

Carpeta esperada:

```txt
src/db/
  localDb.ts
  profileRepository.ts
  routineRepository.ts
  exerciseRepository.ts
  workoutRepository.ts
  backupRepository.ts
```

La UI debe llamar a hooks o helpers que usen esos repositories.

El objetivo es poder reemplazar IndexedDB por backend/cloud más adelante sin rehacer la UI.

---

## Regla de dominio principal

Una rutina es una plantilla.

Una sesión de entrenamiento es lo que realmente pasó durante el entrenamiento.

No sobrescribir datos base de la rutina cuando la persona modifica valores durante una sesión.

Ejemplo:

- La rutina guarda el peso base.
- La sesión guarda el peso real usado ese día.

El histórico debe calcularse desde logs de sesión, no desde la rutina.

---

## Sesión activa

La sesión activa debe persistirse incrementalmente en IndexedDB.

No guardar todo recién al tocar “Finalizar rutina”.

Durante una sesión activa, persistir:

- Series completadas
- Pesos editados
- Rondas completadas
- Estado de temporizadores
- Hora de inicio
- Última actualización

Si la app se cierra o se refresca, al volver debe ofrecer:

```txt
Tenés una rutina en curso

[Retomar]
[Descartar]
```

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

## Imágenes

Guardar imágenes de portada como Blob en IndexedDB.

Renderizar con `URL.createObjectURL`.

Cuando corresponda, liberar memoria con:

```ts
URL.revokeObjectURL(objectUrl);
```

No guardar imágenes grandes como base64 salvo que sea estrictamente necesario.

---

## Importación y exportación

Para el MVP, la importación de datos debe ser por reemplazo total.

No implementar merge complejo.

Exportar:

- Descargar todo el contenido local como JSON.
- Incluir `schema_version`.
- Incluir `exported_at`.

Importar:

- Validar estructura básica.
- Mostrar confirmación clara antes de importar.
- Reemplazar todos los datos locales actuales con los datos importados.

Texto de confirmación sugerido:

```txt
Esto va a reemplazar todos los datos actuales. No se puede deshacer.
```

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

## Flujo de trabajo obligatorio

Trabajar por fases.

No implementar más de una fase por vez salvo que el usuario lo pida explícitamente.

Después de cada fase:

1. Correr typecheck.
2. Correr tests.
3. Correr build.
4. Corregir errores.
5. Entregar resumen.

Comandos esperados, ajustar si el package.json usa otros nombres:

```bash
npm run typecheck
npm test
npm run build
```

Si falta alguno de estos scripts, crearlo o explicar claramente por qué no existe.

---

## Modo planner / worker / reviewer

Usar tres roles lógicos en cada fase.

### Planner

Responsabilidades:

- Leer `SPEC.md`.
- Leer `IMPLEMENTATION_PLAN.md`.
- Usar GitHits para groundear decisiones técnicas no triviales contra ejemplos reales, documentación o evidencia de repositorios open source cuando aplique.
- Identificar el alcance exacto de la fase actual.
- Crear un plan corto.
- Listar archivos que probablemente se van a tocar.
- Identificar riesgos antes de escribir código.
- Dejar explicitado en el plan qué evidencia de GitHits se usó, o indicar que no aplicaba por ser una decisión puramente local del proyecto.

El planner no debe implementar código.

### Worker

Responsabilidades:

- Implementar solamente la fase actual.
- Mantener el scope cerrado.
- No agregar features fuera de fase.
- Mantener componentes pequeños.
- Mantener código tipado.
- Respetar arquitectura de repositories.
- Mantener textos de UI en español de Argentina.

### Reviewer

Responsabilidades:

- Revisar que la implementación cumpla `SPEC.md`.
- Revisar que no haya scope creep.
- Usar GitHits para contrastar decisiones o patrones implementados cuando haya dudas técnicas, riesgo de arquitectura, uso de librerías o APIs externas.
- Groundear el resumen del reviewer con la evidencia de GitHits usada, o indicar que no hizo falta porque la revisión fue puramente local.
- Revisar tipos, tests y build.
- Revisar bugs obvios de estado.
- Revisar que no se llame Dexie desde componentes.
- Revisar que no se hayan introducido dependencias no pedidas.
- Pedir correcciones antes de cerrar la fase.

En OpenCode, usar agentes/subagentes si están configurados.

En Codex CLI, simular estos roles dentro del mismo agente con secciones explícitas:

```txt
Planner:
Worker:
Reviewer:
```

---

## Criterios para cerrar una fase

Una fase no está terminada hasta que:

- El scope de la fase está implementado.
- No se implementaron features fuera de fase.
- Typecheck pasa.
- Tests pasan.
- Build pasa.
- El reviewer dejó un resumen.
- El resumen incluye:
  - Qué se hizo
  - Qué archivos se tocaron
  - Qué quedó pendiente
  - Qué comandos se corrieron
  - Si hubo decisiones técnicas importantes

---

## Estilo de implementación

Priorizar:

- Simplicidad
- Código legible
- Tipos claros
- Funciones chicas
- Estado explícito
- Datos persistidos correctamente
- Mobile-first
- UI sobria

Evitar:

- Abstracciones prematuras
- Librerías innecesarias
- Soluciones mágicas
- Componentes enormes
- Lógica de negocio mezclada con UI
- Implementar features futuras antes de tiempo

---

## Si hay dudas

No inventar grandes decisiones de producto.

Tomar la opción más simple compatible con `SPEC.md`.

Si la duda bloquea la implementación, dejarla explicitada en el resumen de fase.
