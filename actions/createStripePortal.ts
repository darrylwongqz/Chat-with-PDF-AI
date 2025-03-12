'use server';

import { adminDb } from '@/firebaseAdmin';
import getBaseUrl from '@/lib/getBaseUrl';
import stripe from '@/lib/stripe';
import { auth } from '@clerk/nextjs/server';

export async function createStripePortal() {
  auth().protect();

  const { userId } = await auth();

  if (!userId) {
    throw new Error('User not found');
  }

  //   get customer ID from firebase
  const user = await adminDb.collection('users').doc(userId).get();
  const stripeCustomerId = user.data()?.stripeCustomerId;

  if (!stripeCustomerId) {
    throw new Error('Stripe customer not found');
  }

  // Get the base URL for redirects
  const baseUrl = getBaseUrl();
  console.log(`Using base URL for portal return: ${baseUrl}`);

  const session = await stripe.billingPortal.sessions.create({
    customer: stripeCustomerId,
    return_url: `${baseUrl}/dashboard`,
  });

  return session.url;
}
