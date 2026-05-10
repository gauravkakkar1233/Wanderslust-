const Listing=require("../models/listing");

module.exports.index=async (req, res) => {
    const alllistings = await Listing.find({});
    res.render("listings/index.ejs", { alllistings });
};
module.exports.renderNewForm=(req, res) => {
    res.render("listings/new.ejs");
    // res.send("NEW ROUTE IS WORKING");
}


module.exports.showListing=async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
    .populate({path:"reviews",
        populate:{
            path:"author"
        },})
    .populate("owner");
    if (!listing) {
        req.flash("error", "Listing is not Valid!!!!");
        return res.redirect("/listings");
    }
    console.log(listing);
    res.render("listings/show.ejs", { listing });
}
module.exports.createListing=async (req, res, next) => {
    // let {title,description,image,price,location,country}=req.body;
    // console.log({title,description,image,price,location,country}); 

    let listing = req.body.listing;
    let url=req.file.path;
    let filename=req.file.filename;
    console.log(url,filename);

    console.log(listing);
    let newlisting1 = new Listing(listing);
    newlisting1.owner=req.user._id;
    newlisting1.image.url=url;
    newlisting1.image.filename=filename;
    await newlisting1.save();
    req.flash("success", "New Listing Created!!");
    res.redirect("/listings");
    // res.send("new route is working");
}
module.exports.renderEditForm=async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("error", "Listing is not Valid!!!!");
        return res.redirect("/listings");
    }
    let orginalImageUrl=listing.image.url;
    orginalImageUrl=orginalImageUrl.replace("/upload","/upload/h_300,w_250");
    res.render("listings/edit.ejs", { listing,orginalImageUrl });
}
module.exports.updateListing = async (req, res) => {
    let { id } = req.params;

    let updatelisting = await Listing.findByIdAndUpdate(
        id,
        { ...req.body.listing },
        { returnDocument: "after" }
    );

    if (req.file) {
        let url = req.file.path;
        let filename = req.file.filename;

        updatelisting.image = { url, filename };
        await updatelisting.save();
    }

    console.log(updatelisting);
    req.flash("success", "Listing Updated!!");
    res.redirect(`/listings/${id}`);
};
module.exports.destroyListing=async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findByIdAndDelete(id);
    console.log(listing);
    req.flash("success", "Listing Deleted!!");
    res.redirect("/listings");
}