import type {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from "next";
import type { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { addUser, getUserByEmail } from "@/app/action";

export const config = {
  debug: process.env.NODE_ENV === "development" ? true : false,
  pages: {
    signIn: "/auth/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    session: async ({ session }) => {
      if (session.user) {
        const dbUser = await getUserByEmail(session.user.email || "");
        if (dbUser.length > 0) {
          session.user.organization = dbUser[0].organization;
          session.user.name = dbUser[0].name;
          session.user.role = dbUser[0].role;
        }
      }
      return Promise.resolve(session);
    },
    async signIn({ user, account, profile }) {
      // add user role checking here
      console.log(user, account, profile);
      const userExists = await getUserByEmail(user.email || "");
      if (userExists.length === 0) {
        let addSuccess: boolean = false;
        try {
          addSuccess = await addUser({
            name: user.name || "",
            email: user.email || "",
            organization: "",
            role: "user",
          });
        } catch (e) {
          console.log(e);
          return addSuccess;
        }
      }
      return true;
    },
  },
} satisfies NextAuthOptions;

// Use it in server contexts
export function auth(
  ...args:
    | [GetServerSidePropsContext["req"], GetServerSidePropsContext["res"]]
    | [NextApiRequest, NextApiResponse]
    | []
) {
  return getServerSession(...args, config);
}