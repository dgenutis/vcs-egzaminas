import { jest } from "@jest/globals";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import * as listingsController from "../../../controller/listingsController.js";
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

describe("Listings Controller", () => {
  beforeEach(async () => {
    await Listings.deleteMany({});
  });

  describe("getListings", () => {
    it("should return all listings", async () => {
      const mockListings = [
        {
          title: "Listing 1",
          description: "Description 1",
          photos: ["photo1.jpg"],
          price: 100,
          available: true,
          min_duration: 1,
          max_duration: 7,
          extras: ["WiFi"],
          year: 2022,
          size: "Medium",
          transmission: "Automatic",
          fuelType: "Petrol",
        },
        {
          title: "Listing 2",
          description: "Description 2",
          photos: ["photo2.jpg"],
          price: 200,
          available: true,
          min_duration: 2,
          max_duration: 14,
          extras: ["Parking"],
          year: 2023,
          size: "Large",
          transmission: "Manual",
          fuelType: "Electric",
        },
      ];
      await Listings.insertMany(mockListings);

      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await listingsController.getListings({}, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining(mockListings[0]),
          expect.objectContaining(mockListings[1]),
        ])
      );
    });
  });

  describe("getListing", () => {
    it("should return a single listing", async () => {
      const mockListing = new Listings({
        title: "Test Listing",
        description: "Test Description",
        price: 100,
        available: true,
        min_duration: 1,
        max_duration: 7,
        year: 2022,
        size: "Medium",
        transmission: "Automatic",
        fuelType: "Petrol",
      });
      await mockListing.save();

      const mockReq = { params: { id: mockListing._id } };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await listingsController.getListing(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Test Listing",
          description: "Test Description",
        })
      );
    });

    it("should return 404 if listing not found", async () => {
      const mockReq = { params: { id: new mongoose.Types.ObjectId() } };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await listingsController.getListing(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: "No such listing" });
    });

    it("should return 404 if ID is invalid", async () => {
      const mockReq = { params: { id: "invalidid" } };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await listingsController.getListing(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: "Invalid ID" });
    });
  });

  describe("createListing", () => {
    it("should create a new listing", async () => {
      const mockReq = {
        body: {
          title: "New Listing",
          description: "New Description",
          photos: ["photo1.jpg"],
          price: 150,
          available: true,
          min_duration: 2,
          max_duration: 10,
          extras: ["WiFi"],
          year: 2023,
          size: "Large",
          transmission: "Manual",
          fuelType: "Electric",
        },
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await listingsController.createListing(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining(mockReq.body)
      );
    });

    it("should return 400 if required fields are missing", async () => {
      const mockReq = {
        body: {
          title: "Incomplete Listing",
        },
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await listingsController.createListing(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: "Please fill in all the fields",
          emptyFields: expect.any(Array),
        })
      );
    });
  });

  describe("updateListing", () => {
    it("should update an existing listing", async () => {
      const mockListing = new Listings({
        title: "Original Listing",
        description: "Original Description",
        price: 100,
        available: true,
        min_duration: 1,
        max_duration: 7,
        year: 2022,
        size: "Medium",
        transmission: "Automatic",
        fuelType: "Petrol",
      });
      await mockListing.save();

      const mockReq = {
        params: { id: mockListing._id },
        body: { title: "Updated Listing", price: 200 },
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await listingsController.updateListing(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          _id: mockListing._id,
        })
      );

      const updatedListing = await Listings.findById(mockListing._id);
      expect(updatedListing.title).toBe("Updated Listing");
      expect(updatedListing.price).toBe(200);
    });

    it("should return 404 if listing not found", async () => {
      const mockReq = {
        params: { id: new mongoose.Types.ObjectId() },
        body: { title: "Updated Listing" },
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await listingsController.updateListing(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: "No such listing" });
    });
  });

  describe("deleteListing", () => {
    it("should delete an existing listing", async () => {
      const mockListing = new Listings({
        title: "Listing to Delete",
        description: "Will be deleted",
        price: 100,
        available: true,
        min_duration: 1,
        max_duration: 7,
        year: 2022,
        size: "Medium",
        transmission: "Automatic",
        fuelType: "Petrol",
      });
      await mockListing.save();

      const mockReq = { params: { id: mockListing._id } };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await listingsController.deleteListing(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          _id: mockListing._id,
        })
      );

      const deletedListing = await Listings.findById(mockListing._id);
      expect(deletedListing).toBeNull();
    });

    it("should return 404 if listing not found", async () => {
      const mockReq = { params: { id: new mongoose.Types.ObjectId() } };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await listingsController.deleteListing(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.json).toHaveBeenCalledWith({ error: "No such listing" });
    });
  });
});
