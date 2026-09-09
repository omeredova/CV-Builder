import { PasswordRecoveryForm } from "@/features/auth";
import { AuthPageLayout } from "@/widgets/auth";

export function PasswordRecoveryPage() {
  return (
    <AuthPageLayout contentClassName="pb-auth-content-offset">
      <PasswordRecoveryForm />
    </AuthPageLayout>
  );
}
