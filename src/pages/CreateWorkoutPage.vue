<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from "vue";
import { useRouter, useRoute } from "vue-router";
import { showToast } from "vant";
import {
  mainButton,
  secondaryButton,
  miniApp,
  themeParams,
} from "@tma.js/sdk-vue";
import { Icon } from "@iconify/vue";
import draggable from "vuedraggable";

import AppPage from "@/components/AppPage.vue";
import ScreenHeader from "@/components/ScreenHeader.vue";
import ExerciseModal, {
  type ExerciseModalOutput,
  type ExerciseModalInitialData,
} from "@/components/ExerciseModal.vue";
import IconColorPickerModal from "@/components/IconColorPickerModal.vue";
import { triggerHaptic } from "@/shared/utils/haptic";
import { usePlansStore } from "@/stores/plans";
import { useWorkoutStore } from "@/stores/workouts";
import type { WorkoutPlanCreate } from "@/shared/api/types";

// Локальный тип элемента в списке тренировочного плана
interface WorkoutPlanExerciseItem {
  client_id: string;
  exercise_id: number;
  name: string;
  sets: string;
  reps: string;
  weight?: string;
  note?: string;
}

const router = useRouter();
const route = useRoute();
const plansStore = usePlansStore();
const workoutStore = useWorkoutStore();


const planId = computed(() => {
  const id = route.params.id;
  return id ? Number(id) : null;
});

// Существует ли план в базе
const isExistingPlan = computed(
  () => planId.value !== null && !isNaN(planId.value),
);

// Состояние режима: true = редактирование/создание, false = просмотр
const isEditMode = ref(!isExistingPlan.value);

// Определяем режим страницы: создание, редактирование или просмотр
const pageMode = computed<"create" | "edit" | "view">(() => {
  if (!isExistingPlan.value) return "create";
  return isEditMode.value ? "edit" : "view";
});

// Динамический заголовок экрана
// const headerTitle = computed(() => {
//   switch (pageMode.value) {
//     case "create":
//       return "Новый план";
//     case "edit":
//       return "Редактирование";
//     case "view":
//       return name.value || "План тренировки";
//   }
// });

// // Динамический подзаголовок
// const headerSubtitle = computed(() => {
//   switch (pageMode.value) {
//     case "create":
//       return "Настройка упражнений и подходов";
//     case "edit":
//       return "Изменение структуры плана";
//     case "view":
//       return "Обзор тренировки";
//   }
// });

// Цвета для выбора карточки плана
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
const isIconColorModalOpen = ref(false);

const planForm = ref({
  color: "#3390ec",
  icon: "lucide:dumbbell"
});

function openIconColorModal() {
  triggerHaptic("light");
  isIconColorModalOpen.value = true;
}

function handleIconColorSave(data: { icon: string; color: string }) {
  planForm.value.icon = data.icon;
  planForm.value.color = data.color;

  selectColor(data.color);
}

// --- Настройка MainButton & SecondaryButton ---

function setupButtons() {
  if (!mainButton.isMounted() || !secondaryButton.isMounted()) return;

  // Очищаем старые обработчики
  mainButton.offClick(handleMainButtonClick);
  secondaryButton.offClick(handleSecondaryButtonClick);

  miniApp.setBottomBarColor("secondary_bg_color");
  const appBgColor = themeParams.bgColor() || "#1c1c1e";
  const buttonTextColor = themeParams.buttonColor() || "#3390ec";
  secondaryButton.setBgColor(appBgColor as `#${string}`);
  secondaryButton.setTextColor(buttonTextColor as `#${string}`);

  switch (pageMode.value) {
    case "view":
      mainButton.setText("Начать тренировку");
      mainButton.enableShineEffect();
      mainButton.enable();
      mainButton.show();

      secondaryButton.setText("Редактировать");
      secondaryButton.setParams({ position: "left" });

      secondaryButton.enable();
      secondaryButton.show();
      break;

    case "edit":
      mainButton.setText("Сохранить");
      mainButton.disableShineEffect();
      mainButton.enable();
      mainButton.show();

      secondaryButton.setText("Отмена");
      secondaryButton.setParams({ position: "left" });
      // secondaryButton.setBgColor(appBgColor as `#${string}`);
      secondaryButton.enable();
      secondaryButton.show();
      break;

    case "create":
      mainButton.setText("Создать план");
      mainButton.disableShineEffect();
      mainButton.enable();
      mainButton.show();

      secondaryButton.hide();
      break;
  }

  mainButton.onClick(handleMainButtonClick);
  secondaryButton.onClick(handleSecondaryButtonClick);
}

// Следим за изменением состояния страницы
watch(pageMode, () => {
  setupButtons();
});

// Следим за состоянием модального окна (скрываем secondaryButton при открытии)
watch(showExerciseModal, (isOpen) => {
  if (isOpen) {
    miniApp.setBottomBarColor("bg_color");
    if (mainButton.isMounted()) mainButton.offClick(handleMainButtonClick);
    if (secondaryButton.isMounted()) secondaryButton.hide();
  } else {
    setupButtons();
  }
});

watch(isIconColorModalOpen, async (isOpen) => {
  if (isOpen) {
    miniApp.setBottomBarColor("bg_color");
    if (mainButton.isMounted()) mainButton.offClick(handleMainButtonClick);
    if (secondaryButton.isMounted()) secondaryButton.hide();
  } else {
    await nextTick();
    setupButtons();
  }
});

// Следим за переключением режима просмотр / редактирование
// watch(isEditMode, () => {
//   setupButtons();
// });

// --- Обработчики нажатий кнопок Telegram ---

async function handleMainButtonClick() {
  triggerHaptic("medium");

  if (pageMode.value === "view") {
    // СТАРТ ТРЕНИРОВКИ
    if (!planId.value) return;
    try {
      if (mainButton.isMounted()) mainButton.showLoader();
      const session = await workoutStore.startWorkoutFromPlan(planId.value);
      router.push(`/workouts/${session.id}`);
    } catch (e) {
      showToast({ message: "Не удалось начать тренировку", position: "top" });
      console.error("Ошибка старта тренировки:", e);
    } finally {
      if (mainButton.isMounted()) mainButton.hideLoader();
    }
  } else {
    // СОХРАНЕНИЕ (при 'create' или 'edit')
    await handleSavePlan();
  }
}

function handleSecondaryButtonClick() {
  triggerHaptic("light");

  if (pageMode.value === "view") {
    // Включаем редактирование
    isEditMode.value = true;
  } else if (pageMode.value === "edit") {
    // Отменяем изменения и возвращаемся в view
    isEditMode.value = false;
    loadPlanData();
  }
}

async function loadPlanData() {
  if (isExistingPlan.value && planId.value) {
    const plan = await plansStore.getPlanById(planId.value);
    if (plan) {
      name.value = plan.name;
      description.value = plan.description || "";
      selectedColor.value = plan.color || COLORS[0];
      planForm.value.color = plan.color || COLORS[0]!;
      planForm.value.icon = plan.icon || "lucide:dumbbell";

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
}

onMounted(async () => {
  await loadPlanData();
  setupButtons();
});

onUnmounted(() => {
  if (mainButton.isMounted()) {
    mainButton.offClick(handleMainButtonClick);
    mainButton.hideLoader();
    mainButton.hide();
  }
  if (secondaryButton.isMounted()) {
    secondaryButton.offClick(handleSecondaryButtonClick);
    secondaryButton.hide();
  }
});

function handleGoBack() {
  triggerHaptic("light");
  router.back();
}

function selectColor(color: string) {
  triggerHaptic("light");
  selectedColor.value = color;
}

function openAddExerciseModal() {
  triggerHaptic("light");
  editingExerciseData.value = null;
  showExerciseModal.value = true;
}

function openEditExerciseModal(exercise: WorkoutPlanExerciseItem) {
  if (!isEditMode.value) return; // Редактировать упражнение можно только в режиме редактирования
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

function handleSaveExerciseFromModal(data: ExerciseModalOutput) {
  if (data.client_id) {
    const index = exercises.value.findIndex(
      (e) => e.client_id === data.client_id,
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

  const payload: WorkoutPlanCreate = {
    name: name.value.trim(),
    description: description.value.trim() || null,
    color: planForm.value.color || selectedColor.value || "#3390ec",
    icon: planForm.value.icon || "lucide:dumbbell",
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
    if (mainButton.isMounted()) {
      mainButton.showLoader();
      mainButton.disable();
    }

    if (isExistingPlan.value && planId.value) {
      await plansStore.updatePlan(planId.value, payload);
      showToast({ message: "План обновлен", type: "success" });
      await loadPlanData();
      isEditMode.value = false; // Переводим обратно в режим просмотра
    } else {
      await plansStore.createPlan(payload);
      showToast({ message: "План создан", type: "success" });
      router.back();
    }
  } catch (error: unknown) {
    const msg = (error as { response?: { data?: { detail?: string } } })?.response?.data?.detail || "Ошибка при сохранении плана";
    showToast({ message: msg, position: "top" });
  } finally {
    if (mainButton.isMounted()) {
      mainButton.hideLoader();
      mainButton.enable();
    }
  }
}
</script>

<template>
  <AppPage title="" :back="false">
    <!-- Крупная иконка карточки плана (в самом верху, над ScreenHeader) -->
    <div class="plan-hero-avatar-wrapper">
      <div
        class="plan-hero-avatar"
        :style="{ backgroundColor: selectedColor || '#3390ec' }"
      >
        <Icon :icon="planForm.icon || 'lucide:dumbbell'" width="48" height="48" color="#ffffff" />

        <button
          v-if="pageMode !== 'view'"
          type="button"
          class="avatar-edit-btn"
          @click="openIconColorModal"
        >
          <Icon icon="mdi:pencil" width="16" height="16" color="#ffffff" />
        </button>
      </div>
    </div>

    <ScreenHeader v-if="pageMode === 'view'"
      :title="name"
      :subtitle="description || ''"
      @back="handleGoBack"
    />

    <!-- ========================================== -->
    <!-- 1. РЕЖИМ ПРОСМОТРА (VIEW MODE)             -->
    <!-- ========================================== -->
    <div v-if="pageMode === 'view'" class="view-container">
      <!-- Список упражнений (Static) -->
      <div class="view-section">
        <!-- <div class="view-section-title">Состав тренировки</div> -->

        <div v-if="exercises.length === 0" class="empty-state-view">
          <Icon icon="mdi:format-list-bulleted" width="32" height="32" />
          <span>В этом плане пока нет упражнений</span>
        </div>

        <van-cell-group v-else inset class="view-exercises-group">
          <div
            v-for="(exercise, index) in exercises"
            :key="exercise.client_id"
            class="view-exercise-card"
          >
            <div class="exercise-index">{{ index + 1 }}</div>

            <div class="exercise-main-content">
              <div class="exercise-name">{{ exercise.name }}</div>

              <!-- Нормативы (Подходы / Повторы / Вес) -->
              <div class="exercise-tags">
                <span v-if="exercise.sets" class="exercise-tag">
                  <Icon icon="mdi:repeat" width="14" height="14" />
                  {{ exercise.sets }} подх.
                </span>
                <span v-if="exercise.reps" class="exercise-tag">
                  {{ exercise.reps }} повт.
                </span>
                <span v-if="exercise.weight" class="exercise-tag exercise-tag--highlight">
                  <Icon icon="mdi:weight-kilogram" width="14" height="14" />
                  {{ exercise.weight }}
                </span>
              </div>

              <!-- Заметка к упражнению, если есть -->
              <p v-if="exercise.note" class="exercise-note">
                <Icon icon="mdi:notebook-text-outline" width="14" height="14" />
                {{ exercise.note }}
              </p>
            </div>
          </div>
        </van-cell-group>
      </div>
    </div>

    <!-- ========================================== -->
    <!-- 2. РЕЖИМ РЕДАКТИРОВАНИЯ (EDIT / CREATE)    -->
    <!-- ========================================== -->
    <div v-else class="editor-form">
      <!-- Название тренировки -->
      <div class="form-section">
        <label class="section-header form-label">Название *</label>
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
        <!-- <label class="form-label">Описание (опционально)</label> -->
        <van-cell-group inset class="form-group">
          <van-field
            v-model="description"
            type="textarea"
            rows="2"
            autosize
            placeholder="Описание..."
            class="app-input"
          />
        </van-cell-group>
      </div>

      <!-- Выбор цвета -->
       <!-- TODO: перенести в IconColorPickerModal -->
      <!-- <div class="form-section">
        <label class="form-label">Цвет карточки</label>
        <div class="color-picker">
          <button
            v-for="color in COLORS"
            :key="color"
            type="button"
            class="color-swatch"
            :class="{ 'color-swatch--selected': selectedColor === color }"
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
      </div> -->

      <!-- Список упражнений с Drag & Drop -->
      <div class="form-section">
        <div class="section-header">
          <label class="form-label">Упражнения ({{ exercises.length }})</label>
          <button
            v-if="exercises.length > 0"
            v-ripple
            type="button"
            class="btn-link"
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
                    <span v-if="exercise.reps">• {{ exercise.reps }} повт.</span>
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

    <IconColorPickerModal
      v-model:show="isIconColorModalOpen"
      :initial-data="{ icon: planForm.icon, color: planForm.color }"
      @save="handleIconColorSave"
    />
  </AppPage>
</template>

<style scoped>
.editor-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 12px;
  padding-bottom: 24px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  padding-top: 12px;
  padding-left: 12px;
}

:deep(.van-field__control) {
  color: var(--tg-theme-text-color, #fff) !important;
  font-size: 15px;
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

/* Контейнер для центрирования плашки с иконкой*/
.plan-hero-avatar-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  padding-top: 12px;
  padding-bottom: 8px;
}

/* Квадратная карточка-аватар с закруглёнными углами */
.plan-hero-avatar {
position: relative !important;
  width: 96px;
  height: 96px;
  border-radius: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
  transition: background-color 0.25s ease, transform 0.2s ease;
  flex-shrink: 0;
}

/* Плавающая кнопка редактирования в правом нижнем углу */
.avatar-edit-btn {
  position: absolute !important;
  right: -6px;
  bottom: -6px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--tg-theme-button-color, #3390ec);
  border: 3px solid var(--tg-theme-bg-color, #1c1c1e);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  padding: 0;
  transition: transform 0.15s ease, background-color 0.2s ease;
}

.avatar-edit-btn:active {
  transform: scale(0.9);
}

/* --- Стили для режима просмотра (View Mode) --- */
.view-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-bottom: 20px;
}

/* Герой-карточка (Hero Block) */
.plan-card-hero {
  background: var(--tg-theme-bg-color, #1c1c1e);
  border-radius: 14px;
  padding: 12px 14px;
  border-left: 3px solid var(--accent-color, #3390ec);
}

.plan-hero-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.plan-color-badge {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.plan-hero-titles {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.plan-hero-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--tg-theme-text-color, #ffffff);
  margin: 0;
  line-height: 1.2;
}

.plan-hero-count {
  font-size: 12px;
  color: var(--tg-theme-hint-color, #8e8e93);
}

.plan-hero-desc {
  margin: 8px 0 0;
  font-size: 13px;
  line-height: 1.35;
  color: var(--tg-theme-text-color, #ffffff);
  opacity: 0.8;
}

/* Секция списка упражнений */
.view-section {
  display: flex;
  flex-direction: column;
  background-color: var(--tg-theme-bg-color);
  border-radius: 14px !important;
}

.view-section-title {
  font-size: 12px;
  font-weight: 600;
  /* text-transform: uppercase; */
  letter-spacing: 0.5px;
  color: var(--tg-theme-accent-text-color, #8e8e93);
  margin-bottom: 6px;
  padding-top: 12px;
  padding-left: 12px;
}

.view-exercises-group {
  margin: 0 !important;
  border-radius: 14px !important;
  background: var(--tg-theme-bg-color, #1c1c1e) !important;
  overflow: hidden;
}

/* Компактная строчка упражнения */
.view-exercise-card {
  display: flex;
  align-items: center; /* Центрируем всё в одну плотную строку */
  gap: 10px;
  padding: 8px 12px;  /* Уменьшенный вертикальный padding для плотности */
  border-bottom: 1px solid var(--tg-theme-secondary-bg-color, #1c1c1e);
}

.view-exercise-card:last-child {
  border-bottom: none;
}

/* Номер упражнения */
.exercise-index {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.06);
  color: var(--tg-theme-hint-color, #8e8e93);
  font-size: 11px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.exercise-main-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.exercise-name {
  font-size: 14px;
  font-weight: 600;
  line-height: 1.25;
  color: var(--tg-theme-text-color, #ffffff);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Тэги / Нормативы */
.exercise-tags {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
}

.exercise-tag {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 1px 6px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.05);
  font-size: 11px;
  font-weight: 500;
  color: var(--tg-theme-hint-color, #8e8e93);
  line-height: 1.4;
}

.exercise-tag--highlight {
  color: var(--tg-theme-button-color, #3390ec);
  background: rgba(51, 144, 236, 0.12);
}

/* Заметка */
.exercise-note {
  margin: 1px 0 0;
  font-size: 11px;
  color: var(--tg-theme-hint-color, #8e8e93);
  display: flex;
  align-items: center;
  gap: 3px;
  font-style: italic;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.empty-state-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 24px 16px;
  background: var(--tg-theme-bg-color, #1c1c1e);
  border-radius: 14px;
  color: var(--tg-theme-hint-color, #8e8e93);
  font-size: 13px;
}
</style>
