// copied from mutant/value.js and added
// - onStartListening -- called after first listener was added
// - onStopListening -- called after last listener was removed

module.exports = Observable

function Observable (value, opts) {
  var listeners = []

  observable.set = function (v) {
    value = v
    var cachedListeners = listeners.slice(0)
    for (var i = 0, len = cachedListeners.length; i < len; i++) {
      cachedListeners[i](value)
    }
  }

  return observable

  function observable (listener) {
    if (!listener) {
      return value
    }

    if (typeof listener !== 'function') {
      throw new Error('Listeners must be functions.')
    }

    const isFirst = listeners.length == 0
    listeners.push(listener)
    if (isFirst && opts.onStartListening) {
      console.log('first listener')
      opts.onStartListening()
    }

    return function remove () {
      const isLast = listeners.length == 1
      for (var i = 0, len = listeners.length; i < len; i++) {
        if (listeners[i] === listener) {
          listeners.splice(i, 1)
          break
        }
      }
      if (isLast && opts.onStopListening) {
        console.log('lastlistener')
        opts.onStopListening()
      }
    }
  }
}
