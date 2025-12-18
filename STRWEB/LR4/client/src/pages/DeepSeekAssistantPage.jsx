import React, { useState, useRef, useEffect } from 'react';
import deepseekService from '../services/deepseekService';
import carService from '../services/carService'; // Импортируем carService
import ReactMarkdown from 'react-markdown';
import './DeepSeekAssistantPage.css';

const DeepSeekAssistantPage = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [carsLoading, setCarsLoading] = useState(true);
    const [availableCars, setAvailableCars] = useState([]);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    // Загрузка списка доступных автомобилей при монтировании компонента
    useEffect(() => {
        const fetchCars = async () => {
            setCarsLoading(true);
            try {
                const response = await carService.getAllCars({ status: 'available' });
                setAvailableCars(response.data);
            } catch (err) {
                console.error("Ошибка при загрузке автомобилей для контекста:", err);
            } finally {
                setCarsLoading(false);
            }
        };
        fetchCars();
    }, []);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!input.trim() || loading || carsLoading) return;

        const userMessage = { role: "user", content: input };
        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInput('');
        setLoading(true);

        // Формируем контекстные сообщения для ассистента
        const contextMessages = [
            { role: "system", content: "Ты — помощник для сервиса по прокату автомобилей. Твоя задача — помогать пользователям находить и понимать варианты аренды автомобилей, отвечать на вопросы о машинах и условиях аренды. Будь краток и по делу." },
            { role: "system", content: `Вот список автомобилей, доступных для аренды в данный момент: ${availableCars.map(car => `${car.brand} ${car.model} (${car.year}, ${car.licensePlate}, $${car.dailyRate}/день)`).join('; ')}. Используй эту информацию для ответов.` }
        ];

        try {
            const response = await deepseekService.chat([...contextMessages, ...newMessages]);
            const assistantMessage = { role: "assistant", content: response.data.reply };
            setMessages(prevMessages => [...prevMessages, assistantMessage]);
        } catch (error) {
            console.error("Error sending message to DeepSeek:", error);
            setMessages(prevMessages => [...prevMessages, { role: "assistant", content: "Извините, произошла ошибка при получении ответа." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="deepseek-assistant-page">
            <h1>Ассистент</h1>
            <div className="chat-window">
                {messages.length === 0 && !carsLoading && (
                    <div className="chat-placeholder">
                        Начните диалог с вашим DeepSeek помощником!
                    </div>
                )}
                {carsLoading && (
                    <div className="chat-placeholder">Загрузка информации об автомобилях...</div>
                )}
                {messages.map((msg, index) => (
                    <div key={index} className={`chat-message ${msg.role}`}>
                        <strong>{msg.role === 'user' ? 'Вы' : 'Ассистент'}:</strong>
                        {msg.role === 'assistant' ? (
                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                        ) : (
                            msg.content
                        )}
                    </div>
                ))}
                {loading && (
                    <div className="chat-message assistant loading">
                        <strong>Ассистент:</strong> Печатает...
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={sendMessage} className="chat-input-form">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Задайте вопрос..."
                    disabled={loading || carsLoading}
                />
                <button type="submit" disabled={loading || carsLoading}>Отправить</button>
            </form>
        </div>
    );
};

export default DeepSeekAssistantPage;
