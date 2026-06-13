# Formato JSON para importar rutinas en la app

## Estructura raíz

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

## Perfil

```json
{
  "id": "un-id-unico",
  "name": "Eze",
  "created_at": "2026-06-13T00:00:00.000Z",
  "updated_at": "2026-06-13T00:00:00.000Z"
}
```

## Rutina

```json
{
  "id": "un-id-unico",
  "profile_id": "mismo-id-del-perfil",
  "title": "Nombre de la rutina",
  "description": "Descripción",
  "created_at": "2026-06-13T00:00:00.000Z",
  "updated_at": "2026-06-13T00:00:00.000Z"
}
```

Si tiene imagen de portada, agregar: `"cover_image_blob_id": "id-del-blob"` y el blob en `routine_images`.

## Ejercicio por series

En `exercises`:

```json
{
  "id": "un-id-unico",
  "routine_id": "id-de-la-rutina",
  "profile_id": "id-del-perfil",
  "name": "Press banca",
  "short_description": "Descripción corta",
  "full_description": "Descripción larga",
  "video_url": "",
  "video_thumbnail_url": "",
  "category": "strength",
  "type": "sets",
  "sort_order": 0,
  "created_at": "2026-06-13T00:00:00.000Z",
  "updated_at": "2026-06-13T00:00:00.000Z"
}
```

En `sets_exercise_config`:

```json
{
  "id": "un-id-unico",
  "exercise_id": "id-del-ejercicio",
  "sets": 4,
  "reps": 10,
  "base_weight": 20
}
```

## Ejercicio por tiempo

En `exercises` (misma estructura, cambia `type`):

```json
{
  "id": "un-id-unico",
  "routine_id": "id-de-la-rutina",
  "profile_id": "id-del-perfil",
  "name": "Burpees",
  "short_description": "Full body",
  "full_description": "",
  "video_url": "",
  "video_thumbnail_url": "",
  "category": "core",
  "type": "timed",
  "sort_order": 1,
  "created_at": "2026-06-13T00:00:00.000Z",
  "updated_at": "2026-06-13T00:00:00.000Z"
}
```

En `timed_exercise_config`:

```json
{
  "id": "un-id-unico",
  "exercise_id": "id-del-ejercicio",
  "work_seconds": 40,
  "rest_seconds": 20,
  "rounds": 3
}
```

## Categorias válidas

| Valor | Label |
|-------|-------|
| `"warmup"` | Calentamiento |
| `"core"` | Core |
| `"strength"` | Fuerza |

## Tipos válidos

| Valor | Label |
|-------|-------|
| `"sets"` | Por series |
| `"timed"` | Por tiempo |

## Reglas

- `sort_order` arranca en 0 y va subiendo. El orden en la app sigue este campo.
- Las fechas siempre en ISO string (`new Date().toISOString()`).
- Los `id` pueden ser cualquier string único (UUIDs, números, lo que sea).
- La importación **reemplaza todos los datos locales**, no hace merge.
- Los arrays vacíos son válidos.
- `workout_sessions`, `workout_set_logs` y `workout_timed_logs` son para historial de entrenamiento, no hace incluirlos si solo se quiere cargar rutinas.

## Ejemplo completo mínimo (una rutina con dos ejercicios)

```json
{
  "schema_version": 1,
  "exported_at": "2026-06-13T00:00:00.000Z",
  "profiles": [
    {
      "id": "perfil-1",
      "name": "Eze",
      "created_at": "2026-06-13T00:00:00.000Z",
      "updated_at": "2026-06-13T00:00:00.000Z"
    }
  ],
  "routines": [
    {
      "id": "rutina-1",
      "profile_id": "perfil-1",
      "title": "Tren superior",
      "description": "Empuje y tracción básicos",
      "created_at": "2026-06-13T00:00:00.000Z",
      "updated_at": "2026-06-13T00:00:00.000Z"
    }
  ],
  "routine_images": [],
  "exercises": [
    {
      "id": "ej-1",
      "routine_id": "rutina-1",
      "profile_id": "perfil-1",
      "name": "Press banca",
      "short_description": "Barra, pecho",
      "full_description": "",
      "video_url": "",
      "video_thumbnail_url": "",
      "category": "strength",
      "type": "sets",
      "sort_order": 0,
      "created_at": "2026-06-13T00:00:00.000Z",
      "updated_at": "2026-06-13T00:00:00.000Z"
    },
    {
      "id": "ej-2",
      "routine_id": "rutina-1",
      "profile_id": "perfil-1",
      "name": "Plancha",
      "short_description": "Core",
      "full_description": "",
      "video_url": "",
      "video_thumbnail_url": "",
      "category": "core",
      "type": "timed",
      "sort_order": 1,
      "created_at": "2026-06-13T00:00:00.000Z",
      "updated_at": "2026-06-13T00:00:00.000Z"
    }
  ],
  "sets_exercise_config": [
    {
      "id": "config-1",
      "exercise_id": "ej-1",
      "sets": 4,
      "reps": 10,
      "base_weight": 20
    }
  ],
  "timed_exercise_config": [
    {
      "id": "config-2",
      "exercise_id": "ej-2",
      "work_seconds": 40,
      "rest_seconds": 20,
      "rounds": 3
    }
  ],
  "workout_sessions": [],
  "workout_set_logs": [],
  "workout_timed_logs": []
}
```
