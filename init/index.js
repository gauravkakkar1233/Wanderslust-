const mongoose=require("mongoose");
const initdata=require("./data.js");
const Listing=require("../models/listing.js");
let q="mongodb://127.0.0.1:27017/wanderlust"
async function main() {
    await mongoose.connect(q);
}
main()
.then(()=>
{
    console.log("Connection succsesfull");
})
.catch((err)=>
{
    console.log(err);
});
const initdb=async()=>
{
    await Listing.deleteMany({});
    await Listing.insertMany(initdata.data);
    console.log("data was saved");
};
initdb();
