
var Secondary = require('level-secondary')

var level = module.exports = function(db) {
  if (typeof db == 'undefined') {
    throw new Error('you must pass in a leveldb instance')
  }

  return function(Model) {
    Model.store = db.sublevel(Model.modelName)
    var indexedAttrs = []

    Model.once('initialize', function() {
      for (var attr in Model.attrs) {
        if (Model.attrs[attr].index) {
          Model.store[('by' + attr).toLowerCase()] = Secondary(Model.store, attr)
        }
      }
    })

    Model.save = level.save
    Model.update = level.update
    Model.remove = level.remove
    Model.find = Model.get = level.find
    Model.findBy = Model.getBy = level.findBy
    Model.removeBy = Model.delBy = level.removeBy

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
  this.store.del(this.primary(), fn)
}

level.find = function(id, fn) {
  var self = this

  this.store.get(id, function(err, result) {
    if (err && err.notFound) {
      return fn(new Error('unable to find ' + self.modelName + ' with id: ' + id), false)
    }
    if (err) {
      return fn(err)
    }
    fn(null, new self(result))
  })
}

level.findBy = function(field, value, fn) {
  var self = this

  var getBy = ('by' + field).toLowerCase()

  if (typeof this.store[getBy] == 'undefined') {
    return fn(new Error('field does not exist'))
  }

  this.store[getBy].get(value, function(err, value2) {
    if (err) {
      return fn(err)
    }

    fn(err, new self(value2))
  })
}

level.removeBy = function(field, value, fn) {
  var self = this

  var getBy = ('by' + field).toLowerCase()

  if (typeof this.store[getBy] == 'undefined') {
    return fn(new Error('field does not exist'))
  }
  
  this.store[getBy].del(value, function(err, value2) {
    if (err) {
      return fn(err)
    }

    fn(err, null)
  })
}
