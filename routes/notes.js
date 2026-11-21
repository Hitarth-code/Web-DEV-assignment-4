// routes/notes.js
const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const { verifyToken } = require('../middleware/auth');
const appEvents = require('../events/eventEmitter');

router.use(verifyToken);

router.get('/', async (req, res) => {
    try {
        const notes = await Note.find({ owner: req.user.id });
        return res.status(200).json(notes);
    } catch (err) {
        return res.status(500).json({ message: "Server error", error: err.message });
    }
});

router.post('/', async (req, res) => {
    try {
        const { title, content } = req.body;

        if (!title || !content) {
            return res.status(400).json({ message: "Title and content are required" });
        }

        const newNote = await Note.create({
            title,
            content,
            owner: req.user.id
        });

        appEvents.emit('note_created', newNote);

        return res.status(201).json(newNote);
    } catch (err) {
        return res.status(500).json({ message: "Server error", error: err.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);

        if (!note) {
            return res.status(404).json({ message: "Note not found" });
        }

        if (note.owner.toString() !== req.user.id.toString()) {
            return res.status(403).json({ message: "Not authorized to update this note" });
        }

        const updatedNote = await Note.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        return res.status(200).json(updatedNote);
    } catch (err) {
        return res.status(500).json({ message: "Server error", error: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);

        if (!note) {
            return res.status(404).json({ message: "Note not found" });
        }

        if (note.owner.toString() !== req.user.id.toString()) {
            return res.status(403).json({ message: "Not authorized to delete this note" });
        }

        await Note.findByIdAndDelete(req.params.id);

        return res.status(200).json({ message: "Note deleted successfully" });
    } catch (err) {
        return res.status(500).json({ message: "Server error", error: err.message });
    }
});

module.exports = router;
