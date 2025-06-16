// app.js (main Fastify application file)
import Fastify from 'fastify';

const fastify = Fastify({
  logger: true // Habilita el logger para ver las solicitudes en consola
});


let products = [
  { id: '1', nombre: 'Birrete de flores', precio: 45, categoria: 'Birrete' },
  { id: '2', nombre: 'Llavero Letra M', precio: 5, categoria: 'Llavero' },
  { id: '3', nombre: 'Birrete 3D', precio: 37, categoria: 'Birrete' },
  {id: '4', nombre: 'Vaso térmico letra J', precio: 15, categoria: 'Vaso'},
  {id: '5', nombre: 'Vaso Plastico Victor R', precio: 10, categoria: 'Vaso'},
  {id: '6', nombre: 'Birrete Sencillo', precio: 30, categoria: 'Birrete'},
  {id: '7', nombre: 'triple lazo de tres colores', precio: 12, categoria: 'Lazo'},
];

let nextProductId = products.length > 0 ? Math.max(...products.map(p => parseInt(p.id))) + 1 : 1;


// Routes
fastify.get('/products', (request, reply) => {
  return { madebygreechh_products: products };
});

fastify.get('/products/:id', (request, reply) => {
  const { id } = request.params;
  const product = products.find(p => p.id === id);

  if (!product) {
    return reply.status(404).send({ error: 'Product not found' });
  }
  return { product: product };
});

fastify.post('/products', (request, reply) => {
  const { nombre, precio, categoria } = request.body;

  if (!nombre || !precio || !categoria) {
    return reply.status(400).send({ error: 'Missing data in one of this fields: nombre, precio, categoría' });
  }
  if (typeof precio !== 'number' || precio <= 0) {
      return reply.status(400).send({ error: 'The "precio" must be positive.' });
  }

  const newProduct = {
    id: String(nextProductId++),
    nombre,
    precio,
    categoria
  };

  products.push(newProduct);
  return reply.status(201).send(newProduct);
});


fastify.put('/products/:id', (request, reply) => {
  const { id } = request.params;
  const { nombre, precio, categoria } = request.body;

  const productIndex = products.findIndex(p => p.id === id);

  if (productIndex === -1) {
    return reply.status(404).send({ error: 'Product not found' });
  }

  if (!nombre || !precio || !categoria) {
    return reply.status(400).send({ error: 'Missing data in one of this fields: nombre, precio, categoría' });
  }
  if (typeof precio !== 'number' || precio <= 0) {
      return reply.status(400).send({ error: 'The "precio" must be positive.' });
  }

  const updatedProduct = {
    id: id,
    nombre,
    precio,
    categoria
  };

  products[productIndex] = updatedProduct;
  return { message: 'Product updated', product: updatedProduct };
});


fastify.delete('/products/:id', (request, reply) => {
  const { id } = request.params;

  const initialLength = products.length;
  products = products.filter(p => p.id !== id);

  if (products.length === initialLength) {
    return reply.status(404).send({ error: 'Product not found' });
  }

  return reply.status(204).send({Success: 'Product deleted',product: products});
});


// --- Iniciar el servidor ---
fastify.listen({ port: 3000 }, function (err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`Server is now listening on ${address}`);
});