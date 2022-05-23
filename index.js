const express = require('express')
const cors = require('cors');
const app = express();
const jwt = require('jsonwebtoken');
require('dotenv').config();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ps30c.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


function verifyJWT(req, res, next) {
    const authorization = req.headers.authorization;
    console.log(authorization);
    if (!authorization) {
        return res.status(401).send({ message: 'UnAuthorized access' });
    }
    const token = authorization.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' })
        }
        req.decoded = decoded;
        next();
    });


}


async function run() {
    try {
        await client.connect();
        console.log('db connected');

        const toolsCollection = client.db('plumber').collection('tools');
        const bookedCollection = client.db('plumber').collection('booked');
        const userCollection = client.db('plumber').collection('user');
        const reviewCollection = client.db('plumber').collection('review');


        //Add Tools

        app.post('/tool', async (req, res) => {
            const tool = req.body;
            console.log(tool);
            const result = await toolsCollection.insertOne(tool);

            res.send(result);
        })

        //Get Tools

        app.get('/tool', async (req, res) => {
            const tools = await toolsCollection.find().toArray();

            res.send(tools);
        })

        //Get a single Tool

        app.get('/tool/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const details = await toolsCollection.findOne(query);

            res.send(details);
        })


        // Add bookings

        app.put('/booked', async (req, res) => {
            const booked = req.body;
            const { id, quantity, availableQuantity } = booked;
            const filter = { _id: ObjectId(id) };

            console.log(booked);
            const updateStatus = {
                $set: {
                    status: 'pending',
                }
            }
            const updatedDoc = {
                $set: {
                    availableQuantity: availableQuantity - quantity,

                }
            }
            const result = await bookedCollection.insertOne(booked, updateStatus);
            const updateQuantity = await toolsCollection.updateOne(filter, updatedDoc);
            return res.send({
                success: true, result
            });
        })


        //Add all user

        app.put('/user/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = { email: email };
            const options = { upsert: true };

            const updateDoc = {
                $set: user,
            };

            const result = await userCollection.updateOne(filter, updateDoc, options);
            const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN, { expiresIn: '1h' });
            res.send({ result, token });

        })

        //get oders
        app.get('/booked', verifyJWT, async (req, res) => {
            const email = req.query.email;



            const decodedEmail = req.decoded.email;
            if (email === decodedEmail) {
                const query = { email: email };
                const bookings = await bookedCollection.find(query).toArray();
                return res.send(bookings);
            }
            else {
                return res.status(403).send({ message: 'Forbidden access' })
            }

        })


        //post review

        app.post('/review', async(req,res) =>{
            const review = req.body;
            console.log(review);
             const result = await reviewCollection.insertOne(review); 

            res.send(result);
        })




    } finally {
        //await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Hello From plumber Portal')
})

app.listen(port, () => {
    console.log(`plumber listening on port ${port}`)
})