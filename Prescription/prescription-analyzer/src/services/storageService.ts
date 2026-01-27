import { PrescriptionData } from '../utils/imageUtils';

const STORAGE_KEYS = {
  TRAINED_DATA: 'prescription_trained_data',
  UPLOAD_HISTORY: 'prescription_upload_history'
};

export class StorageService {
  // Save trained prescription data
  saveTrainedData(data: PrescriptionData): void {
    const trainedData = this.getTrainedData();
    const existingIndex = trainedData.findIndex(item => item.id === data.id);
    
    if (existingIndex >= 0) {
      trainedData[existingIndex] = data;
    } else {
      trainedData.push(data);
    }
    
    localStorage.setItem(STORAGE_KEYS.TRAINED_DATA, JSON.stringify(trainedData));
  }

  // Get all trained prescription data
  getTrainedData(): PrescriptionData[] {
    const data = localStorage.getItem(STORAGE_KEYS.TRAINED_DATA);
    return data ? JSON.parse(data) : [];
  }

  // Delete trained data by ID
  deleteTrainedData(id: string): void {
    const trainedData = this.getTrainedData();
    const filtered = trainedData.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEYS.TRAINED_DATA, JSON.stringify(filtered));
  }

  // Save upload history
  saveUploadHistory(data: PrescriptionData): void {
    const history = this.getUploadHistory();
    const existingIndex = history.findIndex(item => item.id === data.id);
    
    if (existingIndex >= 0) {
      history[existingIndex] = data;
    } else {
      history.unshift(data); // Add to beginning
    }
    
    // Keep only last 50 uploads
    if (history.length > 50) {
      history.splice(50);
    }
    
    localStorage.setItem(STORAGE_KEYS.UPLOAD_HISTORY, JSON.stringify(history));
  }

  // Get upload history
  getUploadHistory(): PrescriptionData[] {
    const data = localStorage.getItem(STORAGE_KEYS.UPLOAD_HISTORY);
    return data ? JSON.parse(data) : [];
  }

  // Clear all data
  clearAllData(): void {
    localStorage.removeItem(STORAGE_KEYS.TRAINED_DATA);
    localStorage.removeItem(STORAGE_KEYS.UPLOAD_HISTORY);
  }

  // Export data as JSON
  exportData(): string {
    return JSON.stringify({
      trainedData: this.getTrainedData(),
      uploadHistory: this.getUploadHistory(),
      exportedAt: new Date().toISOString()
    }, null, 2);
  }

  // Import data from JSON
  importData(jsonString: string): void {
    try {
      const data = JSON.parse(jsonString);
      
      if (data.trainedData && Array.isArray(data.trainedData)) {
        localStorage.setItem(STORAGE_KEYS.TRAINED_DATA, JSON.stringify(data.trainedData));
      }
      
      if (data.uploadHistory && Array.isArray(data.uploadHistory)) {
        localStorage.setItem(STORAGE_KEYS.UPLOAD_HISTORY, JSON.stringify(data.uploadHistory));
      }
    } catch (error) {
      throw new Error('Invalid JSON data for import');
    }
  }
}

export const storageService = new StorageService();
