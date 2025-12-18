import React, { useState, useRef } from 'react';
import ocrService from '../services/ocrService';
import './DocumentVerifier.css';

const DocumentVerifier = ({ onDocumentVerify }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileName, setFileName] = useState('');
    const [status, setStatus] = useState('idle');
    const [message, setMessage] = useState('Загрузите документ для верификации.');

    // useRef to calculate attempts of verification
    const attemptCount = useRef(0);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Проверка размера файла (1MB = 1024 * 1024 bytes)
            if (file.size > 1024 * 1024) {
                setStatus('error');
                setMessage('Файл слишком большой. Максимальный размер - 1 МБ.');
                setFileName('');
                setSelectedFile(null);
                e.target.value = null;
                return;
            }
            setSelectedFile(file);
            setFileName(file.name);
            setStatus('idle');
            setMessage('Файл выбран. Нажмите "Верифицировать".');
        }
    };

    const handleVerification = async () => {
        if (!selectedFile) {
            setMessage('Пожалуйста, выберите файл для загрузки.');
            setStatus('error');
            return;
        }

        attemptCount.current += 1;
        console.log(`Попытка верификации #${attemptCount.current}`);

        setStatus('uploading');
        setMessage('Идет верификация документа...');

        try {
            const result = await ocrService.verifyDocument(selectedFile);

            if (result.success) {
                setStatus('success');
                setMessage(result.message);
                onDocumentVerify();
            } else {
                setStatus('error');

                if (attemptCount.current >= 3) {
                    setMessage(`${result.message} Пожалуйста, попробуйте другой документ или свяжитесь с поддержкой.`);
                } else {
                    setMessage(result.message);
                }
            }
        } catch (err) {
            setStatus('error');
            setMessage(err.message || 'Произошла ошибка при обработке документа.');
            console.error(err);
        }
    };

    return (
        <div className="document-verifier">
            <h3>Верификация аккаунта</h3>
            <p>Загрузите скан или фото вашего водительского удостоверения или паспорта (до 1 МБ).</p>
            
            <div className="verifier-controls">
                <input type="file" id="file-upload" onChange={handleFileChange} accept="image/*" style={{ display: 'none' }} />
                <label htmlFor="file-upload" className="btn-file">
                    Выберите файл
                </label>
                {fileName && <span className="file-name">{fileName}</span>}
                <button onClick={handleVerification} disabled={status === 'uploading' || !selectedFile}>
                    Верифицировать
                </button>
            </div>

            <div className={`status-message status-${status}`}>
                {message}
            </div>
        </div>
    );
};

export default DocumentVerifier;
