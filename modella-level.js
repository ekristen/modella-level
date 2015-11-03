var xtend     = require('xtend')
var index     = require('level-scout/index')
var search    = require('level-scout/search')
var filter    = require('level-scout/filter')
var select    = require('level-scout/select')
var sublevel  = require('level-sublevel/bytewise')

var level = module.exports = function(db) {
  if (typeof db == 'undefined') {
    throw new Error('you must pass in a leveldb instance')
  }

  return function(Model) {
    var store = sublevel(db).sublevel(Model.modelName)

    for (var attr in Model.attrs) {
      if (Model.attrs[attr].index) {
        index(store, attr)
        
        if (Model.attrs[attr].index_fields) {
          index(store, Model.attrs[attr].index_fields)
        }
      }
    }

    Model.store = store

    Model.save = level.save
    Model.update = level.update
    Model.remove = level.remove
    Model.get = level.get

    Model.search = search.bind(search, store)
    Model.select = select.bind(select, store)
    Model.filter = filter.bind(filter, store)

    Model.find = function(query, callback) {
      Model.search(query, function(err, results) {
        if (err) {
          return callback(err)
        }

        if (results.length == 0) {
          return callback(null, results)
        }

        callback(null, new Model(results[0].value))
      })
    }

    return Model
  }
}

level.save = function(fn) {
  var self = this

  if (!this.model.primaryKey) {
    return fn(new Error('No primary key set on model'))
  }

  this.model.store.put(this.primary(), this.toJSON(), {valueEncoding: 'json'}, function(err) {
    if (err) {
      return fn(err)
    }

    fn(null, self.toJSON())        
  })
}

level.update = level.save

level.remove = function(fn) {
  this.model.store.del(this.primary(), fn)
}

level.get = function(id, fn) {
  var self = this

  this.model.store.get(id, {valueEncoding: 'json'}, function(err, result) {
    if (err && err.notFound) {
      return fn(new Error('unable to find ' + self.modelName + ' with id: ' + id), false)
    }
    if (err) {
      return fn(err)
    }
    fn(null, new self(result))
  })
}


