const express = require('express')
const cors = require('cors');
const app = express();
const jwt = require('jsonwebtoken');
require('dotenv').config();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require('mongodb');

app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ps30c.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
async function run() {
    try {
      await client.connect();
      console.log('db connected')


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