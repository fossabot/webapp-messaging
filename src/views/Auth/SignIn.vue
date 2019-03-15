<script>
/* global cordova */

export default {
  beforeCreate () {
    const link = this.$system.baseURL() + '/oidc'
    if (process.env.VUE_APP_CORDOVA) {
      const ref = cordova.InAppBrowser.open(link, '_blank', 'hidenavigationbuttons=yes,hideurlbar=yes,zoom=no,location=no,toolbar=no')

      // TODO: Improve this flow
      ref.addEventListener('loadstop', (event) => {
        let { url } = event
        if (url.indexOf('//latest.crust.tech') > -1) {
          ref.close()
          this.$router.push({ name: 'root' })
        }
      })
    } else {
      // For now, we redirect directly to oidc endpoint
      // that will redirect us to satosa login screen
      window.location = link
    }
  },

  render () { return null },
}
</script>
