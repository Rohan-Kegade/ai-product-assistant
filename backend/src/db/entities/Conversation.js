import { EntitySchema } from "typeorm";

export const Conversation = new EntitySchema({
  name: "Conversation",
  tableName: "conversations",
  columns: {
    id: {
      type: "varchar",
      length: 36,
      primary: true,
      generated: "uuid",
    },
    // Null only for conversations created before accounts existed; those
    // belong to no one and are never listed.
    userId: {
      type: "varchar",
      length: 36,
      nullable: true,
      name: "user_id",
    },
    // Set once from the first user question (LLM-generated); null until then.
    title: {
      type: "varchar",
      length: 255,
      nullable: true,
    },
    createdAt: {
      type: "datetime",
      createDate: true,
      name: "created_at",
    },
    updatedAt: {
      type: "datetime",
      updateDate: true,
      name: "updated_at",
    },
  },
  relations: {
    user: {
      type: "many-to-one",
      target: "User",
      joinColumn: { name: "user_id" },
      inverseSide: "conversations",
      onDelete: "CASCADE",
    },
    conversationProducts: {
      type: "one-to-many",
      target: "ConversationProduct",
      inverseSide: "conversation",
    },
    messages: {
      type: "one-to-many",
      target: "Message",
      inverseSide: "conversation",
    },
  },
});
