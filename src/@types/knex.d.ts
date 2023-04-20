// eslint-disable-next-line no-unused-vars
import { knex } from 'knex'

declare module 'knex/types/tables' {
  export interface Tables {
    users: {
      id: string
      name: string
      email: string
      created_at: string
      session_id?: string
    }
    meals: {
      id: string
      name: string
      description?: string
      created_at: string
      user_id: string
      check_diet: boolean
    }
  }
}
