import system from '@/plugins/system'

export default function (Vue, store) {
  // Reinstall plugins
  system.install(Vue, store)

  // Reconnect sockets
  if (Vue.prototype.$ws.connected()) {
    Vue.prototype.$ws.close()
  }

  Vue.prototype.$ws.connect()
}
