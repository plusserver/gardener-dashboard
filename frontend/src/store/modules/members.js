//
// SPDX-FileCopyrightText: 2021 SAP SE or an SAP affiliate company and Gardener contributors
//
// SPDX-License-Identifier: Apache-2.0
//

import { getMembers, addMember, updateMember, deleteMember, resetServiceAccount } from '@/utils/api'

// initial state
const state = {
  all: []
}

// getters
const getters = {}

// actions
const actions = {
  async getAll ({ commit, state, rootState }) {
    const namespace = rootState.namespace
    try {
      const res = await getMembers({ namespace })
      commit('RECEIVE', res.data)
      return state.all
    } catch (error) {
      commit('CLEAR')
      throw error
    }
  },
  async add ({ commit, rootState }, data) {
    const namespace = rootState.namespace
    const res = await addMember({ namespace, data })
    commit('RECEIVE', res.data)
  },
  async update ({ commit, rootState }, { name, roles, description }) {
    const namespace = rootState.namespace
    const res = await updateMember({ namespace, name, data: { roles, description } })
    commit('RECEIVE', res.data)
  },
  async delete ({ commit, rootState }, name) {
    const namespace = rootState.namespace
    const res = await deleteMember({ namespace, name })
    commit('RECEIVE', res.data)
  },
  async resetServiceAccount ({ commit, rootState }, name) {
    const namespace = rootState.namespace
    const res = await resetServiceAccount({ namespace, name })
    commit('RECEIVE', res.data)
  }
}

// mutations
const mutations = {
  RECEIVE (state, items) {
    state.all = items
  },
  CLEAR (state) {
    state.all = []
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
