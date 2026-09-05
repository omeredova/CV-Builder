import { DeviceErrorIcon } from "@/shared/ui/icons/DeviceErrorIcon";

export function DeviceErrorPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-device-error-page-inline text-center md:hidden">
      <div className="flex max-w-device-error-content-width flex-col items-center">
        <DeviceErrorIcon />
        <h1 className="mt-device-error-title-top text-error-title leading-error-title font-normal">
          Oops
        </h1>
        <p className="mt-device-error-message-top text-base leading-6">
          This app isn&apos;t supported on mobile devices.
          <br />
          Please open it on a desktop or tablet to continue.
        </p>
      </div>
    </main>
  );
}
