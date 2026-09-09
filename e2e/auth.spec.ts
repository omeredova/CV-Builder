import { expect, test } from "@playwright/test";
import { backendRequests, configureBackend, credentials, expectSession, fillPasswords, signIn } from "./support/auth";

test.beforeEach(async ({ request }) => {
  await configureBackend(request);
});

for (const route of ["/", "/users", "/settings", "/cvs"]) {
  test(`redirects anonymous visitors from ${route} to sign in`, async ({ page, context }) => {
    await page.goto(route);
    await expect(page).toHaveURL("/login");
    await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
    await expectSession(context, false);
  });
}

test("navigates between authentication pages", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("tab", { name: "Sign up", exact: true }).click();
  await expect(page).toHaveURL("/register");
  await page.getByRole("link", { name: "I have an account" }).click();
  await expect(page).toHaveURL("/login");
  await page.getByRole("link", { name: "Forgot password" }).click();
  await expect(page).toHaveURL("/recover-password");
  await page.getByRole("link", { name: "Cancel" }).click();
  await expect(page).toHaveURL("/login");
});

test("validates sign in and toggles password visibility without submitting", async ({ page, request }) => {
  await page.goto("/login");
  const submit = page.getByRole("button", { name: "Sign in", exact: true });
  await expect(submit).toBeDisabled();
  await page.getByLabel("Email", { exact: true }).fill("invalid-email");
  await page.getByLabel("Password", { exact: true }).fill("123");
  await page.getByLabel("Password", { exact: true }).blur();
  await expect(page.getByText("Please enter a valid email address")).toBeVisible();
  await expect(page.getByText("Password must be at least 6 characters long")).toBeVisible();
  await expect(submit).toBeDisabled();
  await page.getByRole("button", { name: "Show password" }).click();
  await expect(page.getByLabel("Password", { exact: true })).toHaveAttribute("type", "text");
  await page.getByRole("button", { name: "Hide password" }).click();
  await expect(page.getByLabel("Password", { exact: true })).toHaveAttribute("type", "password");
  expect(await backendRequests(request)).toEqual([]);
});

test("signs in, persists the session across reload, and logs out", async ({ page, context, request }) => {
  await signIn(page);
  await expectSession(context, true);
  expect(await backendRequests(request)).toContainEqual({ operationName: "SignIn", variables: { auth: credentials }, authorization: null });
  expect(await page.evaluate(() => document.cookie)).not.toContain("cv-access-token");
  await page.reload();
  await expect(page.getByRole("button", { name: /E2E User/ })).toBeVisible();
  await page.getByRole("button", { name: /E2E User/ }).click();
  await page.getByRole("menuitem", { name: "Logout" }).click();
  await expect(page).toHaveURL("/login");
  await expectSession(context, false);
  await page.goto("/users");
  await expect(page).toHaveURL("/login");
});

for (const [error, message] of [
  ["invalidCredentials", "Invalid email or password"],
  ["internalServerError", "Something went wrong"],
]) {
  test(`shows sign-in failure: ${error}`, async ({ page, context, request }) => {
    await configureBackend(request, { login: { error, delay: 400 } });
    await page.goto("/login");
    await page.getByLabel("Email", { exact: true }).fill(credentials.email);
    await page.getByLabel("Password", { exact: true }).fill(credentials.password);
    const submit = page.getByRole("button", { name: "Sign in", exact: true });
    await submit.click();
    await expect(submit).toBeDisabled();
    await expect(page.getByText(message, { exact: false })).toBeVisible();
    await expect(page).toHaveURL("/login");
    await expectSession(context, false);
    await page.getByLabel("Email", { exact: true }).fill("retry@example.test");
    await expect(page.getByText(message, { exact: false })).not.toBeVisible();
    await expect(submit).toBeEnabled();
  });
}

test("validates registration, creates a session, and verifies email", async ({ page, context, request }) => {
  await page.goto("/register");
  await page.getByLabel("Email", { exact: true }).fill(credentials.email);
  await fillPasswords(page);
  await page.getByLabel("Confirm Password", { exact: true }).fill("mismatch");
  await page.getByLabel("Confirm Password", { exact: true }).blur();
  await expect(page.getByText("Passwords do not match")).toBeVisible();
  await expect(page.getByRole("button", { name: "Create account" })).toBeDisabled();
  expect(await backendRequests(request)).toEqual([]);
  await page.getByLabel("Confirm Password", { exact: true }).fill(credentials.password);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL("/verify-email");
  await expectSession(context, true);
  await expect(page.getByRole("button", { name: "Confirm", exact: true })).toBeDisabled();
  await page.getByLabel("Verification code").fill("123456");
  await page.getByRole("button", { name: "Confirm", exact: true }).click();
  await expect(page).toHaveURL("/");
  await expect(page.getByRole("button", { name: /E2E User/ })).toBeVisible();
  const calls = await backendRequests(request);
  expect(calls).toContainEqual({ operationName: "SignUp", variables: { auth: { ...credentials, confirmPassword: credentials.password } }, authorization: null });
  expect(calls).toContainEqual({ operationName: "VerifyMail", variables: { mail: { otp: "123456" } }, authorization: "Bearer e2e-access" });
});

test("rejects an existing email without creating a session", async ({ page, context, request }) => {
  await configureBackend(request, { signup: { error: "userAlreadyExists" } });
  await page.goto("/register");
  await page.getByLabel("Email", { exact: true }).fill(credentials.email);
  await fillPasswords(page);
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page.getByText("An account with this email already exists")).toBeVisible();
  await expect(page).toHaveURL("/register");
  await expectSession(context, false);
});

for (const [error, message] of [["mailNotFound", "Invalid verification code"], ["otpExpired", "Verification code has expired"]]) {
  test(`handles email verification failure: ${error}`, async ({ page, request }) => {
    await signIn(page);
    await configureBackend(request, { verifyMail: { error } });
    await page.goto("/verify-email");
    await page.getByLabel("Verification code").fill("123456");
    await page.getByRole("button", { name: "Confirm", exact: true }).click();
    await expect(page.getByText(message)).toBeVisible();
    await expect(page).toHaveURL("/verify-email");
    // Clear the OTP widget before entering a replacement code.
    await page.getByLabel("Verification code").fill("");
    await page.getByLabel("Verification code").fill("654321");
    await expect(page.getByLabel("Verification code")).toHaveValue("654321");
    await expect(page.getByText(message)).not.toBeVisible();
  });
}

test("requests password recovery and returns to sign in", async ({ page, request }) => {
  await page.goto("/recover-password");
  await expect(page.getByRole("button", { name: "Reset password" })).toBeDisabled();
  await page.getByLabel("Email", { exact: true }).fill(credentials.email);
  await page.getByRole("button", { name: "Reset password" }).click();
  await expect(page).toHaveURL("/login");
  expect(await backendRequests(request)).toContainEqual({ operationName: "ForgotPassword", variables: { auth: { email: credentials.email } }, authorization: null });
});

test("shows a missing account during password recovery", async ({ page, request }) => {
  await configureBackend(request, { forgotPassword: { error: "mailNotFound" } });
  await page.goto("/recover-password");
  await page.getByLabel("Email", { exact: true }).fill(credentials.email);
  await page.getByRole("button", { name: "Reset password" }).click();
  await expect(page.getByText("No account found with this email address")).toBeVisible();
  await expect(page).toHaveURL("/recover-password");
});

test("resets a password using the link token without creating a session", async ({ page, context, request }) => {
  await page.goto("/reset-password?token=e2e-reset");
  await fillPasswords(page, "New Password");
  await page.getByRole("button", { name: "Submit" }).click();
  await expect(page).toHaveURL("/login");
  await expectSession(context, false);
  expect(await backendRequests(request)).toContainEqual({ operationName: "ResetPassword", variables: { auth: { newPassword: credentials.password, confirmPassword: credentials.password } }, authorization: "Bearer e2e-reset" });
});

for (const token of ["", "expired"]) {
  test(`rejects a ${token || "missing"} reset token`, async ({ page, request }) => {
    await configureBackend(request, { resetPassword: { error: "actionExpired" } });
    await page.goto(`/reset-password${token ? `?token=${token}` : ""}`);
    await fillPasswords(page, "New Password");
    await page.getByRole("button", { name: "Submit" }).click();
    await expect(page.getByText("This password reset link has expired")).toBeVisible();
    await expect(page).toHaveURL(new RegExp("/reset-password"));
    if (!token) expect(await backendRequests(request)).toEqual([]);
  });
}

test("changes the password and clears the fields", async ({ page, request }) => {
  await signIn(page);
  await page.goto("/settings");
  await page.getByLabel("Password", { exact: true }).fill("Old-password-123");
  await fillPasswords(page, "New Password");
  await page.getByRole("button", { name: "Change", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: "Password changed successfully" })).toBeVisible();
  await expect(page.getByLabel("Password", { exact: true })).toHaveValue("");
  await expect(page.getByLabel("New Password", { exact: true })).toHaveValue("");
  await expect(page.getByLabel("Confirm Password", { exact: true })).toHaveValue("");
  expect(await backendRequests(request)).toContainEqual({ operationName: "ChangePassword", variables: { args: { oldPassword: "Old-password-123", newPassword: credentials.password, confirmPassword: credentials.password } }, authorization: "Bearer e2e-access" });
});

test("refreshes an expired access session on protected navigation", async ({ page, context, request }) => {
  await signIn(page);
  await context.clearCookies({ name: "cv-access-token" });
  await page.goto("/");
  await expect(page).toHaveURL("/");
  await expect(page.getByRole("button", { name: /E2E User/ })).toBeVisible();
  await expectSession(context, true);
  expect(await backendRequests(request)).toContainEqual({ operationName: "RefreshAccessToken", variables: {}, authorization: "Bearer e2e-refresh" });
});

test("clears a rejected refresh session and returns to sign in", async ({ page, context, request }) => {
  await signIn(page);
  await configureBackend(request, { updateToken: { error: "Unauthorized", code: "UNAUTHENTICATED" } });
  await context.clearCookies({ name: "cv-access-token" });
  await page.goto("/users");
  await expect(page).toHaveURL("/login");
  await expectSession(context, false);
});
