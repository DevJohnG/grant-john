function getFibonacci(n) {
  if (n === 1) return [0];
  const fibonacci = [0, 1];
  for (let i = 2; i < n; i++) {
    fibonacci.push(fibonacci[i - 1] + fibonacci[i - 2]);
  }
  return fibonacci;
}
//const id = "john"

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

/*fastify.get('/', (request, reply) => {
  return { hello: 'world' }
})

fastify.get('/prueba2', (request, reply) => {
  return { hello: 'prueba2' }
})


fastify.get('/prueba/:id', (request, reply) => {
  return { hello: 'prueba', id:request.params.id }
}) */

fastify.get('/lab5/:n', (request, reply) => {
  const n = parseInt(request.params.n, 10);
  if (isNaN(n) || n <= 0) {
    return reply.status(400).send({ error: 'Number not valid' });
  }
  const serie = getFibonacci(n);
  return { fibonacci: serie };
});



// Run the server!
fastify.listen({ port: 3000 }, function (err, address) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
  // Server is now listening on ${address}
})