<script setup lang="ts">
import { ref, watch } from "vue";
import { showToast } from "vant";
import { Icon } from "@iconify/vue";
import { exercisesApi, type ExerciseCatalogItem } from "@/shared/api/exercises";
import { triggerHaptic } from "@/shared/utils/haptic";

export interface ExerciseModalOutput {
  client_id?: string;
  exercise_id: number;
  exercise_name: string;
  sets: string;
  reps: string;
  weight: string;
  note: string;
}

export interface ExerciseModalInitialData {
  client_id?: string;
  exercise_id?: number;
  name: string;
  sets: string;
  reps: string;
  weight?: string;
  note?: string;
}

const props = defineProps<{
  show: boolean;
  initialData?: ExerciseModalInitialData | null;
}>();

const emit = defineEmits<{
  (e: "update:show", value: boolean): void;
  (e: "save", data: ExerciseModalOutput): void;
}>();

// Поля формы
const modalForm = ref({
  name: "",
  sets: "",
  reps: "",
  weight: "",
  note: "",
});

const selectedExerciseId = ref<number | null>(null);
const exerciseSuggestions = ref<ExerciseCatalogItem[]>([]);
const isSearching = ref(false);
const isCreating = ref(false);

let searchTimeout: ReturnType<typeof setTimeout>;

// Синхронизация данных при открытии модалки
watch(
  () => props.show,
  (isOpen) => {
    if (isOpen) {
      if (props.initialData) {
        modalForm.value = {
          name: props.initialData.name || "",
          sets: props.initialData.sets || "",
          reps: props.initialData.reps || "",
          weight: props.initialData.weight || "",
          note: props.initialData.note || "",
        };
        selectedExerciseId.value = props.initialData.exercise_id || null;
      } else {
        modalForm.value = { name: "", sets: "", reps: "", weight: "", note: "" };
        selectedExerciseId.value = null;
      }
      exerciseSuggestions.value = [];
    }
  }
);

// Логика поиска с дебаунсом 300мс
function onNameInput(val: string) {
  selectedExerciseId.value = null; // Сбрасываем при ручном изменении текста
  clearTimeout(searchTimeout);

  if (!val.trim()) {
    exerciseSuggestions.value = [];
    return;
  }

  searchTimeout = setTimeout(async () => {
    isSearching.value = true;
    try {
      exerciseSuggestions.value = await exercisesApi.search(val.trim());
    } catch (e) {
      console.error("Ошибка при поиске упражнений:", e);
    } finally {
      isSearching.value = false;
    }
  }, 300);
}

function selectSuggestion(item: ExerciseCatalogItem) {
  triggerHaptic("light");
  modalForm.value.name = item.name;
  selectedExerciseId.value = item.id;
  exerciseSuggestions.value = [];
}

function closeModal() {
  emit("update:show", false);
}

async function handleSave() {
  const nameTrimmed = modalForm.value.name.trim();

  if (!nameTrimmed) {
    triggerHaptic("medium");
    showToast({ message: "Введите название упражнения", position: "top" });
    return;
  }

  let finalExerciseId = selectedExerciseId.value;

  // Если юзер ввел название и НЕ выбрал готовый вариант из автокомплита
  if (!finalExerciseId) {
    try {
      isCreating.value = true;
      // 1. Проверяем точное совпадение в локальном поиске
      const found = await exercisesApi.search(nameTrimmed);
      const exactMatch = found.find(
        (ex) => ex.name.toLowerCase() === nameTrimmed.toLowerCase()
      );

      if (exactMatch) {
        finalExerciseId = exactMatch.id;
      } else {
        // 2. Создаем новое кастомное упражнение в справочнике (ExerciseCreate -> ExerciseResponse)
        const created = await exercisesApi.create({ name: nameTrimmed });
        finalExerciseId = created.id;
      }
    } catch (e: any) {
      const errorMsg =
        e?.response?.data?.detail || "Не удалось сохранить упражнение в базу";
      showToast({ message: errorMsg, position: "top" });
      return;
    } finally {
      isCreating.value = false;
    }
  }

  triggerHaptic("medium");

  emit("save", {
    client_id: props.initialData?.client_id,
    exercise_id: finalExerciseId,
    exercise_name: nameTrimmed,
    sets: modalForm.value.sets.trim(),
    reps: modalForm.value.reps.trim(),
    weight: modalForm.value.weight.trim(),
    note: modalForm.value.note.trim(),
  });

  closeModal();
}
</script>

<template>
  <van-popup
    :show="show"
    position="bottom"
    round
    class="exercise-popup"
    @update:show="closeModal"
  >
    <div class="popup-content">
      <div class="popup-header">
        <h3 class="popup-title">
          {{ initialData ? "Редактировать упражнение" : "Новое упражнение" }}
        </h3>
        <button class="popup-close-btn" @click="closeModal">
          <Icon icon="mdi:close" width="20" height="20" />
        </button>
      </div>

      <div class="popup-body">
        <!-- Название с автокомплитом -->
        <div class="modal-field">
          <label class="modal-label">Название *</label>
          <div class="autocomplete-wrapper">
            <van-cell-group inset class="modal-form-group">
              <van-field
                v-model="modalForm.name"
                placeholder="Начните вводить (например: Жим)"
                clearable
                class="app-input"
                @update:model-value="onNameInput"
              />
            </van-cell-group>

            <!-- Выпадающий список вариантов -->
            <div
              v-if="exerciseSuggestions.length > 0"
              class="suggestions-dropdown"
            >
              <div
                v-for="item in exerciseSuggestions"
                :key="item.id"
                v-ripple
                class="suggestion-item"
                @click="selectSuggestion(item)"
              >
                <span class="suggestion-name">{{ item.name }}</span>
                <span v-if="item.category" class="suggestion-category">
                  {{ item.category }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-row">
          <div class="modal-field col">
            <label class="modal-label">Подходы</label>
            <van-cell-group inset class="modal-form-group">
              <van-field
                v-model="modalForm.sets"
                placeholder="3-4"
                class="app-input"
              />
            </van-cell-group>
          </div>

          <div class="modal-field col">
            <label class="modal-label">Повторения / Время</label>
            <van-cell-group inset class="modal-form-group">
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
          <van-cell-group inset class="modal-form-group">
            <van-field
              v-model="modalForm.weight"
              placeholder="Например: 60 кг"
              class="app-input"
            />
          </van-cell-group>
        </div>

        <div class="modal-field">
          <label class="modal-label">Заметка к упражнению</label>
          <van-cell-group inset class="modal-form-group">
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
          :disabled="isCreating"
          @click="handleSave"
        >
          <span v-if="!isCreating">
            {{ initialData ? "Сохранить изменения" : "Добавить в план" }}
          </span>
          <span v-else>Сохранение...</span>
        </button>
      </div>
    </div>
  </van-popup>
</template>

<style scoped>
.exercise-popup {
  background: var(--tg-theme-bg-color, #1c1c1e) !important;
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

.modal-form-group {
  margin: 0 !important;
  border-radius: 12px !important;
  overflow: hidden;
  background: var(--tg-theme-secondary-bg-color, #2c2c2e) !important;
}

.app-input {
  background: transparent !important;
  padding: 12px 14px !important;
}

:deep(.van-field__control) {
  color: var(--tg-theme-text-color, #fff) !important;
  font-size: 15px;
}

/* Автокомплит */
.autocomplete-wrapper {
  position: relative;
}

.suggestions-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: var(--tg-theme-secondary-bg-color, #2c2c2e);
  border-radius: 12px;
  max-height: 180px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.suggestion-item {
  padding: 10px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  border-bottom: 0.5px solid rgba(255, 255, 255, 0.05);
}

.suggestion-item:last-child {
  border-bottom: none;
}

.suggestion-name {
  font-size: 14px;
  color: var(--tg-theme-text-color, #fff);
}

.suggestion-category {
  font-size: 11px;
  color: var(--tg-theme-hint-color, #8e8e93);
  background: rgba(255, 255, 255, 0.06);
  padding: 2px 6px;
  border-radius: 4px;
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

.submit-modal-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
