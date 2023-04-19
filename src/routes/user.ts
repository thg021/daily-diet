import { FastifyInstance } from 'fastify'
import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { knex } from '../database'
import { validateParams } from '../middlewares/validateParams'

const createUserSchema = z.object({
  name: z.string().min(3, {
    message: 'Nome do usuario deve ter no minino 3 caracteres.',
  }),
  email: z.string().email('Email invalido'),
})

const createUserBodySchema = z.object({
  body: createUserSchema,
})

type CreateUser = z.infer<typeof createUserSchema>

export async function userRoutes(app: FastifyInstance) {
  app.post(
    '/',
    {
      preHandler: [validateParams(createUserBodySchema)],
    },
    async (request, reply) => {
      console.log(request.body)
      const { name, email } = request.body as CreateUser

      let sessionId = request.cookies.sessionId

      if (!sessionId) {
        sessionId = randomUUID()

        reply.cookie('sessionId', sessionId, {
          path: '/',
          maxAge: 1000 * 60 * 60 * 24 * 7, // 7dias
        })
      }

      const user = await knex('users').where('email', email).first()

      if (!user) {
        await knex('users').insert({
          id: randomUUID(),
          name,
          email,
          session_id: sessionId,
        })
      }

      return reply.status(201).send()
    },
  )
}
