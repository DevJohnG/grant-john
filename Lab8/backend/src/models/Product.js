import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: [true, 'La categoría del producto es requerida'],
    },
    subCategory: {
        type: String,
        required: [true, 'La subcategoría del producto es requerida'],
    },
    name: {
        type: String,
        required: [true, 'El nombre del producto es requerido'],
        trim: true,
    },
    /*description: {
        type: String,
        required: false,
    },*/
    price: {
        type: Number,
        required: [true, 'El precio del producto es requerido'],
        min: [0, 'El precio no puede ser negativo'],
    },
    imageUrl: {
        type: String,
        required: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Product = mongoose.model('Product', ProductSchema);

export default Product;