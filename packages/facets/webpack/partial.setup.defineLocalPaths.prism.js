const envVars = require('./constants.env-vars')
const envVarDefaults = require('./constants.env-var-defaults')
require('dotenv').config()

// define prism dev server origin
process.env[envVars.API_URL] = process.env[envVars.API_URL] || envVarDefaults.API_URL
process.env[envVars.PRISM_LOCAL_PROTOCOL] =
  process.env[envVars.PRISM_LOCAL_PROTOCOL] || envVarDefaults.PRISM_LOCAL_PROTOCOL
process.env[envVars.PRISM_LOCAL_HOST] = process.env[envVars.PRISM_LOCAL_HOST] || envVarDefaults.PRISM_LOCAL_HOST
process.env[envVars.PRISM_LOCAL_PORT] = process.env[envVars.PRISM_LOCAL_PORT] || envVarDefaults.PRISM_LOCAL_PORT
process.env[envVars.PRISM_LOCAL_ORIGIN] = `${process.env[envVars.PRISM_LOCAL_PROTOCOL]}://${
  process.env[envVars.PRISM_LOCAL_HOST]
}${process.env[envVars.PRISM_LOCAL_PORT] ? `:${process.env[envVars.PRISM_LOCAL_PORT]}` : ''}` // default local URL to localhost
