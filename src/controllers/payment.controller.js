import Stripe from 'stripe';
import { asyncHandler } from "../utils/asyncHandler.js";
import { v4 as uuidv4 } from 'uuid';
import {  databases } from '../db/index.js';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);


const createPayment = asyncHandler(async (req, res) => {
  const { product, token, userId } = req.body;
  const idempotencyKey = uuidv4();
// console.log(product);
// console.log(token);
// console.log(userId);
  try {
    // Create Stripe customer
    const customer = await stripe.customers.create({
      email: token.email,
      source: token.id,
    });

    // Create Stripe charge
    const charge = await stripe.charges.create(
      {
        amount: product.price * 100,
        currency: "inr",
        customer: customer.id,
        receipt_email: token.email,
        description: `Purchase of ${product.name}`,
      },
      {
        idempotencyKey,
      }
    );

    // Save transaction in Appwrite
    const transaction = await databases.createDocument(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_TRANSACTIONS_COLLECTION_ID,
      uuidv4(),
      {
        userId: userId,
        product: product.name,
        amount: `${product.price}`,
        chargeId: charge.id,
        status: 'succeeded',
      }
    );

    // Update user in Appwrite
    const updatedUser = await databases.updateDocument(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_USERS_COLLECTION_ID,
      userId,
      {
        royal: true,
      }
    );

    res.status(200).json(charge);
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({ error: 'Payment failed' });
  }
});

export { createPayment };
