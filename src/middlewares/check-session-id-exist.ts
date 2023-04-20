import { FastifyReply, FastifyRequest } from 'fastify'
export async function CheckSessionId(
  request: FastifyRequest,
  replay: FastifyReply,
) {
  const sessionId = request.cookies.sessionId

  if (!sessionId) {
    console.error(`❌ Unauthorized access.`)
    return replay.status(401).send({ error: 'Unauthorized' })
  }

  console.log(`✅ checking session ${sessionId}.`)
}
