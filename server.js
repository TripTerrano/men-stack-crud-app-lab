const mongoose = require("mongoose");
const Starship = require("./models/starship");

const express = require("express");
const ejs = require("ejs");
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
  res.send(
    starships.map((starship) => ({
      id: starship._id,
      name: starship.name,
      captain: starship.captain,
      class: starship.class,
      crewSize: starship.crewSize,
    }))
  );
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

app.set("view engine", "ejs");
app.get("/", async (req, res) => {
  const starships = await fetch("http://localhost:3000/starships")
    .then((response) => response.json())
    .catch((err) => {
      console.error("Error fetching starships:", err);
      return [];
    });
  console.log("Starships fetched:", starships);
  const html = await ejs.renderFile(
    "views/index.ejs",
    {
      title: "Starship Management",
      starships,
    },
    {
      async: true,
      cache: false,
    }
  );
  res.send(html);
});
app.get("/new", (req, res) => {
  res.render("new", { title: "Create New Starship" });
});

app.get("/:id", async (req, res) => {
  const starshipId = req.params.id;
  try {
    const starship = await Starship.findById(starshipId);
    if (!starship) {
      return res.status(404).send("Starship not found.");
    }
    const html = await ejs.renderFile(
      "views/starship.ejs",
      { title: "Starship Details", starship },
      { async: true, cache: false }
    );
    res.send(html);
  } catch (err) {
    console.error("Error fetching starship:", err.message);
    res.status(500).send("Error fetching starship.");
  }
});

app.get("/:id/edit", async (req, res) => {
  const starshipId = req.params.id;
  try {
    const starship = await Starship.findById(starshipId);
    if (!starship) {
      return res.status(404).send("Starship not found.");
    }
    res.render("edit", { title: "Edit Starship", starship });
  } catch (err) {
    console.error("Error fetching starship for edit:", err.message);
    res.status(500).send("Error fetching starship for edit.");
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
