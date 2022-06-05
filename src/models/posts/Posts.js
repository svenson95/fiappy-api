const mongoose = require('../../middleware/mongoose');

const Posts = mongoose.schoolbase.model(
  'subjects-posts',
  new mongoose.Schema({
    url: { type: String, required: true },
    topicId: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    subject: { type: String, required: true },
    type: { type: String, required: true },
    lessonDate: { type: String, required: true },
    lastUpdate: { type: String, required: true },
    schoolWeek: { type: Number, required: true },
    elements: { type: Array, default: undefined },
  }),
);

module.exports = Posts;
