import { AuthTabs } from "@/features/auth/navigation";
import { SignInForm } from "@/features/auth/sign-in";

export function SignInPage() {
  return (
    <main className="flex min-h-screen flex-col items-center bg-background px-auth-page-inline pb-auth-page-bottom pt-auth-page-top text-foreground sm:pt-auth-page-top-tablet">
      <AuthTabs activeTab="signIn" />

      <section className="flex w-full max-w-auth-content-width flex-1 items-center justify-center pb-auth-content-offset">
        <SignInForm />
      </section>
    </main>
  );
}
