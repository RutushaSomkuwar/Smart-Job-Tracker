import api from './api';

export const analysisService = {
  async analyzeResume(resume_id, job_description, application_id = null) {
    const response = await api.post('/analysis/analyze', {
      resume_id,
      job_description,
      application_id,
    });
    return response.data;
  },

  async saveAnalysis(data) {
    const response = await api.post('/analysis/save', data);
    return response.data;
  },

  async getAnalysisByApplication(application_id) {
    const response = await api.get(`/analysis/application/${application_id}`);
    return response.data;
  },
};
