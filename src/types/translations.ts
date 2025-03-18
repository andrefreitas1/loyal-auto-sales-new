export type Language = 'pt-BR' | 'en' | 'es'

export interface DashboardTranslations {
  welcome: string
  subtitle: string
  acquired: string
  inPreparation: string
  forSale: string
  sold: string
  featuredVehicles: string
  noVehicles: string
  financialSummary: string
  totalRevenue: string
  totalExpenses: string
  totalInvestment: string
  netProfit: string
  quickActions: string
  addNewVehicle: string
  viewAllVehicles: string
  viewReports: string
}

export interface Translations {
  dashboard: DashboardTranslations
}

export type TranslationKey = keyof DashboardTranslations 