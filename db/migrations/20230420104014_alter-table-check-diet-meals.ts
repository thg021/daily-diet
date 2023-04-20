import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('meals', function (table) {
    table.dropColumn('checkDiet')
    table.boolean('check_diet').defaultTo(false)
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('meals', (table) => {
    table.dropColumn('check_diet')
    table.boolean('checkDiet').defaultTo(false)
  })
}
