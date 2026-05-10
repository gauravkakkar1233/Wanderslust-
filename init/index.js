if(process.env.NODE_ENV!="production"){
  require('dotenv').config();
  }

const mongoose = require("mongoose");
const initdata = require("./data.js");
const Listing = require("../models/listing.js");


const db_url = process.env.ATLASDB_URL;

console.log("DB URL =", db_url);

async function main() {
  await mongoose.connect(db_url);
}

const initdb = async () => {
  await Listing.deleteMany({});

  const dataWithOwner = initdata.data.map((obj) => ({
    ...obj,
    owner: "6995f09b1de46f91716740ee",
  }));

  await Listing.insertMany(dataWithOwner);
  console.log("data was saved");
};

main()
  .then(async () => {
    console.log("Connection successful");
    await initdb();
    await mongoose.connection.close();
  })
  .catch(console.log);