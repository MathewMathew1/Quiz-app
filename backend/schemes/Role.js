
import mongoose from "mongoose"

let roleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    }
})

export const Role = mongoose.model('Role', roleSchema)