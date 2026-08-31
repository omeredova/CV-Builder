import { PasswordResetForm } from "@/features/auth/password-reset";
import { AuthPageLayout } from "@/widgets/auth";

export function PasswordResetPage() {
  return (
    <AuthPageLayout contentClassName="pb-auth-content-offset">
      <PasswordResetForm />
    </AuthPageLayout>
  );
}
