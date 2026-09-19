import { EntitySchema } from "typeorm";

// Explicit join entity (rather than a plain @ManyToMany/@JoinTable) so we can
// carry an `added_at` timestamp on the link itself.
export const ConversationProduct = new EntitySchema({
  name: "ConversationProduct",
  tableName: "conversation_products",
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
    productId: {
      type: "int",
      name: "product_id",
    },
    addedAt: {
      type: "datetime",
      createDate: true,
      name: "added_at",
    },
  },
  relations: {
    conversation: {
      type: "many-to-one",
      target: "Conversation",
      joinColumn: { name: "conversation_id" },
      inverseSide: "conversationProducts",
      onDelete: "CASCADE",
    },
    product: {
      type: "many-to-one",
      target: "Product",
      joinColumn: { name: "product_id" },
      inverseSide: "conversationProducts",
      onDelete: "CASCADE",
    },
  },
  uniques: [{ name: "UQ_conversation_product", columns: ["conversationId", "productId"] }],
});
