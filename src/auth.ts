import { loadConfig } from './config/env.js'
import { createAuth } from './lib/auth/create-auth.js'

export const auth = await createAuth(loadConfig())
