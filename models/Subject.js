const mongoose = require('mongoose');

const SubjectSchema = mongoose.Schema({
    subject: { type: String, required: true },
    topics: { type: Array, default: [
        {
            title: {
                type: String, required: true
            },
            links: Array, default: [
                { title: String, required: true },
                { description: String, required: true },
                { url: String, required: true },
            ]
        }
    ]},
    tests: { type: Array, required: false, default: [
            { title: String, required: true },
            { description: String, required: true },
            { url: String, required: true },
    ]}
});

module.exports = mongoose.model('lf-2', PostSchema);