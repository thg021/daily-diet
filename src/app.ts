import { fastify } from 'fastify'
import { sessionRoutes } from './routes/session'
import cookie from '@fastify/cookie'

export const app = fastify()

app.register(cookie)
app.register(sessionRoutes, {
  prefix: 'session',
})
