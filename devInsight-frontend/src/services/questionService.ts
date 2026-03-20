import api from './api';

export interface CreateQuestionRequest {
  title: string;
  description: string;
  type: 'CODING' | 'BEHAVIORAL' | 'MULTIPLE_CHOICE' | 'SYSTEM_DESIGN';
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  tags?: string[];
  
  // For CODING questions
  programmingLanguage?: string;
  starterCode?: string;
  solution?: string;
  testCases?: string;
  
  // For MULTIPLE_CHOICE questions
  options?: string[];
  correctAnswer?: string;
  
  // For BEHAVIORAL questions
  evaluationCriteria?: string;
  
  maxPoints?: number;
  timeLimit?: number;
  interviewId?: number;
}

export interface QuestionResponse {
  id: number;
  title: string;
  description: string;
  type: string;
  difficulty?: string;
  tags?: string[];
  programmingLanguage?: string;
  starterCode?: string;
  solution?: string;
  testCases?: string;
  evaluationCriteria?: string;
  maxPoints?: number;
  timeLimit?: number;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
}

const questionService = {
  // Create new question
  createQuestion: async (data: CreateQuestionRequest): Promise<QuestionResponse> => {
    const response = await api.post('/questions', data);
    return response.data.data;
  },

  // Get all questions
  getAllQuestions: async (): Promise<QuestionResponse[]> => {
    const response = await api.get('/questions');
    return response.data.data;
  },

  // Get question by ID
  getQuestionById: async (id: number): Promise<QuestionResponse> => {
    const response = await api.get(`/questions/${id}`);
    return response.data.data;
  },

  // Update question
  updateQuestion: async (id: number, data: CreateQuestionRequest): Promise<QuestionResponse> => {
    const response = await api.put(`/questions/${id}`, data);
    return response.data.data;
  },

  // Delete question
  deleteQuestion: async (id: number): Promise<void> => {
    await api.delete(`/questions/${id}`);
  },

  // Get questions by type
  getQuestionsByType: async (type: string): Promise<QuestionResponse[]> => {
    const response = await api.get(`/questions/type/${type}`);
    return response.data.data;
  }
};

export default questionService;
