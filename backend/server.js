const express = require("express");
const { MongoClient } = require("mongodb");
const bodyParser = require("body-parser");
const { ObjectId } = require("mongodb");
require("dotenv").config();

const cors = require('cors');
const app = express();
const port = 3001;

// ✅ Use environment variable (fallback to localhost if not set)
const mongoURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017";

const client = new MongoClient(mongoURI);
const dbName = "PassOp";

// Middleware
app.use(bodyParser.json());
app.use(cors())

// Connect to MongoDB and then start server
async function startServer() {
  try {
    await client.connect();
    console.log("✅ Connected to MongoDB");

    const db = client.db(dbName);
    const collection = db.collection("documents");

    // 📌 GET all passwords
    app.get("/", async (req, res) => {
      try {
        const docs = await collection.find({}).toArray();
        res.json(docs);
      } catch (err) {
        console.error("❌ Error fetching documents:", err);
        res.status(500).json({ error: "Failed to fetch documents" });
      }
    });

    // 📌 POST to save a password
    app.post("/", async (req, res) => {
      try {
        const passwordData = req.body;

        if (!passwordData.site || !passwordData.username || !passwordData.password) {
          return res.status(400).json({ error: "Missing required fields" });
        }

        const result = await collection.insertOne(passwordData);
        res.json({ success: true, insertedId: result.insertedId });
      } catch (err) {
        console.error("❌ Error inserting document:", err);
        res.status(500).json({ error: "Failed to insert document" });
      }
    });

    // 📌 DELETE a password by id
app.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    console.log("🛠 Incoming DELETE id:", id);

    let query = { _id: id }; // try string match first

    // If the id is a valid ObjectId, also try that
    if (ObjectId.isValid(id)) {
      query = { $or: [{ _id: id }, { _id: new ObjectId(id) }] };
    }

    const result = await collection.deleteOne(query);
    console.log("🛠 Delete result:", result);

    if (result.deletedCount === 1) {
      res.json({ success: true });
    } else {
      res.status(404).json({ error: "Document not found" });
    }
  } catch (err) {
    console.error("❌ Error deleting document:", err);
    res.status(500).json({ error: "Failed to delete document" });
  }
});


    // 📌 PUT to update a password by id
    app.put("/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const updateData = req.body;
        if (!id || !updateData.platform || !updateData.username || !updateData.password) {
          return res.status(400).json({ error: "Missing required fields" });
        }
        const result = await collection.updateOne(
          { _id: new require('mongodb').ObjectId(id) },
          { $set: updateData }
        );
        if (result.modifiedCount === 1) {
          res.json({ success: true });
        } else {
          res.status(404).json({ error: "Document not found or not updated" });
        }
      } catch (err) {
        console.error("❌ Error updating document:", err);
        res.status(500).json({ error: "Failed to update document" });
      }
    });

    app.listen(port, () => {
      console.log(`🚀 Server running on http://localhost:${port}`);
    });
  } catch (err) {
    console.error("❌ Failed to connect to MongoDB:", err);
    process.exit(1);
  }
}

startServer();
