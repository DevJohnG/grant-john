const id = "john"

// Require the framework and instantiate it

// ESM
import Fastify from 'fastify'

const fastify = Fastify({
  logger: true
})

// Declare a route
//fastify.get('/', function (request, reply) {
//  reply.send({ hello: 'world' })
//})

fastify.get('/', (request, reply) => {
  return { hello: 'world' }
})

fastify.get('/prueba2', (request, reply) => {
  return { hello: 'prueba2' }
})


fastify.get('/prueba/:id', (request, reply) => {
  return { hello: 'prueba', id:request.params.id }
})


// Run the server!
fastify.listen({ port: 3000 }, function (err, address) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
  // Server is now listening on ${address}
})