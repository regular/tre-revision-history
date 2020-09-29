const Observable = require('./observable')
const computed = require('mutant/computed')
const ssbSort = require('ssb-sort')
const pull = require('pull-stream')
const debug = require('debug')('tre-revision-history')

module.exports = function(ssb) {

  return function history(revRoot, opts) {
    opts = opts || {}
    let items = []
    let synced = false
    let drain
    let array
    array = Observable([], {
      onStartListening: function startListening() {
        function stream() {
          items = []
          array.set([])
          synced = false
          drain = pull.drain( item => {
            if (item.sync) {
              synced = true
              return array.set(items)
            }
            items.push(item)
            if (synced) array.set(items)
          }, err =>{
            if (err) {
              debug('startListening error: %s', err.message)
              const delay = err.pleaseRetryIn
              if (delay !== undefined) return setTimeout(stream, delay)
              console.error('tre-revision-history stream: error: %s', err.message)
            }
          })
          pull( ssb.revisions.history(revRoot, {
            live: true,
            sync: true,
            values: true
          }), drain)
        }
        stream()
      },
      onStopListening: ()=>  {
        drain.abort()
      }
    })
    return computed(array, a => {
      return opts.reverse ? ssbSort(a).reverse() : ssbSort(a)
    })
  }
}
