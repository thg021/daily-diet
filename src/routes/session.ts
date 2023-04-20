import { FastifyInstance } from 'fastify'
import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { knex } from '../database'
import { validateParams } from '../middlewares/validate-params'

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

export async function sessionRoutes(app: FastifyInstance) {
  app.post(
    '/',
    {
      preHandler: [validateParams(createUserBodySchema)],
    },
    async (request, reply) => {
      const { name, email } = request.body as CreateUser
      const sessionIdUser = randomUUID()
      let sessionId = request.cookies.sessionId

      const user = await knex('users').where('email', email).first()
      if (!user) {
        await knex('users').insert({
          id: randomUUID(),
          name,
          email,
          session_id: sessionIdUser,
        })
      }

      if (!sessionId || user?.session_id !== sessionId) {
        sessionId = user?.session_id || sessionIdUser
      }

      reply.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7dias
      })

      return reply.status(201).send()
    },
  )
}
