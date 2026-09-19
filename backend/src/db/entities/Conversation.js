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
