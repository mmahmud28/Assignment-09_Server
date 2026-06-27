const dns = require("node:dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const { log } = require("node:console");

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Home Route
app.get("/", (req, res) => {
  res.send("Server is running successfully!");
});

// MongoDB URI
const uri = process.env.DB_URI;

// Check if URI exists
if (!uri) {
  console.error("❌ MONGODB_URI is missing in the .env file.");
  process.exit(1);
}


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


// Start Server
app.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
});



async function run() {
  try {
    
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    
  } finally {
    
  }
}
run().catch(console.dir);





