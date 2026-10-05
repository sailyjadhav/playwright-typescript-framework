import type { TestTag } from '../utils/test-tags';

export type InvalidLoginCase = {
  title: string;
  email: string;
  password: string;
  // Optional tags for the generated test, for example ['@smoke'].
  tags?: TestTag[];
};

export const rejectedByServer: InvalidLoginCase[] = [
  {
    title: 'unknown email',
    email: 'nobody@example.com',
    password: 'secret123',
    tags: ['@smoke'],
  },
  {
    title: 'unknown email in capital letters',
    email: 'NOBODY@EXAMPLE.COM',
    password: 'secret123',
  },
  {
    title: 'password with database attack SQL injection',
    email: 'NOBODY@EXAMPLE.COM',
    password: "' OR '1'='1",
  },
];

// Cases the BROWSER rejects before sending the form (required and type="email" fields).
// invalidField names the LoginPage locator the browser marks invalid.
export type BrowserRejectedCase = InvalidLoginCase & {
  invalidField: 'emailInput' | 'passwordInput';
};

export const rejectedByBrowser: BrowserRejectedCase[] = [
  { title: 'empty email', email: '', password: 'secret123', invalidField: 'emailInput' },
  {
    title: 'empty password',
    email: 'nobody@example.com',
    password: '',
    invalidField: 'passwordInput',
  },
  {
    title: 'email without @',
    email: 'notanemail',
    password: 'secret123',
    invalidField: 'emailInput',
  },
  {
    title: 'email without a domain',
    email: 'nobody@',
    password: 'secret123',
    invalidField: 'emailInput',
  },
];
