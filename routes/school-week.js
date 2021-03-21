const express = require('express');
const router = express.Router();
const Posts = require('../models/posts/Posts');
const Quizzes = require('../models/quiz/Quiz');
const IndexCards = require('../models/index-cards/IndexCards');

// Get specific school week by number
router.get('/number/:number', async (req, res) => {
    try {
        const posts = await Posts.find({}, {elements: 0});
        const quizzes = await Quizzes.find({}, {questions: 0});
        const indexCards = await IndexCards.find({}, {questions: 0});
        const objects = [...posts, ...quizzes, ...indexCards];
        let week = { schoolWeek: req.params.number, posts: [] };
        await objects.forEach(post => {
            if (req.params.number === post.schoolWeek) {
                week.posts.push(post);
            }
        });
        week.posts.sort(function(a, b) {
            if (a.lessonDate > b.lessonDate) { return 1; }
            if (a.lessonDate < b.lessonDate) { return -1; }
            return 0;
        });
        res.status(200).json(week);
    } catch(error) {
        res.status(500).json({
            message: 'Get school-week failed. Try again',
            error: error
        });
    }
});

// Get all school weeks (history)
router.get('/all', async (req, res) => {
    try {
        const posts = await Posts.find({}, {elements: 0});
        const quizzes = await Quizzes.find({}, {questions: 0});
        const indexCards = await IndexCards.find({}, {questions: 0});
        const objects = [...posts, ...quizzes, ...indexCards];
        const weeksArray = [];
        objects.forEach(post => {
            if (post.schoolWeek > 0) {
                const weekObj = weeksArray.find(week => week.schoolWeek === post.schoolWeek);
                if (weekObj) {
                    weekObj.posts.push(post);
                } else {
                    weeksArray.push({
                        schoolWeek: post.schoolWeek,
                        posts: [post]
                    })
                }
            }
        });
        weeksArray.sort(function(a, b) {
            if (Number(a.schoolWeek) > Number(b.schoolWeek)) { return 1; }
            if (Number(a.schoolWeek) < Number(b.schoolWeek)) { return -1; }
            return 0;
        });
        await weeksArray.forEach(week => {
            week.posts.sort(function(a, b) {
                if (a.lessonDate > b.lessonDate) { return 1; }
                if (a.lessonDate < b.lessonDate) { return -1; }
                return 0;
            });
        })
        res.status(200).json(weeksArray);
    } catch(error) {
        res.status(500).json({
            message: 'Get all school-weeks (history) failed. Try again',
            error: error
        });
    }
});

module.exports = router;
