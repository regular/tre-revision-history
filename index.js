const Observable = require('./observable')
const computed = require('mutant/computed')
const ssbSort = require('ssb-sort')
const pull = require('pull-stream')

module.exports = function(ssb) {

  return function history(revRoot, opts) {
    opts = opts || {}
    let items = []
    let synced = false
    let drain
    let array
    array = Observable([], {
      onStartListening: ()=>{
        items = []
        synced = false
        drain = pull.drain( item => {
          if (item.sync) {
            synced = true
            return array.set(items)
          }
          items.push(item)
          if (synced) array.set(items)
        })
        pull( ssb.revisions.history(revRoot, {
          live: true,
          sync: true,
          values: true
        }), drain)
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
