import type { Package, Feature } from '../models'

// Helper function to get localized package name
export const getLocalizedPackageName = (packageData: Package, _locale: string): string => {
  // Keep package names as-is (TEAM, GROWTH, ENTERPRISE)
  return packageData.name
}

// Helper function to get localized package description
export const getLocalizedPackageDescription = (packageData: Package, _locale: string, t: any): string => {
  // Map package names to their translated descriptions
  const packageDescriptionMap: { [key: string]: string } = {
    'TEAM': 'pricing.packageDescriptions.TEAM',
    'GROWTH': 'pricing.packageDescriptions.GROWTH',
    'ENTERPRISE': 'pricing.packageDescriptions.ENTERPRISE'
  }
  
  const translationKey = packageDescriptionMap[packageData.name]
  if (translationKey) {
    return t(translationKey)
  }
  
  // Return original description if no translation found
  return packageData.description || t('pricing.limitedUsers')
}

// Helper function to get localized feature name
export const getLocalizedFeatureName = (feature: Feature, _locale: string, t?: any): string => {
  if (!t) return feature.name
  
  // Create a mapping based on the exact feature names from backend
  const featureNameMap: { [key: string]: string } = {
    // TEAM package features
    'Tối đa 10 thành viên': 'pricing.packageFeatures.maxMembers10',
    'Quản lý hồ sơ nhân sự, nghỉ phép, chấm công': 'pricing.packageFeatures.hrManagement',
    'Chế độ Tập trung': 'pricing.packageFeatures.focusMode',
    'Báo cáo hiệu suất cơ bản (tuần/tháng)': 'pricing.packageFeatures.basicReports',
    'Hỗ trợ qua email': 'pricing.packageFeatures.emailSupport',
    
    // GROWTH package features
    'Tối đa 30 thành viên': 'pricing.packageFeatures.maxMembers30',
    'Toàn bộ tính năng trong Team': 'pricing.packageFeatures.allTeamFeatures',
    'Báo cáo AI về hiệu suất & năng suất làm việc': 'pricing.packageFeatures.aiReports',
    'Bảng điều khiển theo thời gian thực': 'pricing.packageFeatures.realTimeDashboard',
    'Đánh giá hiệu suất 360° & phản hồi đa chiều': 'pricing.packageFeatures.performance360',
    'Tùy chỉnh KPI & mục tiêu nhóm': 'pricing.packageFeatures.customKPI',
    'Báo cáo tự động (tuần/tháng/quý)': 'pricing.packageFeatures.autoReports',
    'Hỗ trợ ưu tiên': 'pricing.packageFeatures.prioritySupport',
    
    // ENTERPRISE package features
    '50 thành viên (có thể mở rộng thêm)': 'pricing.packageFeatures.maxMembers50',
    'Toàn bộ tính năng trong Growth': 'pricing.packageFeatures.allGrowthFeatures',
    'Phân tích AI nâng cao: dự báo hiệu suất, phát hiện nguy cơ nghỉ việc': 'pricing.packageFeatures.advancedAI',
    'Tự động hóa quy trình nhân sự (nhắc nhở, phê duyệt, onboarding)': 'pricing.packageFeatures.hrAutomation',
    'Báo cáo tùy biến theo nhu cầu doanh nghiệp': 'pricing.packageFeatures.customReports',
    'Hỗ trợ riêng': 'pricing.packageFeatures.dedicatedSupport',
    'Bảo mật nâng cao (SSO, phân quyền truy cập chi tiết)': 'pricing.packageFeatures.advancedSecurity'
  }
  
  const translationKey = featureNameMap[feature.name]
  if (translationKey) {
    return t(translationKey)
  }
  
  // Return original name if no translation found
  return feature.name
}

// Helper function to process package features for display
export const processPackageFeatures = (features: Feature[], locale: string, t?: any): string[] => {
  return features.map(feature => getLocalizedFeatureName(feature, locale, t))
}