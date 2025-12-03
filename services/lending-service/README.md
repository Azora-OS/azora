# Lending Service

A comprehensive lending and credit evaluation service for the Azora ecosystem.

## Features

- **Loan Management**: Create, track, and manage loan applications
- **Credit Evaluation**: Evaluate applicant creditworthiness
- **Loan Approval**: Approve or reject loan applications
- **Interest Rate Calculation**: Dynamic interest rate based on credit score
- **RESTful API**: Well-documented API endpoints for all lending functions

## API Endpoints

### Health & Info
- `GET /health` - Service health check

### Loans
- `GET /api/loans` - Get all loan applications
- `GET /api/loans/:loanId` - Get specific loan application
- `POST /api/loans` - Submit a new loan application
- `PUT /api/loans/:loanId` - Update loan application status

### Credit Evaluation
- `POST /api/credit-evaluation` - Evaluate applicant creditworthiness
- `GET /api/credit-evaluation/:applicantId` - Get credit history for applicant

## Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the service:
   ```bash
   npm start
   ```

3. For development:
   ```bash
   npm run dev
   ```

## Environment Variables

Create a `.env` file with the following variables:

```
PORT=3030
LOG_LEVEL=info
```

## Loan Status Types

The service supports the following loan status types:

1. **Pending**: Loan application is under review
2. **Approved**: Loan application has been approved
3. **Rejected**: Loan application has been rejected
4. **Active**: Loan is currently active
5. **Closed**: Loan has been fully repaid
6. **Defaulted**: Loan is in default status

## Risk Levels

The service evaluates applicants with the following risk levels:

1. **Low**: Low risk of default
2. **Medium**: Moderate risk of default
3. **High**: High risk of default

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

PROPRIETARY