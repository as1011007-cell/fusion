import { getUncachableStripeClient } from './stripeClient';

async function createProducts() {
  const stripe = await getUncachableStripeClient();

  console.log('Creating Feud Fusion products in Stripe...');

  const existingProducts = await stripe.products.search({ query: "active:'true'" });
  const existingNames = existingProducts.data.map(p => p.name);

  if (!existingNames.includes('Ad-Free Version')) {
    const adFreeProduct = await stripe.products.create({
      name: 'Ad-Free Version',
      description: 'Remove all ads from Feud Fusion forever',
      metadata: {
        type: 'one_time',
        category: 'upgrade',
      },
    });

    await stripe.prices.create({
      product: adFreeProduct.id,
      unit_amount: 500,
      currency: 'usd',
    });

    console.log('Created: Ad-Free Version - $5.00');
  }

  if (!existingNames.includes('5000 Star Points')) {
    const starPointsProduct = await stripe.products.create({
      name: '5000 Star Points',
      description: 'Get 5000 star points to unlock themes and power cards',
      metadata: {
        type: 'one_time',
        category: 'currency',
        star_points: '5000',
      },
    });

    await stripe.prices.create({
      product: starPointsProduct.id,
      unit_amount: 500,
      currency: 'usd',
    });

    console.log('Created: 5000 Star Points - $5.00');
  }

  console.log('Product seeding complete!');
}

createProducts().catch(console.error);
