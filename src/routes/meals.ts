import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { validateParams } from '../middlewares/validate-params'
import { CheckSessionId } from '../middlewares/check-session-id-exist'
import { knex } from '../database'
import { randomUUID } from 'node:crypto'

const createMealsSchema = z.object({
  name: z.string({
    required_error: 'Name is required.',
  }),
  description: z.string().optional(),
  checkDiet: z.boolean({
    required_error: 'checkDiet is required.',
  }),
})

const createUserBodySchema = z.object({
  body: createMealsSchema,
})

type Meals = z.infer<typeof createMealsSchema>

export async function mealsRoutes(app: FastifyInstance) {
  app.post(
    '/',
    {
      preHandler: [validateParams(createUserBodySchema), CheckSessionId],
    },
    async (request, reply) => {
      const { checkDiet, description, name } = request.body as Meals

      await knex('meals').insert({
        id: randomUUID(),
        name,
        description,
        check_diet: checkDiet,
        user_id: request.cookies.sessionId,
      })

      return reply.status(201).send()
    },
  )

  app.get(
    '/',
    {
      preHandler: [CheckSessionId],
    },
    async (request) => {
      const sessionId = request.cookies.sessionId
      const meals = await knex('meals').where('user_id', sessionId).select()

      return {
        meals,
      }
    },
  )
}
