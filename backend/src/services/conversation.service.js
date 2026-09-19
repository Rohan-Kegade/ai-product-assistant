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

// Bumps updated_at so the conversation list orders by real activity (the
// column only auto-updates when the conversation row itself is saved).
export async function touchConversation(conversationId) {
  await conversationRepository().update(
    { id: conversationId },
    { updatedAt: new Date() },
  );
}

export async function deleteConversation(conversationId) {
  await conversationRepository().delete({ id: conversationId });
}

// One query for the whole list: title is the first-added product's title.
export async function listConversations(limit = 50) {
  const rows = await AppDataSource.query(
    `SELECT c.id,
            c.updated_at AS updatedAt,
            COUNT(cp.id) AS productCount,
            (SELECT p.title
               FROM conversation_products cp2
               JOIN products p ON p.id = cp2.product_id
              WHERE cp2.conversation_id = c.id
              ORDER BY cp2.added_at ASC, cp2.id ASC
              LIMIT 1) AS title
       FROM conversations c
       LEFT JOIN conversation_products cp ON cp.conversation_id = c.id
      GROUP BY c.id, c.updated_at
      ORDER BY c.updated_at DESC, c.id DESC
      LIMIT ?`,
    [limit],
  );

  return rows.map((row) => ({
    id: row.id,
    title: row.title || "New conversation",
    productCount: Number(row.productCount),
    updatedAt: row.updatedAt,
  }));
}
