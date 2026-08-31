import { PasswordResetForm } from "@/features/auth";
import { AuthPageLayout } from "@/widgets/auth";

export function PasswordResetPage() {
  return (
    <AuthPageLayout contentClassName="pb-auth-content-offset">
      <PasswordResetForm />
    </AuthPageLayout>
  );
}
