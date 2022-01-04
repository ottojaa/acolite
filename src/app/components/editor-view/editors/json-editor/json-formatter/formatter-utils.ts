export function escapeString(str) {
  return str.replace('"', '"')
}

// From http://stackoverflow.com/a/332429
export function getObjectName(object) {
  if (object === undefined) {
    return ''
  }
  if (object === null) {
    return 'Object'
  }
  if (typeof object === 'object' && !object.constructor) {
    return 'Object'
  }

  //ES6 default gives name to constructor
  if (
    object.__proto__ !== undefined &&
    object.__proto__.constructor !== undefined &&
    object.__proto__.constructor.name !== undefined
  ) {
    return object.__proto__.constructor.name
  }

  const funcNameRegex = /function (.{1,})\(/
  const results = funcNameRegex.exec(object.constructor.toString())
  if (results && results.length > 1) {
    return results[1]
  } else {
    return ''
  }
}

export function getType(object) {
  if (object === null) {
    return 'null'
  }
  return typeof object
}

export function getValuePreview(object, value) {
  const type = getType(object)

  if (type === 'null' || type === 'undefined') {
    return type
  }

  if (type === 'string') {
    value = '"' + escapeString(value) + '"'
  }
  if (type === 'function') {
    // Remove content of the function
    return (
      object
        .toString()
        .replace(/[\r\n]/g, '')
        .replace(/\{.*\}/, '') + '{…}'
    )
  }
  return value
}

export function getPreview(object) {
  let value = ''
  if (typeof object === 'object') {
    value = getObjectName(object)
    if (Array.isArray(object)) {
      value += '[' + object.length + ']'
    }
  } else {
    value = getValuePreview(object, object)
  }
  return value
}
