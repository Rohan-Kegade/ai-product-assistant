import { AppDataSource } from "../db/data-source.js";
import { Message } from "../db/entities/Message.js";
import { touchConversation } from "./conversation.service.js";

const messageRepository = () => AppDataSource.getRepository(Message);

export async function createMessage(conversationId, role, content) {
  const message = messageRepository().create({
    conversationId,
    role,
    content,
  });

  const saved = await messageRepository().save(message);
  await touchConversation(conversationId);

  return saved;
}

export async function listMessagesForConversation(conversationId) {
  return messageRepository().find({
    where: { conversationId },
    order: { createdAt: "ASC", id: "ASC" },
  });
}
