import axios from 'axios';

const API_URL = 'http://localhost:5000/api/deepseek';

const chat = (messages) => {
    return axios.post(`${API_URL}/chat`, { messages });
};

const deepseekService = {
    chat,
};

export default deepseekService;
