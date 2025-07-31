import 'dotenv/config';

import Fastify from "fastify";
import cors from "@fastify/cors";
import connect from "./config/db.js";

import Product from './models/Product.js'
import Category from './models/Category.js';

import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PORT = process.env.PORT || 5000;

const fastify = Fastify({
    logger: true,
});


fastify.register(cors, {
    origin: process.env.FRONTEND_URL || "http://localhost:5500",
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
});

connect();

// ********** API Routes **********

fastify.get("/api/v1/categories", async (request, reply) => {
    try {
        const category = await Category.find({});
        return {
            data: category,
            count: category.length,
        };
    } catch (error) {
        fastify.log.error('Error fetching category:', error);
        return reply.status(500).send({ error: 'Error interno del servidor al obtener categorías.' });
    }
});

fastify.post("/api/v1/categories", async (request, reply) => {
    try {
        const { name } = request.body;
        if (!name) {
            return reply.status(400).send({ message: 'El nombre de la categoría es requerido.' });
        }
        const newCategory = new Category({ name });
        await newCategory.save();
        return reply.status(201).send(newCategory);
    } catch (error) {
        fastify.log.error('Error creating category:', error);
        return reply.status(500).send({ error: 'Error interno del servidor al crear categoría.' });
    }
});

fastify.get("/api/v1/products", async (request, reply) => {
    try {
        const product = await Product.find({}).populate('category');
        return {
            data: product,
            count: product.length,
        };
    } catch (error) {
        fastify.log.error('Error fetching product:', error);
        return reply.status(500).send({ error: 'Error interno del servidor al obtener productos.' });
    }
});

fastify.get("/api/v1/products/:id", async (request, reply) => {
    try {
        const product = await Product.findById(request.params.id).populate('category');
        if (!product) {
            return reply.status(404).send({ message: 'Producto no encontrado.' });
        }
        return product;
    } catch (error) {
        if (error.name === 'CastError') {
            return reply.status(400).send({ message: 'ID de producto inválido.' });
        }
        fastify.log.error(`Error fetching product with ID ${request.params.id}:`, error);
        return reply.status(500).send({ error: 'Error interno del servidor al obtener el producto.' });
    }
});

fastify.post("/api/v1/products", async (request, reply) => {
    try {
        const { name, price, category, subCategory, description, imageUrl, stock, stripe_id, stripe_price_id } = request.body;

        if (!name || !price || !category || !subCategory) {
            return reply.status(400).send({ message: 'Nombre, precio, categoría y subcategoría son requeridos.' });
        }
        if (typeof price !== 'number' || price < 0) {
            return reply.status(400).send({ message: 'El precio debe ser un número válido y no negativo.' });
        }
        if (stock !== undefined && (typeof stock !== 'number' || stock < 0)) {
            return reply.status(400).send({ message: 'El stock debe ser un número válido y no negativo.' });
        }

        const categoryExists = await Category.findById(category);
        if (!categoryExists) {
            return reply.status(400).send({ message: 'ID de categoría no encontrado.' });
        }

        const subCategoryExists = categoryExists.subcategories.some(sc => sc.name === subCategory);
        if (!subCategoryExists) {
            return reply.status(400).send({ message: 'Subcategoría no encontrada en la categoría especificada.' });
        }

        const newProduct = new Product({
            name,
            price,
            category,
            subCategory,
            description,
            imageUrl,
            stock,
            stripe_id,
            stripe_price_id
        });

        await newProduct.save();
        return reply.status(201).send(newProduct);
    } catch (error) {
        if (error.name === 'ValidationError') {
            return reply.status(400).send({ message: error.message });
        }
        fastify.log.error('Error creating product:', error);
        return reply.status(500).send({ error: 'Error interno del servidor al crear el producto.' });
    }
});

fastify.put("/api/v1/products/:id", async (request, reply) => {
    try {
        const { id } = request.params;
        const { name, price, category, subCategory, description, imageUrl, stock, stripe_id, stripe_price_id } = request.body;

        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (price !== undefined) {
            if (typeof price !== 'number' || price < 0) {
                return reply.status(400).send({ message: 'El precio debe ser un número válido y no negativo.' });
            }
            updateData.price = price;
        }
        if (description !== undefined) updateData.description = description;
        if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
        if (stock !== undefined) {
            if (typeof stock !== 'number' || stock < 0) {
                return reply.status(400).send({ message: 'El stock debe ser un número válido y no negativo.' });
            }
            updateData.stock = stock;
        }
        if (stripe_id !== undefined) updateData.stripe_id = stripe_id;
        if (stripe_price_id !== undefined) updateData.stripe_price_id = stripe_price_id;


        if (category !== undefined) {
            const categoryExists = await Category.findById(category);
            if (!categoryExists) {
                return reply.status(400).send({ message: 'ID de categoría no encontrado.' });
            }
            updateData.category = category;

            if (subCategory !== undefined) {
                const subCategoryExists = categoryExists.subcategories.some(sc => sc.name === subCategory);
                if (!subCategoryExists) {
                    return reply.status(400).send({ message: 'Subcategoría no encontrada en la categoría especificada.' });
                }
                updateData.subCategory = subCategory;
            }
        } else if (subCategory !== undefined) {
            return reply.status(400).send({ message: 'La categoría es requerida cuando se actualiza la subcategoría.' });
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        ).populate('category');

        if (!updatedProduct) {
            return reply.status(404).send({ message: 'Producto no encontrado.' });
        }

        return reply.status(200).send(updatedProduct);
    } catch (error) {
        if (error.name === 'CastError') {
            return reply.status(400).send({ message: 'ID de producto inválido.' });
        }
        if (error.name === 'ValidationError') {
            return reply.status(400).send({ message: error.message });
        }
        fastify.log.error(`Error updating product with ID ${request.params.id}:`, error);
        return reply.status(500).send({ error: 'Error interno del servidor al actualizar el producto.' });
    }
});

fastify.delete("/api/v1/products/:id", async (request, reply) => {
    try {
        const { id } = request.params;
        fastify.log.info(`Attempting to delete product with ID: ${id}`);

        const deletedProduct = await Product.findByIdAndDelete(id);

        if (!deletedProduct) {
            fastify.log.warn(`Product with ID: ${id} not found for deletion.`);
            return reply.status(404).send({ error: 'Producto no encontrado.' });
        }

        fastify.log.info(`Product with ID: ${id} deleted successfully.`);
        return reply.status(204).send();
    } catch (error) {
        if (error.name === 'CastError') {
            return reply.status(400).send({ message: 'ID de producto inválido.' });
        }
        fastify.log.error(`Error during product deletion for ID ${request.params.id}:`, error);
        return reply.status(500).send({ error: 'Error interno del servidor al eliminar el producto.' });
    }
});

// ********** Stripe Payment Routes **********

fastify.post("/api/v1/create-payment-intent", async (request, reply) => {
    try {
        const { productId, quantity = 1, customization } = request.body;

        if (!productId) {
            return reply.status(400).send({ error: 'Product ID is required' });
        }

        let product;
        let amount;

        // Handle custom products
        if (productId.startsWith('custom-') || productId.startsWith('order-')) {
            if (customization && customization.budget) {
                amount = Math.round(customization.budget * quantity * 100);
                product = {
                    name: customization.title || 'Producto Personalizado',
                    price: customization.budget
                };
            } else {
                return reply.status(400).send({ error: 'Budget is required for custom products' });
            }
        } else {
            // Get product details from database
            product = await Product.findById(productId);
            if (!product) {
                return reply.status(404).send({ error: 'Product not found' });
            }
            amount = Math.round(product.price * quantity * 100);
        }

        // Create payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amount,
            currency: 'usd',
            metadata: {
                productId: productId,
                productName: product.name,
                quantity: quantity.toString(),
                customization: customization ? JSON.stringify(customization) : null
            }
        });

        return reply.send({
            clientSecret: paymentIntent.client_secret,
            amount: amount,
            productName: product.name
        });
    } catch (error) {
        fastify.log.error('Error creating payment intent:', error);
        return reply.status(500).send({ error: 'Error creating payment intent' });
    }
});

fastify.post("/api/v1/confirm-payment", async (request, reply) => {
    try {
        const { paymentIntentId } = request.body;

        if (!paymentIntentId) {
            return reply.status(400).send({ error: 'Payment Intent ID is required' });
        }

        // Retrieve payment intent to get details
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        
        if (paymentIntent.status === 'succeeded') {
            // Here you could save order details to database, send confirmation email, etc.
            return reply.send({
                success: true,
                orderId: paymentIntent.id,
                amount: paymentIntent.amount,
                metadata: paymentIntent.metadata
            });
        } else {
            return reply.status(400).send({ error: 'Payment not completed' });
        }
    } catch (error) {
        fastify.log.error('Error confirming payment:', error);
        return reply.status(500).send({ error: 'Error confirming payment' });
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