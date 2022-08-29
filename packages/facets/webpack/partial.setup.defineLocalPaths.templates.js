const envVars = require('./constants.env-vars')
const envVarDefaults = require('./constants.env-var-defaults')
require('dotenv').config()

// define template dev server origin

process.env[envVars.TEMPLATES_LOCAL_PROTOCOL] =
  process.env[envVars.TEMPLATES_LOCAL_PROTOCOL] || envVarDefaults.TEMPLATES_LOCAL_PROTOCOL
process.env[envVars.TEMPLATES_LOCAL_HOST] =
  process.env[envVars.TEMPLATES_LOCAL_HOST] || envVarDefaults.TEMPLATES_LOCAL_HOST
process.env[envVars.TEMPLATES_LOCAL_PORT] =
  process.env[envVars.TEMPLATES_LOCAL_PORT] || envVarDefaults.TEMPLATES_LOCAL_PORT
process.env[envVars.TEMPLATES_LOCAL_ORIGIN] = `${process.env[envVars.TEMPLATES_LOCAL_PROTOCOL]}://${
  process.env[envVars.TEMPLATES_LOCAL_HOST]
}${process.env[envVars.TEMPLATES_LOCAL_PORT] ? `:${process.env[envVars.TEMPLATES_LOCAL_PORT]}` : ''}` // default local URL to localhost
