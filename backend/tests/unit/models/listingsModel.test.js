import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import Listings from "../../../models/listingsModel.js";

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

describe("Listing Model Test Suite", () => {
  test("should validate a good model", async () => {
    const validListing = {
      title: "Test Listing",
      description: "This is a test listing",
      photos: ["photo1.jpg", "photo2.jpg"],
      price: 100,
      available: true,
      min_duration: 1,
      max_duration: 7,
      extras: ["WiFi", "Parking"],
      year: 2022,
      size: "Medium",
      transmission: "Automatic",
      fuelType: "Petrol",
    };

    const listing = new Listings(validListing);
    const savedListing = await listing.save();

    expect(savedListing._id).toBeDefined();
    expect(savedListing.title).toBe(validListing.title);
    expect(savedListing.price).toBe(validListing.price);
    expect(savedListing.year).toBe(validListing.year);
    expect(savedListing.transmission).toBe(validListing.transmission);
    expect(savedListing.fuelType).toBe(validListing.fuelType);
  });

  test("should not validate a model with missing required fields", async () => {
    const invalidListing = {
      title: "Invalid Listing",
      // Missing other required fields
    };

    try {
      const listing = new Listings(invalidListing);
      await listing.save();
      // If save succeeds, the test should fail
      fail("Expected validation error but save succeeded");
    } catch (error) {
      expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
      const errorMessage = error.message;

      // Check for each required field in the error message
      expect(errorMessage).toContain("description");
      expect(errorMessage).toContain("price");
      expect(errorMessage).toContain("available");
      expect(errorMessage).toContain("min_duration");
      expect(errorMessage).toContain("max_duration");
      expect(errorMessage).toContain("year");
      expect(errorMessage).toContain("size");
      expect(errorMessage).toContain("transmission");
      expect(errorMessage).toContain("fuelType");

      // Check that 'photos' is not in the error message
      expect(errorMessage).not.toContain("photos");
    }
  });

  // Add a new test to check the 'photos' field separately
  test("should validate even when photos array is empty", async () => {
    const listingWithEmptyPhotos = {
      title: "Listing With Empty Photos",
      description: "This is a test listing",
      photos: [], // Empty array
      price: 100,
      available: true,
      min_duration: 1,
      max_duration: 7,
      year: 2022,
      size: "Medium",
      transmission: "Automatic",
      fuelType: "Petrol",
    };

    const listing = new Listings(listingWithEmptyPhotos);
    const savedListing = await listing.save();

    expect(savedListing._id).toBeDefined();
    expect(savedListing.photos).toEqual([]);
  });

  test("should not validate if price is not a number", async () => {
    const invalidListing = {
      title: "Invalid Price Listing",
      description: "This listing has an invalid price",
      photos: ["photo.jpg"],
      price: "not a number",
      available: true,
      min_duration: 1,
      max_duration: 7,
      year: 2022,
      size: "Large",
      transmission: "Manual",
      fuelType: "Diesel",
    };

    try {
      const listing = new Listings(invalidListing);
      await listing.save();
    } catch (error) {
      expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
      expect(error.errors.price).toBeDefined();
    }
  });

  test("should be able to update an existing listing", async () => {
    const listing = new Listings({
      title: "Original Title",
      description: "Original description",
      photos: ["photo.jpg"],
      price: 100,
      available: true,
      min_duration: 1,
      max_duration: 7,
      year: 2022,
      size: "Small",
      transmission: "Automatic",
      fuelType: "Electric",
    });

    await listing.save();

    const updatedListing = await Listings.findByIdAndUpdate(
      listing._id,
      { title: "Updated Title", price: 150 },
      { new: true }
    );

    expect(updatedListing.title).toBe("Updated Title");
    expect(updatedListing.price).toBe(150);
  });

  test("should be able to delete a listing", async () => {
    const listing = new Listings({
      title: "Listing to Delete",
      description: "This listing will be deleted",
      photos: ["photo.jpg"],
      price: 100,
      available: true,
      min_duration: 1,
      max_duration: 7,
      year: 2022,
      size: "Medium",
      transmission: "Manual",
      fuelType: "Hybrid",
    });

    await listing.save();

    await Listings.findByIdAndDelete(listing._id);

    const deletedListing = await Listings.findById(listing._id);
    expect(deletedListing).toBeNull();
  });

  test("should not validate if year is not a number", async () => {
    const invalidListing = {
      title: "Invalid Year Listing",
      description: "This listing has an invalid year",
      photos: ["photo.jpg"],
      price: 100,
      available: true,
      min_duration: 1,
      max_duration: 7,
      year: "not a number",
      size: "Large",
      transmission: "Manual",
      fuelType: "Diesel",
    };

    try {
      const listing = new Listings(invalidListing);
      await listing.save();
    } catch (error) {
      expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
      expect(error.errors.year).toBeDefined();
    }
  });

  test("should allow extras to be empty", async () => {
    const listingWithoutExtras = {
      title: "Listing Without Extras",
      description: "This listing has no extras",
      photos: ["photo.jpg"],
      price: 100,
      available: true,
      min_duration: 1,
      max_duration: 7,
      year: 2022,
      size: "Medium",
      transmission: "Automatic",
      fuelType: "Petrol",
    };

    const listing = new Listings(listingWithoutExtras);
    const savedListing = await listing.save();

    expect(savedListing.extras).toBeDefined();
    expect(Array.isArray(savedListing.extras)).toBeTruthy();
    expect(savedListing.extras.length).toBe(0);
  });
});
