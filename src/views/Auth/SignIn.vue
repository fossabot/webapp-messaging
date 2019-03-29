<script>
/* global cordova */

import Vue from 'vue'
import update from '../../plugins/update'

export default {
  beforeCreate () {
    if (process.env.VUE_APP_CORDOVA) {
      window.crustHybrid.configureClient()
        .then(({ config, domain }) => {
          // Update config
          window.CrustConfig = config

          // Update plugins & state
          update(Vue, null)

          const link = `${this.$system.baseURL()}/oidc`
          const ref = cordova.InAppBrowser.open(link, '_blank', 'hidenavigationbuttons=yes,hideurlbar=yes,zoom=no,location=no,toolbar=no')

          // Provide an auth window
          // TODO: Improve this flow
          ref.addEventListener('loadstop', (event) => {
            let { url } = event
            if (url.indexOf(`//${domain}`) > -1) {
              ref.close()
              this.$router.push({ name: 'landing' })
            }
          })
        }, false)
    } else {
      const link = `${this.$system.baseURL()}/oidc`
      // For now, we redirect directly to oidc endpoint
      // that will redirect us to satosa login screen
      window.location = link
    }
  },

  render () { return null },
}
</script>
