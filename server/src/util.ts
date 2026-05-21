import os from "os";
import { createClient } from "redis";
import { RedisClientType } from "@redis/client";
import express, {Application} from "express"
import mongoose from "mongoose"
import {REDIS_HOST, REDIS_PORT, MAX_START_RETRIES, MONGODB_URL, SERVER_PORT, START_RETRY_DELAY_MS} from "./config";


//this gives local/private ip assinged by the router, only useful when communicating with devices connected to the same network
export async function getServerIP(): Promise<string> {
  const nets = os.networkInterfaces();
  let localIP = "127.0.0.1";

  for (const name of Object.keys(nets)) {
    // Only look at Wi-Fi adapter
    if (name.toLowerCase().includes("wi-fi")) {
      for (const net of nets[name] || []) {
        if (net.family === "IPv4" && !net.internal) {
          localIP = net.address;
          return localIP;
        }
      }
    }
  }

  // fallback: pick the first IPv4 in the 10.x.x.x range
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net.family === "IPv4" && !net.internal && net.address.startsWith("10.")) {
        return net.address;
      }
    }
  }

  return localIP;
}

//redis client
export const redisClient:RedisClientType = createClient({
  socket: {
    host : REDIS_HOST,
    port : REDIS_PORT
  }
});

//express server
export const app:Application = express();

const delay = (ms:number) => new Promise((res) => setTimeout(res, ms));
export async function startServer(){
  console.log("MONGODB_URL" , MONGODB_URL);
  console.log("REDIS_HOST", REDIS_HOST);
  let retries = 0;

  while (retries < MAX_START_RETRIES) {
    try {
      await mongoose.connect(MONGODB_URL);
      console.log('Database connected successfully');

      // await redisClient.connect()
      console.log("Redis connected successfully");

      app.listen(SERVER_PORT, '0.0.0.0', async () => {
        const ip: string | null = await getServerIP();
        console.log(`Server started at http://${ip}:${SERVER_PORT}`);
      });

      break;
    } catch (err) {
      retries++;
      console.error(`Failed to connect to DB (attempt ${retries}/${MAX_START_RETRIES})`);
      console.error(err);

      if (retries === MAX_START_RETRIES) {
        console.error('Max retries reached. Exiting.');
        process.exit(1);
      }

      console.log(`Retrying in ${START_RETRY_DELAY_MS / 1000}s...\n`);
      await delay(START_RETRY_DELAY_MS);
    }
  }
};


