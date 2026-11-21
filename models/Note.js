// models/Note.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const noteSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    owner: {
        type: String,
        required: true
    }
}, { timestamps: true });

const NoteModel = mongoose.model('Note', noteSchema);

let memoryNotes = [];

const Note = {
    schema: noteSchema,
    model: NoteModel,
    async find(query) {
        if (mongoose.connection.readyState === 1) {
            return await NoteModel.find(query);
        }
        if (query.owner) {
            return memoryNotes.filter(n => n.owner.toString() === query.owner.toString());
        }
        return memoryNotes;
    },
    async findById(id) {
        if (mongoose.connection.readyState === 1) {
            return await NoteModel.findById(id);
        }
        return memoryNotes.find(n => n._id.toString() === id.toString()) || null;
    },
    async create(data) {
        if (mongoose.connection.readyState === 1) {
            return await NoteModel.create(data);
        }
        const newNote = {
            _id: new mongoose.Types.ObjectId().toString(),
            title: data.title,
            content: data.content,
            owner: data.owner.toString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        memoryNotes.push(newNote);
        return newNote;
    },
    async findByIdAndUpdate(id, data, options) {
        if (mongoose.connection.readyState === 1) {
            return await NoteModel.findByIdAndUpdate(id, data, options);
        }
        const note = memoryNotes.find(n => n._id.toString() === id.toString());
        if (note) {
            if (data.title) note.title = data.title;
            if (data.content) note.content = data.content;
            note.updatedAt = new Date().toISOString();
            return note;
        }
        return null;
    },
    async findByIdAndDelete(id) {
        if (mongoose.connection.readyState === 1) {
            return await NoteModel.findByIdAndDelete(id);
        }
        const index = memoryNotes.findIndex(n => n._id.toString() === id.toString());
        if (index !== -1) {
            const deleted = memoryNotes.splice(index, 1);
            return deleted[0];
        }
        return null;
    }
};

module.exports = Note;
