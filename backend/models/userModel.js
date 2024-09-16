import mongoose from "mongoose";
import bcrypt from "bcrypt";
import validator from "validator";

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: false,
      default: "user",
    },
  },
  { timestamps: true }
);

// Pre-save hook to hash password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Handle unique constraint errors
userSchema.post("save", function (error, doc, next) {
  if (error.name === "MongoServerError" && error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    next(
      new Error(
        `${field.charAt(0).toUpperCase() + field.slice(1)} jau naudojamas.`
      )
    );
  } else {
    next(error);
  }
});

// Static signup method
userSchema.statics.signup = async function (email, password, username) {
  if (!email || !password || !username) {
    throw Error("All fields are required.");
  }

  const userEmail = await this.findOne({ email });

  if (userEmail) {
    throw Error("Email is already in use.");
  }

  const userUsername = await this.findOne({ username });

  if (userUsername) {
    throw Error("Username is already in use.");
  }

  if (!validator.isEmail(email)) {
    throw Error("Email address is incorrect.");
  }

  if (
    !validator.isStrongPassword(password, {
      minLength: 5,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 0,
    })
  ) {
    throw Error("Password is too weak.");
  }

  const user = await this.create({
    email,
    username,
    password,
    role: "user",
  });

  return user;
};

// Static login method
userSchema.statics.login = async function (email, password) {
  if (!email || !password) {
    throw Error("Please fill in your email and password.");
  }

  const user = await this.findOne({ email });

  if (!user) {
    throw Error("Check your email address.");
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    throw Error("Password is incorrect.");
  }

  return user;
};

// User model export
const User = mongoose.model("User", userSchema);

export default User;
