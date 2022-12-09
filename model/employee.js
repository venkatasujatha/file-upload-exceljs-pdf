const EntitySchema = require('typeorm').EntitySchema

const employee = new EntitySchema({
  name: 'employee2',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true
    },
    name: {
      type: 'varchar',
      nullable: false
    },
    age: {
      type: 'int',
      nullable: false
    }
  }
})

module.exports = { employee }
