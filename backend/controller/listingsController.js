import Listings from "../models/listingsModel.js";
import mongoose from "mongoose";
import Reservations from "../models/reservationsModel.js";

//GET - get all listings
export const getListings = async (req, res) => {
  const listings = await Listings.find({}).sort({
    createdAt: -1,
  });
  res.status(200).json(listings);
};

//GET - get a single listing
export const getListing = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "Invalid ID" });
  }

  const listing = await Listings.findById(id);
  if (!listing) {
    return res.status(404).json({ error: "No such listing" });
  }

  res.status(200).json(listing);
};

//POST - create new listing
export const createListing = async (req, res) => {
  const {
    title,
    description,
    photos,
    price,
    available,
    min_duration,
    max_duration,
    extras,
    year,
    size,
    transmission,
    fuelType,
  } = req.body;
  let emptyFields = [];

  if (!title) {
    emptyFields.push("title");
  }
  if (!description) {
    emptyFields.push("description");
  }
  if (!photos) {
    emptyFields.push("photos");
  }
  if (!price) {
    emptyFields.push("price");
  }
  if (!available) {
    emptyFields.push("available");
  }
  if (!min_duration) {
    emptyFields.push("min_duration");
  }
  if (!max_duration) {
    emptyFields.push("max_duration");
  }
  if (!extras) {
    emptyFields.push("extras");
  }
  if (!year) {
    emptyFields.push("year");
  }
  if (!size) {
    emptyFields.push("size");
  }
  if (!transmission) {
    emptyFields.push("transmission");
  }
  if (!fuelType) {
    emptyFields.push("fuelType");
  }

  if (emptyFields.length > 0) {
    return res
      .status(400)
      .json({ error: "Please fill in all the fields", emptyFields });
  }
  try {
    const listing = await Listings.create({
      title,
      description,
      photos,
      price,
      available,
      min_duration,
      max_duration,
      extras,
      year,
      size,
      transmission,
      fuelType,
    });
    res.status(200).json(listing);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

//PATCH - update a listing
export const updateListing = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "Invalid ID" });
  }

  const listing = await Listings.findOneAndUpdate({ _id: id }, { ...req.body });
  if (!listing) {
    return res.status(404).json({ error: "No such listing" });
  }

  res.status(200).json(listing);
};

//DELETE - delete a listing
export const deleteListing = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "Invalid ID" });
  }

  const listing = await Listings.findOneAndDelete({ _id: id });

  if (!listing) {
    return res.status(404).json({ error: "No such listing" });
  }

  const reservations = await Reservations.deleteMany({ listing: listing._id });
  console.log(reservations);

  res.status(200).json(listing);
};
