const dns = require("node:dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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

    const database = client.db("my-tutor");

    const tutorsCollection = database.collection("tutors");
    const bookingTutorsCollection = database.collection("booking_Tutor");
    const usersCollection = database.collection("users");


    app.get("/tutors", async (req, res) => {
      const cursor = tutorsCollection.find({});
      const tutors = await cursor.toArray();
      res.send(tutors);
    });

    app.get("/tutors/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const tutor = await tutorsCollection.findOne(query);
      res.send(tutor);
    });

    app.get("/allBookings", async (req, res) => {
      const bookings = await bookingTutorsCollection.find().toArray();
      res.send(bookings);
    });

    app.get("/myBookings", async (req, res) => {
      const { email } = req.query;

      if (!email) {
        return res.status(400).send({
          error: "Student email is required",
        });
      }

      const bookings = await bookingTutorsCollection
        .find({
          "student.email": email,
        })
        .sort({
          "timestamps.createdAt": -1,
        })
        .toArray();

      res.send(bookings);
    });


    app.get("/myBookings/:id", async (req, res) => {
      const id = req.params.id;

      const booking = await bookingTutorsCollection.findOne({
        _id: id,
      });

      res.send(booking);
    });


    app.get("/users", async (req, res) => {
      try {
        const users = await usersCollection.find({}).toArray();
        console.log(users);
        res.send(users);
      } catch (error) {
        console.error(error);
        res.status(500).send(error.message);
      }
    });


    app.get("/users", async (req, res) => {
      try {
        const { email } = req.query;

        if (!email) {
          return res.status(400).send({
            message: "Email is required",
          });
        }

        const user = await usersCollection.findOne({ email });

        if (!user) {
          return res.status(404).send({
            message: "User not found",
          });
        }

        res.send(user);
      } catch (error) {
        console.error(error);
        res.status(500).send({
          message: error.message,
        });
      }
    });



  } finally {

  }
}
run().catch(console.dir);





