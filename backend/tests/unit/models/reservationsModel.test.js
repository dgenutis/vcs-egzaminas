import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import Reservations from "../../../models/reservationsModel.js";

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Reservation Model Test Suite", () => {
  test("should validate a good model", async () => {
    const validReservation = {
      listing: new mongoose.Types.ObjectId(),
      user: new mongoose.Types.ObjectId(),
      start: new Date(),
      end: new Date(Date.now() + 86400000), // One day later
      status: "confirmed",
    };

    const reservation = new Reservations(validReservation);
    const savedReservation = await reservation.save();

    expect(savedReservation._id).toBeDefined();
    expect(savedReservation.listing).toEqual(validReservation.listing);
    expect(savedReservation.user).toEqual(validReservation.user);
    expect(savedReservation.start).toEqual(validReservation.start);
    expect(savedReservation.end).toEqual(validReservation.end);
    expect(savedReservation.status).toBe(validReservation.status);
  });

  test("should not validate a model with missing required fields", async () => {
    const invalidReservation = {
      // Missing required fields
    };

    try {
      const reservation = new Reservations(invalidReservation);
      await reservation.save();
      fail("Expected validation error but save succeeded");
    } catch (error) {
      expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
      const errorMessage = error.message;

      expect(errorMessage).toContain("listing");
      expect(errorMessage).toContain("user");
      expect(errorMessage).toContain("start");
      expect(errorMessage).toContain("end");
      expect(errorMessage).toContain("status");
    }
  });

  test("should not validate if listing is not an ObjectId", async () => {
    const invalidReservation = {
      listing: "not an ObjectId",
      user: new mongoose.Types.ObjectId(),
      start: new Date(),
      end: new Date(Date.now() + 86400000),
      status: "confirmed",
    };

    try {
      const reservation = new Reservations(invalidReservation);
      await reservation.save();
    } catch (error) {
      expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
      expect(error.errors.listing).toBeDefined();
    }
  });

  test("should not validate if user is not an ObjectId", async () => {
    const invalidReservation = {
      listing: new mongoose.Types.ObjectId(),
      user: "not an ObjectId",
      start: new Date(),
      end: new Date(Date.now() + 86400000),
      status: "confirmed",
    };

    try {
      const reservation = new Reservations(invalidReservation);
      await reservation.save();
    } catch (error) {
      expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
      expect(error.errors.user).toBeDefined();
    }
  });

  test("should not validate if start is not a Date", async () => {
    const invalidReservation = {
      listing: new mongoose.Types.ObjectId(),
      user: new mongoose.Types.ObjectId(),
      start: "not a date",
      end: new Date(Date.now() + 86400000),
      status: "confirmed",
    };

    try {
      const reservation = new Reservations(invalidReservation);
      await reservation.save();
    } catch (error) {
      expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
      expect(error.errors.start).toBeDefined();
    }
  });

  test("should not validate if end is not a Date", async () => {
    const invalidReservation = {
      listing: new mongoose.Types.ObjectId(),
      user: new mongoose.Types.ObjectId(),
      start: new Date(),
      end: "not a date",
      status: "confirmed",
    };

    try {
      const reservation = new Reservations(invalidReservation);
      await reservation.save();
    } catch (error) {
      expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
      expect(error.errors.end).toBeDefined();
    }
  });

  test("should be able to update an existing reservation", async () => {
    const reservation = new Reservations({
      listing: new mongoose.Types.ObjectId(),
      user: new mongoose.Types.ObjectId(),
      start: new Date(),
      end: new Date(Date.now() + 86400000),
      status: "pending",
    });

    await reservation.save();

    const updatedReservation = await Reservations.findByIdAndUpdate(
      reservation._id,
      { status: "confirmed" },
      { new: true }
    );

    expect(updatedReservation.status).toBe("confirmed");
  });

  test("should be able to delete a reservation", async () => {
    const reservation = new Reservations({
      listing: new mongoose.Types.ObjectId(),
      user: new mongoose.Types.ObjectId(),
      start: new Date(),
      end: new Date(Date.now() + 86400000),
      status: "confirmed",
    });

    await reservation.save();

    await Reservations.findByIdAndDelete(reservation._id);

    const deletedReservation = await Reservations.findById(reservation._id);
    expect(deletedReservation).toBeNull();
  });
});
