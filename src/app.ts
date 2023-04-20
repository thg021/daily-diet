import { fastify } from 'fastify'
import { sessionRoutes } from './routes/session'
import cookie from '@fastify/cookie'
import { mealsRoutes } from './routes/meals'

export const app = fastify()

app.register(cookie)
app.register(sessionRoutes, {
  prefix: 'session',
})
app.register(mealsRoutes, {
  prefix: 'meals',
})
