import mongoose from 'mongoose';

const SubCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    }
});

const CategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'El nombre de la categoría es requerido'],
        unique: true,
        trim: true,
    },
    subcategories: [SubCategorySchema],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const Category = mongoose.model('Category', CategorySchema);

export default Category;