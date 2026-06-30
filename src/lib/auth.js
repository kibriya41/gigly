import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "better-auth/adapters/mongodb";

const client = new MongoClient(process.env.MONGO_DB_URI);
const db = client.db(process.env.AUTH_DB_NAME);

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
  },

  // ── Google OAuth ──────────────────────────────────────────────────────────
  // Users who sign in with Google are automatically treated as Clients.
  // Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your .env file.
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      // After OAuth, default new Google users to the "client" role.
      // BetterAuth calls this hook when creating a brand-new user.
      mapProfileToUser: (profile) => ({
        name: profile.name,
        email: profile.email,
        image: profile.picture,
        role: "client",
        emailVerified: true,
      }),
    },
  },

  // ── Trusted origins (prevents CORS on deployed URLs) ─────────────────────
  trustedOrigins: [
    process.env.BETTER_AUTH_URL || "http://localhost:3000",
    process.env.NEXT_PUBLIC_SITE_URL || "",
  ].filter(Boolean),

  database: mongodbAdapter(db, {
    client,
  }),

  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "client",
      },
      skills: {
        type: "string[]",
        required: false,
      },
      hirePrice: {
        type: "number",
        required: false,
      },
      bio: {
        type: "string",
        required: false,
      },
      isBlocked: {
        type: "boolean",
        required: false,
        defaultValue: false,
      },
    },
  },
});
