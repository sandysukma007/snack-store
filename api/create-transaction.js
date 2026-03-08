/**
 * Vercel API Route for Midtrans Transaction
 * Using native fetch instead of axios
 */

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

        if (!order_id || !amount) {
            return res.status(400).json({
                error: 'order_id and amount are required'
            });
        }

        // Get Server Key from environment variable
        const MIDTRANS_SERVER_KEY = process.env.MIDTRANS_SERVER_KEY;

        if (!MIDTRANS_SERVER_KEY) {
            return res.status(500).json({ error: 'Server key not configured' });
        }

        // Create transaction token from Midtrans using fetch
        const authString = Buffer.from(MIDTRANS_SERVER_KEY + ':').toString('base64');

        const midtransResponse = await fetch(
            'https://app.midtrans.com/snap/v1/transactions',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Basic ${authString}`
                },
                body: JSON.stringify({
                    transaction_details: {
                        order_id: order_id,
                        gross_amount: parseInt(amount)
                    },
                    customer_details: {
                        name: customer_name || 'Customer'
                    }
                })
            }
        );

        const data = await midtransResponse.json();

        if (!midtransResponse.ok) {
            return res.status(500).json({
                error: data.status_message || 'Failed to create transaction',
                details: data
            });
        }

        res.status(200).json(data);
    } catch (error) {
        console.error('Midtrans Error:', error);
        res.status(500).json({
            error: 'Failed to create transaction',
            details: error.message
        });
    }
}
