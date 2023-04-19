import { FastifyReply, FastifyRequest } from 'fastify'
import { AnyZodObject } from 'zod'
import { findErrorsRequest } from '../util/findErrorsRequest'
import BadRequestException from '../util/badRequestException'

export const validateParams =
  (schema: AnyZodObject) =>
  async (request: FastifyRequest, replay: FastifyReply) => {
    const _validate = await schema.safeParseAsync({
      body: request.body,
      query: request.query,
      params: request.params,
    })

    if (_validate.success === false) {
      const listErrors = findErrorsRequest(_validate.error.format())
        .map((error) => error._errors?.join(''))
        .join('')

      console.error(
        `❌ BadRequest ${JSON.stringify(request.body)}, params: ${listErrors}`,
      )

      return replay.status(400).send(new BadRequestException(listErrors))
    }
  }
