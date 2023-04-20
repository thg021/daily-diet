import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { validateParams } from '../middlewares/validate-params'
import { CheckSessionId } from '../middlewares/check-session-id-exist'
import { knex } from '../database'
import { randomUUID } from 'node:crypto'

const mealsSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string({
    required_error: 'Name is required.',
  }),
  description: z.string().optional(),
  checkDiet: z.boolean({
    required_error: 'checkDiet is required.',
  }),
})

const getMealsIdSchema = z.object({
  id: z.string().uuid(),
})

const createUserBodySchema = z.object({
  body: mealsSchema,
})

const getMealsParamsSchema = z.object({
  params: getMealsIdSchema,
})

type Meals = z.infer<typeof mealsSchema>
type MealsID = Pick<Meals, 'id'>

export async function mealsRoutes(app: FastifyInstance) {
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

  app.get(
    '/:id',
    {
      preHandler: [validateParams(getMealsParamsSchema), CheckSessionId],
    },
    async (request) => {
      const sessionId = request.cookies.sessionId
      const { id } = request.params as MealsID
      const meals = await knex('meals').where({
        user_id: sessionId,
        id,
      })

      return {
        meals,
      }
    },
  )

  app.get(
    '/metrics',
    {
      preHandler: [CheckSessionId],
    },
    async (request) => {
      type Ranking = Record<string, number>
      interface Metrics {
        totalRegisteredMeals: number
        totalAmountMealsWithinDiet: number
        totalNumberMealsOutsideDiet: number
        ranking: Ranking
      }
      const sessionId = request.cookies.sessionId
      const meals = await knex('meals').where('user_id', sessionId).select()

      const metrics = meals.reduce(
        (acc: Metrics, meal) => {
          if (meal.check_diet) {
            acc.totalAmountMealsWithinDiet++
          }
          if (!meal.check_diet) {
            acc.totalNumberMealsOutsideDiet++
          }

          const date = meal.created_at.substring(0, 10)
          if (!acc.ranking[date]) {
            acc.ranking[date] = 0
          }
          acc.ranking[date]++
          acc.totalRegisteredMeals++

          return acc
        },
        {
          totalRegisteredMeals: 0,
          totalAmountMealsWithinDiet: 0,
          totalNumberMealsOutsideDiet: 0,
          ranking: {},
        },
      )

      return {
        ...metrics,
      }
    },
  )

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

  app.put(
    '/',
    { preHandler: [validateParams(createUserBodySchema), CheckSessionId] },
    async (request, reply) => {
      const { id, checkDiet, description, name } = request.body as Meals
      const sessionId = request.cookies.sessionId
      await knex('meals')
        .where({
          user_id: sessionId,
          id,
        })
        .update({
          name,
          description,
          check_diet: checkDiet,
        })

      return reply.status(200).send()
    },
  )

  app.delete(
    '/:id',
    {
      preHandler: [validateParams(getMealsParamsSchema), CheckSessionId],
    },
    async (request, reply) => {
      const sessionId = request.cookies.sessionId
      const { id } = request.params as MealsID
      await knex('meals')
        .where({
          user_id: sessionId,
          id,
        })
        .del()

      return reply.status(200).send()
    },
  )
}
