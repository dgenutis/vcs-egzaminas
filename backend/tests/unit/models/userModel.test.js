import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import User from "../../../models/userModel.js";
import bcrypt from "bcrypt";

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

describe("User Model Test Suite", () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  test("should validate a good model", async () => {
    const validUser = {
      email: "test@example.com",
      username: "testuser",
      password: "Password123",
      role: "user",
    };

    const user = new User(validUser);
    const savedUser = await user.save();

    expect(savedUser._id).toBeDefined();
    expect(savedUser.email).toBe(validUser.email);
    expect(savedUser.username).toBe(validUser.username);
    expect(savedUser.role).toBe(validUser.role);
    // Check if the password is hashed
    expect(savedUser.password).not.toBe(validUser.password);
    const isPasswordValid = await bcrypt.compare(
      validUser.password,
      savedUser.password
    );
    expect(isPasswordValid).toBe(true);
  });

  test("should not validate a model with missing required fields", async () => {
    const invalidUser = {
      email: "test@example.com",
      // Missing username and password
    };

    try {
      const user = new User(invalidUser);
      await user.save();
      fail("Expected validation error but save succeeded");
    } catch (error) {
      expect(error).toBeInstanceOf(mongoose.Error.ValidationError);
      expect(error.errors.username).toBeDefined();
      expect(error.errors.password).toBeDefined();
    }
  });

  test("should not validate if email is not unique", async () => {
    const user1 = new User({
      email: "duplicate@example.com",
      username: "user1",
      password: "Password123",
    });
    await user1.save();

    const user2 = new User({
      email: "duplicate@example.com",
      username: "user2",
      password: "Password456",
    });

    await expect(user2.save()).rejects.toThrow("Email jau naudojamas.");
  });

  test("should not validate if username is not unique", async () => {
    const user1 = new User({
      email: "user1@example.com",
      username: "duplicateuser",
      password: "Password123",
    });
    await user1.save();

    const user2 = new User({
      email: "user2@example.com",
      username: "duplicateuser",
      password: "Password456",
    });

    await expect(user2.save()).rejects.toThrow("Username jau naudojamas.");
  });

  describe("User.signup static method", () => {
    test("should create a new user", async () => {
      const user = await User.signup(
        "newuser@example.com",
        "Password123",
        "newuser"
      );
      expect(user._id).toBeDefined();
      expect(user.email).toBe("newuser@example.com");
      expect(user.username).toBe("newuser");
      expect(user.role).toBe("user");
    });

    test("should throw error if email is invalid", async () => {
      await expect(
        User.signup("invalidemail", "Password123", "user")
      ).rejects.toThrow("El. paštas neteisingas.");
    });

    test("should throw error if password is weak", async () => {
      await expect(
        User.signup("valid@example.com", "weak", "user")
      ).rejects.toThrow("Slaptažodis pernelyg silpnas.");
    });

    test("should throw error if email already exists", async () => {
      await User.signup("existing@example.com", "Password123", "existinguser");
      await expect(
        User.signup("existing@example.com", "Password456", "newuser")
      ).rejects.toThrow("Email jau naudojamas.");
    });

    test("should throw error if username already exists", async () => {
      await User.signup("user1@example.com", "Password123", "existinguser");
      await expect(
        User.signup("user2@example.com", "Password456", "existinguser")
      ).rejects.toThrow("Username jau naudojamas.");
    });
  });

  describe("User.login static method", () => {
    beforeEach(async () => {
      await User.signup(
        "testlogin@example.com",
        "Password123",
        "testloginuser"
      );
    });

    test("should login a user with correct credentials", async () => {
      const user = await User.login("testlogin@example.com", "Password123");
      expect(user.email).toBe("testlogin@example.com");
    });

    test("should throw error if email is incorrect", async () => {
      await expect(
        User.login("nonexistent@example.com", "Password123")
      ).rejects.toThrow("El. paštas neteisingas.");
    });

    test("should throw error if password is incorrect", async () => {
      await expect(
        User.login("testlogin@example.com", "WrongPassword")
      ).rejects.toThrow("Įvestas neteisingas slaptažodis.");
    });
  });

  test("should be able to update an existing user", async () => {
    const user = new User({
      email: "update@example.com",
      username: "updateuser",
      password: "Password123",
      role: "user",
    });
    await user.save();

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { role: "admin" },
      { new: true }
    );

    expect(updatedUser.role).toBe("admin");
  });

  test("should be able to delete a user", async () => {
    const user = new User({
      email: "delete@example.com",
      username: "deleteuser",
      password: "Password123",
      role: "user",
    });
    await user.save();

    await User.findByIdAndDelete(user._id);

    const deletedUser = await User.findById(user._id);
    expect(deletedUser).toBeNull();
  });
});
