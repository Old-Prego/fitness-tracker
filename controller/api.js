const router = require("express").Router();
const Workout = require("../models/workout.js");
const mongojs = require('mongojs');

router.get("/workouts", (req, res) => {
    Workout.find({})
        .sort({ day: 1 })
        .then(dbWorkout => {
            res.json(dbWorkout);
        })
        .catch(err => {
            res.status(400).json(err);
        });
});

router.post("/workouts", ({ body }, res) => {
    const workout = new Workout(body);
    workout.totalTime();

    Workout.create(workout)
        .then(dbWorkout => {
            res.json(dbWorkout);
        })
        .catch(err => {
            res.status(400).json(err);
        });
});

router.post("/workouts/bulk", ({ body }, res) =>{
    Workout.insertMany(body)
        .then(dbWorkout => {
            res.json(dbWorkout);
        })
        .catch(err => {
            res.status(400).json(err);
        });
});

router.put("/workouts/:id", (req, res) => {
    Workout.updateOne({
        _id: mongojs.ObjectId(req.params.id)
    }, {
        $push: {
            exercises: req.body
        }
    })
        .then(dbWorkout => {
            res.json(dbWorkout);
        })
        .catch(err => {
            res.status(400).json(err);
        });
});

router.get("/workouts/range", async (req, res) => {
    Workout.aggregate([
        { 
            $unwind: "$exercises" 
        },
        {
            $group: {
                _id: "$day",
                day: { $push: { $max: "$day"}},
                totalDuration: { $sum: "$exercises.duration" },
                totalWeight: { $sum: "$exercises.weight"}
            }
        },
        {$sort: {_id: -1}},
        {$limit: 7},
        {$sort: {_id: 1}},
    ])
        .then(dbWorkout => {
            res.json(dbWorkout);
        })
        .catch(err => {
            console.log(err)
            res.status(400).json(err);
        });
})

module.exports = router;