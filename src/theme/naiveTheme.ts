import { computed } from 'vue'
import {  themeParams, useSignal } from '@tma.js/sdk-vue'
import type { GlobalThemeOverrides } from 'naive-ui'

export function useNaiveTheme() {
  const tp = useSignal(themeParams.state);
  // console.log(tp);

  const themeOverrides = computed<GlobalThemeOverrides>(() => ({
    common: {
      primaryColor: tp.value.button_color,
      primaryColorHover: tp.value.button_color,
      primaryColorPressed: tp.value.button_color,
      textColorBase: tp.value.text_color,
      textColor2: tp.value.hint_color,
      cardColor: tp.value.bg_color,
      bodyColor: tp.value.secondary_bg_color,
      borderColor: tp.value.hint_color
    },

    Button: {
      textColor: tp.value.button_text_color,
      colorHover: tp.value.button_color,
      colorPressed: tp.value.button_color
    },

    Input: {
      textColor: tp.value.text_color,
      borderHover: tp.value.hint_color,
      borderFocus: tp.value.button_color
    },

    Select: {
      peers: {
        InternalSelection: {
          textColor: tp.value.text_color
        }
      }
    }
  }))

  return { themeOverrides }
}
