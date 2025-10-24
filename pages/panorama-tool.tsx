import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

const PanoramaTool: React.FC = () => {
  const router = useRouter();
  const [projectName, setProjectName] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [progress, setProgress] = useState(0);

  const handleCreateProject = async () => {
    if (!projectName.trim() || !selectedFiles || selectedFiles.length === 0) {
      setMessage('Please enter project name and select at least one image');
      return;
    }

    setUploading(true);
    setProgress(0);
    
    try {
      const formData = new FormData();
      formData.append('projectName', projectName);
      
      for (let i = 0; i < selectedFiles.length; i++) {
        formData.append('images', selectedFiles[i]);
      }

      const response = await fetch('/api/marzipano/create-project', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setMessage('Project created successfully!');
        setTimeout(() => {
          router.push(`/panorama-editor/${data.projectId}`);
        }, 1000);
      } else {
        setMessage('Failed to create project');
      }
    } catch (error) {
      setMessage('Error creating project');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Create Panorama Project</h1>
            <Link
              href="/manage"
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Back to Manage
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium mb-6">Project Details</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Name
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter project name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Panorama Images
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => setSelectedFiles(e.target.files)}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="text-sm text-gray-500 mt-1">
                Select one or more 360° panorama images (JPG, PNG)
              </p>
              {selectedFiles && (
                <p className="text-sm text-green-600 mt-2">
                  {selectedFiles.length} file(s) selected
                </p>
              )}
            </div>

            {uploading && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  <span className="text-sm text-blue-700">Creating project...</span>
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={handleCreateProject}
                disabled={uploading || !projectName.trim() || !selectedFiles}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-6 py-2 rounded-md font-medium"
              >
                {uploading ? 'Creating...' : 'Create Project'}
              </button>
              
              <Link
                href="/manage"
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-md font-medium"
              >
                Cancel
              </Link>
            </div>
          </div>
        </div>

        {message && (
          <div className={`mt-4 p-4 rounded-md ${
            message.includes('successfully') 
              ? 'bg-green-50 text-green-800' 
              : 'bg-red-50 text-red-800'
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default PanoramaTool;