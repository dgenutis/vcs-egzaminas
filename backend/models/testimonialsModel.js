import mongoose from "mongoose";

const Schema = mongoose.Schema;

const testimonialSchema = new Schema(
  {
    customer_name: { type: String, required: true },
    photo_url: { type: String, required: true },
    text: { type: String, required: true },
  },
  { timestamps: true }
);

const Testimonials = mongoose.model("Testimonials", testimonialSchema);

export default Testimonials;
