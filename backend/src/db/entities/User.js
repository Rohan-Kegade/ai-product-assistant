import { EntitySchema } from "typeorm";

export const User = new EntitySchema({
  name: "User",
  tableName: "users",
  columns: {
    id: {
      type: "varchar",
      length: 36,
      primary: true,
      generated: "uuid",
    },
    name: {
      type: "varchar",
      length: 100,
    },
    // Stored lowercased and trimmed (see auth.service.js).
    email: {
      type: "varchar",
      length: 255,
      unique: true,
    },
    passwordHash: {
      type: "varchar",
      length: 60,
      name: "password_hash",
    },
    createdAt: {
      type: "datetime",
      createDate: true,
      name: "created_at",
    },
  },
  relations: {
    conversations: {
      type: "one-to-many",
      target: "Conversation",
      inverseSide: "user",
    },
  },
});
