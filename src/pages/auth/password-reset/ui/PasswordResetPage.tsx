import { PasswordResetForm } from "@/features/auth";
import { AuthPageLayout } from "@/widgets/auth";

export interface PasswordResetPageProps {
  token: string;
}

export function PasswordResetPage({ token }: PasswordResetPageProps) {
  return (
    <AuthPageLayout contentClassName="pb-auth-content-offset">
      <PasswordResetForm token={token} />
    </AuthPageLayout>
  );
}
