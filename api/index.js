import express from 'express';
import cors from 'cors';
import gsmarena from 'gsmarena-api';

const app = express();

app.use(cors());

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

export default app;
