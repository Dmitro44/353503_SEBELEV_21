import axios from 'axios';

const API_URL = 'http://localhost:5000/api/deepseek';

const chat = (messages) => {
    return axios.post(`${API_URL}/chat`, { messages });
};

const getChatHistory = () => {
    return axios.get(`${API_URL}/history`);
};

const clearChatHistory = () => {
    return axios.delete(`${API_URL}/history`);
};

const deepseekService = {
    chat,
    getChatHistory,
    clearChatHistory,
};

export default deepseekService;
