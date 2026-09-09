import { expect, type APIRequestContext, type BrowserContext, type Page } from "@playwright/test";

export const credentials = { email: "auth@example.test", password: "Test-password-123" };
const backendURL = "http://127.0.0.1:4100";
type Scenario = Record<string, { error?: string; code?: string; delay?: number }>;
interface BackendRequest {
  operationName: string;
  variables: Record<string, unknown>;
  authorization: string | null;
}

export async function configureBackend(request: APIRequestContext, scenario: Scenario = {}): Promise<void> {
  const response = await request.post(`${backendURL}/scenario`, { data: scenario });
  expect(response.ok()).toBeTruthy();
}

export async function backendRequests(request: APIRequestContext): Promise<BackendRequest[]> {
  const response = await request.get(`${backendURL}/requests`);
  expect(response.ok()).toBeTruthy();
  return response.json();
}

export async function signIn(page: Page): Promise<void> {
  await page.goto("/login");
  await page.getByRole("textbox", { name: "Email", exact: true }).fill(credentials.email);
  await page.getByLabel("Password", { exact: true }).fill(credentials.password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL("/");
  await expect(page.getByRole("button", { name: /E2E User/ })).toBeVisible();
}

export async function fillPasswords(page: Page, label = "Password"): Promise<void> {
  await page.getByLabel(label, { exact: true }).fill(credentials.password);
  await page.getByLabel("Confirm Password", { exact: true }).fill(credentials.password);
}

export async function expectSession(context: BrowserContext, present: boolean): Promise<void> {
  const cookies = (await context.cookies()).filter(({ name }) => ["cv-access-token", "cv-refresh-token"].includes(name));
  expect(cookies).toHaveLength(present ? 2 : 0);
  for (const cookie of cookies) {
    expect(cookie).toMatchObject({ httpOnly: true, secure: true, sameSite: "Lax", path: "/" });
  }
}
