import { prisma } from '../../infrastructure/database/prisma-config'

export class ReportingEngine {
  async generateUserMetrics(startDate: Date, endDate: Date) {
    const [totalUsers, newUsers, activeUsers] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: { createdAt: { gte: startDate, lte: endDate } }
      }),
      prisma.user.count({
        where: { lastLoginAt: { gte: startDate, lte: endDate } }
      })
    ])

    return { totalUsers, newUsers, activeUsers }
  }

  async generateTransactionMetrics(startDate: Date, endDate: Date) {
    const transactions = await prisma.transaction.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        status: 'COMPLETED'
      }
    })

    const totalVolume = transactions.reduce((sum, tx) => sum + tx.amount, 0)
    const totalCount = transactions.length

    return { totalVolume, totalCount }
  }

  async generateFinancialReport(startDate: Date, endDate: Date) {
    const transactions = await prisma.transaction.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        status: 'COMPLETED'
      }
    })

    const revenue = transactions
      .filter(tx => tx.type === 'PAYMENT')
      .reduce((sum, tx) => sum + tx.amount, 0)

    return { revenue }
  }
}