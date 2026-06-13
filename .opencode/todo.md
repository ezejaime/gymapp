# Mission: Seguimiento - Calendar de progreso

## M1: Backend - workoutRepository | status: completed
### S1.1: Añadir getFinishedSessionsByProfile
- [x] Add function getFinishedSessionsByProfile(profileId: string): Promise<WorkoutSession[]>
- [x] Filter by status === "finished", sort by started_at desc

### S1.2: Añadir getSessionCompletion
- [x] Add function getSessionCompletion(sessionId: string): Promise<{ total: number; completed: number; percent: number }>
- [x] Count all WorkoutSetLogs + WorkoutTimedLogs for session
- [x] Count completed ones, calculate percentage

### S1.3: Tests
- [x] Write tests for both new functions in workoutRepository.test.ts

## M2: useProgreso hook | status: completed
### S2.1: Create hook
- [x] Create src/hooks/useProgreso.ts
- [x] Load finished sessions via getFinishedSessionsByProfile
- [x] Calculate completion per session via getSessionCompletion
- [x] Group by date (YYYY-MM-DD from finished_at)
- [x] Load routine title + description for each session (via routineRepository)
- [x] Return: Map<dateString, { session, routine, completion }>

## M3: ProgresoPage | status: completed
### S3.1: Create page
- [x] Create src/pages/ProgresoPage.tsx
- [x] Month calendar grid (7 columns: D L M M J V S)
- [x] Navigation prev/next month
- [x] Color dots: orange <50%, yellow >=50%, green 100%
- [x] Bottom modal/banner on dot tap: title + description + X close
- [x] Styling mobile-first with Tailwind

## M4: Router + Navigation | status: completed
### S4.1: Add route
- [x] Add /progreso route in router.tsx

### S4.2: Add link in RoutinesPage
- [x] Add "Progreso" button/link between Ajustes and Cambiar

## M5: Verify | status: completed
### S5.1: Typecheck + Tests + Build
- [x] tsc -b passes
- [x] npm test (32/32 pass)
- [x] npm run build passes
