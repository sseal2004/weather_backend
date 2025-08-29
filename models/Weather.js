const mongoose = require('mongoose');

const WeatherSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

// ✅ Force collection name to "weathers"
const WeatherModel = mongoose.model("Weather", WeatherSchema, "weathers");

module.exports = WeatherModel;
