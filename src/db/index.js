// /database/appwriteDatabase.js
import { Client, Databases } from 'node-appwrite';

const client = new Client();
client
  .setEndpoint(process.env.APPWRITE_ENDPOINT) // Your Appwrite Endpoint
  .setProject(process.env.APPWRITE_PROJECT_ID) // Your Appwrite Project ID
  .setKey(process.env.APPWRITE_API_KEY); // Your Appwrite API Key

const database = new Databases(client);

export const saveTransaction = async (userId, expiresAt) => {
  try {
    const response = await database.createDocument('transactions', 'unique()', {
      userId: userId,
      expiresAt: expiresAt,
    });
    return response;
  } catch (error) {
    throw new Error('Error saving transaction: ' + error.message);
  }
};
