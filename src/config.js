import dotenv from 'dotenv';
dotenv.config({ silent: true });
export const {
  SECRET,
} = process.env;


export default SECRET;