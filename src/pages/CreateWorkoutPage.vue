<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { showToast } from "vant";
import { mainButton } from "@tma.js/sdk-vue";
import { Icon } from "@iconify/vue";
import draggable from "vuedraggable";

import AppPage from "@/components/AppPage.vue";
import ScreenHeader from "@/components/ScreenHeader.vue";
import ExerciseModal, {
  type ExerciseModalOutput,
  type ExerciseModalInitialData,
} from "@/components/ExerciseModal.vue";
import { triggerHaptic } from "@/shared/utils/haptic";
import { usePlansStore } from "@/stores/plans";
import type { WorkoutPlanCreate } from "@/shared/api/types";

// Локальный тип элемента в списке тренировочного плана
interface WorkoutPlanExerciseItem {
  client_id: string; // Локальный ID элемента для Vue (vuedraggable, key)
  exercise_id: number; // ID из справочника (соответствует PlanExerciseBase.exercise_id)
  name: string; // Название для UI (из справочника)
  sets: string;
  reps: string;
  weight?: string;
  note?: string;
}

const router = useRouter();
const route = useRoute();
const plansStore = usePlansStore();

const planId = computed(() => {
  const id = route.params.id;
  return id ? Number(id) : null;
});
const isEditing = computed(() => planId.value !== null && !isNaN(planId.value));

const COLORS = [
  "#3390ec",
  "#ff9500",
  "#34c759",
  "#ff3b30",
  "#af52de",
  "#ff2d55",
  "#5ac8fa",
  "#8e8e93",
];

// Реактивные состояния формы
const name = ref("");
const description = ref("");
const selectedColor = ref(COLORS[0]);
const exercises = ref<WorkoutPlanExerciseItem[]>([]);

// Состояние модального окна
const showExerciseModal = ref(false);
const editingExerciseData = ref<ExerciseModalInitialData | null>(null);

  // В CreateWorkoutPlanPage.vue

const mainButtonText = computed(() => {
  if (showExerciseModal.value) {
    return editingExerciseData.value ? "Сохранить упражнение" : "Добавить в план";
  }
  return isEditing.value ? "Сохранить изменения" : "Создать план";
});

function setupParentMainButton() {
  if (!mainButton.isMounted()) return;

  // 1. Всегда сначала отвязываем ВСЕ возможные хендлеры страницы
  mainButton.offClick(handleSavePlan);

  // 2. Настраиваем внешка
  mainButton.setText(mainButtonText.value);
  mainButton.disableShineEffect();
  mainButton.enable();
  mainButton.show();

  // 3. Привязываем хендлер
  mainButton.onClick(handleSavePlan);
}

// Следим за открытием/закрытием модалки
watch(showExerciseModal, (isOpen) => {
  if (!isOpen) {
    // Когда модалка КЛОЗИТСЯ — возвращаем управление родителю
    setupParentMainButton();
  } else {
    // Когда модалка ОТКРЫВАЕТСЯ — гарантированно снимаем хендлер родителя
    if (mainButton.isMounted()) {
      mainButton.offClick(handleSavePlan);
    }
  }
});

// Следим за изменением текста (например, если сменился isEditing)
watch(mainButtonText, (newText) => {
  if (mainButton.isMounted() && !showExerciseModal.value) {
    mainButton.setText(newText);
  }
});

onMounted(async () => {
  if (isEditing.value && planId.value) {
    const plan = await plansStore.getPlanById(planId.value);
    if (plan) {
      name.value = plan.name;
      description.value = plan.description || "";
      selectedColor.value = plan.color || COLORS[0];

      if (plan.plan_exercises?.length) {
        exercises.value = plan.plan_exercises.map((ex, idx) => ({
          client_id: ex.id ? String(ex.id) : `${Date.now()}-${idx}`,
          exercise_id: ex.exercise_id,
          name: ex.exercise ? ex.exercise.name : "Упражнение",
          sets: ex.sets ?? "",
          reps: ex.reps ?? "",
          weight: ex.weight ?? "",
          note: ex.note ?? "",
        }));
      }
    }
  }

  // Первичная инициализация
  setupParentMainButton();
});

onUnmounted(() => {
  if (mainButton.isMounted()) {
    mainButton.offClick(handleSavePlan);
    mainButton.hide();
  }
});

// Восстанавливаем кнопку родителя при закрытии модалки
// watch(showExerciseModal, (isOpen) => {
//   if (!isOpen) {
//     setupParentMainButton();
//   }
// });

function handleGoBack() {
  triggerHaptic("light");
  router.back();
}

function selectColor(color: string) {
  triggerHaptic("light");
  selectedColor.value = color;
}

// Открытие модалки для НОВОГО упражнения
function openAddExerciseModal() {
  triggerHaptic("light");
  editingExerciseData.value = null;
  showExerciseModal.value = true;
}

// Открытие модалки для РЕДАКТИРОВАНИЯ
function openEditExerciseModal(exercise: WorkoutPlanExerciseItem) {
  triggerHaptic("light");
  editingExerciseData.value = {
    client_id: exercise.client_id,
    exercise_id: exercise.exercise_id,
    name: exercise.name,
    sets: exercise.sets,
    reps: exercise.reps,
    weight: exercise.weight,
    note: exercise.note,
  };
  showExerciseModal.value = true;
}

// Прием сохраненных данных из модалки
function handleSaveExerciseFromModal(data: ExerciseModalOutput) {
  if (data.client_id) {
    // Обновляем существующий элемент в списке
    const index = exercises.value.findIndex(
      (e) => e.client_id === data.client_id
    );
    if (index !== -1) {
      exercises.value[index] = {
        client_id: data.client_id,
        exercise_id: data.exercise_id,
        name: data.exercise_name,
        sets: data.sets,
        reps: data.reps,
        weight: data.weight,
        note: data.note,
      };
    }
  } else {
    // Добавляем новый элемент в список
    exercises.value.push({
      client_id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      exercise_id: data.exercise_id,
      name: data.exercise_name,
      sets: data.sets,
      reps: data.reps,
      weight: data.weight,
      note: data.note,
    });
  }
}

function removeExercise(clientId: string, e: Event) {
  e.stopPropagation();
  triggerHaptic("medium");
  exercises.value = exercises.value.filter((ex) => ex.client_id !== clientId);
}

function onDragStart() {
  triggerHaptic("light");
}
function onDragEnd() {
  triggerHaptic("light");
}

async function handleSavePlan() {
  if (!name.value.trim()) {
    triggerHaptic("heavy");
    showToast({ message: "Введите название плана", position: "top" });
    return;
  }

  if (exercises.value.length === 0) {
    triggerHaptic("heavy");
    showToast({ message: "Добавьте хотя бы одно упражнение", position: "top" });
    return;
  }

  // Явное приведение типов под WorkoutPlanCreate
  const payload: WorkoutPlanCreate = {
    name: name.value.trim(),
    description: description.value.trim() || null,
    color: selectedColor.value ?? null,
    exercises: exercises.value.map((ex, index) => ({
      exercise_id: ex.exercise_id,
      sets: ex.sets.trim() || null,
      reps: ex.reps.trim() || null,
      weight: ex.weight?.trim() || null,
      note: ex.note?.trim() || null,
      order: index + 1,
    })),
  };

  try {
    triggerHaptic("medium");

    if (isEditing.value && planId.value) {
      await plansStore.updatePlan(planId.value, payload);
      showToast({ message: "План обновлен", type: "success" });
    } else {
      await plansStore.createPlan(payload);
      showToast({ message: "План создан", type: "success" });
    }

    router.back();
  } catch (error: any) {
    const msg = error?.response?.data?.detail || "Ошибка при сохранении плана";
    showToast({ message: msg, position: "top" });
  }
}


</script>

<template>
  <AppPage title="" :back="false">
    <ScreenHeader
      :title="isEditing ? 'Редактировать план' : 'Новый план'"
      :subtitle="
        isEditing
          ? 'Обновите параметры плана'
          : 'Соберите шаблон своей тренировки'
      "
      :show-back="true"
      @back="handleGoBack"
    />

    <div class="editor-form">
      <!-- Название тренировки -->
      <div class="form-section">
        <label class="form-label">Название плана *</label>
        <van-cell-group inset class="form-group">
          <van-field
            v-model="name"
            placeholder="Например: Силовая А (Грудь + Трицепс)"
            clearable
            class="app-input"
          />
        </van-cell-group>
      </div>

      <!-- Описание -->
      <div class="form-section">
        <label class="form-label">Описание (опционально)</label>
        <van-cell-group inset class="form-group">
          <van-field
            v-model="description"
            type="textarea"
            rows="2"
            autosize
            placeholder="Например: Акцент на верхнюю часть грудных"
            class="app-input"
          />
        </van-cell-group>
      </div>

      <!-- Выбор цвета -->
      <div class="form-section">
        <label class="form-label">Цвет карточки</label>
        <div class="color-picker">
          <button
            v-for="color in COLORS"
            :key="color"
            type="button"
            class="color-circle"
            :class="{ 'color-circle--selected': selectedColor === color }"
            :style="{ backgroundColor: color }"
            @click="selectColor(color)"
          >
            <Icon
              v-if="selectedColor === color"
              icon="mdi:check"
              width="20"
              height="20"
              color="#ffffff"
            />
          </button>
        </div>
      </div>

      <!-- Список упражнений -->
      <div class="form-section">
        <div class="section-header">
          <label class="form-label">Упражнения ({{ exercises.length }})</label>
          <button
            v-ripple
            type="button"
            class="add-btn-link"
            @click="openAddExerciseModal"
          >
            <Icon icon="mdi:plus" width="18" height="18" />
            Добавить
          </button>
        </div>

        <div
          v-if="exercises.length === 0"
          class="empty-exercises"
          @click="openAddExerciseModal"
        >
          <Icon icon="mdi:dumbbell" width="28" height="28" />
          <span>Нажмите, чтобы добавить упражнение</span>
        </div>

        <van-cell-group v-else inset class="exercises-group">
          <draggable
            v-model="exercises"
            item-key="client_id"
            handle=".drag-handle"
            :animation="220"
            ghost-class="drag-ghost"
            drag-class="drag-active"
            chosen-class="drag-chosen"
            class="exercises-list"
            @start="onDragStart"
            @end="onDragEnd"
          >
            <template #item="{ element: exercise }">
              <div
                v-ripple
                class="exercise-row-item"
                @click="openEditExerciseModal(exercise)"
              >
                <div class="drag-handle" @click.stop>
                  <Icon icon="mdi:drag-vertical" width="22" height="22" />
                </div>

                <div class="exercise-info">
                  <span class="exercise-name">{{ exercise.name }}</span>
                  <div class="exercise-sub">
                    <span v-if="exercise.sets">{{ exercise.sets }} подх.</span>
                    <span v-if="exercise.reps"
                      >• {{ exercise.reps }} повт.</span
                    >
                    <span v-if="exercise.weight">• {{ exercise.weight }}</span>
                  </div>
                </div>

                <button
                  type="button"
                  class="remove-btn"
                  @click="removeExercise(exercise.client_id, $event)"
                >
                  <Icon icon="mdi:trash-can-outline" width="18" height="18" />
                </button>
              </div>
            </template>
          </draggable>
        </van-cell-group>
      </div>
    </div>

    <!-- Компонент модалки -->
    <ExerciseModal
      v-model:show="showExerciseModal"
      :initial-data="editingExerciseData"
      @save="handleSaveExerciseFromModal"
    />
  </AppPage>
</template>

<style scoped>
.editor-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 12px;
  padding-bottom: 24px;
}

.form-section {
  display: flex;
  flex-direction: column;
}

.form-label {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--tg-theme-button-color, #3390ec);
  margin-bottom: 8px;
  padding-left: 4px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.section-header .form-label {
  margin-bottom: 0;
}

.add-btn-link {
  background: none;
  border: none;
  color: var(--tg-theme-button-color, #3390ec);
  font-size: 14px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 2px;
  cursor: pointer;
  padding: 2px 6px;
}

.form-group {
  margin: 0 !important;
  border-radius: 14px !important;
  overflow: hidden;
  background: var(--tg-theme-bg-color, #1c1c1e) !important;
}

.app-input {
  background: transparent !important;
  padding: 12px 14px !important;
}

:deep(.van-field__control) {
  color: var(--tg-theme-text-color, #fff) !important;
  font-size: 15px;
}

.color-picker {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.color-circle {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: 2px solid transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.15s ease;
}

.color-circle--selected {
  border-color: #ffffff;
  transform: scale(1.08);
}

.exercises-group {
  margin: 0 !important;
  border-radius: 14px !important;
  overflow: hidden;
  background: var(--tg-theme-bg-color, #1c1c1e) !important;
}

.exercises-list {
  display: flex;
  flex-direction: column;
}

.exercise-row-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  background: var(--tg-theme-bg-color, #1c1c1e);
  cursor: pointer;
  position: relative;
  user-select: none;
  -webkit-user-select: none;
  border-bottom: 0.5px solid rgba(255, 255, 255, 0.08);
}

.exercise-row-item:last-child {
  border-bottom: none;
}

.drag-handle {
  color: var(--tg-theme-hint-color, #8e8e93);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  touch-action: none;
  padding: 2px;
}

.exercise-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.exercise-name {
  font-size: 15px;
  font-weight: 500;
  color: var(--tg-theme-text-color, #ffffff);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.exercise-sub {
  font-size: 12px;
  color: var(--tg-theme-hint-color, #8e8e93);
  display: flex;
  gap: 4px;
}

.remove-btn {
  background: transparent;
  color: var(--tg-theme-hint-color, #8e8e93);
  border: none;
  padding: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 6px;
}

.remove-btn:active {
  color: #ff3b30;
}

.empty-exercises {
  background: var(--tg-theme-bg-color, #1c1c1e);
  border: 1px dashed var(--tg-theme-hint-color, #8e8e93);
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--tg-theme-hint-color, #8e8e93);
  font-size: 13px;
  cursor: pointer;
}

.drag-chosen {
  background: var(--tg-theme-secondary-bg-color, #2c2c2e) !important;
}

.drag-ghost {
  opacity: 0.15 !important;
  background: var(--tg-theme-secondary-bg-color, #000000) !important;
}

.drag-active {
  opacity: 0.98;
  transform: scale(1.03) !important;
  border-radius: 12px !important;
  border-bottom: none !important;
  background: var(--tg-theme-bg-color, #2c2c2e) !important;
  box-shadow:
    0 14px 28px rgba(0, 0, 0, 0.4),
    0 6px 10px rgba(0, 0, 0, 0.25) !important;
  z-index: 99999 !important;
}

.exercises-list > * {
  transition: transform 0.22s cubic-bezier(0.2, 0, 0, 1) !important;
}
</style>
