const dns = require("node:dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const { log } = require("node:console");
const { createRemoteJWKSet, jwtVerify } = require("jose-cjs");

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


const loger = (req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
}

const veryFiToken = async (req, res, next) => {

  const { authorization } = req.headers;

  const token = authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      error: "Unauthorized",
    });//////
  }


  const JWKS = createRemoteJWKSet(
    new URL('http://localhost:3000/api/auth/jwks')
  )


  try {
    const JWKS = createRemoteJWKSet(
      new URL('http://localhost:3000/api/auth/jwks')
    )
    const { payload } = await jwtVerify(token, JWKS)


    req.user = payload;


    console.log(req.user);

    next();

  } catch (error) {
    console.error('Token validation failed:', error)
    return res.status(401).json({
      error: "Unauthorized",
    });
  }




  console.log(token);

}







async function run() {
  try {

    await client.connect();

    const database = client.db("my-tutor");

    const tutorsCollection = database.collection("tutors");
    const bookingTutorsCollection = database.collection("booking_Tutor");
    const usersCollection = database.collection("user");


    app.get("/tutors", async (req, res) => {
      const cursor = tutorsCollection.find({});
      const tutors = await cursor.toArray();
      res.send(tutors);
    });

    app.get("/tutors/:id", loger, veryFiToken, async (req, res) => {
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
      try {
        const id = req.params.id;

        console.log("ID from params:", id);

        const booking = await bookingTutorsCollection.findOne({
          _id: new ObjectId(id),
        });

        console.log("Booking:", booking);

        res.send(booking);
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: error.message });
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



    app.post("/booking_Tutor", async (req, res) => {
      try {
        const booking = req.body;

        const tutorId = booking.tutor._id;

        // 1. Tutor খুঁজে বের করো
        const tutor = await tutorsCollection.findOne({
          _id: new ObjectId(tutorId),
        });

        // 2. Slot আছে কিনা চেক করো ✅
        if (tutor.totalSlot <= 0) {
          return res.status(400).send({
            message: "No available slots",
          });
        }

        // 3. আগে বুক করেছে কিনা চেক করো ✅
        const alreadyBooked = await bookingTutorsCollection.findOne({
          "student.email": booking.student.email,
          "tutor._id": tutorId,
        });

        if (alreadyBooked) {
          return res.status(400).send({
            message: "You have already booked this tutor",
          });
        }

        // 4. Booking Save
        const result = await bookingTutorsCollection.insertOne(booking);

        // 5. Slot কমাও
        await tutorsCollection.updateOne(
          { _id: new ObjectId(tutorId) },
          {
            $inc: {
              totalSlot: -1,
            },
          }
        );

        res.send(result);

      } catch (error) {
        console.log(error);
        res.status(500).send({ message: error.message });
      }
    });



  } finally {

  }
}
run().catch(console.dir);





