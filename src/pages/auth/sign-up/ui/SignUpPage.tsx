import { SignUpForm } from "@/features/auth";
import { AuthPageLayout } from "@/widgets/auth";

export function SignUpPage() {
  return (
    <AuthPageLayout activeTab="signUp" contentClassName="py-10">
      <SignUpForm />
    </AuthPageLayout>
  );
}
