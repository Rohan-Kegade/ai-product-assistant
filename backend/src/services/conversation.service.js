import { IsNull } from "typeorm";
import { AppDataSource } from "../db/data-source.js";
import { Conversation } from "../db/entities/Conversation.js";

const conversationRepository = () => AppDataSource.getRepository(Conversation);

export async function createConversation(userId) {
  const conversation = conversationRepository().create({ userId });

  return conversationRepository().save(conversation);
}

// Only finds the conversation if `userId` owns it, so another user's
// conversation looks the same as a missing one.
export async function getConversationById(conversationId, userId) {
  // TypeORM drops `undefined` from the filter, which would match any owner.
  if (!userId) return null;

  return conversationRepository().findOneBy({ id: conversationId, userId });
}

// Bumps updated_at so the conversation list orders by real activity (the
// column only auto-updates when the conversation row itself is saved).
export async function bumpConversationUpdatedAt(conversationId) {
  await conversationRepository().update(
    { id: conversationId },
    { updatedAt: new Date() },
  );
}

export async function deleteConversation(conversationId) {
  await conversationRepository().delete({ id: conversationId });
}

// One query for the user's whole list. Title is the stored (LLM-generated) one,
// falling back to the first-added product's title.
export async function listConversations(userId, limit = 50) {
  const rows = await AppDataSource.query(
    `SELECT c.id,
            c.updated_at AS updatedAt,
            COUNT(cp.id) AS productCount,
            COALESCE(c.title, (SELECT p.title
               FROM conversation_products cp2
               JOIN products p ON p.id = cp2.product_id
              WHERE cp2.conversation_id = c.id
              ORDER BY cp2.added_at ASC, cp2.id ASC
              LIMIT 1)) AS title
       FROM conversations c
       LEFT JOIN conversation_products cp ON cp.conversation_id = c.id
      WHERE c.user_id = ?
      GROUP BY c.id, c.updated_at, c.title
      ORDER BY c.updated_at DESC, c.id DESC
      LIMIT ?`,
    [userId, limit],
  );

  return rows.map((row) => ({
    id: row.id,
    title: row.title || "New conversation",
    productCount: Number(row.productCount),
    updatedAt: row.updatedAt,
  }));
}

// Only sets the title if none exists yet, so concurrent chats can't overwrite
// each other. Returns true if this call set it.
export async function setConversationTitleIfEmpty(conversationId, title) {
  const result = await conversationRepository().update(
    { id: conversationId, title: IsNull() },
    { title },
  );

  return (result.affected ?? 0) > 0;
}

// Manual rename. Keeps updated_at as-is so renaming doesn't reorder the list.
export async function setConversationTitle(conversationId, title) {
  await conversationRepository().update(
    { id: conversationId },
    { title, updatedAt: () => "updated_at" },
  );
}
