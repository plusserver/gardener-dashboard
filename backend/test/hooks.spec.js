//
// SPDX-FileCopyrightText: 2020 SAP SE or an SAP affiliate company and Gardener contributors
//
// SPDX-License-Identifier: Apache-2.0
//

'use strict'

const { createDashboardClient } = require('@gardener-dashboard/kube-client')

const cache = require('../lib/cache')

jest.mock('../lib/watches')

const watches = require('../lib/watches')

const createHooks = require('../lib/hooks')

describe('hooks', () => {
  describe('LifecycleHooks', () => {
    const { LifecycleHooks } = createHooks
    let hooks
    let dashboardClient

    beforeEach(() => {
      createDashboardClient.mockClear()
      hooks = createHooks()
      dashboardClient = createDashboardClient.mock.results[0].value
      hooks.ac.abort = jest.fn()
    })

    it('should create the default instance', function () {
      expect(hooks.client).toBe(dashboardClient)
    })

    it('#createInformers', async function () {
      for (const key of LifecycleHooks.resources) {
        const observable = dashboardClient['core.gardener.cloud'][key]
        const informer = {
          names: {
            plural: key
          }
        }
        if (observable.constructor.scope === 'Namespaced') {
          informer.mockFn = observable.informerAllNamespaces = jest.fn(() => informer)
        } else {
          informer.mockFn = observable.informer = jest.fn(() => informer)
        }
      }
      const informers = LifecycleHooks.createInformers(dashboardClient)
      for (const key of LifecycleHooks.resources) {
        const { mockFn, names } = informers[key]
        expect(names.plural).toBe(key)
        expect(mockFn).toBeCalledTimes(1)
      }
    })

    it('#cleanup', async function () {
      // initial state
      await hooks.cleanup()
      expect(hooks.ac.abort).toBeCalledTimes(1)
      hooks.ac.abort.mockClear()
      await hooks.cleanup()
      expect(hooks.ac.abort).toBeCalledTimes(1)
    })

    describe('#beforeListen', () => {
      const server = {}
      const ticketCache = {}
      let informers
      let mockCreateInformers

      beforeEach(() => {
        informers = {
          foo: {
            run: jest.fn(),
            store: {
              untilHasSynced: Promise.resolve('foo')
            }
          },
          bar: {
            run: jest.fn(),
            store: {
              untilHasSynced: Promise.resolve('bar')
            }
          }
        }
        hooks.constructor.createInformers = mockCreateInformers = jest.fn(() => informers)
        cache.initialize = jest.fn()
        cache.getTicketCache = jest.fn(() => ticketCache)
      })

      it('should create and run informers, create io instance and initialize cache and watches', async function () {
        await expect(hooks.beforeListen(server)).resolves.toEqual(['foo', 'bar'])

        expect(mockCreateInformers).toBeCalledTimes(1)
        expect(mockCreateInformers.mock.calls[0]).toHaveLength(1)
        expect(mockCreateInformers.mock.calls[0][0]).toBe(hooks.client)

        for (const informer of Object.values(informers)) {
          expect(informer.run).toBeCalledTimes(1)
          expect(informer.run.mock.calls[0]).toHaveLength(1)
          expect(informer.run.mock.calls[0][0]).toBe(hooks.ac.signal)
        }

        expect(cache.initialize).toBeCalledTimes(1)
        expect(cache.initialize.mock.calls[0]).toHaveLength(1)
        expect(cache.initialize.mock.calls[0][0]).toBe(informers)

        expect(cache.getTicketCache).toBeCalledTimes(1)

        for (const [key, watch] of Object.entries(watches)) {
          expect(watch).toBeCalledTimes(1)
          expect(watch.mock.calls[0]).toHaveLength(1)
          expect(watch.mock.calls[0][0]).toBe(key === 'tickets' ? ticketCache : informers[key])
        }
      })
    })
  })
})
