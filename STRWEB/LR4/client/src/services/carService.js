import axios from 'axios';

const API_URL = 'http://localhost:5000/api/cars';

const getAllCars = (params = {}) => {
    return axios.get(API_URL, { params });
};

const getCarById = (id) => {
    return axios.get(`${API_URL}/${id}`);
};

const carService = {
    getAllCars,
    getCarById,
};

export default carService;
