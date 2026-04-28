import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { NextResponse } from "next/server";

const ALLOWED_EMAILS = (process.env.ALLOWED_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim())
  .filter(Boolean);

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  callbacks: {
    signIn({ user }) {
      if (ALLOWED_EMAILS.length === 0) return true;
      return ALLOWED_EMAILS.includes(user.email ?? "");
    },
    authorized({ auth: session, request }) {
      const isLoggedIn = !!session?.user;
      const { pathname } = request.nextUrl;
      const isLoginPage = pathname === "/login";
      const isApiAuth = pathname.startsWith("/api/auth");

      if (isApiAuth) return true;
      if (isLoginPage) {
        if (isLoggedIn) return NextResponse.redirect(new URL("/", request.nextUrl));
        return true;
      }
      return isLoggedIn;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
});
