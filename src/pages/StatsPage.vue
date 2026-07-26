<script setup lang="ts">
import { Icon } from "@iconify/vue";
import ScreenHeader from "@/components/ScreenHeader.vue";
import StatCard from "@/components/StatCard.vue";
import AppPage from "@/components/AppPage.vue";

</script>

<template>
  <AppPage title="" :back="true">
    <!-- Использование переиспользуемого ScreenHeader -->
    <ScreenHeader title="Аналитика и прогресс" show-back @back="$router.back()" />

    <main class="stats-content">
      <!-- Использование переиспользуемого StatCard -->
      <section class="summary-grid">
        <StatCard
          icon="lucide:weight"
          label="Поднятый вес"
          :value="12.4"
          unit="тонн"
        />
        <StatCard
          icon="lucide:dumbbell"
          label="Тренировок"
          :value="18"
          unit="всего"
        />
        <StatCard
          icon="lucide:target"
          label="Цель месяца"
          :value="94"
          unit="%"
        />
        <StatCard
          icon="lucide:flame"
          label="Калории"
          :value="8500"
          unit="ккал"
        />
      </section>

      <!-- Плейсхолдер графика -->
      <section class="chart-card">
        <div class="chart-head">
          <span class="chart-title">Динамика объёма</span>
          <span class="badge">За 30 дней</span>
        </div>
        <div class="chart-mock">
          <div class="bar" style="height: 40%"></div>
          <div class="bar" style="height: 65%"></div>
          <div class="bar" style="height: 50%"></div>
          <div class="bar" style="height: 85%"></div>
          <div class="bar active" style="height: 100%"></div>
          <div class="bar" style="height: 70%"></div>
          <div class="bar" style="height: 60%"></div>
        </div>
      </section>

      <!-- Информационный баннер -->
      <section class="info-banner">
        <Icon icon="lucide:sparkles" width="24" height="24" class="banner-icon" />
        <div class="banner-text">
          <h3>Раздел в разработке</h3>
          <p>Скоро здесь появятся детальные графики по каждому упражнению, история рекордов и распределение нагрузки по группам мышц.</p>
        </div>
      </section>
    </main>
  </AppPage>
</template>

<style scoped>
.stats-page {
  min-height: 100vh;
  background-color: var(--tg-theme-bg-color, #000000);
  color: var(--tg-theme-text-color, #ffffff);
  padding: 16px;
  box-sizing: border-box;
}

.stats-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 12px;
}

/* Сетка карточек статистики */
.summary-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

/* График */
.chart-card {
  background: var(--tg-theme-bg-color, #1c1c1e);
  border-radius: 12px;
  padding: 16px;
}

.chart-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.chart-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--tg-theme-text-color, #ffffff);
}

.badge {
  font-size: 11px;
  background: rgba(255, 255, 255, 0.08);
  padding: 4px 8px;
  border-radius: 20px;
  color: var(--tg-theme-hint-color, #8e8e93);
}

.chart-mock {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  height: 110px;
  padding: 0 4px;
}

.bar {
  width: 10%;
  background: rgba(255, 255, 255, 0.12);
  border-radius: 4px;
  transition: height 0.3s ease;
}

.bar.active {
  background: var(--tg-theme-button-color, #3390ec);
}

/* Баннер будущих функций */
.info-banner {
  background: color-mix(in srgb, var(--tg-theme-button-color, #3390ec) 10%, transparent);
  border: 1px dashed color-mix(in srgb, var(--tg-theme-button-color, #3390ec) 30%, transparent);
  border-radius: 12px;
  padding: 14px 16px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.banner-icon {
  color: var(--tg-theme-button-color, #3390ec);
  flex-shrink: 0;
  margin-top: 2px;
}

.banner-text h3 {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--tg-theme-text-color, #ffffff);
}

.banner-text p {
  margin: 0;
  font-size: 12px;
  color: var(--tg-theme-hint-color, #8e8e93);
  line-height: 1.4;
}
</style>
