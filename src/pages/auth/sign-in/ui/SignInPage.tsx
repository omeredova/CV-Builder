import { SignInForm } from "@/features/auth/sign-in";
import { AuthPageLayout } from "@/widgets/auth";

export function SignInPage() {
  return (
    <AuthPageLayout activeTab="signIn" contentClassName="pb-auth-content-offset">
      <SignInForm />
    </AuthPageLayout>
  );
}
