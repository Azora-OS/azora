# Country-Specific Pricing Guide

## Overview

The Education Revenue Engine now supports country-specific pricing and currencies. This allows you to offer localized pricing for different regions while maintaining a consistent tier structure globally.

## Features

- **Multi-Currency Support**: Automatic currency detection based on country code
- **Localized Pricing**: Set custom prices for each country and tier
- **Automatic Fallback**: Calculates localized prices based on multipliers if custom pricing isn't set
- **Student Discounts**: Country-specific student discount rates
- **25+ Countries Supported**: Pre-configured pricing for major markets

## Supported Countries and Currencies

| Country | Code | Currency | Multiplier |
|---------|------|----------|-----------|
| United States | US | USD | 1.0 |
| United Kingdom | GB | GBP | 0.85 |
| Canada | CA | CAD | 1.35 |
| Australia | AU | AUD | 1.55 |
| India | IN | INR | 0.012 |
| South Africa | ZA | ZAR | 0.053 |
| Nigeria | NG | NGN | 0.0013 |
| Kenya | KE | KES | 0.0077 |
| Ghana | GH | GHS | 0.065 |
| Egypt | EG | EGP | 0.032 |
| Brazil | BR | BRL | 0.2 |
| Mexico | MX | MXN | 0.058 |
| Germany | DE | EUR | 0.92 |
| France | FR | EUR | 0.92 |
| Italy | IT | EUR | 0.92 |
| Spain | ES | EUR | 0.92 |
| Japan | JP | JPY | 0.0067 |
| China | CN | CNY | 0.14 |
| Singapore | SG | SGD | 0.74 |
| Malaysia | MY | MYR | 0.21 |
| Thailand | TH | THB | 0.028 |
| Philippines | PH | PHP | 0.018 |
| Indonesia | ID | IDR | 0.000063 |
| Vietnam | VN | VND | 0.000039 |
| Pakistan | PK | PKR | 0.0036 |
| Bangladesh | BD | BDT | 0.0095 |

## API Endpoints

### Get Localized Pricing

Get pricing for a specific tier and country with automatic currency conversion.

```
GET /api/v1/pricing/localized/:tier/:country
```

**Parameters:**
- `tier`: Pricing tier name (free, premium, pro)
- `country`: ISO 3166-1 alpha-2 country code (e.g., US, GB, IN)

**Response:**
```json
{
  "success": true,
  "data": {
    "tier": "premium",
    "countryCode": "IN",
    "currency": "INR",
    "originalPrice": 0.36,
    "studentDiscount": 50,
    "studentPrice": 0.18,
    "savings": 0.18,
    "features": [...],
    "limits": {...}
  },
  "timestamp": "2025-11-19T01:30:00.000Z"
}
```

### Get Country Currency

Get currency information for a country.

```
GET /api/v1/pricing/country/:country
```

**Response:**
```json
{
  "success": true,
  "data": {
    "countryCode": "GB",
    "currency": "GBP"
  },
  "timestamp": "2025-11-19T01:30:00.000Z"
}
```

### Create Country-Specific Pricing

Create custom pricing for a country and tier (admin only).

```
POST /api/v1/pricing/country-pricing
```

**Request Body:**
```json
{
  "pricingTierId": "tier-id-123",
  "countryCode": "IN",
  "currency": "INR",
  "monthlyPrice": 499,
  "studentDiscount": 50
}
```

### Get Country-Specific Pricing

Get custom pricing for a specific country and tier.

```
GET /api/v1/pricing/country-pricing/:tierId/:country
```

### Update Country-Specific Pricing

Update custom pricing for a country and tier (admin only).

```
PUT /api/v1/pricing/country-pricing/:tierId/:country
```

**Request Body:**
```json
{
  "monthlyPrice": 599,
  "studentDiscount": 40
}
```

### Get All Country Pricing for a Tier

Get all country-specific pricing configurations for a tier.

```
GET /api/v1/pricing/country-pricing/tier/:tierId
```

## Usage Examples

### Example 1: Get Premium Tier Pricing for India

```bash
curl https://api.example.com/api/v1/pricing/localized/premium/IN
```

Response:
```json
{
  "success": true,
  "data": {
    "tier": "premium",
    "countryCode": "IN",
    "currency": "INR",
    "originalPrice": 0.36,
    "studentDiscount": 50,
    "studentPrice": 0.18,
    "savings": 0.18
  }
}
```

### Example 2: Set Custom Pricing for South Africa

```bash
curl -X POST https://api.example.com/api/v1/pricing/country-pricing \
  -H "Content-Type: application/json" \
  -d '{
    "pricingTierId": "tier-premium-123",
    "countryCode": "ZA",
    "currency": "ZAR",
    "monthlyPrice": 399,
    "studentDiscount": 50
  }'
```

### Example 3: Get Currency for a Country

```bash
curl https://api.example.com/api/v1/pricing/country/BR
```

Response:
```json
{
  "success": true,
  "data": {
    "countryCode": "BR",
    "currency": "BRL"
  }
}
```

## Pricing Calculation

### Automatic Calculation (Fallback)

If custom pricing isn't set for a country, the system calculates it using:

```
Localized Price = Base Price × Country Multiplier
```

**Example:**
- Base Price (US): $29.99
- Country: India (Multiplier: 0.012)
- Calculated Price: $29.99 × 0.012 = ₹0.36

### Student Discount

Student discounts are applied after localization:

```
Student Price = Localized Price × (1 - Student Discount %)
```

**Example:**
- Localized Price: ₹0.36
- Student Discount: 50%
- Student Price: ₹0.36 × 0.5 = ₹0.18

## Database Schema

### PricingTier Model
```prisma
model PricingTier {
  id String @id @default(cuid())
  name String @unique
  monthlyPrice Decimal @default(0)
  studentDiscount Int @default(0)
  features String[] @default([])
  coursesPerMonth Int
  aiQueriesPerMonth Int
  storageGB Int
  supportLevel String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  countryPricing CountryPricing[]
}
```

### CountryPricing Model
```prisma
model CountryPricing {
  id String @id @default(cuid())
  pricingTierId String
  pricingTier PricingTier @relation(fields: [pricingTierId], references: [id], onDelete: Cascade)
  countryCode String // ISO 3166-1 alpha-2
  currency String // ISO 4217
  monthlyPrice Decimal
  studentDiscount Int @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@unique([pricingTierId, countryCode])
}
```

## Best Practices

1. **Use ISO Standards**: Always use ISO 3166-1 alpha-2 country codes and ISO 4217 currency codes
2. **Set Custom Pricing**: For important markets, set custom pricing rather than relying on multipliers
3. **Monitor Conversions**: Track conversion rates by country to optimize pricing
4. **Update Regularly**: Review and update pricing multipliers quarterly based on exchange rates
5. **Test Thoroughly**: Test pricing calculations for edge cases and different countries
6. **Document Changes**: Keep records of pricing changes for audit purposes

## Adding New Countries

To add support for a new country:

1. Add the country code and currency to `COUNTRY_CURRENCY_MAP` in `currency.service.ts`
2. Add the country code and price multiplier to `COUNTRY_PRICE_MULTIPLIERS`
3. Regenerate the Prisma client
4. Test the new country pricing

Example:
```typescript
// In currency.service.ts
const COUNTRY_CURRENCY_MAP: Record<string, string> = {
  // ... existing entries
  NZ: 'NZD', // New Zealand
};

const COUNTRY_PRICE_MULTIPLIERS: Record<string, number> = {
  // ... existing entries
  NZ: 1.65, // New Zealand multiplier
};
```

## Testing

Run the currency service tests:

```bash
npm test -- src/services/__tests__/currency.service.test.ts
```

Run the pricing routes tests:

```bash
npm test -- src/routes/__tests__/pricing.routes.test.ts
```

## Troubleshooting

### Issue: Pricing not found for a country

**Solution**: The system will automatically calculate pricing using the multiplier. If you need custom pricing, create it using the POST endpoint.

### Issue: Currency mismatch

**Solution**: Ensure the currency code matches the country code in the `COUNTRY_CURRENCY_MAP`. Use ISO 4217 currency codes.

### Issue: Decimal precision issues

**Solution**: All prices are stored as Decimal in the database and converted to numbers for API responses. Ensure proper rounding in calculations.

## Support

For issues or questions about country-specific pricing, contact the development team or refer to the main README.
