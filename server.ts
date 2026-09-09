import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './src/db/index.ts';
import { users, transactions, sheetExports, emailLogs } from './src/db/schema.ts';
import { getOrCreateUser } from './src/db/users.ts';
import { requireAuth, AuthRequest } from './src/middleware/auth.ts';
import { createGoogleSheetExport, sendGmailReceipt } from './src/lib/workspace.ts';
import { eq, desc } from 'drizzle-orm';

async function startServer() {
  const app = express();
  const PORT = 3000;

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

  // User Sync Route (Sync Firebase Auth User into Cloud SQL)
  app.post('/api/sync-user', requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const { uid, email } = req.user;
      const phone = req.body.phone || '';

      const userRecord = await getOrCreateUser(uid, email || '', phone);
      res.json({ success: true, user: userRecord });
    } catch (error: any) {
      console.error('Error syncing user to Cloud SQL:', error);
      res.status(500).json({ error: 'Failed to sync user record', details: error.message });
    }
  });

  // Fetch Transactions from Cloud SQL
  app.get('/api/transactions', requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const dbUser = await db.select().from(users).where(eq(users.uid, req.user.uid));
      if (!dbUser.length) {
        return res.json({ transactions: [] });
      }

      const txList = await db
        .select()
        .from(transactions)
        .where(eq(transactions.userId, dbUser[0].id))
        .orderBy(desc(transactions.createdAt));

      res.json({ transactions: txList });
    } catch (error: any) {
      console.error('Error fetching transactions:', error);
      res.status(500).json({ error: 'Failed to fetch transactions', details: error.message });
    }
  });

  // Create Transaction in Cloud SQL
  app.post('/api/transactions', requireAuth, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const { type, amount, recipientPhone, operator } = req.body;
      if (!type || !amount || !recipientPhone || !operator) {
        return res.status(400).json({ error: 'Missing required transaction fields' });
      }

      const userRecord = await getOrCreateUser(req.user.uid, req.user.email || '');

      const newTx = await db
        .insert(transactions)
        .values({
          userId: userRecord.id,
          type,
          amount: Number(amount),
          recipientPhone,
          operator,
          status: 'completed',
        })
        .returning();

      res.json({ success: true, transaction: newTx[0] });
    } catch (error: any) {
      console.error('Error creating transaction:', error);
      res.status(500).json({ error: 'Failed to record transaction', details: error.message });
    }
  });

  // Export to Google Sheets
  app.post('/api/sheets/export', async (req, res) => {
    try {
      const { accessToken, title, transactions: txList } = req.body;
      if (!accessToken) {
        return res.status(400).json({ error: 'Missing Google OAuth Access Token' });
      }

      const result = await createGoogleSheetExport(
        accessToken,
        title || 'Unigo - Relevé de Transactions',
        txList || []
      );

      res.json({ success: true, ...result });
    } catch (error: any) {
      console.error('Error exporting to Google Sheets:', error);
      res.status(500).json({ error: 'Google Sheets export failed', details: error.message });
    }
  });

  // Send Gmail Receipt
  app.post('/api/gmail/send-receipt', async (req, res) => {
    try {
      const { accessToken, recipientEmail, subject, transaction } = req.body;
      if (!accessToken || !recipientEmail || !transaction) {
        return res.status(400).json({ error: 'Missing required email parameters' });
      }

      const messageId = await sendGmailReceipt(
        accessToken,
        recipientEmail,
        subject || 'Unigo.ci - Reçu de Transaction',
        transaction
      );

      res.json({ success: true, messageId });
    } catch (error: any) {
      console.error('Error sending email via Gmail:', error);
      res.status(500).json({ error: 'Gmail delivery failed', details: error.message });
    }
  });

  // Vite Middleware for development / static serving in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Unigo server is running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
