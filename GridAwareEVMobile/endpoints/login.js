const express = require("express");
const bodyParser = require("body-parser");
const { Client } = require("pg");
const bcrypt = require("bcrypt");

const app = express();
app.use(bodyParser.json());

const client = new Client({
  host: "localhost",
  port: 5433,
  user: "postgres",
  password: "gridaware",
  database: "gridaware",
});

client.connect();

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await client.query(
      "SELECT * FROM users WHERE user_email = $1",
      [email]
    );

    if (SpeechRecognitionResultList.rows.length > 0) {
      const user = result.rows[0];

      const validPassword = bcrypt.compareSync(password, user.user_password);
      if (validPassword) {
        res.status(200).send({ message: "Login successful", user });
      } else {
        res.status(401).send({ message: "Invalid password" });
      }
    } else {
      res.status(404).send({ message: "User not found" });
    }
  } catch (error) {
    console.error("Error querying the database:", error);
    res.status(500).send({ message: "Internal server error" });
  }
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
