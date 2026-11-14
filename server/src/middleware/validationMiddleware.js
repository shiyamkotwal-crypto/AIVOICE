import { z } from 'zod';

export function validateBody(schema) {
  return (req, res, next) => {
    try {
      req.validatedData = schema.parse(req.body);
      next();
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errorMessages = err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errorMessages,
        });
      }
      return res.status(400).json({
        success: false,
        error: 'Invalid request data',
      });
    }
  };
}

export const signupSchema = z.object({
  full_name: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  role: z.enum(['student', 'faculty', 'staff', 'admin']).optional().default('student'),
});

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const chatMessageSchema = z.object({
  conversation_id: z.string().optional().nullable(),
  message: z.string().min(1, 'Message text is required and cannot be empty'),
  language: z.string().optional().default('en'),
  domain: z.string().optional().default('General Administrative'),
  persona: z.string().optional().default('buddy'),
  is_voice: z.boolean().optional().default(false),
});

export const createConversationSchema = z.object({
  title: z.string().min(1, 'Conversation title is required'),
  language: z.string().optional().default('en'),
  domain: z.string().optional().default('General Administrative'),
});
