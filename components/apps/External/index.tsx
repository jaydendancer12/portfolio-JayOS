import { memo, useEffect } from "react";
import { type ComponentProcessProps } from "components/system/Apps/RenderComponent";
import { useProcesses } from "contexts/process";

const External: FC<ComponentProcessProps> = ({ id }) => {
  const {
    close,
    processes: { [id]: process },
  } = useProcesses();
  const { url = "" } = process || {};

  useEffect(() => {
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
      close(id);
    }
  }, [close, id, url]);

  return <span hidden />;
};

export default memo(External);
