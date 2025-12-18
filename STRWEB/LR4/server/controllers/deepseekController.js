const { OpenRouter } = require('@openrouter/sdk');

const openrouter = new OpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
});

exports.chatWithDeepSeek = async (req, res) => {
    const { messages } = req.body;

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

        res.json({ reply: fullContent });

    } catch (error) {
        console.error('Error communicating with OpenRouter API:', error);
        res.status(500).json({ msg: 'Error communicating with OpenRouter API.' });
    }
};