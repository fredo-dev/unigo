export interface TransactionRecord {
  id: string | number;
  type: string;
  operator: string;
  phone: string;
  amount: number;
  date: string;
  status: string;
}

/**
 * Creates a new Google Sheet with Unigo Transaction Records.
 * Uses Google Sheets REST API v4.
 */
export async function createGoogleSheetExport(
  accessToken: string,
  title: string,
  transactions: TransactionRecord[]
): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> {
  if (!accessToken) {
    throw new Error('An active Google Access Token is required to export to Google Sheets.');
  }

  // 1. Create Spreadsheet
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title: title || `Unigo - Relevé de Transactions (${new Date().toLocaleDateString()})`,
      },
      sheets: [
        {
          properties: {
            title: 'Transactions',
            gridProperties: {
              frozenRowCount: 1,
            },
          },
        },
      ],
    }),
  });

  if (!createRes.ok) {
    const err = await createRes.json().catch(() => ({}));
    throw new Error(`Google Sheets creation failed: ${err?.error?.message || createRes.statusText}`);
  }

  const sheetData = await createRes.json();
  const spreadsheetId = sheetData.spreadsheetId;
  const spreadsheetUrl = sheetData.spreadsheetUrl;

  // 2. Populate Headers & Rows
  const values = [
    ['ID', 'Date', 'Type', 'Opérateur', 'Téléphone Destinataire', 'Montant (FCFA)', 'Statut'],
    ...transactions.map((tx) => [
      String(tx.id),
      tx.date,
      tx.type === 'recharge' ? 'Recharge Crédit' : tx.type === 'bundle' ? 'Forfait Internet' : 'Transfert Solde',
      tx.operator,
      tx.phone,
      tx.amount,
      tx.status === 'completed' ? 'Succès' : tx.status,
    ]),
  ];

  const updateRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Transactions!A1?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values,
      }),
    }
  );

  if (!updateRes.ok) {
    const err = await updateRes.json().catch(() => ({}));
    throw new Error(`Failed to populate spreadsheet data: ${err?.error?.message || updateRes.statusText}`);
  }

  return { spreadsheetId, spreadsheetUrl };
}

/**
 * Sends a transaction receipt or confirmation email using Gmail API v1.
 */
export async function sendGmailReceipt(
  accessToken: string,
  recipientEmail: string,
  subject: string,
  transaction: TransactionRecord
): Promise<string> {
  if (!accessToken) {
    throw new Error('An active Google Access Token is required to send emails via Gmail.');
  }

  const emailBody = [
    `To: ${recipientEmail}`,
    `Subject: =?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
    'Content-Type: text/html; charset=utf-8',
    'MIME-Version: 1.0',
    '',
    `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; background-color: #ffffff;">`,
    `  <div style="text-align: center; margin-bottom: 20px;">`,
    `    <h2 style="color: #0d9488; margin: 0;">Unigo.ci - Reçu de Transaction</h2>`,
    `    <p style="color: #64748b; font-size: 14px;">Plateforme sécurisée de recharges & forfaits</p>`,
    `  </div>`,
    `  <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 16px 0;" />`,
    `  <div style="margin-bottom: 16px;">`,
    `    <p><strong>Détails du transfert :</strong></p>`,
    `    <ul>`,
    `      <li><strong>Service :</strong> ${transaction.type === 'recharge' ? 'Recharge Crédit' : transaction.type === 'bundle' ? 'Forfait Internet' : 'Transfert'}</li>`,
    `      <li><strong>Opérateur :</strong> ${transaction.operator}</li>`,
    `      <li><strong>Destinataire :</strong> ${transaction.phone}</li>`,
    `      <li><strong>Montant :</strong> <span style="font-size: 18px; color: #0d9488; font-weight: bold;">${transaction.amount.toLocaleString()} FCFA</span></li>`,
    `      <li><strong>Date :</strong> ${transaction.date}</li>`,
    `      <li><strong>Statut :</strong> Complété</li>`,
    `    </ul>`,
    `  </div>`,
    `  <p style="color: #64748b; font-size: 12px; text-align: center;">Merci d'avoir utilisé Unigo.ci pour vos services mobiles !</p>`,
    `</div>`,
  ].join('\r\n');

  // Convert to Base64URL
  const base64EncodedEmail = btoa(unescape(encodeURIComponent(emailBody)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const sendRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      raw: base64EncodedEmail,
    }),
  });

  if (!sendRes.ok) {
    const err = await sendRes.json().catch(() => ({}));
    throw new Error(`Gmail API failed: ${err?.error?.message || sendRes.statusText}`);
  }

  const result = await sendRes.json();
  return result.id;
}
