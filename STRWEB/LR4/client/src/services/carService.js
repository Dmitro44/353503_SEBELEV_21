import axios from 'axios';

const API_URL = 'http://localhost:5000/api/cars';

const getAllCars = (params = {}) => {
    return axios.get(API_URL, { params });
};

const getCarById = (id) => {
    return axios.get(`${API_URL}/${id}`);
};

const createCar = (params) => {
    return axios.post(`${API_URL}/`, params);
};

const updateCar = (id, params) => {
    return axios.put(`${API_URL}/${id}`, params);
};

const deleteCar = (id) => {
    return axios.delete(`${API_URL}/${id}`);
}

const carService = {
    getAllCars,
    getCarById,
    createCar,
    updateCar,
    deleteCar
};

export default carService;
