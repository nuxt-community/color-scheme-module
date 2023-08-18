// @ts-nocheck
// Add dark / light detection that runs before loading Nuxt
(() => {
  // Global variable minimizers
  const w = window
  const d = document
  const de = d.documentElement

  const knownColorSchemes = ['dark', 'light']

  const preference = (window && window.localStorage && window.localStorage.getItem && window.localStorage.getItem('<%= options.storageKey %>')) || '<%= options.preference %>'

  /* Backticks are needed to proper escape quotes in options.themeColors.
     Using ES template literals instead of "interpolate" delimiter (lodash)
     is needed to preserve the backticks in the minify process
     */
  const metaThemeColors = JSON.parse(`${options.themeColors}`)

  // Get previous meta element if the script is run the second time (e.g. in dev mode)
  let metaElementThemeColor = d.head.querySelector('meta[name=theme-color]')
  let value = preference === 'system' ? getColorScheme() : preference
  // Applied forced color mode
  const forcedColorMode = de.getAttribute('data-color-mode-forced')
  if (forcedColorMode) {
    value = forcedColorMode
  }

  addColorScheme(value)

  w['<%= options.globalName %>'] = {
    preference,
    value,
    getColorScheme,
    addColorScheme,
    removeColorScheme
  }

  function addColorScheme (value) {
    const className = '<%= options.classPrefix %>' + value + '<%= options.classSuffix %>'
    const dataValue = '<%= options.dataValue %>'
    if (de.classList) {
      de.classList.add(className)
    } else {
      de.className += ' ' + className
    }
    if (dataValue) {
      de.setAttribute('data-' + dataValue, value)
    }

    // theme-color refers to a meta attribute which indicates a
    // suggested color user agents can use to customize the interface
    // more info: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta/name/theme-color
    const currentMetaThemeColor = metaThemeColors?.[value]
    if (currentMetaThemeColor) {
      if (!metaElementThemeColor) {
        metaElementThemeColor = d.createElement('meta')
        metaElementThemeColor.name = 'theme-color'
      }
      metaElementThemeColor.content = currentMetaThemeColor
      if (metaElementThemeColor.parentNode !== d.head) {
        d.head.appendChild(metaElementThemeColor)
      }
    } else if (metaElementThemeColor?.parentNode) {
      metaElementThemeColor.parentNode.removeChild(metaElementThemeColor)
    }
  }

  function removeColorScheme (value) {
    const className = '<%= options.classPrefix %>' + value + '<%= options.classSuffix %>'
    const dataValue = '<%= options.dataValue %>'
    if (de.classList) {
      de.classList.remove(className)
    } else {
      de.className = de.className.replace(new RegExp(className, 'g'), '')
    }
    if (dataValue) {
      de.removeAttribute('data-' + dataValue)
    }
  }

  function prefersColorScheme (suffix) {
    return w.matchMedia('(prefers-color-scheme' + suffix + ')')
  }

  function getColorScheme () {
    if (w.matchMedia && prefersColorScheme('').media !== 'not all') {
      for (const colorScheme of knownColorSchemes) {
        if (prefersColorScheme(':' + colorScheme).matches) {
          return colorScheme
        }
      }
    }

    return '<%= options.fallback %>'
  }
})()
