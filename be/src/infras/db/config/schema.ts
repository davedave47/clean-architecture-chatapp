import { varchar, timestamp, pgTable, uuid  } from 'drizzle-orm/pg-core';

export const users = pgTable(
    'users',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        name: varchar('name').notNull().unique(),
        email: varchar('email').notNull().unique(),
        password: varchar('password').notNull(),
        created_at: timestamp('created_at').notNull().defaultNow(),
        updated_at: timestamp('updated_at').notNull().defaultNow()
    }
);