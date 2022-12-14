const EntitySchema = require('typeorm').EntitySchema

const employee = new EntitySchema({
  name: 'employee2',
  columns: {
    id: {
      primary: true,
      type: 'int',
      generated: true
    },
    Name: {
      type: 'varchar',
      nullable: true
    },
    Age: {
      type: 'int',
      nullable: true
    }
  }
})

module.exports = { employee }
