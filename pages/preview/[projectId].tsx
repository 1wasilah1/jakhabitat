import { useRouter } from 'next/router';
import PanoramaViewer from '../../components/PanoramaViewer';

const ProjectPreview = () => {
  const router = useRouter();
  const { projectId } = router.query;

  return (
    <div className="w-full h-screen">
      <PanoramaViewer 
        projectId={projectId as string}
        onNavigate={() => {}}
      />
    </div>
  );
};

export default ProjectPreview;