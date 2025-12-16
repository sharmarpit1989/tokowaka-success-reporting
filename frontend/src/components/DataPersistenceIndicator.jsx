/**
 * Data Persistence Indicator
 * Shows users that their data is persisted across navigation
 */

import { Database, Check } from 'lucide-react';
import { useAppContext } from '../contexts/AppContext';

function DataPersistenceIndicator() {
  const { 
    hasUploadedData, 
    hasAnalysisResults, 
    hasCitationData, 
    hasActiveProject 
  } = useAppContext();

  const hasAnyData = hasUploadedData || hasAnalysisResults || hasCitationData || hasActiveProject;

  if (!hasAnyData) {
    return null;
  }

  const dataItems = [
    { label: 'URLs', active: hasUploadedData },
    { label: 'Analysis', active: hasAnalysisResults },
    { label: 'Citations', active: hasCitationData },
    { label: 'Project', active: hasActiveProject }
  ].filter(item => item.active);

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-lg text-sm">
      <Database className="w-4 h-4 text-green-600" />
      <span className="text-green-700 font-medium">Session Data:</span>
      <div className="flex items-center gap-2">
        {dataItems.map((item, index) => (
          <span key={item.label} className="flex items-center gap-1 text-green-600">
            <Check className="w-3 h-3" />
            {item.label}
            {index < dataItems.length - 1 && <span className="mx-1">•</span>}
          </span>
        ))}
      </div>
    </div>
  );
}

export default DataPersistenceIndicator;

