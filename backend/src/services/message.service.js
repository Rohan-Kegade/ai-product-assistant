import { AppDataSource } from "../db/data-source.js";
import { Message } from "../db/entities/Message.js";
import { bumpConversationUpdatedAt } from "./conversation.service.js";

const messageRepository = () => AppDataSource.getRepository(Message);

export async function createMessage(conversationId, role, content) {
  const message = messageRepository().create({
    conversationId,
    role,
    content,
  });

  const saved = await messageRepository().save(message);
  await bumpConversationUpdatedAt(conversationId);

  return saved;
}

export async function listMessagesForConversation(conversationId) {
  return messageRepository().find({
    where: { conversationId },
    order: { createdAt: "ASC", id: "ASC" },
  });
}

// Stores the user's new question and returns the full history including it.
// On retry the question is already stored (the previous attempt failed before
// any reply was saved), so it isn't inserted a second time.
export async function saveUserQuestionAndGetHistory(
  conversationId,
  content,
  { retry = false } = {},
) {
  const storedMessages = await listMessagesForConversation(conversationId);
  const lastMessage = storedMessages[storedMessages.length - 1];

  if (retry && lastMessage?.role === "user" && lastMessage.content === content) {
    return storedMessages;
  }

  await createMessage(conversationId, "user", content);

  return listMessagesForConversation(conversationId);
}
