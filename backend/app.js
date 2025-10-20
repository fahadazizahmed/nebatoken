// app.js
require('dotenv').config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const http = require('http');
const connectToMongo = require('./db/db');
const routes = require('./routes/routes');
const newWeb3Connection = require('./db/blockchain');

const app = express();

app.use(cors());
app.use(bodyParser.json({ limit: "10mb" }));
app.use(express.json());

connectToMongo();
newWeb3Connection()

app.use('/api/v1', routes);
app.get('/test', (req, res) => {
  res.send('Version 1 is running!');
})

// Removed the problematic line: projectCreationListenr()
const PORT = process.env.PORT || 2000;
console.log(' process.env, ', process.env.MOONGOOSE_URL)
const httpServer = http.createServer(app);

httpServer.listen(PORT, () => {
  console.log(`Neba service is listening on port ${PORT}`);
});
