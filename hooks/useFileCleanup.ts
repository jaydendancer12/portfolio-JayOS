import { useEffect, useRef } from "react";
import { useFileSystem } from "contexts/fileSystem";

const STALE_PATHS = [
  "/Users/Public/Documents/Blogs/How to Build Secure APIs.url",
  "/Users/Public/Documents/Blogs/Exploring Containers and Kubernetes.url",
  "/Users/Public/Documents/Blogs/How to Leverage AI in Your Development Workflow.url",
  "/Users/Public/Documents/Blogs/Optimizing Developer Productivity.url",
  "/Users/Public/Documents/Blogs/Chess 960 Exposes Tactical Weaknesses.url",
  "/Users/Public/Documents/Blogs/How Strong Players Think During Equal Positions.url",
];

const useFileCleanup = (): void => {
  const { fs } = useFileSystem();
  const cleaned = useRef(false);

  useEffect(() => {
    if (cleaned.current || !fs) return;
    cleaned.current = true;

    STALE_PATHS.forEach((path) => {
      fs.exists(path, (exists) => {
        if (exists) fs.unlink(path, () => undefined);
      });
    });
  }, [fs]);
};

export default useFileCleanup;
