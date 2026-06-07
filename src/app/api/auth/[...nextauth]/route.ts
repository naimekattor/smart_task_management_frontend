import { handlers } from '@/auth';

export const { GET, POST } = handlers;
export const runtime = 'nodejs'; // Use Node.js runtime for encryption/bcrypt compatibility
