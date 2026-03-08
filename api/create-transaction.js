/**
 * Vercel API Route for Midtrans Transaction
 */

const axios = require('axios');

export default async function handler(req, res) {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { order_id, amount, customer_name } = req.body;

        console.log('Received request:', { order_id, amount, customer_name });

        if (!order_id || !amount) {
            return res.status(400).json({
                error: 'order_id and amount are required'
            });
        }

        // Get Server Key from environment variable
        const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY;

        console.log('Server Key exists:', !!MIDTRANS_SERVER_KEY);

        if (!MIDTRANS_SERVER_KEY) {
            return res.status(500).json({ error: 'Server key not configured' });
        }

        // Create transaction token from Midtrans
        const authString = Buffer.from(MIDTRANS_SERVER_KEY + ':').toString('base64');

        console.log('Calling Midtrans API...');

        const response = await axios.post(
            'https://app.midtrans.com/snap/v1/transactions',
            {
                transaction_details: {
                    order_id: order_id,
                    gross_amount: parseInt(amount)
                },
                customer_details: {
                    name: customer_name || 'Customer'
                }
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${authString}`
                }
            }
        );

        console.log('Midtrans response:', response.data);

        res.status(200).json(response.data);
    } catch (error) {
        console.error('Midtrans Error:', error.response?.data || error.message);
        res.status(500).json({
            error: error.response?.data?.status_message || 'Failed to create transaction',
            details: error.message
        });
    }
}
