require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));


// USER SEARCH
app.get("/api/user/:username", async (req, res) => {
  const { username } = req.params;

  try {
    const userResp = await axios.post(
      "https://users.roblox.com/v1/usernames/users",
      {
        usernames: [username],
        excludeBannedUsers: false,
      }
    );

    const users = userResp.data.data;

    if (!users || users.length === 0) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    const user = users[0];

    const profileResp = await axios.get(
      `https://users.roblox.com/v1/users/${user.id}`
    );

    const profile = profileResp.data;

    let avatarUrl = null;

    try {
      const avatarResp = await axios.get(
        `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${user.id}&size=150x150&format=Png&isCircular=true`
      );

      avatarUrl =
        avatarResp.data.data?.[0]?.imageUrl || null;
    } catch {}

    return res.json({
      id: profile.id,
      name: profile.name,
      displayName: profile.displayName,
      description: profile.description || "",
      created: profile.created,
      avatarUrl,
    });

  } catch (err) {
    console.log(err.message);

    return res.status(500).json({
      error: "Failed to fetch user",
    });
  }
});


// SEND ROUTE (SIMULATION)
app.post("/api/send-robux", async (req, res) => {
  const { userId, username, amount } = req.body;

  if (!userId || !amount || amount <= 0) {
    return res.status(400).json({
      error: "Invalid request",
    });
  }

  await new Promise((r) => setTimeout(r, 1800));

  return res.json({
    success: true,
    message: `You sent ${amount} Robux to ${username}`,
    simulated: true,
  });
});


// INDEX
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});


// IMPORTANT FOR RENDER
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
