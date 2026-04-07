"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
exports.down = down;
async function up(knex) {
    await knex.schema.createTable("users", (table) => {
        table.string("id", 36).primary();
        table.string("name").notNullable();
        table.string("email").notNullable().unique();
        table.string("password_hash").notNullable();
        table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
        table.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());
    });
    await knex.schema.createTable("meals", (table) => {
        table.string("id", 36).primary();
        table
            .string("user_id", 36)
            .notNullable()
            .references("id")
            .inTable("users")
            .onDelete("CASCADE");
        table.string("name").notNullable();
        table.string("description");
        table.timestamp("occurred_at").notNullable();
        table.boolean("is_on_diet").notNullable();
        table.timestamp("created_at").notNullable().defaultTo(knex.fn.now());
        table.timestamp("updated_at").notNullable().defaultTo(knex.fn.now());
        table.index(["user_id"]);
        table.index(["user_id", "occurred_at"]);
    });
}
async function down(knex) {
    await knex.schema.dropTableIfExists("meals");
    await knex.schema.dropTableIfExists("users");
}
