//
// SPDX-FileCopyrightText: 2021 SAP SE or an SAP affiliate company and Gardener contributors
//
// SPDX-License-Identifier: Apache-2.0
//

const _ = require('lodash')
const { NotFound } = require('http-errors')
const createTicketCache = require('./tickets')

/*
  In file `lib/api.js` the synchronization is started with the privileged dashboardClient.
  Be careful when reading information from the cache that an authorization check is done
  or the information can be considered as not sensitive or public.
*/

class Cache extends Map {
  constructor () {
    super()
    this.ticketCache = createTicketCache()
  }

  getCloudProfiles () {
    return this.get('core.gardener.cloud/cloudprofiles').list()
  }

  getQuotas () {
    return this.get('core.gardener.cloud/quotas').list()
  }

  getSeeds () {
    return this.get('core.gardener.cloud/seeds').list()
  }

  getProjects () {
    return this.get('core.gardener.cloud/projects').list()
  }

  getControllerRegistrations () {
    return this.get('core.gardener.cloud/controllerregistrations').list()
  }

  getResourceQuotas () {
    return this.get('core/resourcequotas').list()
  }

  getTicketCache () {
    return this.ticketCache
  }
}

const cache = new Cache()

module.exports = {
  cache,
  initialize (informers) {
    for (const [key, informer] of Object.entries(informers)) {
      cache.set(key, informer.store)
    }
  },
  getCloudProfiles () {
    return cache.getCloudProfiles()
  },
  getQuotas () {
    return cache.getQuotas()
  },
  getSeeds () {
    return cache.getSeeds()
  },
  getSeed (name) {
    return _
      .chain(cache.getSeeds())
      .find(['metadata.name', name])
      .cloneDeep()
      .value()
  },
  getVisibleAndNotProtectedSeeds () {
    const predicate = item => {
      const taints = _.get(item, 'spec.taints')
      const unprotected = !_.find(taints, ['key', 'seed.gardener.cloud/protected'])
      const visible = _.get(item, 'spec.settings.scheduling.visible')
      return unprotected && visible
    }
    return _.filter(cache.getSeeds(), predicate)
  },
  getProjects () {
    return cache.getProjects()
  },
  getControllerRegistrations () {
    return cache.getControllerRegistrations()
  },
  getResourceQuotas () {
    return cache.getResourceQuotas()
  },
  findProjectByNamespace (namespace) {
    const project = cache.get('core.gardener.cloud/projects').find(['spec.namespace', namespace])
    if (!project) {
      throw new NotFound(`Namespace '${namespace}' is not related to a gardener project`)
    }
    return project
  },
  findResourceQuotasByNamespace (namespace) {
    const resourceQuotas = cache.getResourceQuotas()
    return _.filter(resourceQuotas, { metadata: { namespace } })
  },
  getTicketCache () {
    return cache.getTicketCache()
  }
}
