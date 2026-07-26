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

interface ExerciseItem {
  id: string;
  name: string;
  sets: string;
  reps: string;
  weight?: string;
  note?: string;
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

// Реактивные состояния
const name = ref("");
const description = ref("");
const selectedColor = ref(COLORS[0]);
const exercises = ref<ExerciseItem[]>([]);

// Состояние модального окна добавления/редактирования упражнения
const showExerciseModal = ref(false);
const editingExerciseId = ref<string | null>(null);

// Поля формы внутри модалки
const modalForm = ref({
  name: "",
  sets: "",
  reps: "",
  weight: "",
  note: "",
});

onMounted(() => {
  if (isEditing.value) {
    name.value = "Силовая А";
    description.value = "Грудь + Трицепс";
    selectedColor.value = COLORS[1];
    exercises.value = [
      {
        id: "1",
        name: "Жим штанги лежа",
        sets: "4",
        reps: "8-10",
        weight: "80 кг",
      },
      {
        id: "2",
        name: "Разводка гантелей",
        sets: "3",
        reps: "12",
        weight: "16 кг",
      },
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

// Открытие модалки для НОВОГО упражнения
function openAddExerciseModal() {
  triggerHaptic("light");
  editingExerciseId.value = null;
  modalForm.value = { name: "", sets: "", reps: "", weight: "", note: "" };
  showExerciseModal.value = true;
}

// Открытие модалки для РЕДАКТИРОВАНИЯ существующего
function openEditExerciseModal(exercise: ExerciseItem) {
  triggerHaptic("light");
  editingExerciseId.value = exercise.id;
  modalForm.value = {
    name: exercise.name,
    sets: exercise.sets,
    reps: exercise.reps,
    weight: exercise.weight || "",
    note: exercise.note || "",
  };
  showExerciseModal.value = true;
}

// Сохранение упражнения из модалки в список
function saveExerciseFromModal() {
  if (!modalForm.value.name.trim()) {
    triggerHaptic("medium");
    showToast({ message: "Введите название упражнения", position: "top" });
    return;
  }

  triggerHaptic("medium");

  if (editingExerciseId.value) {
    // Обновляем существующее
    const index = exercises.value.findIndex(
      (e) => e.id === editingExerciseId.value
    );
    if (index !== -1) {
      exercises.value[index] = {
        id: editingExerciseId.value,
        name: modalForm.value.name.trim(),
        sets: modalForm.value.sets.trim(),
        reps: modalForm.value.reps.trim(),
        weight: modalForm.value.weight.trim(),
        note: modalForm.value.note.trim(),
      };
    }
  } else {
    // Добавляем новое
    exercises.value.push({
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: modalForm.value.name.trim(),
      sets: modalForm.value.sets.trim(),
      reps: modalForm.value.reps.trim(),
      weight: modalForm.value.weight.trim(),
      note: modalForm.value.note.trim(),
    });
  }

  showExerciseModal.value = false;
}

function removeExercise(id: string, e: Event) {
  e.stopPropagation(); // Чтобы не открывалась модалка редактирования при клике на корзину
  triggerHaptic("medium");
  exercises.value = exercises.value.filter((ex) => ex.id !== id);
}

// Drag & Drop haptics
function onDragStart() {
  triggerHaptic("light");
}
function onDragEnd() {
  triggerHaptic("light");
}

function handleSavePlan() {
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

  triggerHaptic("medium");
  showToast({
    message: isEditing.value ? "План обновлен" : "План создан",
    type: "success",
  });
  router.back();
}

// Telegram MainButton
onMounted(() => {
  if (mainButton.isMounted()) {
    mainButton.setText(
      isEditing.value ? "Сохранить изменения" : "Создать план"
    );
    mainButton.enable();
    mainButton.show();
    mainButton.onClick(handleSavePlan);
  }
});

onUnmounted(() => {
  if (mainButton.isMounted()) {
    mainButton.offClick(handleSavePlan);
    mainButton.hide();
  }
});
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

      <!-- Компактный список упражнений в едином van-cell-group -->
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

        <!-- Пустое состояние -->
        <div
          v-if="exercises.length === 0"
          class="empty-exercises"
          @click="openAddExerciseModal"
        >
          <Icon icon="mdi:dumbbell" width="28" height="28" />
          <span>Нажмите, чтобы добавить упражнение</span>
        </div>

        <!-- Единый плашечный блок под упражнения -->
        <van-cell-group v-else inset class="exercises-group">
          <draggable
            v-model="exercises"
            item-key="id"
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
                <!-- Левая иконка перетаскивания (Handle) -->
                <div class="drag-handle" @click.stop>
                  <Icon icon="mdi:drag-vertical" width="22" height="22" />
                </div>

                <!-- Основной текст -->
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

                <!-- Кнопка удаления -->
                <button
                  type="button"
                  class="remove-btn"
                  @click="removeExercise(exercise.id, $event)"
                >
                  <Icon icon="mdi:trash-can-outline" width="18" height="18" />
                </button>
              </div>
            </template>
          </draggable>
        </van-cell-group>
      </div>
    </div>

    <!-- Telegram BottomSheet (Нижняя шторка добавления/редактирования) -->
    <van-popup
      v-model:show="showExerciseModal"
      position="bottom"
      round
      class="exercise-popup"
    >
      <div class="popup-content">
        <div class="popup-header">
          <h3 class="popup-title">
            {{
              editingExerciseId
                ? "Редактировать упражнение"
                : "Новое упражнение"
            }}
          </h3>
          <button class="popup-close-btn" @click="showExerciseModal = false">
            <Icon icon="mdi:close" width="20" height="20" />
          </button>
        </div>

        <div class="popup-body">
          <div class="modal-field">
            <label class="modal-label">Название *</label>
            <van-cell-group inset class="form-group">
              <van-field
                v-model="modalForm.name"
                placeholder="Например: Жим штанги лежа"
                clearable
                class="app-input"
              />
            </van-cell-group>
          </div>

          <div class="modal-row">
            <div class="modal-field col">
              <label class="modal-label">Подходы</label>
              <van-cell-group inset class="form-group">
                <van-field
                  v-model="modalForm.sets"
                  placeholder="3-4"
                  class="app-input"
                />
              </van-cell-group>
            </div>

            <div class="modal-field col">
              <label class="modal-label">Повторения / Время</label>
              <van-cell-group inset class="form-group">
                <van-field
                  v-model="modalForm.reps"
                  placeholder="8-12"
                  class="app-input"
                />
              </van-cell-group>
            </div>
          </div>

          <div class="modal-field">
            <label class="modal-label">Целевой вес (опционально)</label>
            <van-cell-group inset class="form-group">
              <van-field
                v-model="modalForm.weight"
                placeholder="Например: 60 кг"
                class="app-input"
              />
            </van-cell-group>
          </div>

          <div class="modal-field">
            <label class="modal-label">Заметка к упражнению</label>
            <van-cell-group inset class="form-group">
              <van-field
                v-model="modalForm.note"
                type="textarea"
                rows="2"
                autosize
                placeholder="Например: Локти близко к корпусу"
                class="app-input"
              />
            </van-cell-group>
          </div>

          <button
            v-ripple
            type="button"
            class="submit-modal-btn"
            @click="saveExerciseFromModal"
          >
            {{ editingExerciseId ? "Сохранить изменения" : "Добавить в план" }}
          </button>
        </div>
      </div>
    </van-popup>
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
  transition: transform 0.15s ease;
}

.color-circle--selected {
  border-color: #ffffff;
  transform: scale(1.08);
}

/* --- Единая группа упражнений Vant --- */
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

/* --- Нативная анимация перетаскивания (iOS / Telegram) --- */
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

/* --- Telegram BottomSheet --- */
.exercise-popup {
  background: var(--tg-theme-secondary-bg-color, #1c1c1e) !important;
  max-height: 85vh;
}

.popup-content {
  padding: 20px 16px 28px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.popup-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--tg-theme-text-color, #ffffff);
  margin: 0;
}

.popup-close-btn {
  background: rgba(255, 255, 255, 0.08);
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--tg-theme-hint-color, #8e8e93);
  cursor: pointer;
}

.popup-body {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.modal-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.modal-row {
  display: flex;
  gap: 10px;
}

.modal-row .col {
  flex: 1;
}

.modal-label {
  font-size: 12px;
  color: var(--tg-theme-hint-color, #8e8e93);
  font-weight: 500;
}

.submit-modal-btn {
  margin-top: 8px;
  width: 100%;
  height: 46px;
  border-radius: 12px;
  border: none;
  background: var(--tg-theme-button-color, #3390ec);
  color: var(--tg-theme-button-text-color, #ffffff);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
}
</style>
