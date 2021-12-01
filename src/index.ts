import mqtt, { MqttClient } from "mqtt";
import { Block } from "./block";
import { Blockchain } from "./blockchain";
import { MqttMessage } from "./types";
import { Utils } from "./utils";
import http from "http";
import fs from "fs";

class SimpleBlockChain {

  client: MqttClient;
  name: string;
  chain: Blockchain;
  pendingBlock: Block | null;
  difficulty: number;
  server: http.Server;

  constructor() {
    this.server = http.createServer(async (req, res) => {
      const buffers = [];
    
      for await (const chunk of req) {
        buffers.push(chunk);
      }
    
      const data = Buffer.concat(buffers).toString();
      console.log("Received new data from http server");
      if (!this.pendingBlock) {
        this.pendingBlock = new Block(this.chain.getLatestHash(), data);
      }
      this.client.publish("dataAdded", JSON.stringify({node: this.name, content: data}));
      res.end();
    });
    const port = process.argv[2] ? parseInt(process.argv[2] ) : 3000;
    this.server.listen(port)
    console.log(`Server listening on port: ${port}`);
    this.pendingBlock = null;
    this.client = mqtt.connect("mqtt://test.mosquitto.org")
    this.client.on('connect', () => this.onMqttConnection());
    this.client.on('message', (topic: string, message: Buffer) => this.onMqttMessage(topic, message));
    this.name = Utils.getNodeName();
    let data = null;
    if (fs.existsSync("./chain.json")) {
      data = fs.readFileSync("./chain.json");
    }
    this.chain = data ? Blockchain.fromObjects(JSON.parse(data)) : new Blockchain();
    this.difficulty = 3;
    console.log(`Node: ${this.name} starting...`);
    this.run();
  }

  run() {
    setTimeout(() => {
      if (this.pendingBlock && this.pendingBlock.mine(this.difficulty)) {
        console.log("Found valid block!");
        const message: MqttMessage = {
          node: this.name,
          content: this.pendingBlock.toJson()
        }

        this.chain.addBlock(this.pendingBlock);
        fs.writeFile("./chain.json", this.chain.toJson(), () => {});
        this.client.publish("blockFound", JSON.stringify(message));
        this.pendingBlock = null;
      }
      this.run();
    }, 0);
  }

  onMqttConnection() {
    console.log("Connected");
    const topics = ["blockFound", "fullUpdate", "queryFullUpdate", "dataAdded"];
    topics.forEach((topic) => {
      this.client.subscribe(topic, (err) => {
        if (err) {
          console.error(`Error subscribing to topic: ${topic}`, err);
        }
      })
    });
    this.client.publish("queryFullUpdate", JSON.stringify({ node: this.name }));
  }

  onMqttMessage(topic: string, message: Buffer) {
    const messageData: MqttMessage = JSON.parse(message.toString("utf-8"));
    if (messageData.node == this.name) {
      return;
    }

    switch (topic) {
      case "dataAdded": 
        if (!this.pendingBlock) {
          console.log(`Received new data from node: ${messageData.node}`);
          this.pendingBlock = new Block(this.chain.getLatestHash(), messageData.content);
        }
      break;
      case "blockFound":
        const block = Block.fromObject(JSON.parse(messageData.content));
        if (this.chain.isValidBlock(block)) {
          console.log(`Node: ${messageData.node} found valid block, accepting...`);
          if (this.pendingBlock && this.pendingBlock.data == block.data) {
            console.log("Current data stored, stopping mining");
            this.pendingBlock = null;
          }
          this.chain.addBlock(block);
          fs.writeFile("./chain.json", this.chain.toJson(), () => {});
        } else {
          console.error(`Node: ${messageData.node} found invalid block, sending full chain to sync`);
          this.client.publish("fullUpdate", JSON.stringify({ node: this.name, content: this.chain.toJson() }));
        }
      break;
      case "fullUpdate":
        const blockchain = Blockchain.fromObjects(JSON.parse(messageData.content));
        if (blockchain.getLength() > this.chain.getLength() && blockchain.isValid()) {
          console.log(`Node: ${messageData.node} has longer chain, accepting it`);
          this.chain = blockchain;
          this.pendingBlock = null;
          fs.writeFile("./chain.json", this.chain.toJson(), () => {});
        } else {
          console.log("Ignored full update");
        }
      break;
      case "queryFullUpdate":
        console.log(`Node: ${messageData.node} joined, sending full chain`);
        this.client.publish("fullUpdate", JSON.stringify({ node: this.name, content: this.chain.toJson() }));
      break;
      default:
        console.error(`Message to unknown topic ${topic}`);
      break;
    }
  }
}

new SimpleBlockChain();