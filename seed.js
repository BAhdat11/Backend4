try {
  require('dotenv').config();
} catch (e) {
  // dotenv не установлен
}

const mongoose = require('mongoose');
const Measurement = require('./models/Measurement');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/analytical-platform';

async function seedDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    await Measurement.deleteMany({});
    console.log('Cleared existing measurements');

    const measurements = [];
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Генерация данных
    for (let date = new Date(thirtyDaysAgo); date <= now; date.setHours(date.getHours() + 1)) {
      const hoursSinceStart = (date - thirtyDaysAgo) / (1000 * 60 * 60);
      const random = () => (Math.random() - 0.5);
      
      measurements.push({
        timestamp: new Date(date),
        field1: Number((22.5 + 2.5 * Math.sin(hoursSinceStart * Math.PI / 12) + random() * 1.5).toFixed(2)),
        field2: Number((50 - 10 * Math.sin(hoursSinceStart * Math.PI / 12) + random() * 5).toFixed(2)),
        field3: Number((400 + hoursSinceStart / 100 + 50 * Math.sin(hoursSinceStart * Math.PI / 24) + random() * 20).toFixed(2))
      });
    }

    // Вставка батчами
    const batchSize = 1000;
    for (let i = 0; i < measurements.length; i += batchSize) {
      await Measurement.insertMany(measurements.slice(i, i + batchSize));
      console.log(`Inserted batch ${Math.floor(i / batchSize) + 1}`);
    }

    console.log(`\n✅ Successfully seeded ${measurements.length} measurements`);
    console.log(`Date range: ${thirtyDaysAgo.toISOString()} to ${now.toISOString()}`);
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
