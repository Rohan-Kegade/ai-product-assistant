import { AppDataSource } from "../db/data-source.js";
import { Conversation } from "../db/entities/Conversation.js";

const conversationRepository = () => AppDataSource.getRepository(Conversation);

export async function createConversation() {
  const conversation = conversationRepository().create({});

  return conversationRepository().save(conversation);
}

export async function getConversationById(conversationId) {
  return conversationRepository().findOneBy({ id: conversationId });
}
