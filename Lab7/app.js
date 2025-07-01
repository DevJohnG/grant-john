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
    origin: "*",
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

fastify.post("/api/v1/products", (req, res) => {
    const { name, price, categoryId } = req.body;
    return ProductModel.create({ name, price, categoryId });
});

const start = async () => {
    try {
        await fastify.listen({ port: PORT });
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

start();