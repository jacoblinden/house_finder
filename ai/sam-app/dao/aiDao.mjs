

export const openAIChat = async (message, previousMessages) => {
    try {
        const result = [];
        result.push(...previousMessages);
        result.push({ from: "user", message: message, timestamp: Date.now(), flags: [] });
        result.push({ from: "system", message: "Hello from the AI", timestamp: Date.now(), flags: [] });
        return result;
    } catch (err) {
        throw err;
    }
}