import Vue from 'vue'

import i18next from 'i18next'
import VueI18Next from '@panter/vue-i18next'

// Plugins for i18next
import xhrBackend from 'i18next-xhr-backend'
import lngDetector from 'i18next-browser-languagedetector'
import intervalPlural from 'i18next-intervalplural-postprocessor'

Vue.use(VueI18Next)

i18next
  .use(xhrBackend)
  .use(lngDetector)
  .use(intervalPlural)
  .init({
    fallbackLng: 'en',
    debug: process.env.NODE_ENV !== 'production',
    detection: {
      // to overwrite, to use user defined, to guess user's lang
      order: ['querystring', 'localStorage', 'cookie', 'navigator'],
      caches: [/* 'localStorage', 'cookie' */],
    },
    backend: {
      loadPath: `${process.env.BASE_URL}lang/{{lng}}.json`,
    },
  })

i18next.on('loaded', () => Vue.prototype.$bus.$emit('$t.loaded'))
i18next.on('languageChanged', () => Vue.prototype.$bus.$emit('$t.languageChanged'))

export default new VueI18Next(i18next)
