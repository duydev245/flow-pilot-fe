import { fetcher } from '../fetcher'
import type {
  UserListResponse,
  UserDetailResponse,
  CreateUserRequest,
  UpdateUserRequest,
  ApiResponse
} from '../../modules/SuperAdmin/UserManagement/models/UserManagementInterface'

// SuperAdmin User APIs
export class UserSuperAdminAPI {
  /**
   * Get all users (SuperAdmin)
   * GET /user/super-admin
   */
  static async getAllUsers(params?: { page?: number; limit?: number }): Promise<UserListResponse> {
    const response = await fetcher.get('/user/super-admin', { params })
    return response.data
  }

  static async getAllUsersInSystem(): Promise<UserListResponse> {
    const queryParams = new URLSearchParams({
      page: String(1),
      limit: String(10000)
    })

    const response = await fetcher.get(`/user/super-admin?${queryParams.toString()}`)
    return response.data
  }

  /**
   * Get user by ID (SuperAdmin)
   * GET /user/super-admin/:id
   */
  static async getUserById(id: string): Promise<UserDetailResponse> {
    const response = await fetcher.get(`/user/super-admin/${id}`)
    return response.data
  }

  /**
   * Create new user (SuperAdmin)
   * POST /user/super-admin/create
   */
  static async createUser(userData: CreateUserRequest): Promise<ApiResponse> {
    const response = await fetcher.post(`/user/super-admin/create`, userData)
    return response.data
  }

  /**
   * Update user (SuperAdmin)
   * PUT /user/super-admin/:id
   */
  static async updateUser(id: string, userData: UpdateUserRequest): Promise<ApiResponse> {
    const response = await fetcher.put(`/user/super-admin/${id}`, userData)
    return response.data
  }

  /**
   * Delete user (SuperAdmin)
   * DELETE /user/super-admin/delete/:id
   */
  static async deleteUser(id: string): Promise<ApiResponse> {
    const response = await fetcher.delete(`/user/super-admin/delete/${id}`)
    return response.data
  }

  /**
   * Activate user (SuperAdmin)
   * PATCH /user/super-admin/active-user/:id
   */
  static async activateUser(id: string): Promise<ApiResponse> {
    const response = await fetcher.patch(`/user/super-admin/active-user/${id}`, { status: 'active' })
    return response.data
  }

  static async getAllUserByAdmin(page: number, pageSize: number): Promise<UserListResponse> {
    const response = await fetcher.get('/user/admin?page=' + page + '&pageSize=' + pageSize)
    return response.data
  }

  static async getMe() {
    const response = await fetcher.get('/user/me')
    return response.data?.data
  }

  static async updateProfile(formData: FormData) {
    const response = await fetcher.put('/user/update-profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  }

  /**
   * Get user info by ID
   * GET /user/user-info/:id
   */
  static async getUserInfo(id: string): Promise<any> {
    const response = await fetcher.get(`/user/user-info/${id}`)
    return response.data
  }
  
}

// Export individual functions for easier imports
export const { getAllUsers, getUserById, createUser, updateUser, deleteUser, activateUser, getAllUserByAdmin, getMe, getUserInfo } =
  UserSuperAdminAPI
