// backend/utils/generateToken.js
import jwt from 'jsonwebtoken';
// import config from '../config/index.js'; // If you created config/index.js
// Or directly use process.env if not using config/index.js
import dotenv from 'dotenv';
dotenv.config();


const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { // or config.jwtSecret
    expiresIn: '30d', // Token expiry time
  });
};

export default generateToken;