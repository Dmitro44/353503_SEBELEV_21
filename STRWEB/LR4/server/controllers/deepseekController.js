const { OpenRouter } = require('@openrouter/sdk');
const ChatHistory = require('../models/ChatHistory'); // Импортируем модель истории чата

const openrouter = new OpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
});

exports.chatWithDeepSeek = async (req, res) => {
    const { messages } = req.body;
    const userId = req.user.id;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ msg: 'Messages array is required.' });
    }

    try {
        const stream = await openrouter.chat.send({
            model: "deepseek/deepseek-r1-0528:free",
            messages: messages,
            stream: true
        });

        let fullContent = '';
        for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
                fullContent += content;
            }
        }

        const assistantMessage = { role: "assistant", content: fullContent };
        const updatedMessages = [...messages, assistantMessage];

        await ChatHistory.findOneAndUpdate(
            { user: userId },
            { messages: updatedMessages },
            { upsert: true, new: true } // upsert: true создаст документ, если его нет
        );

        res.json({ reply: fullContent });

    } catch (error) {
        console.error('Error communicating with OpenRouter API:', error);
        res.status(500).json({ msg: 'Error communicating with OpenRouter API.' });
    }
};

exports.getChatHistory = async (req, res) => {
    try {
        const chatHistory = await ChatHistory.findOne({ user: req.user.id });
        res.json(chatHistory ? chatHistory.messages : []);
    } catch (error) {
        console.error('Error fetching chat history:', error);
        res.status(500).json({ msg: 'Error fetching chat history.' });
    }
};

exports.clearChatHistory = async (req, res) => {
    try {
        await ChatHistory.findOneAndDelete({ user: req.user.id });
        res.json({ msg: 'Chat history cleared.' });
    } catch (error) {
        console.error('Error clearing chat history:', error);
        res.status(500).json({ msg: 'Error clearing chat history.' });
    }
};
