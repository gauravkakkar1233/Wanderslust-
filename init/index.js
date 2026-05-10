if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({ path: "../.env" });
}

const mongoose = require("mongoose");
const initdata = require("./data.js");
const Listing = require("../models/listing.js");

const db_url = process.env.ATLASDB_URL;

console.log("DB URL =", db_url);

// ---------------- DATABASE CONNECTION ----------------
async function main() {
  await mongoose.connect(db_url);
}

// ---------------- DATABASE SEED FUNCTION ----------------
const initdb = async () => {

  // delete old listings
  await Listing.deleteMany({});

  // add owner to each listing
  const dataWithOwner = initdata.data.map((obj) => ({
    ...obj,
    owner: new mongoose.Types.ObjectId("681f2b3c8f1d6e7a12345678"),
  }));

  // insert data
  await Listing.insertMany(dataWithOwner);

  console.log("Database seeded successfully");
};

// ---------------- EXECUTION ----------------
main()
  .then(async () => {

    console.log("Connection successful");

    await initdb();

    await mongoose.connection.close();

    console.log("Connection closed");

  })
  .catch((err) => {
    console.log("ERROR:", err);
  });