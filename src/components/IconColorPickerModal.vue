<script setup lang="ts">
import { ref, watch, onUnmounted } from "vue";
import { mainButton } from "@tma.js/sdk-vue";
import { Icon } from "@iconify/vue";
import { triggerHaptic } from "@/shared/utils/haptic";

export interface IconColorModalOutput {
  icon: string;
  color: string;
}

export interface IconColorModalInitialData {
  icon?: string;
  color?: string;
}

const props = defineProps<{
  show: boolean;
  initialData?: IconColorModalInitialData | null;
}>();

const emit = defineEmits<{
  (e: "update:show", value: boolean): void;
  (e: "save", payload: IconColorModalOutput): void;
}>();

// Список предустановленных иконок (Lucide / Material Design)
const AVAILABLE_ICONS = [
  "lucide:dumbbell",
  "lucide:biceps-flexed",
  "lucide:flame",
  "lucide:zap",
  "lucide:heart-pulse",
  "lucide:activity",
  "lucide:trophy",
  "lucide:target",
  "lucide:timer",
  "lucide:footprints",
  "lucide:bike",
  "lucide:swords",
];

// Пресеты цветов для карточек
const AVAILABLE_COLORS = [
  "#3390ec", // Telegram Blue
  "#34c759", // Green
  "#ff9500", // Orange
  "#ff3b30", // Red
  "#af52de", // Purple
  "#5856d6", // Indigo
  "#00c7be", // Teal
  "#ff2d55", // Pink
];

const selectedIcon = ref<string>(AVAILABLE_ICONS[0] as string);
const selectedColor = ref<string>(AVAILABLE_COLORS[0] as string);

const DEFAULT_ICON = AVAILABLE_ICONS[0] as string;
const DEFAULT_COLOR = AVAILABLE_COLORS[0] as string;

// Управление MainButton при открытии/закрытии модалки
watch(
  () => props.show,
  (isOpen) => {
    if (isOpen) {
      selectedIcon.value = props.initialData?.icon ?? DEFAULT_ICON;
      selectedColor.value = props.initialData?.color ?? DEFAULT_COLOR;
      setupMainButton();
    } else {
      cleanupMainButton();
    }
  }
);

function setupMainButton() {
  if (mainButton.isMounted()) {
    mainButton.offClick(handleSave);
    mainButton.setText("Сохранить");
    mainButton.enable();
    mainButton.show();

    mainButton.onClick(handleSave);
  }
}

function cleanupMainButton() {
  if (mainButton.isMounted()) {
    mainButton.offClick(handleSave);
  }
}

function closeModal() {
  triggerHaptic("light");
  cleanupMainButton();
  emit("update:show", false);
}

function pickIcon(icon: string) {
  triggerHaptic("light");
  selectedIcon.value = icon;
}

function pickColor(color: string) {
  triggerHaptic("light");
  selectedColor.value = color;
}

function handleSave() {
  triggerHaptic("medium");
  emit("save", {
    icon: selectedIcon.value,
    color: selectedColor.value,
  });
  closeModal();
}

onUnmounted(() => {
  cleanupMainButton();
});
</script>

<template>
  <van-popup
    :show="show"
    position="bottom"
    round
    class="icon-color-popup"
    @update:show="closeModal"
    @click-overlay="closeModal"
  >
    <div class="popup-content">
      <div class="popup-header">
        <h3 class="popup-title">Иконка и цвет</h3>
        <button class="popup-close-btn" @click="closeModal">
          <Icon icon="mdi:close" width="20" height="20" />
        </button>
      </div>

      <div class="popup-body">
        <!-- Превью аватара -->
        <div class="preview-container">
          <div
            class="avatar-preview"
            :style="{ backgroundColor: selectedColor }"
          >
            <Icon :icon="selectedIcon" width="44" height="44" color="#ffffff" />
          </div>
        </div>

        <!-- Выбор иконки -->
        <div class="modal-field">
          <label class="modal-label">Выберите иконку</label>
          <div class="grid-selector">
            <button
              v-for="icon in AVAILABLE_ICONS"
              :key="icon"
              type="button"
              class="grid-item icon-item"
              :class="{ active: selectedIcon === icon }"
              @click="pickIcon(icon)"
            >
              <Icon :icon="icon" width="24" height="24" />
            </button>
          </div>
        </div>

        <!-- Выбор цвета -->
        <div class="modal-field">
          <label class="modal-label">Цвет оформления</label>
          <div class="grid-selector color-grid">
            <button
              v-for="color in AVAILABLE_COLORS"
              :key="color"
              type="button"
              class="grid-item color-item"
              :class="{ active: selectedColor === color }"
              :style="{ backgroundColor: color }"
              @click="pickColor(color)"
            >
              <Icon
                v-if="selectedColor === color"
                icon="mdi:check"
                width="18"
                height="18"
                color="#ffffff"
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  </van-popup>
</template>

<style scoped>
.icon-color-popup {
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
  gap: 16px;
}

/* Превью */
.preview-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 8px 0;
}

.avatar-preview {
  width: 80px;
  height: 80px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
  transition: background-color 0.2s ease, transform 0.2s ease;
}

.modal-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.modal-label {
  font-size: 12px;
  color: var(--tg-theme-accent-text-color, #8e8e93);
  font-weight: 500;
}

/* Сетка выбора */
.grid-selector {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 10px;
}

.grid-item {
  aspect-ratio: 1;
  border-radius: 12px;
  border: none;
  background: var(--tg-theme-secondary-bg-color, #2c2c2e);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-sizing: border-box;
  outline: none;
  transition: all 0.15s ease;
  -webkit-tap-highlight-color: transparent;
}

/* Стили иконок */
.icon-item {
  color: var(--tg-theme-hint-color, #8e8e93);
}

.icon-item.active {
  background: rgba(255, 255, 255, 0.15);
  color: var(--tg-theme-text-color, #ffffff);
  box-shadow: 0 0 0 2px var(--tg-theme-accent-text-color, #3390ec);
}

/* Стили цвета */
.color-grid {
  /* grid-template-columns: repeat(4, 1fr); */
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.color-item {
  height: 44px;
  width: 44px;
  border-radius: 50%;
  position: relative;
}

.color-item.active {
  box-shadow: 0 0 0 2px #ffffff;
}
</style>
