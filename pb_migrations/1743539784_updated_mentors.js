/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3954596432")

  // add field
  collection.fields.addAt(3, new Field({
    "hidden": false,
    "id": "json1068999359",
    "maxSize": 0,
    "name": "availability",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3954596432")

  // remove field
  collection.fields.removeById("json1068999359")

  return app.save(collection)
})
