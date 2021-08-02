import Vue from 'vue'
import colorSchemeComponent from './color-scheme'

Vue.component('<%= options.componentName %>', colorSchemeComponent)

export default function (ctx, inject) {
  const preference = '<%= options.preference %>'

  const colorMode = {
    preference,
    value: preference,
    unknown: true,
    forced: false
  }

  if (ctx.route.matched[0]) {
    const pageColorMode = ctx.route.matched[0].components.default.options.colorMode
    if (pageColorMode && pageColorMode !== 'system') {
      colorMode.value = pageColorMode
      colorMode.forced = true

      ctx.app.head.bodyAttrs = ctx.app.head.bodyAttrs || {}
      ctx.app.head.bodyAttrs['data-color-mode-forced'] = pageColorMode
    } else if (pageColorMode === 'system') {
      console.warn('You cannot force the colorMode to system at the page level.')
    }
  }

  ctx.beforeNuxtRender(({ nuxtState }) => {
    nuxtState.colorMode = colorMode
  })

  inject('colorMode', colorMode)
}
