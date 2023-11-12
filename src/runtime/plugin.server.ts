import type { IncomingMessage, ServerResponse } from 'http';
import { reactive } from 'vue'

import type { ColorModeInstance } from './types'
import { defineNuxtPlugin, isVue2, isVue3, useHead, useState, useRouter } from '#imports'
import { preference, hid, script, dataValue } from '#color-mode-options'

const addScript = (head) => {
  head.script = head.script || []
  head.script.push({
    hid,
    innerHTML: script
  })
  const serializeProp = '__dangerouslyDisableSanitizersByTagID'
  head[serializeProp] = head[serializeProp] || {}
  head[serializeProp][hid] = ['innerHTML']
}

const schemeHeader = 'Sec-CH-Prefers-Color-Scheme';
const getSystemSchemeFromReq = (req: IncomingMessage): string | null => {
  return req.headers[
    schemeHeader.toLowerCase()
  ] as string || null;
}
const setSchemeHeaderForRes = (res: ServerResponse): void => {
  res.setHeader('Accept-CH', schemeHeader);
}

export default defineNuxtPlugin((nuxtApp) => {
  let colorMode: ColorModeInstance;

  if (nuxtApp.ssrContext && 'islandContext' in nuxtApp.ssrContext) {
    colorMode = reactive({} as ColorModeInstance);
  } else {
    let systemScheme: string | null = null;

    if (isVue2) {
      const { req, res } = nuxtApp.nuxt2Context;

      setSchemeHeaderForRes(res);

      systemScheme = getSystemSchemeFromReq(req) || systemScheme;
    } else {
      const { req, res } = useRequestEvent()?.node || {};

      setSchemeHeaderForRes(res);

      systemScheme = getSystemSchemeFromReq(req) || systemScheme;
    }

    colorMode = useState<ColorModeInstance>('color-mode', () => reactive({
      preference,
      systemScheme,
      value: systemScheme || preference,
      unknown: !systemScheme,
      forced: false
    })).value
  }

  const htmlAttrs: Record<string, string> = {}

  if (isVue2) {
    const app = nuxtApp.nuxt2Context.app

    if (typeof app.head === 'function') {
      const originalHead = app.head
      app.head = function () {
        const head = originalHead.call(this) || {}
        addScript(head)
        head.htmlAttrs = htmlAttrs
        return head
      }
    } else {
      addScript(app.head)
      app.head.htmlAttrs = htmlAttrs
    }
  }

  if (isVue3) {
    useHead({ htmlAttrs })
  }

  useRouter().afterEach((to) => {
    const forcedColorMode = isVue2
      ? (to.matched[0]?.components.default as any)?.options?.colorMode
      : to.meta.colorMode

    if (forcedColorMode && forcedColorMode !== 'system') {
      colorMode.value = htmlAttrs['data-color-mode-forced'] = forcedColorMode
      if (dataValue) {
        htmlAttrs[`data-${dataValue}`] = colorMode.value
      }
      colorMode.forced = true
    } else if (forcedColorMode === 'system') {
      // eslint-disable-next-line no-console
      console.warn('You cannot force the colorMode to system at the page level.')
    }
  })

  nuxtApp.provide('colorMode', colorMode)
})
