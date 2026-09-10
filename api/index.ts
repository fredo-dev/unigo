import express from 'express';
import { db } from '../src/db/index.ts';
import { users, transactions } from '../src/db/schema.ts';
import { getOrCreateUser } from '../src/db/users.ts';
import { requireAuth, AuthRequest } from '../src/middleware/auth.ts';
import { createGoogleSheetExport, sendGmailReceipt } from '../src/lib/workspace.ts';
import { eq, desc } from 'drizzle-orm';

const app = express();
app.use(express.json());

// API Routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Unigo.ci Core API',
    database: 'Cloud SQL (PostgreSQL) + Firestore',
    timestamp: new Date().toISOString(),
  });
});

app.post('/api/sync-user', requireAuth, async (req: AuthRequest, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const { uid, email } = req.user;
    const phone = req.body.phone || '';
    const userRecord = await getOrCreateUser(uid, email || '', phone);
    res.json({ success: true, user: userRecord });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to sync user record', details: error.message });
  }
});

app.get('/api/transactions', requireAuth, async (req: AuthRequest, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const dbUser = await db.select().from(users).where(eq(users.uid, req.user.uid));
    if (!dbUser.length) return res.json({ transactions: [] });

    const txList = await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, dbUser[0].id))
      .orderBy(desc(transactions.createdAt));
    res.json({ transactions: txList });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch transactions', details: error.message });
  }
});

app.post('/api/transactions', requireAuth, async (req: AuthRequest, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const { type, amount, recipientPhone, operator } = req.body;
    if (!type || !amount || !recipientPhone || !operator) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const userRecord = await getOrCreateUser(req.user.uid, req.user.email || '');
    const newTx = await db.insert(transactions).values({
      userId: userRecord.id, type, amount: Number(amount), recipientPhone, operator, status: 'completed'
    }).returning();
    res.json({ success: true, transaction: newTx[0] });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to record transaction', details: error.message });
  }
});

app.post('/api/sheets/export', async (req, res) => {
  try {
    const { accessToken, title, transactions: txList } = req.body;
    if (!accessToken) return res.status(400).json({ error: 'Missing Token' });
    const result = await createGoogleSheetExport(accessToken, title || 'Unigo', txList || []);
    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ error: 'Export failed', details: error.message });
  }
});

app.post('/api/gmail/send-receipt', async (req, res) => {
  try {
    const { accessToken, recipientEmail, subject, transaction } = req.body;
    if (!accessToken || !recipientEmail || !transaction) return res.status(400).json({ error: 'Missing parameters' });
    const messageId = await sendGmailReceipt(accessToken, recipientEmail, subject || 'Unigo.ci', transaction);
    res.json({ success: true, messageId });
  } catch (error: any) {
    res.status(500).json({ error: 'Gmail delivery failed', details: error.message });
  }
});

// À la place de app.listen, on exporte l'application pour Vercel Serverless
export default app;
