import { EmailVerificationForm } from "@/features/auth";
import { AuthPageLayout } from "@/widgets/auth";

export function EmailVerificationPage() {
  return (
    <AuthPageLayout contentClassName="py-10">
      <EmailVerificationForm />
    </AuthPageLayout>
  );
}
