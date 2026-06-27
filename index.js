const dns = require("node:dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const { MongoClient, ServerApiVersion } = require('mongodb');

const express = require("express");
const dotenv = require("dotenv");
const app = express();
const port = process.env.PORT || 5000;


const cors = require("cors");
app.use(cors());
app.use(express.json());

dotenv.config();



app.get("/", (req, res) => {
    res.send("Hello World!");
});



const uri = process.env.MONGODB_URI;


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    
});