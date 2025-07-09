import Fastify from "fastify";
import cors from "@fastify/cors";

const PORT = 3000;

const db = {
    categories: [],
    products: [],
};

const generateId = () => {
    // Big O(1)
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

const ProductModel = {
    create: ({ name, price, categoryId }) => {
        // Big O(1)
        const product = {
            id: generateId(),
            name,
            price,
            categoryId,
        };
        db.products.push(product);
        return product;
    },
    findAll: () => {
        // Big O(n^2)
        return db.products.map((product) => ProductModel.findById(product.id));
    },
    findById: (id) => {
        const product = db.products.find((product) => product.id === id);
        if (!product) {
            return null;
        }
        const category = CategoryModel.findById(product.categoryId);
        return {
            id: product.id,
            name: product.name,
            price: product.price,
            category,
        };
    },
    deleteById: (id) => {
        const initialLength = db.products.length;
        db.products = db.products.filter(p => p.id !== id);
        return db.products.length < initialLength;
    },
    updateById: (id, { name, price, categoryId }) => {
        const productIndex = db.products.findIndex(p => p.id === id);
        if (productIndex === -1) {
            return null;
        }

        if (categoryId) {
            const categoryExists = CategoryModel.findById(categoryId);
            if (!categoryExists) {
                return null;
            }
        }

        db.products[productIndex] = {
            ...db.products[productIndex], // Mantiene los campos existentes
            name: name !== undefined ? name : db.products[productIndex].name,
            price: price !== undefined ? price : db.products[productIndex].price,
            categoryId: categoryId !== undefined ? categoryId : db.products[productIndex].categoryId,
        };

        return ProductModel.findById(id);
    }
};

const CategoryModel = {
    create: ({ name }) => {
        // Big O(1)
        const category = {
            id: generateId(),
            name,
        };
        db.categories.push(category);
        return category;
    },
    findAll: () => {
        // Big O(n)
        return db.categories;
    },
    findById: (id) => {
        // Big O(n)
        return db.categories.find((category) => category.id === id);
    },
};

CategoryModel.create({ name: "Birrete" });
CategoryModel.create({ name: "Vasos" });
CategoryModel.create({ name: "Llavero" });
CategoryModel.create({ name: "Lazos" });
ProductModel.create({ name: "Birrete de Flores", price: 45, categoryId: db.categories[0].id });
ProductModel.create({ name: "Llavero Letra M", price: 5, categoryId: db.categories[2].id });
ProductModel.create({ name: "Birrete 3D", price: 37, categoryId: db.categories[0].id });
ProductModel.create({ name: "Vaso térmico Letra J", price: 15, categoryId: db.categories[1].id });
ProductModel.create({ name: "Vaso Plastico Victor R", price: 30, categoryId: db.categories[1].id });
ProductModel.create({ name: "Birrete Sencillo", price: 30, categoryId: db.categories[0].id });
ProductModel.create({ name: "Triple Lazo de Tres Colores", price: 12, categoryId: db.categories[3].id });





const fastify = Fastify({
    logger: true,
});

fastify.register(cors, {
    origin: "http://127.0.0.1:5500",
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
});

fastify.get("/api/v1/categories", (req, res) => {
    return {
        data: CategoryModel.findAll(),
        count: CategoryModel.findAll().length,
    };
});

fastify.get("/api/v1/products", (req, res) => {
    return {
        data: ProductModel.findAll(),
        count: ProductModel.findAll().length,
    };
});

fastify.get("/api/v1/products/:id", (req, res) => {
    return ProductModel.findById(req.params.id);
});

fastify.post("/api/v1/products", (req, reply) => {
    const { name, price, categoryId } = req.body;
    const categoryExists = CategoryModel.findById(categoryId);
    if (!categoryExists) {
        return reply.status(400).send({ message: 'Category ID not found' });
    }

    const newProduct = ProductModel.create({ name, price, categoryId });
    return reply.status(201).send(newProduct);
});

fastify.put("/api/v1/products/:id", (request, reply) => {
    const { id } = request.params;
    const { name, price, categoryId } = request.body;
    if (name === undefined && price === undefined && categoryId === undefined) {
        return reply.status(400).send({ message: 'No se proporcionaron datos para actualizar.' });
    }

    const updatedProduct = ProductModel.updateById(id, { name, price, categoryId });

    if (!updatedProduct) {
        const categoryExists = categoryId ? CategoryModel.findById(categoryId) : true;
        if (!categoryExists) {
             return reply.status(400).send({ message: 'Category ID not found' });
        }
        return reply.status(404).send({ message: 'Producto no encontrado.' });
    }

    return reply.status(200).send(updatedProduct);
});

fastify.delete("/api/v1/products/:id", async (request, reply) => {
    try {
        const { id } = request.params;

        fastify.log.info(`Attempting to delete product with ID: ${id}`);

        const wasDeleted = ProductModel.deleteById(id);

        if (!wasDeleted) {
            fastify.log.warn(`Product with ID: ${id} not found for deletion.`);
            return reply.status(404).send({ error: 'Producto no encontrado' });
        }

        fastify.log.info(`Product with ID: ${id} deleted successfully.`);
        return reply.status(204).send();
    } catch (error) {

        fastify.log.error(`Error during product deletion for ID ${request.params.id}:`, error);

        return reply.status(500).send({ error: 'Error interno del servidor al eliminar el producto.' });
    }
});


const start = async () => {
    try {
        await fastify.listen({ port: PORT });
        console.log(`Servidor Fastify escuchando en http://localhost:${PORT}`);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

start();