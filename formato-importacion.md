# Formato JSON para importar rutinas en la app

El import desde JSON está en **Nueva Rutina → Importar desde JSON**.

Se aceptan **dos formatos**. La app detecta automáticamente cuál es.

---

## Formato simple (recomendado)

El más fácil de generar. Sin IDs, sin fechas, solo la rutina y sus ejercicios.

```json
{
  "title": "Tren superior",
  "description": "Empuje y tracción básicos",
  "exercises": [
    {
      "name": "Press banca",
      "short_description": "Barra, pecho",
      "full_description": "Técnica: ...",
      "video_url": "",
      "video_thumbnail_url": "",
      "category": "strength",
      "type": "sets",
      "sets_config": {
        "sets": 4,
        "reps": 10,
        "base_weight": 20
      }
    },
    {
      "name": "Burpees",
      "short_description": "Full body",
      "full_description": "",
      "video_url": "",
      "video_thumbnail_url": "",
      "category": "core",
      "type": "timed",
      "timed_config": {
        "work_seconds": 40,
        "rest_seconds": 20,
        "rounds": 3
      }
    }
  ]
}
```

### Campos

| Campo | Tipo | Obligatorio |
|-------|------|-------------|
| `title` | string | sí |
| `description` | string | no |
| `exercises` | array | no |

### Ejercicio: campos comunes

| Campo | Tipo | Obligatorio |
|-------|------|-------------|
| `name` | string | sí |
| `short_description` | string | no |
| `full_description` | string | no |
| `video_url` | string | no |
| `video_thumbnail_url` | string | no |
| `category` | `"warmup"` / `"core"` / `"strength"` | sí |
| `type` | `"sets"` / `"timed"` | sí |

### Ejercicio por series (`type: "sets"`)

Requiere `sets_config`:

```json
"sets_config": {
  "sets": 4,
  "reps": 10,
  "base_weight": 20
}
```

### Ejercicio por tiempo (`type: "timed"`)

Requiere `timed_config`:

```json
"timed_config": {
  "work_seconds": 40,
  "rest_seconds": 20,
  "rounds": 3
}
```

---

## Formato backup completo

El mismo que genera la exportación desde **Ajustes → Exportar datos**.

La app busca la **primera rutina** del array `routines[]` y extrae sus ejercicios y configs.

```json
{
  "schema_version": 1,
  "exported_at": "2026-06-13T00:00:00.000Z",
  "profiles": [
    {
      "id": "cualquier-id",
      "name": "Eze",
      "created_at": "2026-06-13T00:00:00.000Z",
      "updated_at": "2026-06-13T00:00:00.000Z"
    }
  ],
  "routines": [
    {
      "id": "id-de-la-rutina",
      "profile_id": "id-del-perfil",
      "title": "Tren superior",
      "description": "Empuje y tracción básicos",
      "created_at": "2026-06-13T00:00:00.000Z",
      "updated_at": "2026-06-13T00:00:00.000Z"
    }
  ],
  "routine_images": [],
  "exercises": [
    {
      "id": "id-del-ejercicio",
      "routine_id": "id-de-la-rutina",
      "profile_id": "id-del-perfil",
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
    }
  ],
  "sets_exercise_config": [
    {
      "id": "id-de-config",
      "exercise_id": "id-del-ejercicio",
      "sets": 4,
      "reps": 10,
      "base_weight": 20
    }
  ],
  "timed_exercise_config": [],
  "workout_sessions": [],
  "workout_set_logs": [],
  "workout_timed_logs": []
}
```

Los arrays vacíos son válidos. Los IDs pueden ser cualquier string único.

---

## Categorías válidas

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

## Notas

- No hace falta incluir `workout_sessions`, `workout_set_logs` ni `workout_timed_logs` si solo querés cargar rutinas.
- La importación **agrega** la rutina a los datos existentes (no borra nada).
- Los IDs y fechas los genera la app automáticamente cuando usás el formato simple.
