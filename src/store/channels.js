import { Channel } from '@/types'

const types = {
  pending: 'pending',
  completed: 'completed',
  setCurrent: 'setCurrent',
  resetList: 'resetList',
  updateList: 'updateList',
  channelJoin: 'channelJoin',
  channelPart: 'channelPart',
  removeFromList: 'removeFromList',
  updateLastMessage: 'updateLastMessage',
}

export default function (Messaging) {
  return {
    namespaced: true,

    state: {
      current: null,
      pending: false,
      list: [],
      lastMessages: [], // set of channelID-messageId pairs
    },

    getters: {
      pending: (state) => state.pending,
      // Finds last message id for a specific channel
      lastMessage: (state) => (channelID) => {
        const ci = state.lastMessages.findIndex(lm => lm.channelID === channelID)
        return ci < 0 ? 0 : state.lastMessages[ci].messageId
      },
      current: (state) => state.current,

      // Return all but deleted
      list: (state) => state.list.filter(c => c.canJoin || c.canObserve),
      listOnDemand: (state) => () => state.list.filter(c => !c.deletedAt && !c.archivedAt),

      // Return private & public channels
      byType: (state, getters) => (type) => getters.list.filter(c => c.type === type),

      // Find channel by ID
      findByID: (state, getters) => (ID) => {
        return getters.list.filter(c => c.channelID === ID)[0] || undefined
      },

      // Find direct/group channel for a specific set of members
      findByMembership: (state, getters) => (...userIDs) => {
        const userCount = userIDs.length
        const uidstr = JSON.stringify(userIDs.sort())
        const eq = (members) => JSON.stringify([...members].sort()) === uidstr

        return getters.list.find(c => c.type === 'group' && c.members.length === userCount && eq(c.members))
      },

      otherMembersOf: (state, getters) => (channelID, userID) => {
        const ch = getters.findByID(channelID)

        if (!ch) {
          return []
        }

        if (ch.members.length === 1) {
          return ch.members
        }

        return ch.members.filter(memberID => memberID !== userID)
      },
    },

    actions: {
      // Loads all channels, returns a promise, can be used to update unreads.
      async load ({ commit }) {
        commit(types.pending)
        return new Promise((resolve) => {
          Messaging.channelList().then((channels) => {
            const cc = []
            const unreads = []
            console.debug('Prefeched %d channels', channels.length)
            channels.forEach((c) => {
              cc.push(new Channel(c))

              if (c.unread && (c.unread.count > 0 || c.unread.lastMessageID !== undefined)) {
                unreads.push({ channelID: c.channelID, ...c.unread })
              }
            })

            commit(types.resetList, cc)
            commit(types.completed)
            resolve({ unreads })
          })
        })
      },

      incUnreadMessageCount ({ commit, getters }, channelID) {
        const ch = getters.findByID(channelID)

        if (ch) {
          ch.view.newMessagesCount++
          commit(types.updateList, ch)
        }
      },

      resetUnreadMessageCount ({ commit, getters }, channelID) {
        const ch = getters.findByID(channelID)

        if (ch) {
          ch.view.newMessagesCount = 0
          commit(types.updateList, ch)
        }
      },
    },

    mutations: {
      [types.pending] (state) {
        state.pending = true
      },
      [types.completed] (state) {
        state.pending = false
      },

      [types.setCurrent] (state, channel) {
        state.current = channel
      },

      [types.resetList] (state, channels) {
        state.list = channels
      },

      [types.updateList] (state, channel) {
        const l = state.list
        const i = l.findIndex(c => c.channelID === channel.channelID)

        if (i === -1) {
          l.unshift(channel)
        } else {
          l[i] = channel
        }

        state.list = [...l]
      },

      [types.channelJoin] (state, { channelID, userID }) {
        const ch = state.list.findIndex(c => c.channelID === channelID)

        if (ch >= 0) {
          const channel = state.list[ch]
          if (channel.members.findIndex(m => m === userID) < 0) {
            channel.members.push(userID)
            state.list.splice(ch, 1, channel)
          }
        }
      },

      [types.channelPart] (state, { channelID, userID }) {
        const ch = state.list.findIndex(c => c.channelID === channelID)

        if (ch >= 0) {
          const channel = state.list[ch]
          const i = channel.members.findIndex(m => m === userID)
          if (i > -1) {
            channel.members.splice(i, 1)
            state.list.splice(ch, 1, channel)
          }

          // Remove non-public channels, groups from the list
          if (channel.type !== 'public') {
            state.list.splice(ch, 1)
          }
        }
      },

      [types.removeFromList] (state, { ID }) {
        state.list = [...state.list.filter(ch => ID !== ch.channelID)]
      },

      [types.updateLastMessage] (state, { channelID, messageId }) {
        const ci = state.lastMessages.findIndex(lm => lm.channelID === channelID)
        if (ci < 0) {
          state.lastMessages.push({ channelID, messageId })
        } else {
          state.lastMessages.splice(ci, 1, { channelID, messageId })
        }
      },
    },
  }
}
