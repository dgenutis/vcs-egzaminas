import Reservations from "../models/reservationsModel.js";
import Listings from "../models/listingsModel.js";
import mongoose from "mongoose";
import User from "../models/userModel.js";
import { verifyToken } from "../utils/jwt.js";

//GET - get all reservations
export const getReservations = async (req, res) => {
  try {
    const token = req.cookies.jwt;
    const verifiedToken = verifyToken(token);

    if (verifiedToken.role === "admin") {
      const reservations = await Reservations.find({})
        .sort({ createdAt: -1 })
        .populate({
          path: "user",
          select: "-password",
        })
        .populate("listing");

      return res.status(200).json(reservations);
    }

    const reservations = await Reservations.find(
      {},
      { user: 0, status: 0 }
    ).sort({ createdAt: -1 });

    return res.status(200).json(reservations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//GET - get a single reservation
export const getReservation = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "Invalid ID" });
  }

  const reservation = await Reservations.findById(id);
  if (!reservation) {
    return res.status(404).json({ error: "No such reservation" });
  }

  res.status(200).json(reservation);
};

export const getMyReservations = async (req, res) => {
  try {
    const token = req.cookies.jwt;
    const verifiedToken = verifyToken(token);

    if (!mongoose.Types.ObjectId.isValid(verifiedToken.id)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const reservations = await Reservations.find({
      user: verifiedToken.id,
    }).populate("listing");

    return res.status(200).json(reservations);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: error.message });
  }
};

//POST - create new reservation
export const createReservation = async (req, res) => {
  const { listing, start, end } = req.body;
  let emptyFields = [];

  if (!listing) {
    emptyFields.push("listing");
  }
  if (!start) {
    emptyFields.push("start");
  }
  if (!end) {
    emptyFields.push("end");
  }

  if (emptyFields.length > 0) {
    return res
      .status(400)
      .json({ error: "Please fill in all the fields", emptyFields });
  }

  try {
    const token = await req.cookies.jwt;
    const verifiedToken = verifyToken(token);
    const user = verifiedToken.id;

    // Validate listing ID
    if (!mongoose.Types.ObjectId.isValid(listing)) {
      return res.status(400).json({ error: "Invalid listing ID" });
    }

    if (!mongoose.Types.ObjectId.isValid(user)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    // Check if the listing exists
    const listingData = await Listings.findById(listing);
    if (!listingData) {
      return res.status(404).json({ error: "Listing does not exist" });
    }
    const userData = await User.findById(user);
    if (!userData) {
      return res.status(404).json({ error: "User does not exist" });
    }

    // Ensure listing is available
    if (!listingData.available) {
      return res
        .status(400)
        .json({ error: "Listing is not available for reservation" });
    }

    // Validate dates
    const startDate = new Date(start);
    const endDate = new Date(end);

    if (isNaN(startDate) || isNaN(endDate)) {
      return res.status(400).json({ error: "Invalid date format" });
    }

    if (endDate <= startDate) {
      return res
        .status(400)
        .json({ error: "'End' date must be after 'start' date" });
    }

    // Calculate the duration in days
    const duration = (endDate - startDate) / (1000 * 60 * 60 * 24);

    // Check if duration is within allowed range
    if (
      duration < listingData.min_duration ||
      duration > listingData.max_duration
    ) {
      return res.status(400).json({
        error: `Reservation duration must be between ${listingData.min_duration} and ${listingData.max_duration} days`,
      });
    }

    // Check for overlapping reservations
    const overlappingReservation = await Reservations.findOne({
      listing,
      $or: [
        { start: { $lt: endDate }, end: { $gt: startDate } },
        { start: { $eq: startDate } },
        { end: { $eq: endDate } },
      ],
    });

    if (overlappingReservation) {
      return res.status(400).json({
        error: "The listing is already reserved for the selected dates",
      });
    }

    // Create the reservation
    const reservation = await Reservations.create({
      listing,
      user,
      start: startDate,
      end: endDate,
      status: "pending",
    });

    // Mark listing as unavailable if the reservation is created
    // listingData.available = false;
    // await listingData.save();

    res.status(200).json(reservation);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

//PATCH - update a reservation
export const updateReservation = async (req, res) => {
  const { id } = req.params;
  const { start, end, listing } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "Invalid reservation ID" });
  }

  try {
    // Validate listing ID if provided
    if (listing && !mongoose.Types.ObjectId.isValid(listing)) {
      return res.status(400).json({ error: "Invalid listing ID" });
    }

    // Validate and process dates if provided
    if (start || end) {
      const startDate = new Date(start);
      const endDate = new Date(end);

      if (isNaN(startDate) || isNaN(endDate)) {
        return res.status(400).json({ error: "Invalid date format" });
      }

      if (endDate <= startDate) {
        return res
          .status(400)
          .json({ error: "'End' date must be after 'start' date" });
      }

      const reservationToUpdate = await Reservations.findById(id);

      if (!reservationToUpdate) {
        return res.status(404).json({ error: "No such reservation" });
      }

      // Check for overlapping reservations if dates or listing is updated
      const overlappingReservation = await Reservations.findOne({
        listing: listing || reservationToUpdate.listing,
        _id: { $ne: id },
        $or: [
          { start: { $lt: endDate }, end: { $gt: startDate } },
          { start: { $eq: startDate } },
          { end: { $eq: endDate } },
        ],
      });

      if (overlappingReservation) {
        return res.status(400).json({
          error: "The listing is already reserved for the selected dates",
        });
      }
    }

    const updatedReservation = await Reservations.findOneAndUpdate(
      { _id: id },
      { ...req.body },
      { new: true } // return the updated document
    ).populate("listing");

    if (!updatedReservation) {
      return res.status(404).json({ error: "No such reservation" });
    }

    res.status(200).json(updatedReservation);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

//DELETE - delete a reservation
export const deleteReservation = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "Invalid reservation ID" });
  }

  try {
    const reservation = await Reservations.findOneAndDelete({ _id: id });

    // console.log(reservation);

    if (!reservation) {
      return res.status(404).json({ error: "No such reservation" });
    }

    // After deleting the reservation, check if any other reservations exist for the listing.
    // If no other reservations exist, mark the listing as available.
    // const existingReservations = await Reservations.findOne({
    //   listing: reservation.listing,
    // });

    // if (!existingReservations) {
    //   const listingData = await Listings.findById(reservation.listing);
    //   if (listingData) {
    //     listingData.available = true;
    //     await listingData.save();
    //   }
    // }

    res.status(200).json(reservation);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getReservationsByListingId = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "Invalid ID" });
  }

  const reservations = await Reservations.find({ listing: id });
  if (!reservations) {
    return res.status(404).json({ error: "No such reservation" });
  }

  res.status(200).json(reservations);
};
