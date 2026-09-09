import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  phone: text('phone'),
  balance: integer('balance').default(0).notNull(),
  role: text('role').default('user').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const transactions = pgTable('transactions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  type: text('type').notNull(), // 'recharge' | 'transfer' | 'bundle'
  amount: integer('amount').notNull(),
  recipientPhone: text('recipient_phone').notNull(),
  operator: text('operator').notNull(), // 'Orange' | 'MTN' | 'Moov'
  status: text('status').default('completed').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const sheetExports = pgTable('sheet_exports', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  spreadsheetId: text('spreadsheet_id').notNull(),
  spreadsheetUrl: text('spreadsheet_url').notNull(),
  title: text('title').notNull(),
  exportedAt: timestamp('exported_at').defaultNow().notNull(),
});

export const emailLogs = pgTable('email_logs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  recipientEmail: text('recipient_email').notNull(),
  subject: text('subject').notNull(),
  sentAt: timestamp('sent_at').defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  transactions: many(transactions),
  sheetExports: many(sheetExports),
  emailLogs: many(emailLogs),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
}));

export const sheetExportsRelations = relations(sheetExports, ({ one }) => ({
  user: one(users, {
    fields: [sheetExports.userId],
    references: [users.id],
  }),
}));

export const emailLogsRelations = relations(emailLogs, ({ one }) => ({
  user: one(users, {
    fields: [emailLogs.userId],
    references: [users.id],
  }),
}));
