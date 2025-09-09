// analytics.js - Endpoint para Google Analytics Data API
const express = require('express');
const { BetaAnalyticsDataClient } = require('@google-analytics/data');
const router = express.Router();
const path = require('path');

const analyticsDataClient = new BetaAnalyticsDataClient({
  keyFilename: path.join(__dirname, 'ga-key.json')
});

const PROPERTY_ID = '168631323233'; // ID de propiedad GA4

router.get('/summary', async (req, res) => {
  try {
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${PROPERTY_ID}`,
      dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
      metrics: [
        { name: 'activeUsers' },
        { name: 'averageSessionDuration' }
      ],
      dimensions: [{ name: 'country' }]
    });

    // Total de usuarios
    const totalUsers = response.rows.reduce((acc, row) => acc + parseInt(row.metricValues[0].value), 0);
    // Tiempo promedio (en segundos)
    const avgSession = response.rows.length
      ? (response.rows.reduce((acc, row) => acc + parseFloat(row.metricValues[1].value), 0) / response.rows.length)
      : 0;
    // País con más usuarios
    let topCountry = '-';
    if (response.rows.length) {
      const countryCount = {};
      response.rows.forEach(row => {
        const country = row.dimensionValues[0].value;
        countryCount[country] = (countryCount[country] || 0) + parseInt(row.metricValues[0].value);
      });
      topCountry = Object.entries(countryCount).sort((a, b) => b[1] - a[1])[0][0];
    }

    res.json({
      visits: totalUsers,
      avgTime: Math.round(avgSession),
      topZone: topCountry
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
