import { fetcher } from '@/app/apis/fetcher'
import type { FileByTaskRes, MyTask, MyTaskResponse } from '@/app/modules/Employee/MyTasks/models/myTask.type'

import type { AxiosError, AxiosResponse } from 'axios'

export const MyTaskApi = {
  getMyTask: async () => {
    try {
      // Get projectId from localStorage or Redux store
      const user = localStorage.getItem('user')
      const projectId = user ? JSON.parse(user).projectId : null;

      if (!projectId) {
        throw new Error('No project selected. Please select a project first.')
      }

      const response: AxiosResponse<MyTaskResponse> = await fetcher.get(`/task/my-tasks/${projectId}`)
      return response.data as MyTaskResponse
    } catch (error) {
      const axiosError = error as AxiosError
      throw axiosError
    }
  },

  // New API for Manager to get all tasks
  getAllTasksByManager: async () => {
    try {
      // Get projectId from localStorage or Redux store
      const user = localStorage.getItem('user')
      const projectId = user ? JSON.parse(user).projectId : null;

      if (!projectId) {
        throw new Error('No project selected. Please select a project first.')
      }

      const response: AxiosResponse<MyTaskResponse> = await fetcher.get(`/task/task-by-project/${projectId}`)
      return response.data as MyTaskResponse
    } catch (error) {
      const axiosError = error as AxiosError
      throw axiosError
    }
  },

  // Get single task by ID
  getTaskById: async (taskId: string) => {
    try {
      const response: AxiosResponse<{ success: boolean; message: string; data: MyTask }> = await fetcher.get(
        `/task/${taskId}`
      )
      return response.data
    } catch (error) {
      const axiosError = error as AxiosError
      throw axiosError
    }
  },

  // Create new task
  createTask: async (taskData: FormData) => {
    try {
      const response: AxiosResponse<{ success: boolean; message: string; data: MyTask }> = await fetcher.post(
        '/task/create',
        taskData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      )
      return response.data
    } catch (error) {
      const axiosError = error as AxiosError
      throw axiosError
    }
  },

  // Update task
  updateTask: async (
    taskId: string,
    taskData: {
      name?: string
      description?: string
      start_at?: string
      due_at?: string
      priority?: 'low' | 'medium' | 'high'
      status?: 'todo' | 'doing' | 'reviewing' | 'rejected' | 'completed' | 'feedbacked' | 'overdued'
    }
  ) => {
    try {
      const response: AxiosResponse<{ success: boolean; message: string; data: MyTask }> = await fetcher.put(
        `/task/update/${taskId}`,
        taskData
      )
      return response.data
    } catch (error) {
      const axiosError = error as AxiosError
      throw axiosError
    }
  },

  // Delete task
  deleteTask: async (taskId: string) => {
    try {
      const response: AxiosResponse<{ success: boolean; message: string; data: any }> = await fetcher.delete(
        `/task/${taskId}`
      )
      return response.data
    } catch (error) {
      const axiosError = error as AxiosError
      throw axiosError
    }
  },

  // Create review for task
  createReview: async (reviewData: {
    task_id: string
    task_owner_id: string
    quality_score: number
    notes: string
  }) => {
    try {
      const response: AxiosResponse<{ success: boolean; message: string; data: any }> = await fetcher.post(
        '/task/create-review',
        reviewData
      )
      return response.data
    } catch (error) {
      const axiosError = error as AxiosError
      throw axiosError
    }
  },

  // Reject task
  rejectTask: async (rejectData: { task_id: string; reason: string; notes: string }) => {
    try {
      const response: AxiosResponse<{ success: boolean; message: string; data: any }> = await fetcher.post(
        '/task/reject-task',
        rejectData
      )
      return response.data
    } catch (error) {
      const axiosError = error as AxiosError
      throw axiosError
    }
  },
  createTaskContent: async (task_id: string, user_id: string, content: string, type: string, status: string) => {
    try {
      const response: AxiosResponse<MyTaskResponse> = await fetcher.post(`/task/content/create`, {
        task_id,
        user_id,
        content,
        type,
        status
      })
      return response.data as MyTaskResponse
    } catch (error) {
      const axiosError = error as AxiosError
      throw axiosError
    }
  },
  updateTaskContent: async (
    contentId: number,
    task_id: string,
    user_id: string,
    content: string,
    type: string,
    status: string
  ) => {
    try {
      const response: AxiosResponse<MyTaskResponse> = await fetcher.put(`/task/content/update/${contentId}`, {
        task_id,
        user_id,
        content,
        type,
        status
      })
      return response.data as MyTaskResponse
    } catch (error) {
      const axiosError = error as AxiosError
      throw axiosError
    }
  },
  deleteTaskContent: async (contentId: number) => {
    try {
      const response: AxiosResponse<MyTaskResponse> = await fetcher.put(`/task/content/update/${contentId}`, {
        status: 'inactive'
      })
      return response.data as MyTaskResponse
    } catch (error) {
      const axiosError = error as AxiosError
      throw axiosError
    }
  },
  createChecklistItem: async (task_id: string, title: string, status: string, is_completed: boolean) => {
    try {
      const response: AxiosResponse<MyTaskResponse> = await fetcher.post(`/task/checklist/create`, {
        task_id,
        title,
        status,
        is_completed
      })
      return response.data as MyTaskResponse
    } catch (error) {
      const axiosError = error as AxiosError
      throw axiosError
    }
  },
  updateChecklistItem: async (
    checklistId: string,
    task_id: string,
    title: string,
    status: string,
    is_completed: boolean
  ) => {
    try {
      const response: AxiosResponse<MyTaskResponse> = await fetcher.put(`/task/checklist/update/${checklistId}`, {
        task_id,
        title,
        status,
        is_completed
      })
      return response.data as MyTaskResponse
    } catch (error) {
      const axiosError = error as AxiosError
      throw axiosError
    }
  },
  updateTaskStatus: async (taskId: string, status: string) => {
    try {
      const response: AxiosResponse<MyTaskResponse> = await fetcher.put(`/task/update/${taskId}`, {
        status
      })
      return response.data as MyTaskResponse
    } catch (error) {
      const axiosError = error as AxiosError
      throw axiosError
    }
  },
  getFileByTaskId: async (taskId: string) => {
    try {
      const response: AxiosResponse<FileByTaskRes> = await fetcher.get(`/file/task/${taskId}`)
      return response.data
    } catch (error) {
      const axiosError = error as AxiosError
      throw axiosError
    }
  },
  uploadFileByTaskId: async (task_id: string, file: File) => {
    try {
      const formData = new FormData()
      formData.append('task_id', task_id)
      formData.append('file', file)
      const response: AxiosResponse = await fetcher.post(`/file/upload/task`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    } catch (error) {
      const axiosError = error as AxiosError
      throw axiosError
    }
  },

  // Assign task to users
  assignTask: async (assignData: { task_id: string; user_ids: string[] }) => {
    try {
      const response: AxiosResponse<{ success: boolean; message: string; data: any }> = await fetcher.post(
        '/task/assign-task',
        assignData
      )
      return response.data
    } catch (error) {
      const axiosError = error as AxiosError
      throw axiosError
    }
  }
}
