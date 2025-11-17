const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());

// Define the API route
app.get("/api/matches/today", async (req, res) => {
  try {
    const response = await axios.get(`${process.env.API}/matches/npm/`);
    // Send the entire data object as JSON
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching matches:", error);
    res.status(500).json({ error: "Failed to fetch matches" });
  }
});

// Define the new API route for fetching matches by date
app.get("/api/matches/date/:date", async (req, res) => {
  try {
    const { date } = req.params;
    const apiUrl = `${process.env.API}/matches/npm/?date=${date}&lang=27&time=+02:00`;
    const response = await axios.get(apiUrl);
    // Send the STING-WEB-Matches array as JSON
    res.json(response.data["STING-WEB-Matches"]);
  } catch (error) {
    console.error(`Error fetching matches for date ${req.params.date}:`, error);
    res
      .status(500)
      .json({ error: "Failed to fetch matches for the specified date" });
  }
});

// Define the new complex API route for fetching match details and stats
app.get("/api/match/:matchId", async (req, res) => {
  try {
    const { matchId } = req.params;

    const eventsUrl = `${process.env.API}/matches/npm/events/?MatchID=${matchId}&lang=27&time=+02:00`;
    const statsUrl = `${process.env.API}/matches/npm/stats/?MatchID=${matchId}`;

    // Use Promise.all to fetch from both URLs concurrently
    const [eventsResponse, statsResponse] = await Promise.all([
      axios.get(eventsUrl),
      axios.get(statsUrl),
    ]);

    // Combine the results into a single JSON object
    const combinedResponse = {
      details: eventsResponse.data,
      stats: statsResponse.data,
    };

    res.json(combinedResponse);
  } catch (error) {
    console.error(
      `Error fetching details for match ${req.params.matchId}:`,
      error
    );
    res.status(500).json({ error: "Failed to fetch match details" });
  }
});

app.get("/api/image", async (req, res) => {
  try {
    const imagePath = req.query.path;
    if (!imagePath) {
      return res.status(400).send("Image path is required");
    }
    const imageUrl = `${process.env.API}${imagePath}`;
    const response = await axios({
      method: "GET",
      url: imageUrl,
      responseType: "stream",
    });
    response.data.pipe(res);
  } catch (error) {
    console.error("Error fetching image:", error);
    res.status(500).send("Failed to fetch image ");
  }
});

const LEAGUE_PRIORITIES = {
  // La Liga
  11: { priority: 90 },
  // Premier League
  7: { priority: 100 },
  // UEFA Champions League
  572: { priority: 120 },
  // Serie A
  17: { priority: 85 },
  // Bundesliga
  25: { priority: 80 },
  // Ligue 1
  35: { priority: 75 },
  // Saudi Pro League
  649: { priority: 50 },
  // تصفيات اوروبا لكأس العالم
  5421: { priority: 95 },
};

app.get("/api/league-priorities", (req, res) => {
  res.json(LEAGUE_PRIORITIES);
});

app.get("/api/download-url", (req, res) => {
  res.json({
    url: "https://expo.dev/accounts/mohanad_kz/projects/matchora/builds/62270929-017c-4588-8bf8-f8d3bfa731da",
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
