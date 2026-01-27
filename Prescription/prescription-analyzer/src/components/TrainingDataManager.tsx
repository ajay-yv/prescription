import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Trash2, 
  Eye, 
  Download, 
  Upload, 
  Plus,
  Search 
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { PrescriptionData } from '../utils/imageUtils';
import { storageService } from '../services/storageService';

interface TrainingDataManagerProps {
  onViewTrainingData: (data: PrescriptionData) => void;
  onAddToTraining: () => void;
}

export const TrainingDataManager: React.FC<TrainingDataManagerProps> = ({
  onViewTrainingData,
  onAddToTraining
}) => {
  const [trainedData, setTrainedData] = useState<PrescriptionData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState<PrescriptionData[]>([]);

  useEffect(() => {
    loadTrainedData();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = trainedData.filter(data =>
        data.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        data.medications.some(med => 
          med.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        data.doctorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        data.patientName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredData(filtered);
    } else {
      setFilteredData(trainedData);
    }
  }, [searchTerm, trainedData]);

  const loadTrainedData = () => {
    const data = storageService.getTrainedData();
    setTrainedData(data);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this training data?')) {
      storageService.deleteTrainedData(id);
      loadTrainedData();
    }
  };

  const handleExport = () => {
    const exportData = storageService.exportData();
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prescription-training-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          storageService.importData(content);
          loadTrainedData();
          alert('Data imported successfully!');
        } catch (error) {
          alert('Error importing data. Please check the file format.');
        }
      };
      reader.readAsText(file);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-purple-500" />
            <span>Training Data ({trainedData.length})</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
            <label>
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
              <Button variant="outline" size="sm" className="cursor-pointer">
                <Upload className="w-4 h-4 mr-1" />
                Import
              </Button>
            </label>
            <Button variant="primary" size="sm" onClick={onAddToTraining}>
              <Plus className="w-4 h-4 mr-1" />
              Add New
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search training data..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Training Data List */}
        {filteredData.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchTerm ? 'No matching training data found' : 'No training data available. Upload and analyze prescriptions to build your training set.'}
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredData.map((data) => (
              <div
                key={data.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-4">
                    <img
                      src={data.image}
                      alt={data.name}
                      className="w-16 h-16 object-cover rounded-md border border-gray-200"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">
                        {data.name}
                      </h4>
                      <div className="text-sm text-gray-500 space-y-1">
                        {data.medications.length > 0 && (
                          <p>
                            Medications: {data.medications.slice(0, 2).join(', ')}
                            {data.medications.length > 2 && ` +${data.medications.length - 2} more`}
                          </p>
                        )}
                        {data.doctorName && (
                          <p>Doctor: {data.doctorName}</p>
                        )}
                        <p>Added: {formatDate(data.uploadedAt)}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewTrainingData(data)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(data.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
