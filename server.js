process.on('uncaughtException', err => {
  console.log(err.name, err.message);
  console.log('UNHANDLED REJECTION..! SHUTTING DOWN 🥲');

  process.exit(1);
})

const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const app = require('./app');
const mongoose = require('mongoose');


// CONNECT TO ATLAS
// const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD)

mongoose.connect('mongodb+srv://gauravjoshi:Ananta@123@cluster0.9heejm2.mongodb.net/natoursdatabase?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true
}).then(con => {
  console.log("DB connection is successfull !");
})
// .catch(err => {
//   console.log("ERROR");
// })

const port = process.env.PORT;

const server = app.listen(port, () => {
  console.log(`Listening at port number ${port} on this device`);
})

process.on('unhandledRejection', err => {
  console.log(err.name, err.message);
  console.log('UNHANDLED REJECTION..! SHUTTING DOWN 🥲');

  server.close(() => process.exit(1));
})

