import { useEffect, useRef } from "react";
import { useFileSystem } from "contexts/fileSystem";
import { useProcesses } from "contexts/process";
import { useSession } from "contexts/session";

const WELCOME_FILE = "/Users/Public/Documents/Welcome.whtml";

const useWelcome = (): void => {
  const { fs } = useFileSystem();
  const { open } = useProcesses();
  const { sessionLoaded } = useSession();
  const opened = useRef(false);

  useEffect(() => {
    if (opened.current || !fs || !sessionLoaded) return;
    opened.current = true;
    open("TinyMCE", { url: WELCOME_FILE });
  }, [fs, open, sessionLoaded]);
};

export default useWelcome;
