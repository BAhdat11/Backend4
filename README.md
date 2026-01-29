# 📊 Analytical Platform (Assignment 4)

Analytical Platform is a web application built with **Node.js**, **Express**, and **MongoDB** for retrieving, analyzing, and visualizing time-series data.  
Users can filter data by date range, select specific fields, view statistical metrics, and see results on an interactive chart.

---

## 🎯 Project Objective

Build an analytical platform that:
- Retrieves time-series data from MongoDB
- Filters data by date range
- Allows selecting fields for analysis
- Calculates:
  - Average
  - Minimum
  - Maximum
  - Standard Deviation
- Visualizes data using charts

---

## 🛠️ Technologies Used

- Node.js  
- Express.js  
- MongoDB  
- Mongoose  
- Chart.js  
- HTML / CSS / JavaScript  

---

## 📂 Database Schema

**Database:** `analytical-platform`  
**Collection:** `measurements`

Each document:

| Field      | Type   | Description                  |
|------------|--------|------------------------------|
| timestamp | Date   | Time of measurement         |
| field1    | Number | Example: Temperature        |
| field2    | Number | Example: Humidity           |
| field3    | Number | Example: CO2 Levels         |

Index is created on `timestamp` for faster date range queries.

---

## ⚙️ API Endpoints

### Get Time-Series Data



GET /api/measurements?field=field1&start_date=YYYY-MM-DD&end_date=YYYY-MM-DD

```json
[
  { "timestamp": "2025-01-01T12:00:00Z", "field1": 22.5 },
  { "timestamp": "2025-01-01T13:00:00Z", "field1": 23.1 }
]


Get Statistical Metrics

GET /api/measurements/metrics?field=field1&start_date=YYYY-MM-DD&end_date=YYYY-MM-DD

{
  "avg": 22.8,
  "min": 22.5,
  "max": 23.1,
  "stdDev": 0.3
}


Error Handling

The application validates:

Field name correctness

Date format (YYYY-MM-DD)

Date range correctness

Missing or empty data

Meaningful error messages are returned for invalid requests.
