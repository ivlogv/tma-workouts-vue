import type { Directive } from "vue";

export const vRipple: Directive = {
  mounted(el: HTMLElement) {
    el.style.position = "relative";
    el.style.overflow = "hidden";

    const handlePress = (e: MouseEvent | TouchEvent) => {
      // Игнорируем зажатие правой кнопки мыши
      if (e instanceof MouseEvent && e.button !== 0) return;

      const rect = el.getBoundingClientRect();

      // Безопасное извлечение координат
      const touch = "touches" in e ? e.touches[0] : null;
      const clientX = touch ? touch.clientX : (e as MouseEvent).clientX;
      const clientY = touch ? touch.clientY : (e as MouseEvent).clientY;

      const circle = document.createElement("span");
      const diameter = Math.max(rect.width, rect.height);
      const radius = diameter / 2;

      circle.style.width = circle.style.height = `${diameter}px`;
      circle.style.left = `${clientX - rect.left - radius}px`;
      circle.style.top = `${clientY - rect.top - radius}px`;
      circle.classList.add("v-ripple-effect");

      const oldRipple = el.querySelector(".v-ripple-effect");
      if (oldRipple) oldRipple.remove();

      el.appendChild(circle);

      // Плавно растворяем волну при отпускании пальца/скролле
      const clearRipple = () => {
        circle.style.opacity = "0";
        circle.style.transition = "opacity 0.4s ease-out";
        setTimeout(() => circle.remove(), 400);

        window.removeEventListener("pointerup", clearRipple);
        window.removeEventListener("pointercancel", clearRipple);
      };

      window.addEventListener("pointerup", clearRipple);
      window.addEventListener("pointercancel", clearRipple);
    };

    el.addEventListener("pointerdown", handlePress);
  },
};
