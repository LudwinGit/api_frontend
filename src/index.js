const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const app = express();

mongoose
    .connect('mongodb://34.67.186.172:27017/covid19', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
        useCreateIndex: true,
    })
    .then((db) => console.log("Mongodb is connected to", db.connection.host))
    .catch((err) => console.error(err));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.set('port', process.env.PORT || 3000)

let Schema = mongoose.Schema;
let CasosSchema = new Schema({
    name: String,
    location: String,
    age: Number,
    infectedtype: String,
    state: String
});

let Casos = mongoose.model('Casos', CasosSchema);

router.get('/top', async function (req, res) {
    const casos = await Casos.aggregate([
        {
            $group: {
                _id: "$location",
                count: { $sum: 1 }
            }
        },
        {
            $sort: { casos: -1 }
        },
        {
            $limit: 3
        }
    ])
    res.json({ casos });
});

router.get('/pipeline', async function (req, res) {
    const casos = await Casos.aggregate([
        {
            $group: {
                _id: "$location",
                count: { $sum: 1 }
            }
        },
        {
            $sort: { casos: -1 }
        }
    ])
    res.json({ casos });
});

router.get('/range',async function(req,res){
    const casos = await Casos.aggregate([
        {
            $group: {
                _id: {
                    $cond: [{$and: [{ $lt: ["$age",10]},{$gte: ["$age",0]}]},"0-10"  ,{
                    $cond: [{$and: [{ $lt: ["$age",20]},{$gte: ["$age",10]}]},"10-20",{
                    $cond: [{$and: [{ $lt: ["$age",30]},{$gte: ["$age",20]}]},"20-30",{
                    $cond: [{$and: [{ $lt: ["$age",40]},{$gte: ["$age",30]}]},"30-40",{
                    $cond: [{$and: [{ $lt: ["$age",50]},{$gte: ["$age",40]}]},"40-50",{
                    $cond: [{$and: [{ $lt: ["$age",60]},{$gte: ["$age",50]}]},"50-60",{
                    $cond: [{$and: [{ $lt: ["$age",70]},{$gte: ["$age",60]}]},"60-70",{
                    $cond: [{$and: [{ $lt: ["$age",80]},{$gte: ["$age",70]}]},"70-80",{
                    $cond: [{$and: [{ $lt: ["$age",90]},{$gte: ["$age",80]}]},"80-90",{
                    $cond: [{$and: [{ $lt: ["$age",100]},{$gte: ["$age",90]}]},"90-100","+100"]}]}]}]}]}]}]}]}]}]},
                    "casos": {$sum: 1}
                }            
        },
        {
            $sort : {_id:1}
        }
    ])
    res.json({ casos });
})

app.use('/api', router);

app.listen(app.get('port'), () => {
    console.log(`Server on port ${app.get('port')}`);
});