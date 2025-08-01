const app = require('./app');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE;

process.on('uncaughtException',err => {
  console.log('UNCAUGHT EXCEPTION Shutting down...');
  console.log(err.name,err.message);
  server.close(() => {
    process.exit(1);
  })
});

mongoose.connect(DB)
.then((db)=>{
  console.log('connected to db');
});

const port = process.env.PORT || 5000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

process.on('unhandledRejection',err => {
  console.log('UNHANDLEDREJECTION Shutting down...');
  console.log(err.name,err.message);
  server.close(() => {
    process.exit(1);
  })
});

