require("dotenv").config();
const dns = require("dns");
const express = require("express");
const cors = require("cors");

const app = express();
const urls = [];

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.urlencoded({ extended: true }));

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", (req, res) => {
  res.sendFile(process.cwd() + "/views/index.html");
});

// Your first API endpoint
app.get("/api/hello", (req, res) => {
  res.json({ greeting: "hello API" });
});

app.get("/api/shorturl/:urlNum", (req, res, next) => {
  const { urlNum } = req.params;

  if (urlNum <= 0) {
    res.status(400).json({ error: "that url is not supported" });
  }

  res.redirect(urls[urlNum - 1]);
});

app.post("/api/shorturl", async (req, res, next) => {
  try {
    const receivedUrl = req.body.url;
    const urlObj = new URL(receivedUrl);

    dns.lookup(urlObj.hostname, {}, (err, address, family) => {
      if (err) {
        res.status(400);
        res.json({ error: "invalid url" });
      }
    });

    urls.forEach((url) => {
      if (url === receivedUrl) {
        res.status(400).json({ error: "that url already exists" });
      }
    });

    urls.push(receivedUrl);

    res.status(200).json({
      original_url: receivedUrl,
      short_url: urls.indexOf(receivedUrl) + 1,
    });
  } catch (err) {
    if (err instanceof TypeError) {
      res.status(400).json({ error: "invalid url" });
    }
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
