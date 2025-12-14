import axios from 'axios';

const API_URL = 'http://localhost:5000/api/rentals';

// Requires authentication (token will be sent via axios defaults)
const createRental = (rentalData) => {
    return axios.post(API_URL, rentalData);
};

const getMyRentals = () => {
    return axios.get(`${API_URL}/my-rentals`);
};

const rentalService = {
    createRental,
    getMyRentals,
};

export default rentalService;
