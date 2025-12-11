import dotenv from 'dotenv'
import connectToDB from './db/index.js';

dotenv.config({
    path: './.env'
});

connectToDB();


// import express from 'express';
// const app = express()

// ;(async () => {
//   try {
//     await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
//     console.log('Connected to MongoDB');

//     app.listen(process.env.PORT, () => {
//       console.log(`Server is running on port ${process.env.PORT}`);
//     });

//   } 
//   catch (error) {
//     console.error('Error connecting to MongoDB:', error);
//   } 
//   finally {
//     mongoose.connection.close();
//   }
// })();