import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodType, ZodObject } from 'zod';

/**
 * Validates req.body / req.query / req.params against the provided schema.
 *
 * IMPORTANT: the parsed (coerced + defaulted) values are written back onto
 * req.body / req.query / req.params so that Zod `.default()` / `.transform()`
 * results actually reach the route handler. Previously we parsed into a nested
 * object and discarded the result, so defaults silently never applied.
 */
export function validate(schema: ZodObject<{
  body?: ZodType<any>;
  query?: ZodType<any>;
  params?: ZodType<any>;
}>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const shape = schema.shape;

      if (shape.body) {
        req.body = (shape.body as ZodType<any>).parse(req.body);
      }
      if (shape.query) {
        const parsedQuery = (shape.query as ZodType<any>).parse(req.query);
        // Reassign individual keys so express internals stay consistent
        Object.keys(req.query).forEach((k) => delete (req.query as any)[k]);
        Object.assign(req.query, parsedQuery);
      }
      if (shape.params) {
        req.params = (shape.params as ZodType<any>).parse(req.params);
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        return res.status(400).json({
          error: 'Validation failed',
          details: errors,
        });
      }
      next(error);
    }
  };
}

export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
