const mongoose = require("mongoose");
const Starship = require("./models/starship");

const express = require("express");

const dotenv = require("dotenv");
dotenv.config();

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3000;

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.get("/starships", async (req, res) => {
  const starships = await Starship.find();
  if (starships.length === 0) {
    console.log("No starships found.");
  }
  res.send(starships);
});

app.put("/starships/:id", async (req, res) => {
  const starshipId = req.params.id;
  const body = req.body;
  const { name, captain, class: shipClass, crewSize } = body;
  if (!name || !captain || !shipClass || !crewSize) {
    return res.status(400).send("All fields are required.");
  }
  try {
    const starship = await Starship.findByIdAndUpdate(
      starshipId,
      { name, captain, class: shipClass, crewSize },
      { new: true }
    );
    if (!starship) {
      return res.status(404).send("Starship not found.");
    }
    console.log("Starship updated successfully!");
    res.send(starship);
  } catch (err) {
    console.error("Error updating starship:", err.message);
    res.status(500).send("Error updating starship.");
  }
});

app.post("/starships", async (req, res) => {
  async function createStarship() {
    console.log("\nCREATE NEW STARSHIP");
    const body = req.body;
    const { name, captain, class: shipClass, crewSize } = body;
    if (!name || !captain || !shipClass || !crewSize) {
      return res.status(400).send("All fields are required.");
    }

    try {
      const starship = new Starship({
        name,
        captain,
        class: shipClass,
        crewSize,
      });
      await starship.save();
      console.log("Starship created successfully!");
      res.status(201).send(starship);
    } catch (err) {
      console.error("Error creating starship:", err.message);
      res.status(500).send("Error creating starship.");
    }
  }
  await createStarship();
});

app.delete("/starships/:id", async (req, res) => {
  const starshipId = req.params.id;
  try {
    const starship = await Starship.findByIdAndDelete(starshipId);
    if (!starship) {
      return res.status(404).send("Starship not found.");
    }
    console.log("Starship deleted successfully!");
    res.send(starship);
  } catch (err) {
    console.error("Error deleting starship:", err.message);
    res.status(500).send("Error deleting starship.");
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
