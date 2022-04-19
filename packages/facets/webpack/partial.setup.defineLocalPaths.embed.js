const envVars = require('./constants.env-vars')
const envVarDefaults = require('./constants.env-var-defaults')

// define embed dev server origin
process.env[envVars.EMBED_LOCAL_PROTOCOL] = process.env[envVars.EMBED_LOCAL_PROTOCOL] || envVarDefaults.EMBED_LOCAL_PROTOCOL
process.env[envVars.EMBED_LOCAL_HOST] = process.env[envVars.EMBED_LOCAL_HOST] || envVarDefaults.EMBED_LOCAL_HOST
process.env[envVars.EMBED_LOCAL_PORT] = process.env[envVars.EMBED_LOCAL_PORT] || envVarDefaults.EMBED_LOCAL_PORT
process.env[envVars.EMBED_LOCAL_ORIGIN] = `${process.env[envVars.EMBED_LOCAL_PROTOCOL]}://${process.env[envVars.EMBED_LOCAL_HOST]}${process.env[envVars.EMBED_LOCAL_PORT] ? `:${process.env[envVars.EMBED_LOCAL_PORT]}` : ''}`// default local URL to localhost
