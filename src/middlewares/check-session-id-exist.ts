import { FastifyReply, FastifyRequest } from 'fastify'
import { knex } from '../database'

export async function CheckSessionId(
  request: FastifyRequest,
  replay: FastifyReply,
) {
  const sessionId = request.cookies.sessionId

  const userEmail = request.headers.email as string

  if (!sessionId || !userEmail) {
    console.error(`❌ Unauthorized access.`)
    return replay.status(401).send({ error: 'Unauthorized' })
  }

  const user = await knex('users')
    .where({ email: userEmail, session_id: sessionId })
    .first()

  if (!user) {
    console.error(
      `❌ Unauthorized access with params: [ ${sessionId}, ${userEmail}]`,
    )
    return replay.status(401).send({ error: 'Unauthorized' })
  }

  console.log(
    `✅ checking session on user ${user.email}, session ${sessionId}.`,
  )
}
