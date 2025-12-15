import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import PanoramaViewer from '../../components/PanoramaViewer';

const ProjectPreview = () => {
  const router = useRouter();
  const [projectId, setProjectId] = useState<string>('');

  useEffect(() => {
    if (router.isReady && router.query.projectId) {
      setProjectId(router.query.projectId as string);
    }
  }, [router.isReady, router.query.projectId]);

  if (!projectId) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <div className="text-xl mb-2">Loading...</div>
          <div className="text-sm opacity-75">Preparing panorama viewer</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen">
      <PanoramaViewer 
        projectId={projectId}
        onNavigate={() => {}}
      />
    </div>
  );
};

export default ProjectPreview;