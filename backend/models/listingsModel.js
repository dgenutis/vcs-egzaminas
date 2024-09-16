import mongoose from "mongoose";

const Schema = mongoose.Schema;

const listingSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    photos: { type: Array, required: true },
    price: { type: Number, required: true },
    available: { type: Boolean, required: true },
    min_duration: { type: Number, required: true },
    max_duration: { type: Number, required: true },
    extras: { type: Array },
    year:{type:Number, required:true},
    size:{type:String, required:true},
    transmission:{type:String, required:true},
    fuelType:{type:String,required:true}
  },
  { timestamps: true }
);

export default mongoose.model("Listings", listingSchema);
