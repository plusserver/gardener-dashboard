//
// SPDX-FileCopyrightText: 2020 SAP SE or an SAP affiliate company and Gardener contributors
//
// SPDX-License-Identifier: Apache-2.0
//

'use strict'

const crypto = require('crypto')

const kOptions = Symbol('options')

class SessionId extends URL {
  constructor (authority, options = {}) {
    super(createPath(options), authority)
    this[kOptions] = options
  }

  getOptions () {
    return this[kOptions]
  }
}

function normalizeObject (object) {
  const normalizedObject = {}
  for (const key of Object.keys(object).sort()) {
    const value = object[key]
    switch (typeof value) {
      case 'string':
      case 'number':
      case 'boolean':
        normalizedObject[key] = value
        break
      case 'object':
        if (value) {
          normalizedObject[key] = normalizeObject(value)
        }
        break
      case 'undefined':
        break
    }
  }
  return normalizedObject
}

function createObjectHash (object) {
  return crypto
    .createHash('sha1')
    .update(JSON.stringify(normalizeObject(object)))
    .digest('hex')
    .substring(0, 7)
}

function createPath ({ id, ...options }) {
  let path = ''
  if (id) {
    path += '/' + id
  }
  path += '#' + createObjectHash(options)
  return path
}

module.exports = SessionId
