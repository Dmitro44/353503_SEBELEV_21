import axios from 'axios';

const API_URL = 'http://localhost:5000/api/users';

const verifyDocument = async (file) => {
    const formData = new FormData();
    formData.append('document', file);

    try {
        const response = await axios.post(`${API_URL}/verify-document`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Ошибка при отправке документа на верификацию:', error);
        throw new Error(error.response?.data?.message || 'Не удалось верифицировать документ.');
    }
};

const ocrService = {
    verifyDocument,
};

export default ocrService;
