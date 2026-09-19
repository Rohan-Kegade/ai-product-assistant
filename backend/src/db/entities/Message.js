import { EntitySchema } from "typeorm";

export const Message = new EntitySchema({
  name: "Message",
  tableName: "messages",
  columns: {
    id: {
      type: "int",
      primary: true,
      generated: "increment",
    },
    conversationId: {
      type: "varchar",
      length: 36,
      name: "conversation_id",
    },
    role: {
      type: "enum",
      enum: ["user", "assistant"],
    },
    content: {
      type: "text",
    },
    createdAt: {
      type: "datetime",
      createDate: true,
      name: "created_at",
    },
  },
  relations: {
    conversation: {
      type: "many-to-one",
      target: "Conversation",
      joinColumn: { name: "conversation_id" },
      inverseSide: "messages",
      onDelete: "CASCADE",
    },
  },
});
