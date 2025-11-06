# Azora OS - Internationalization (i18n) Guide

## Overview

Azora OS supports multiple languages to serve the diverse linguistic landscape of Africa and the world. This guide covers how to implement and use internationalization across the platform.

## Supported Languages

### Phase 1 (Current)
- 🇬🇧 English (en) - Default
- 🇿🇦 Zulu (zu)
- 🇿🇦 Afrikaans (af)
- 🇫🇷 French (fr)
- 🇵🇹 Portuguese (pt)

### Phase 2 (Planned)
- 🇪🇸 Spanish (es)
- 🇸🇦 Arabic (ar)
- 🇨🇳 Chinese (zh)
- 🇮🇳 Hindi (hi)
- 🇮🇩 Indonesian (id)

## Architecture

### Directory Structure
```
public/locales/
├── en.json          # English (default)
├── zu.json          # Zulu
├── af.json          # Afrikaans
├── fr.json          # French
└── pt.json          # Portuguese
```

### Locale File Format

Each locale file contains translations organized by namespace:

```json
{
  "common": {
    "app_name": "Azora",
    "welcome": "Welcome to Azora"
  },
  "auth": {
    "login": "Log In",
    "register": "Register"
  },
  "courses": {
    "my_courses": "My Courses",
    "enroll": "Enroll Now"
  }
}
```

## Implementation

### 1. Install Dependencies

```bash
npm install next-intl
```

### 2. Configure Next.js

Create `i18n.config.ts`:

```typescript
export const i18n = {
  defaultLocale: 'en',
  locales: ['en', 'zu', 'af', 'fr', 'pt'],
} as const;

export type Locale = typeof i18n.locales[number];
```

### 3. Create Middleware

Create `middleware.ts`:

```typescript
import createMiddleware from 'next-intl/middleware';
import { i18n } from './i18n.config';

export default createMiddleware({
  locales: i18n.locales,
  defaultLocale: i18n.defaultLocale,
  localePrefix: 'as-needed',
});

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
```

### 4. Setup Layout

Update `app/[locale]/layout.tsx`:

```typescript
import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';

export function generateStaticParams() {
  return i18n.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.node;
  params: { locale: string };
}) {
  let messages;
  try {
    messages = (await import(`../../locales/${locale}.json`)).default;
  } catch (error) {
    notFound();
  }

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

## Usage

### In React Components

```typescript
'use client';

import { useTranslations } from 'next-intl';

export function LoginForm() {
  const t = useTranslations('auth');

  return (
    <form>
      <h1>{t('login')}</h1>
      <button>{t('submit')}</button>
    </form>
  );
}
```

### With Parameters

```typescript
const t = useTranslations('validation');

// Translation: "Must be at least {{min}} characters"
const message = t('min_length', { min: 8 });
// Result: "Must be at least 8 characters"
```

### Pluralization

```json
{
  "courses": {
    "count": "{count, plural, =0 {No courses} =1 {1 course} other {# courses}}"
  }
}
```

```typescript
const t = useTranslations('courses');
console.log(t('count', { count: 0 }));  // "No courses"
console.log(t('count', { count: 1 }));  // "1 course"
console.log(t('count', { count: 5 }));  // "5 courses"
```

### In Server Components

```typescript
import { getTranslations } from 'next-intl/server';

export default async function HomePage() {
  const t = await getTranslations('common');

  return <h1>{t('welcome')}</h1>;
}
```

### In API Routes

```typescript
import { getTranslations } from 'next-intl/server';

export async function GET(request: Request) {
  const locale = request.headers.get('accept-language')?.split(',')[0] || 'en';
  const t = await getTranslations({ locale, namespace: 'errors' });

  return Response.json({
    error: t('not_found'),
  });
}
```

## Language Switcher

Create a language switcher component:

```typescript
'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'zu', name: 'isiZulu', flag: '🇿🇦' },
  { code: 'af', name: 'Afrikaans', flag: '🇿🇦' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
];

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLanguage = (newLocale: string) => {
    // Replace current locale in path
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPath);
  };

  return (
    <select 
      value={locale} 
      onChange={(e) => switchLanguage(e.target.value)}
      className="language-selector"
    >
      {languages.map(lang => (
        <option key={lang.code} value={lang.code}>
          {lang.flag} {lang.name}
        </option>
      ))}
    </select>
  );
}
```

## Translation Workflow

### 1. Extract Strings

Create a script to extract all translation keys:

```bash
# Extract from source code
npx @formatjs/cli extract 'app/**/*.{ts,tsx}' \
  --out-file extracted-strings.json \
  --id-interpolation-pattern '[sha512:contenthash:base64:6]'
```

### 2. Translation Management

Use [Lokalise](https://lokalise.com/) or [Crowdin](https://crowdin.com/) for collaborative translation:

1. Upload `en.json` as the source language
2. Invite translators for target languages
3. Download completed translations
4. Place in `public/locales/`

### 3. Quality Assurance

```bash
# Check for missing keys
npx i18next-parser 'app/**/*.{ts,tsx}' --output 'public/locales/$LOCALE.json'

# Validate JSON
find public/locales -name "*.json" -exec jsonlint {} \;
```

## Best Practices

### 1. Namespace Organization

```json
{
  // ✅ Good - organized by feature
  "auth": { "login": "Log In" },
  "courses": { "enroll": "Enroll" },
  
  // ❌ Bad - flat structure
  "auth_login": "Log In",
  "courses_enroll": "Enroll"
}
```

### 2. Context in Keys

```json
{
  // ✅ Good - clear context
  "button_submit": "Submit",
  "button_cancel": "Cancel",
  
  // ❌ Bad - ambiguous
  "submit": "Submit",
  "ok": "OK"
}
```

### 3. Avoid Concatenation

```json
{
  // ✅ Good - complete sentence
  "welcome_message": "Welcome, {{name}}!",
  
  // ❌ Bad - concatenation
  "welcome": "Welcome, ",
  "exclamation": "!"
}
```

### 4. Handle Plurals Properly

```json
{
  // ✅ Good - ICU message format
  "items_count": "{count, plural, =0 {No items} =1 {One item} other {# items}}",
  
  // ❌ Bad - English-centric
  "items": "{{count}} item(s)"
}
```

### 5. Cultural Sensitivity

- Use appropriate date/time formats
- Respect cultural norms and values
- Avoid idioms that don't translate well
- Consider right-to-left (RTL) languages

## RTL Support

For Arabic and other RTL languages:

```typescript
// app/[locale]/layout.tsx
export default function LocaleLayout({ params: { locale } }) {
  const direction = ['ar', 'he'].includes(locale) ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={direction}>
      <body>{children}</body>
    </html>
  );
}
```

## Performance

### 1. Code Splitting

Split large translation files:

```typescript
// Only load needed namespaces
const t = useTranslations('courses'); // Only loads courses namespace
```

### 2. Lazy Loading

```typescript
import dynamic from 'next/dynamic';

const LanguageSwitcher = dynamic(() => import('./LanguageSwitcher'), {
  ssr: false,
});
```

### 3. Caching

Cache translations in Redis:

```typescript
import Redis from 'ioredis';
const redis = new Redis();

export async function getTranslations(locale: string) {
  const cacheKey = `translations:${locale}`;
  
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);
  
  const translations = await import(`./locales/${locale}.json`);
  await redis.setex(cacheKey, 3600, JSON.stringify(translations));
  
  return translations;
}
```

## Testing

```typescript
import { NextIntlClientProvider } from 'next-intl';
import { render } from '@testing-library/react';

const messages = {
  auth: {
    login: 'Log In',
  },
};

test('renders login button', () => {
  const { getByText } = render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <LoginForm />
    </NextIntlClientProvider>
  );

  expect(getByText('Log In')).toBeInTheDocument();
});
```

## Migration Guide

### From Hardcoded Strings

```diff
- <button>Log In</button>
+ <button>{t('auth.login')}</button>

- const message = "Welcome, " + userName;
+ const message = t('welcome_message', { name: userName });
```

## Resources

- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [ICU Message Format](https://unicode-org.github.io/icu/userguide/format_parse/messages/)
- [Lokalise](https://lokalise.com/) - Translation management
- [Google Translate API](https://cloud.google.com/translate) - Machine translation
