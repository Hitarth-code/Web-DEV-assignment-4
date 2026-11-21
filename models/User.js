// models/User.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: 'user'
    }
}, { timestamps: true });

const UserModel = mongoose.model('User', userSchema);

let memoryUsers = [];

const User = {
    schema: userSchema,
    model: UserModel,
    async findOne(query) {
        if (mongoose.connection.readyState === 1) {
            return await UserModel.findOne(query);
        }
        if (query.email) {
            return memoryUsers.find(u => u.email === query.email) || null;
        }
        if (query._id) {
            return memoryUsers.find(u => u._id.toString() === query._id.toString()) || null;
        }
        return null;
    },
    async findById(id) {
        if (mongoose.connection.readyState === 1) {
            return await UserModel.findById(id);
        }
        return memoryUsers.find(u => u._id.toString() === id.toString()) || null;
    },
    async create(data) {
        if (mongoose.connection.readyState === 1) {
            return await UserModel.create(data);
        }
        const newUser = {
            _id: new mongoose.Types.ObjectId().toString(),
            username: data.username,
            email: data.email,
            password: data.password,
            role: data.role || 'user',
            createdAt: new Date(),
            updatedAt: new Date()
        };
        memoryUsers.push(newUser);
        return newUser;
    }
};

module.exports = User;
