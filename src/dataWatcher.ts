import * as chokidar from "chokidar";
import * as fs from "fs";
import * as path from "path";
import * as WebSocket from "ws";

const wss = new WebSocket.Server({ port: 8080 });

const pathToFile = path.join(__dirname, "../data.json");

// Watch the JSON file for changes
chokidar.watch(pathToFile).on("change", () => {
  console.log("event");
  // Read the updated data from the file
  fs.readFile(pathToFile, (err, data) => {
    if (err) {
      throw err;
    }

    // Convert the data to a JSON object
    const jsonData = data.toString();

    // Send the updated data to all connected clients
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        console.log("sending data", client.id);
        client.send(jsonData);
      }
    });
  });
});

wss.on("connect", () => {
  console.log("connected");
});
