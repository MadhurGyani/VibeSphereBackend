// /database/appwriteDatabase.js
import { Client, Databases,Users } from 'node-appwrite';

const client = new Client();
client
  .setEndpoint(process.env.APPWRITE_ENDPOINT) // Your Appwrite Endpoint
  .setProject(process.env.APPWRITE_PROJECT_ID) // Your Appwrite Project ID
  .setKey(process.env.APPWRITE_API_KEY); // Your Appwrite API Key

const users = new Users(client);
const databases = new Databases(client);
const storage = new Storage(client);

export {users,databases,storage}



