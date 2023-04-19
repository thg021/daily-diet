import { FastifyInstance } from 'fastify'
import { randomUUID } from 'node:crypto'
import { z } from 'zod'

export async function userRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const createUserBodySchema = z.object({
      name: z.string().min(3, {
        message: 'Nome do usuario deve ter no minino 3 caracteres.',
      }),
      email: z.string().email(),
    })

    const { name, email } = createUserBodySchema.parse(request.body)
    return reply.status(201).send({
      id: randomUUID(),
      name,
      email,
    })
  })
}
