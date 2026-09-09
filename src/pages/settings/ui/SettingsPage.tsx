import { PreferenceFields } from "@/features/account-preferences";
import { PasswordChangeForm } from "@/features/auth";
import { AppBreadcrumb } from "@/widgets/app-breadcrumb";

export function SettingsPage() {
  return <>
    <AppBreadcrumb pageName="Settings" />
    <div className="mx-auto flex w-full max-w-profile-content flex-col gap-9 px-6 pb-16 pt-2">
      <PreferenceFields />
      <PasswordChangeForm />
    </div>
  </>;
}
