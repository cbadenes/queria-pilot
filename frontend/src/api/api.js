import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

export const loginUser = async (credentials) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/login`, credentials);
    return response.data;
  } catch (error) {
    console.error('Error during login:', error);
    throw error;
  }
};

export const registerUser = async (userData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/register`, userData);
    return response.data;
  } catch (error) {
    console.error('Error during registration:', error);
    throw error;
  }
};

export const uploadPDF = async (fileData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/upload-pdf`, fileData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading PDF:', error);
    throw error;
  }
};

export const generateQuestions = async (settings) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/generate-questions`, settings);
    return response.data;
  } catch (error) {
    console.error('Error generating questions:', error);
    throw error;
  }
};

export const validateAnswer = async (answerData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/validate-answer`, answerData);
    return response.data;
  } catch (error) {
    console.error('Error validating answer:', error);
    throw error;
  }
};
