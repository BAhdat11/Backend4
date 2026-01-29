// Загрузка .env файла (опционально)
try {
  require('dotenv').config();
} catch (e) {
  // dotenv не установлен, используем переменные окружения системы
}

const express = require('express');
const mongoose = require('mongoose');
const Measurement = require('./models/Measurement');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/analytical-platform';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Валидация поля
function validateField(field) {
  const validFields = ['field1', 'field2', 'field3'];
  if (!field || !validFields.includes(field)) {
    return { error: 'Invalid field. Must be field1, field2, or field3' };
  }
  return null;
}

// Валидация дат
function validateDates(start_date, end_date) {
  if (!start_date || !end_date) {
    return { error: 'Both start_date and end_date are required (format: YYYY-MM-DD)' };
  }
  
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(start_date) || !dateRegex.test(end_date)) {
    return { error: 'Invalid date format. Use YYYY-MM-DD format' };
  }
  
  const startDate = new Date(start_date);
  const endDate = new Date(end_date);
  endDate.setHours(23, 59, 59, 999);
  
  if (startDate > endDate) {
    return { error: 'start_date must be before or equal to end_date' };
  }
  
  return { startDate, endDate };
}

// Стандартное отклонение
function calculateStandardDeviation(values) {
  if (values.length === 0) return 0;
  const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / values.length;
  return Math.sqrt(variance);
}

// Получение временных рядов
app.get('/api/measurements', async (req, res) => {
  try {
    const { field, start_date, end_date } = req.query;

    // Валидация
    const fieldError = validateField(field);
    if (fieldError) return res.status(400).json(fieldError);

    const dateValidation = validateDates(start_date, end_date);
    if (dateValidation.error) return res.status(400).json(dateValidation);
    const { startDate, endDate } = dateValidation;

    // Запрос данных
    const measurements = await Measurement.find({
      timestamp: { $gte: startDate, $lte: endDate }
    })
      .sort({ timestamp: 1 })
      .select(`timestamp ${field}`)
      .lean();

    if (measurements.length === 0) {
      return res.status(404).json({ error: 'No data found for the specified date range' });
    }

    // Форматирование ответа
    res.json(measurements.map(m => ({
      timestamp: m.timestamp.toISOString(),
      [field]: m[field]
    })));
  } catch (error) {
    console.error('Error fetching measurements:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Расчет метрик
app.get('/api/measurements/metrics', async (req, res) => {
  try {
    const { field, start_date, end_date } = req.query;

    // Валидация поля
    const fieldError = validateField(field);
    if (fieldError) return res.status(400).json(fieldError);

    // Построение запроса (даты опциональны)
    const query = {};
    if (start_date && end_date) {
      const dateValidation = validateDates(start_date, end_date);
      if (dateValidation.error) return res.status(400).json(dateValidation);
      query.timestamp = { $gte: dateValidation.startDate, $lte: dateValidation.endDate };
    }

    // Получение данных
    const measurements = await Measurement.find(query).select(field).lean();
    if (measurements.length === 0) {
      return res.status(404).json({ error: 'No data found for calculating metrics' });
    }

    // Расчет метрик
    const values = measurements.map(m => m[field]).filter(v => v != null);
    if (values.length === 0) {
      return res.status(404).json({ error: 'No valid values found' });
    }

    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const stdDev = calculateStandardDeviation(values);

    res.json({
      avg: Number(avg.toFixed(2)),
      min: Number(min.toFixed(2)),
      max: Number(max.toFixed(2)),
      stdDev: Number(stdDev.toFixed(2))
    });
  } catch (error) {
    console.error('Error calculating metrics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Serve frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
