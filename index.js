const dns = require("node:dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");

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

// Create MongoDB Client
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect MongoDB
    await client.connect();

    // Test Connection
    await client.db("admin").command({ ping: 1 });

    console.log("✅ Successfully connected to MongoDB!");

    // ==========================
    // Your Collections Here
    // ==========================

    // const database = client.db("yourDatabaseName");
    // const usersCollection = database.collection("users");

    // Example Route
    app.get("/users", async (req, res) => {
      res.send("Users API is working.");
    });

  } catch (error) {
    console.error("❌ MongoDB Connection Error:");
    console.error(error);
  }
}

// Run MongoDB Connection
run().catch(console.dir);

// Start Server
app.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
});