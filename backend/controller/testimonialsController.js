import Testimonials from "../models/testimonialsModel.js";
import mongoose from "mongoose";

export const getAllTestimonials = async (req, res) => {
  const testimonials = await Testimonials.find({}).sort({
    createdAt: -1,
  });
  res.status(200).json(testimonials);
};

export const getTenLatestTestimonials = async (req, res) => {
  const testimonials = await Testimonials.find({})
    .sort({
      createdAt: -1,
    })
    .limit(10);
  res.status(200).json(testimonials);
};

export const getTestimonialById = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "Invalid ID" });
  }

  const testimonial = await Testimonials.findById(id);

  if (!testimonial) {
    return res.status(404).json({ error: "Testimonial not found" });
  }

  res.status(200).json(testimonial);
};

export const createTestimonial = async (req, res) => {
  const { customer_name, photo_url, text } = req.body;

  const emptyFields = [];

  if (!customer_name) {
    emptyFields.push("customer_name");
  }

  if (!photo_url) {
    emptyFields.push("photo_url");
  }

  if (!text) {
    emptyFields.push("text");
  }

  if (emptyFields.length > 0) {
    return res
      .status(400)
      .json({ error: "Please fill in all the fields", emptyFields });
  }

  try {
    const testimonial = await Testimonials.create({
      customer_name,
      photo_url,
      text,
    });

    res.status(200).json(testimonial);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const updateTestimonial = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "Invalid ID" });
  }

  const testimonial = await Testimonials.findByIdAndUpdate(
    { _id: id },
    { ...req.body }
  );

  if (!testimonial) {
    return res.status(404).json({ error: "Testimonial not found" });
  }

  res.status(200).json(testimonial);
};

export const deleteTestimonial = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.stats(404).json({ error: "Invalid ID" });
  }

  const testimonial = await Testimonials.findOneAndDelete({ _id: id });

  if (!testimonial) {
    return res.status(404).json({ error: "Testimonial not found" });
  }

  res.status(200).json(testimonial);
};
