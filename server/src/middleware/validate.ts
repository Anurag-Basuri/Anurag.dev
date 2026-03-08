import { FastifyRequest, FastifyReply } from 'fastify';
import { ZodSchema, ZodError } from 'zod';
import { badRequest } from '../lib/errors';

/**
 * Creates a Fastify preHandler that validates request.body against a Zod schema.
 * On failure, returns a 400 with field-level validation errors.
 */
export function validate(schema: ZodSchema) {
	return async (request: FastifyRequest, reply: FastifyReply) => {
		try {
			request.body = schema.parse(request.body);
		} catch (err) {
			if (err instanceof ZodError) {
				const details = err.errors.map(e => ({
					field: e.path.join('.'),
					message: e.message,
				}));
				const error = badRequest('Validation failed', details);
				return reply.status(error.statusCode).send(error.toJSON());
			}
			throw err;
		}
	};
}

/**
 * Creates a Fastify preHandler that validates request.params against a Zod schema.
 */
export function validateParams(schema: ZodSchema) {
	return async (request: FastifyRequest, reply: FastifyReply) => {
		try {
			request.params = schema.parse(request.params);
		} catch (err) {
			if (err instanceof ZodError) {
				const details = err.errors.map(e => ({
					field: e.path.join('.'),
					message: e.message,
				}));
				const error = badRequest('Invalid parameters', details);
				return reply.status(error.statusCode).send(error.toJSON());
			}
			throw err;
		}
	};
}

/**
 * Creates a Fastify preHandler that validates request.query against a Zod schema.
 */
export function validateQuery(schema: ZodSchema) {
	return async (request: FastifyRequest, reply: FastifyReply) => {
		try {
			request.query = schema.parse(request.query);
		} catch (err) {
			if (err instanceof ZodError) {
				const details = err.errors.map(e => ({
					field: e.path.join('.'),
					message: e.message,
				}));
				const error = badRequest('Invalid query parameters', details);
				return reply.status(error.statusCode).send(error.toJSON());
			}
			throw err;
		}
	};
}
