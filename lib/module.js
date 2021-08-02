import { join, resolve } from 'path'
import { promises as fsp } from 'fs'
import crypto from 'crypto'
import defu from 'defu'
import template from 'lodash.template'
import { stringifyTag } from 'unmeta'

import { addTemplates } from './utils'

export default async function (moduleOptions) {
  const defaults = {
    preference: 'system',
    fallback: 'light',
    hid: 'nuxt-color-mode-script',
    globalName: '__NUXT_COLOR_MODE__',
    componentName: 'ColorScheme',
    classPrefix: '',
    classSuffix: '-mode',
    storageKey: 'nuxt-color-mode'
  }
  // defu(object, defaults)
  const options = defu({
    ...this.options.colorMode,
    ...moduleOptions
  }, defaults)

  // Add script to head to detect user or system preference before loading Nuxt (for SSR)
  const scriptPath = resolve(__dirname, 'script.min.js')
  const scriptT = await fsp.readFile(scriptPath, 'utf-8')

  const script = stringifyTag({
    tag: 'script',
    content: template(scriptT)({ options }).trim()
  })

  // In dev and static generation modes, renderer hooks inject the script into rendered HTML
  if (this.nuxt.options.dev || this.nuxt.options.target === 'static') {
    this.nuxt.hook('vue-renderer:spa:templateParams', (templateParams) => {
      templateParams.APP = script + templateParams.APP
    })
    this.nuxt.hook('vue-renderer:ssr:templateParams', (templateParams) => {
      templateParams.APP = script + templateParams.APP
    })
  } else {
    // In build + start mode, the template files are edited directly
    this.nuxt.hook('build:done', async () => {
      const templates = ['index.ssr.html', 'index.spa.html']
      for (const template of templates) {
        try {
          const templatePath = resolve(this.options.buildDir, 'dist/server', template)
          let contents = await fsp.readFile(templatePath, 'utf-8')
          contents = contents.replace(/<body[^>]*>/, r => r + '\n    ' + script)
          await fsp.writeFile(templatePath, contents)
        } catch {}
      }
    })

    // Support for @nuxt/nitro
    this.nuxt.hook('nitro:template', (tmpl) => {
      tmpl.contents = tmpl.contents.replace(/<body[^>]*>/, r => r + '\n    ' + script)
    })
  }

  // In dev mode we also inject full script via webpack entrypoint for storybook compatibility
  if (this.nuxt.options.dev) {
    const { dst } = this.addTemplate({ src: resolve(__dirname, 'script.js'), fileName: join('color-mode', 'script.js'), options })
    this.nuxt.hook('webpack:config', (configs) => {
      for (const config of configs) {
        if (config.name !== 'server') {
          config.entry.app.unshift(resolve(this.nuxt.options.buildDir, dst))
        }
      }
    })
  }

  // In dev mode we also inject full script via webpack entrypoint for storybook compatibility
  if (this.nuxt.options.dev) {
    const { dst } = this.addTemplate({ src: resolve(__dirname, 'script.js'), fileName: join('color-mode', 'script.js'), options })
    this.nuxt.hook('webpack:config', (configs) => {
      for (const config of configs) {
        if (config.name !== 'server') {
          config.entry.app.unshift(resolve(this.nuxt.options.buildDir, dst))
        }
      }
    })
  }
  this.nuxt.hook('vue-renderer:ssr:csp', (cspScriptSrcHashes) => {
    const { csp } = this.options.render
    const hash = crypto.createHash(csp.hashAlgorithm)
    hash.update(options.script)
    cspScriptSrcHashes.push(`'${csp.hashAlgorithm}-${hash.digest('base64')}'`)
  })

  // Add all templates
  const templatesDir = resolve(__dirname, 'templates')
  await addTemplates.call(this, templatesDir, 'color-mode', options)
}
