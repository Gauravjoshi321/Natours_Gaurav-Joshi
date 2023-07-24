const fs = require('fs');
const dotenv = require('dotenv');
const mongoose = require('mongoose')
const Tour = require('./../../models/tourModel');
const User = require('./../../models/userModel');
const Review = require('./../../models/reviewModel');

dotenv.config({ path: './config.env' });


// CONNECT TO ATLAS
const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD)

mongoose.connect(DB, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true
}).then(con => {
  console.log("CONNECTION SUCCESSFULL !");
})

// READ FILE
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`));


// IMPORT DATA TO THE DATABASE
const importData = async () => {
  try {
    await Tour.create(tours);
    await User.create(users, { validateBeforeSave: false });
    await Review.create(reviews);

    console.log("Data imported successfully");
  }
  catch (err) {
    console.log(err);
  }
  process.exit();
}

// DELETE DATA FROM THE DATABASE
const deleteTours = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();

    console.log("Data deleted successfully");
  }
  catch (err) {
    console.log(err);
  }
  process.exit();
}



if (process.argv[2] === '--import') {
  importData();
}
else if (process.argv[2] === '--delete') {
  deleteTours();
}

console.log(process.argv)