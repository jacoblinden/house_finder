import { getConversation, post, deleteTable, createTable } from '../dao/conversDao.mjs';
import { openAIChat } from '../dao/aiDao.mjs';
export const converse = async (id, message) => {
    // deleteTable();
    // createTable();
    let conversation = await getConversation(id)

    conversation === undefined && (conversation = { id: id, messages: [] });
    conversation = await openAIChat(message, conversation.messages);

    await post(conversation, id);
    return conversation;
}

export const getById = async (id) => {
    return await getConversation(id);
}

