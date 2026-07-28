import type { components } from "./schema";

// --- Auth & User ---
export type UserResponse = components["schemas"]["UserResponse"];

// --- Exercises ---
export type ExerciseResponse = components["schemas"]["ExerciseResponse"];
export type ExerciseCreate = components["schemas"]["ExerciseCreate"];

// --- Plans ---
export type WorkoutPlanResponse = components["schemas"]["WorkoutPlanResponse"];
export type WorkoutPlanCreate = components["schemas"]["WorkoutPlanCreate"];
export type WorkoutPlanUpdate = components["schemas"]["WorkoutPlanUpdate"];
export type PlanExerciseResponse = components["schemas"]["PlanExerciseResponse"];

// --- Workouts & Sessions ---
export type SessionStatus = components["schemas"]["SessionStatus"];
export type WorkoutSessionResponse = components["schemas"]["WorkoutSessionResponse"];
export type WorkoutSessionCreate = components["schemas"]["WorkoutSessionCreate"];
export type WorkoutSessionUpdate = components["schemas"]["WorkoutSessionUpdate"];

export type WorkoutSetResponse = components["schemas"]["WorkoutSetResponse"];
export type WorkoutSetCreate = components["schemas"]["WorkoutSetCreate"];
