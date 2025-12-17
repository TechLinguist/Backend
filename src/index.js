import dotenv from 'dotenv'
import connectToDB from './db/index.js';
import app from './app.js';

dotenv.config({
    path: './.env'
});

connectToDB()
.then(()=> {
    app.listen(process.env.PORT || 8000 , () => {
        console.log(`Server is running on port ${process.env.PORT || 8000}`);
    });
    app.on('error', (error) => {
        console.error('Error starting the server:', error);
    });
})
.catch(error => {
    console.error('Error connecting to MongoDB:', error);
});


// Below code is commented out as the server setup has been moved to app.js


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