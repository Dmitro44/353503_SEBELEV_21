const axios = require('axios');
const FormData = require('form-data');
const User = require('../models/User');

exports.verifyDocument = async (req, res) => {
    if (!req.file) {
        console.log('No file found in request');
        return res.status(400).json({ msg: 'Файл документа не найден.' });
    }

    try {
        const formData = new FormData();
        formData.append('file', req.file.buffer, req.file.originalname);
        formData.append('apikey', process.env.OCR_API_KEY);
        formData.append('language', 'rus');

        const ocrResponse = await axios.post('https://api.ocr.space/parse/image', formData, {
            headers: formData.getHeaders(),
        });

        if (ocrResponse.data.IsErroredOnProcessing) {
            return res.status(500).json({ msg: ocrResponse.data.ErrorMessage.join(', ') });
        }

        const parsedText = ocrResponse.data.ParsedResults[0]?.ParsedText || '';

        const keywords = ['driving license', 'driver license', 'водительское удостоверение', 'паспорт', 'passport'];
        const isDocumentValid = keywords.some(keyword => parsedText.toLowerCase().includes(keyword));

        if (isDocumentValid) {
            // req.user.id приходит из authMiddleware
            await User.findByIdAndUpdate(req.user.id, { isVerified: true });
            res.json({ success: true, message: 'Документ успешно верифицирован.' });
        } else {
            res.status(400).json({ success: false, message: 'Не удалось распознать документ.' });
        }
    } catch (error) {
        console.error('Ошибка при верификации документа:', error);
        res.status(500).send('Ошибка на сервере при верификации документа.');
    }
};
