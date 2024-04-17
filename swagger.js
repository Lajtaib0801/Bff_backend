const swaggerAutogen = require('swagger-autogen')

const doc = {
    info: {
        version: 'v1.0.0',
        title: 'Swagger Demo Project',
        description: 'Implementation of Swagger with TypeScript',
    },
    servers: [
        {
            url: process.env.BACKEND_URL,
            description: '',
        },
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
            },
        },
    },
}

const outputFile = './swagger_output.json'
const endpointsFiles = ['./routes/router.js']

swaggerAutogen({ openapi: '3.0.0' })(outputFile, endpointsFiles, doc)
