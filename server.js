/**
 * Simple Node.js Server for Midtrans Transaction
 * Deploy this to Render.com or Railway.app for free
 */

const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// Midtrans Server Key (from your Midtrans Dashboard)
const MIDTRANS_SERVER_KEY = 'SB-Mid-server-dVZpPZF0zI2M8Smj';
const MIDTRANS_API_URL = 'https://app.midtrans.com/snap/v1/transactions';

// Health check endpoint
app.get('/', (req, res) => {
    res.json({ status: 'ok', message: 'Midtrans Transaction Server is running' });
});

// Create Transaction Endpoint
app.post('/create-transaction', async (req, res) => {
    try {
        const { order_id, amount, customer_name } = req.body;

        if (!order_id || !amount) {
            return res.status(400).json({
                error: 'order_id and amount are required'
            });
        }

        // Create transaction token from Midtrans
        const authString = Buffer.from(MIDTRANS_SERVER_KEY + ':').toString('base64');

        const response = await axios.post(
            MIDTRANS_API_URL,
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

        res.json(response.data);
    } catch (error) {
        console.error('Midtrans Error:', error.response?.data || error.message);
        res.status(500).json({
            error: error.response?.data?.status_message || 'Failed to create transaction'
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
