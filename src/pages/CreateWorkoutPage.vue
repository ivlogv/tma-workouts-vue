<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { showToast } from "vant";
import { mainButton } from "@tma.js/sdk-vue";
import { Icon } from "@iconify/vue";
import draggable from "vuedraggable";

import AppPage from "@/components/AppPage.vue";
import ScreenHeader from "@/components/ScreenHeader.vue";
import { triggerHaptic } from "@/shared/utils/haptic";

interface ExerciseInput {
  id: string;
  name: string;
  sets: string;
  reps: string;
}

const router = useRouter();
const route = useRoute();

const planId = computed(() => route.params.id as string | undefined);
const isEditing = computed(() => !!planId.value);

const COLORS = [
  "#3390ec", // Telegram Blue
  "#ff9500", // Orange
  "#34c759", // Green
  "#ff3b30", // Red
  "#af52de", // Purple
  "#ff2d55", // Pink
  "#5ac8fa", // Cyan
  "#8e8e93", // Gray
];

// Реактивные состояния полей
const name = ref("");
const description = ref("");
const selectedColor = ref(COLORS[0]);
const exercises = ref<ExerciseInput[]>([
  { id: "1", name: "", sets: "", reps: "" },
]);

// Инициализация при редактировании (моковые данные)
onMounted(() => {
  if (isEditing.value) {
    name.value = "Силовая А";
    description.value = "Грудь + Трицепс";
    selectedColor.value = COLORS[1];
    exercises.value = [
      { id: "1", name: "Жим штанги лежа", sets: "4", reps: "8-10" },
      { id: "2", name: "Разводка гантелей", sets: "3", reps: "12" },
    ];
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

function addExercise() {
  triggerHaptic("light");
  const newId = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  exercises.value.push({ id: newId, name: "", sets: "", reps: "" });
}

function removeExercise(id: string) {
  triggerHaptic("medium");
  if (exercises.value.length > 1) {
    exercises.value = exercises.value.filter((e) => e.id !== id);
  }
}

// --- Обработчики Drag & Drop ---
function onDragStart() {
  triggerHaptic("medium"); // Виброотклик при подхвате элемента
}

function onDragEnd() {
  triggerHaptic("light"); // Легкий отклик при отпускании
}

function handleSave() {
  if (!name.value.trim()) {
    triggerHaptic("heavy");
    showToast({ message: "Введите название плана", position: "top" });
    return;
  }

  const validExercises = exercises.value.filter((e) => e.name.trim());
  if (validExercises.length === 0) {
    triggerHaptic("heavy");
    showToast({ message: "Добавьте хотя бы одно упражнение", position: "top" });
    return;
  }

  triggerHaptic("medium");

  const payload = {
    id: planId.value || String(Date.now()),
    name: name.value.trim(),
    description: description.value.trim(),
    color: selectedColor.value,
    exercises: validExercises.map((e) => ({
      id: e.id,
      name: e.name.trim(),
      sets: e.sets.trim(),
      reps: e.reps.trim(),
    })),
  };

  console.log("Saving plan payload:", payload);

  showToast({
    message: isEditing.value ? "План обновлен" : "План создан",
    type: "success",
  });

  router.back();
}

// --- Telegram MainButton ---
onMounted(() => {
  if (mainButton.isMounted()) {
    mainButton.setText(isEditing.value ? "Сохранить изменения" : "Создать план");
    mainButton.enable();
    mainButton.show();
    mainButton.onClick(handleSave);
  }
});

onUnmounted(() => {
  if (mainButton.isMounted()) {
    mainButton.offClick(handleSave);
    mainButton.hide();
  }
});
</script>

<template>
  <AppPage title="" :back="false">
    <ScreenHeader
      :title="isEditing ? 'Редактировать план' : 'Новый план'"
      :subtitle="isEditing ? 'Обновите упражнения и параметры' : 'Соберите шаблон своей тренировки'"
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

      <!-- Описание (Опционально) -->
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

      <!-- Список упражнений с Drag and Drop -->
      <div class="form-section">
        <div class="section-header">
          <label class="form-label">Упражнения</label>
          <button v-ripple type="button" class="add-btn-link" @click="addExercise">
            <Icon icon="mdi:plus" width="18" height="18" />
            Добавить
          </button>
        </div>

        <draggable
          v-model="exercises"
          item-key="id"
          handle=".drag-handle"
          animation="200"
          ghost-class="drag-ghost"
          drag-class="drag-active"
          class="exercises-list"
          @start="onDragStart"
          @end="onDragEnd"
        >
          <template #item="{ element: exercise, index }">
            <div class="exercise-item-card">
              <!-- Поле ввода названия и кнопка удаления -->
              <div class="exercise-row-top">
                <div class="drag-handle">
                  <Icon icon="mdi:drag-vertical" width="22" height="22" />
                </div>

                <div class="exercise-name-input">
                  <input
                    v-model="exercise.name"
                    type="text"
                    :placeholder="`Упражнение #${index + 1}`"
                    class="custom-input"
                  />
                </div>

                <button
                  v-if="exercises.length > 1"
                  type="button"
                  class="remove-btn"
                  @click="removeExercise(exercise.id)"
                >
                  <Icon icon="mdi:trash-can-outline" width="18" height="18" />
                </button>
              </div>

              <!-- Поля подходов и повторений -->
              <div class="exercise-row-bottom">
                <div class="input-col">
                  <input
                    v-model="exercise.sets"
                    type="text"
                    placeholder="Подходы"
                    class="custom-input"
                  />
                </div>

                <div class="input-col">
                  <input
                    v-model="exercise.reps"
                    type="text"
                    placeholder="Повторения / Время, c"
                    class="custom-input"
                  />
                </div>
              </div>
            </div>
          </template>
        </draggable>
      </div>
    </div>
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
  color: var(--tg-theme-button-color, #8e8e93);
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
  border-radius: 6px;
}

/* Vant Field кастомизация */
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

/* Выбор цвета */
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
  transition: transform 0.15s ease, border-color 0.15s ease;
}

.color-circle:active {
  transform: scale(0.9);
}

.color-circle--selected {
  border-color: #ffffff;
  transform: scale(1.08);
}

/* Карточка упражнения */
.exercises-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.exercise-item-card {
  background: var(--tg-theme-bg-color, #1c1c1e);
  border-radius: 14px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  will-change: transform;
}

.exercise-row-top {
  display: flex;
  align-items: center;
  gap: 8px;
}

.drag-handle {
  color: var(--tg-theme-hint-color, #8e8e93);
  display: flex;
  align-items: center;
  cursor: grab;
  padding: 4px;
  touch-action: none; /* Предотвращает скролл страницы при захвате иконки на смартфоне */
}

.drag-handle:active {
  cursor: grabbing;
}

.exercise-name-input {
  flex: 1;
}

.remove-btn {
  background: rgba(255, 59, 48, 0.12);
  color: #ff3b30;
  border: none;
  width: 34px;
  height: 34px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
}

.exercise-row-bottom {
  display: flex;
  gap: 10px;
  padding-left: 38px; /* Выравнивание по линии текстового инпута с учетом иконки drag */
}

.input-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* Кастомные инпуты */
.custom-input {
  width: 100%;
  box-sizing: border-box;
  background: var(--tg-theme-secondary-bg-color, #000000);
  border: 1px solid var(--tg-theme-secondary-bg-color, #8e8e93);
  border-radius: 8px;
  padding: 8px 10px;
  font-size: 14px;
  color: var(--tg-theme-text-color, #ffffff);
  outline: none;
}

.custom-input::placeholder {
  color: var(--tg-theme-hint-color, #8e8e93);
}

.custom-input::-webkit-input-placeholder {
  color: var(--tg-theme-hint-color, #8e8e93);
}

/* --- Стили для Drag and Drop --- */
/* Элемент-полупрозрачный пустой блок на старом месте */
.drag-ghost {
  opacity: 0.3;
  border: 2px dashed var(--tg-theme-button-color, #3390ec);
  background: transparent !important;
}

/* Перетаскиваемый карточка под пальцем */
.drag-active {
  opacity: 0.95;
  transform: scale(1.02);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
  z-index: 999;
}
</style>
