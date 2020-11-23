const config = require('config');

const stripe = require('stripe')(config.get('STRIPE_LIVE_SECRET_KEY'));

module.exports = stripe;
