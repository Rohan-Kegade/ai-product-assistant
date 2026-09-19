import { AppDataSource } from "../db/data-source.js";
import { Message } from "../db/entities/Message.js";

const messageRepository = () => AppDataSource.getRepository(Message);

export async function createMessage(conversationId, role, content) {
  const message = messageRepository().create({
    conversationId,
    role,
    content,
  });

  return messageRepository().save(message);
}

export async function listMessagesForConversation(conversationId) {
  return messageRepository().find({
    where: { conversationId },
    order: { createdAt: "ASC", id: "ASC" },
  });
}
