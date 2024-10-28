const express = require('express');
const cors = require('cors');
const gsmarena = require('gsmarena-api');

const app = express();
const port = 3001; // Choose a port that doesn't conflict with your frontend

app.use(cors());

app.get('/', (req, res) => {
    res.send('GSMArena API Proxy Server is running');
  });

app.get('/api/brands', async (req, res) => {
  try {
    const brands = await gsmarena.catalog.getBrands();
    res.json(brands);
  } catch (error) {
    console.error('Error fetching brands:', error);
    res.status(500).json({ error: 'Failed to fetch brands' });
  }
});

app.get('/api/devices/:brandId', async (req, res) => {
  try {
    const devices = await gsmarena.catalog.getBrand(req.params.brandId);
    res.json(devices);
  } catch (error) {
    console.error('Error fetching devices:', error);
    res.status(500).json({ error: 'Failed to fetch devices' });
  }
});

app.get('/api/device/:deviceId', async (req, res) => {
  try {
    const device = await gsmarena.catalog.getDevice(req.params.deviceId);
    res.json(device);
  } catch (error) {
    console.error('Error fetching device details:', error);
    res.status(500).json({ error: 'Failed to fetch device details' });
  }
});

app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});