const mongoose = require("mongoose");
const { Schema } = mongoose;

const refreshTokenSchema = new Schema({
    value: {
        type: String,
        required: true
    }
})

const RefreshToken = mongoose.model("RefreshToken", refreshTokenSchema);

module.exports = RefreshToken;