# Modella LevelDB 

Creates find, save, remove for Modella using LevelDB

## Example

```javascript
var leveldb = require('level')
var modella_level = require('modella-level')(leveldb)

var User = modella('User')
  .use(modella_level)
  .use(validators)
  .attr('id', { required: true })
  .attr('login', { required: true })

new User({id: '1', login: 'me'}).save(function(err) {
  if (err) {
    console.log(err)
  }
})
```
