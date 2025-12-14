import axios from 'axios';

const RENTALS_URL = 'http://localhost:5000/api/rentals';

const getPendingRentals = () => {
    return axios.get(`${RENTALS_URL}/pending`);
};

const approveRental = (id) => {
    return axios.put(`${RENTALS_URL}/${id}/approve`);
};

const rejectRental = (id) => {
    return axios.put(`${RENTALS_URL}/${id}/reject`);
};

const adminService = {
    getPendingRentals,
    approveRental,
    rejectRental,
};

export default adminService;
