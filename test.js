var test = require('tape')
var model = require('modella')
var level = require('memdb')
var sublevel = require('level-sublevel')
var modeldb = require('./modella-level')

test('save', function(t) {
  t.plan(1)

  var db = sublevel(level({ valueEncoding: 'json' }));
  
  var User = model('user')
    .use(modeldb(db))
    .attr('id')
    .attr('email')

  var u = new User({id: 1, email: 'one@one.com'})
  u.save(function(err, user_data) {
    t.ok(!err)    
  })

})


test('find by id', function(t) {
  t.plan(3)

  var db = sublevel(level({ valueEncoding: 'json' }));
  
  var User = model('user')
    .use(modeldb(db))
    .attr('id')
    .attr('email')

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


test('find by index', function(t) {
  t.plan(3)

  var db = sublevel(level({ valueEncoding: 'json' }));
  
  var User = model('user')
    .use(modeldb(db))
    .attr('id')
    .attr('email', { index: true })

  var userObj = {id: 1, email: "test@test.com"}

  var u = new User(userObj)
  u.save(function(err, user_data) {
    t.ok(!err)    
    
    User.getBy('email', userObj.email, function(err, user) {
      t.ifError(err)
      t.equal(JSON.stringify(user.toJSON()), JSON.stringify(userObj))
    })
  })
})

