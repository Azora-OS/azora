/**
 * AZORA PROPRIETARY LICENSE
 * 
 * Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.
 * See LICENSE file for details.
 */

import { useState, useEffect, useCallback } from 'react'
import apiClient from '../api-client/client'

/**
 * useFetch - Generic data fetching hook
 * Handles loading, error, and data states
 */
export function useFetch(fetchFn, dependencies = []) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    const fetch = async () => {
      setLoading(true)
      setError(null)
      try {
        const result = await fetchFn()
        if (isMounted) {
          setData(result)
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetch()

    return () => {
      isMounted = false
    }
  }, dependencies)

  return { data, loading, error }
}

/**
 * useSapiensData - Hook for Azora Sapiens education data
 */
export function useSapiensData() {
  const { data: enrolledCourses, loading: coursesLoading } = useFetch(
    () => apiClient.getEnrolledCourses()
  )
  const { data: ascensionProgress, loading: progressLoading } = useFetch(
    () => apiClient.getAscensionProgress()
  )
  const { data: knowledgePoints, loading: pointsLoading } = useFetch(
    () => apiClient.getKnowledgePoints()
  )

  const enrollCourse = useCallback((courseId) => {
    return apiClient.enrollCourse(courseId)
  }, [])

  const completeModule = useCallback((courseId, moduleId) => {
    return apiClient.completeModule(courseId, moduleId)
  }, [])

  return {
    enrolledCourses,
    ascensionProgress,
    knowledgePoints,
    loading: coursesLoading || progressLoading || pointsLoading,
    enrollCourse,
    completeModule,
  }
}

/**
 * useMintData - Hook for Azora Mint economic data
 */
export function useMintData() {
  const { data: balance, loading: balanceLoading, error: balanceError } = useFetch(
    () => apiClient.getWalletBalance()
  )
  const { data: transactions, loading: transactionsLoading } = useFetch(
    () => apiClient.getTransactions()
  )
  const { data: uboStatus, loading: uboLoading } = useFetch(
    () => apiClient.getUBOStatus()
  )

  const sendPayment = useCallback((recipientId, amount, currency) => {
    return apiClient.sendPayment(recipientId, amount, currency)
  }, [])

  const convertCurrency = useCallback((from, to, amount) => {
    return apiClient.convertCurrency(from, to, amount)
  }, [])

  return {
    balance,
    transactions,
    uboStatus,
    loading: balanceLoading || transactionsLoading || uboLoading,
    error: balanceError,
    sendPayment,
    convertCurrency,
  }
}

/**
 * useComplianceData - Hook for compliance data
 */
export function useComplianceData() {
  const { data: score, loading: scoreLoading } = useFetch(
    () => apiClient.getComplianceScore()
  )
  const { data: alerts, loading: alertsLoading } = useFetch(
    () => apiClient.getComplianceAlerts()
  )

  const getRegionalStatus = useCallback((region) => {
    return apiClient.getRegionalStatus(region)
  }, [])

  const generateReport = useCallback(() => {
    return apiClient.generateComplianceReport()
  }, [])

  return {
    score,
    alerts,
    loading: scoreLoading || alertsLoading,
    getRegionalStatus,
    generateReport,
  }
}

/**
 * useForgeData - Hook for marketplace data
 */
export function useForgeData() {
  const { data: products, loading: productsLoading } = useFetch(
    () => apiClient.getProducts()
  )
  const { data: sellerDashboard, loading: sellerLoading } = useFetch(
    () => apiClient.getSellerDashboard()
  )
  const { data: orders, loading: ordersLoading } = useFetch(
    () => apiClient.getOrderHistory()
  )

  const purchaseProduct = useCallback((productId, buyerData) => {
    return apiClient.purchaseProduct(productId, buyerData)
  }, [])

  const listProduct = useCallback((productData) => {
    return apiClient.listProduct(productData)
  }, [])

  return {
    products,
    sellerDashboard,
    orders,
    loading: productsLoading || sellerLoading || ordersLoading,
    purchaseProduct,
    listProduct,
  }
}

/**
 * useEnterpriseData - Hook for B2B enterprise data
 */
export function useEnterpriseData() {
  const { data: orders, loading: ordersLoading } = useFetch(
    () => apiClient.getOrders()
  )
  const { data: team, loading: teamLoading } = useFetch(
    () => apiClient.getTeamMembers()
  )
  const { data: metrics, loading: metricsLoading } = useFetch(
    () => apiClient.getBusinessMetrics()
  )

  const updateOrderStatus = useCallback((orderId, status) => {
    return apiClient.updateOrderStatus(orderId, status)
  }, [])

  return {
    orders,
    team,
    metrics,
    loading: ordersLoading || teamLoading || metricsLoading,
    updateOrderStatus,
  }
}

/**
 * useNexusData - Hook for system monitoring data
 */
export function useNexusData() {
  const { data: health, loading: healthLoading } = useFetch(
    () => apiClient.getSystemHealth(),
    [] // Will refetch automatically
  )
  const { data: metrics, loading: metricsLoading } = useFetch(
    () => apiClient.getMetrics()
  )
  const { data: alerts, loading: alertsLoading } = useFetch(
    () => apiClient.getAlerts()
  )

  return {
    health,
    metrics,
    alerts,
    loading: healthLoading || metricsLoading || alertsLoading,
  }
}

/**
 * useAegisData - Hook for governance data
 */
export function useAegisData() {
  const { data: constitutionStatus, loading: statusLoading } = useFetch(
    () => apiClient.getConstitutionalStatus()
  )
  const { data: proposals, loading: proposalsLoading } = useFetch(
    () => apiClient.getGovernanceProposals()
  )

  const submitProposal = useCallback((proposal) => {
    return apiClient.submitGovernanceProposal(proposal)
  }, [])

  const voteOnProposal = useCallback((proposalId, vote) => {
    return apiClient.voteOnProposal(proposalId, vote)
  }, [])

  return {
    constitutionStatus,
    proposals,
    loading: statusLoading || proposalsLoading,
    submitProposal,
    voteOnProposal,
  }
}

/**
 * useOracleData - Hook for oracle and intelligence data
 */
export function useOracleData() {
  const { data: rates, loading: ratesLoading } = useFetch(
    () => apiClient.getExchangeRates()
  )
  const { data: knowledgeGraph, loading: graphLoading } = useFetch(
    () => apiClient.getKnowledgeGraph()
  )

  const searchKnowledge = useCallback((query) => {
    return apiClient.searchKnowledge(query)
  }, [])

  const convertWithRate = useCallback((from, to, amount) => {
    return apiClient.convertWithRate(from, to, amount)
  }, [])

  return {
    rates,
    knowledgeGraph,
    loading: ratesLoading || graphLoading,
    searchKnowledge,
    convertWithRate,
  }
}

export default useFetch
