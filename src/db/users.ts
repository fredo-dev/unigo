import { db } from './index.ts';
import { users } from './schema.ts';

export async function getOrCreateUser(uid: string, email: string, phone?: string) {
  try {
    const result = await db.insert(users)
      .values({
        uid,
        email,
        phone: phone || '',
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
          ...(phone ? { phone } : {}),
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error("Failed in getOrCreateUser:", error);
    throw new Error("User sync failed. Please try again later.", { cause: error });
  }
}
