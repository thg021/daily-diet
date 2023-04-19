// eslint-disable-next-line no-unused-vars
import { knex } from 'knex'

declare module 'knex/types/tables' {
  export interface Tables {
    users: {
      id: string
      name: string
      email: number
      created_at: string
    }
  }
}
