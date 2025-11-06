# Ops Payout Confirmation — Redemption Escrow Flow (TEST: 150 AZR)

To: Finance / Treasury / Ops

We confirm the following terms for the escrowed swap via the Redemption contract (TEST):

- Requester wallet: <REQUESTER_WALLET_ADDRESS>
- AZR token contract: 0x742d35Cc6634C0532925a3b844Bc454e4438f44e
- Redemption contract address (deployed): <REDEMPTION_CONTRACT_ADDRESS>
- Admin (Gnosis Safe) address: <GNOSIS_SAFE_ADDRESS>
- Treasury receiving address: <TREASURY_ADDRESS> (on-chain)
- Agreed payout (test): ZAR 150 AZR * 925 ZAR/AZR = ZAR 138,750 (confirm actual ZAR amount Ops will pay)
- AZR amount to escrow (test): 150 AZR
- Main transfer (if successful after test): <MAIN_AZR_AMOUNT> AZR (TBD)
- Bank details for payout (Treasury):
  - Bank: <BANK_NAME>
  - Account name: <ACCOUNT_NAME>
  - Account number: <ACCOUNT_NUMBER>
  - Branch / Reference: <PAYMENT_REFERENCE>
- Ops commit:
  - We confirm treasury will provide cleared funds to pay the test amount and the full agreed amount on confirmation.
  - We will only authorize multisig completion (completeRedeem) after bank funds CLEAR (bankRef provided).
  - Multisig owners to sign for completeRedeem: <OWNER_1>, <OWNER_2> (threshold: 2 of 3).
  - Ops contact for reconciliation: <OPS_NAME & EMAIL>
- KYC: Requester KYC completed: Yes / No — if No, list required docs.

Please reply with explicit acceptance including:
1) Confirmation of ZAR 138,750 (or the actual ZAR Ops will pay for 150 AZR).
2) Redemption contract address (once deployed).
3) Gnosis Safe address that will be admin.
4) Bank reference template you will use when making the payment.

Signed,
<Ops approver name & title>
<Date>