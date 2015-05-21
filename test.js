var test = require('tape')
var model = require('modella')
var level = require('level')
var modeldb = require('./modella-level')
var rimraf = require('rimraf')

test('save', function(t) {
  t.plan(1)

  var db = level('./db_save', { valueEncoding: 'json' }, function() {

    var User = model('user')
      .use(modeldb(db))
      .attr('id')
      .attr('email')

    var u = new User({id: 1, email: 'one@one.com'})
    u.save(function(err, user_data) {
      t.ok(!err)
    })
    
  })
  

})


test('find by id', function(t) {
  t.plan(3)

  var db = level('./db_findbyid', { valueEncoding: 'json' }, function(err) {
    var User = model('user')
      .attr('id')
      .attr('email')
      .use(modeldb(db))

    var userObj = {id: 1, email: "test@test.com"}

    var u = new User(userObj)
    u.save(function(err, user_data) {
      t.ok(!err)

      User.find(1, function(err, user) {
        t.ok(!err)
        t.equal(JSON.stringify(user.toJSON()), JSON.stringify(userObj))
      })
    })
  })
  
  
})


test('find by index', function(t) {
  t.plan(3)

  level('./db_findbyindex', { valueEncoding: 'json' }, function(err, db) {

    var User = model('user')
      .attr('id')
      .attr('email', { index: true })
      .attr('enabled', { index: true })
      .use(modeldb(db))

    var userObj = {id: 1, email: "test@test.com", enabled: true}

    var u = new User(userObj)
    u.save(function(err, user_data) {
      t.ok(!err)

      User.search({email: 'test@test.com'}, function(err, results) {
        t.ifError(err)
        t.equal(JSON.stringify(results[0].value), JSON.stringify(userObj))
      })
    })
  
  })
  
})
