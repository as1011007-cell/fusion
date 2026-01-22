import { runMigrations } from 'stripe-replit-sync';
import { getStripeSync } from './stripeClient';

export async function initStripe() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.log('DATABASE_URL not set - Stripe integration will be disabled');
    return false;
  }

  try {
    console.log('Initializing Stripe schema...');
    await runMigrations({ databaseUrl });
    console.log('Stripe schema ready');

    const stripeSync = await getStripeSync();

    console.log('Setting up managed webhook...');
    const replitDomains = process.env.REPLIT_DOMAINS;
    if (replitDomains) {
      const webhookBaseUrl = `https://${replitDomains.split(',')[0]}`;
      try {
        const result = await stripeSync.findOrCreateManagedWebhook(
          `${webhookBaseUrl}/api/stripe/webhook`
        );
        if (result?.webhook?.url) {
          console.log(`Webhook configured: ${result.webhook.url}`);
        } else {
          console.log('Webhook setup skipped - no URL returned');
        }
      } catch (webhookError) {
        console.log('Webhook setup skipped - not in production environment');
      }
    } else {
      console.log('REPLIT_DOMAINS not set - webhook setup skipped');
    }

    console.log('Syncing Stripe data...');
    stripeSync.syncBackfill()
      .then(() => {
        console.log('Stripe data synced');
      })
      .catch((err: Error) => {
        console.error('Error syncing Stripe data:', err);
      });

    return true;
  } catch (error) {
    console.error('Failed to initialize Stripe:', error);
    return false;
  }
}
