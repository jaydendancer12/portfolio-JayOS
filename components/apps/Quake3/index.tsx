import { memo, useEffect, useState } from "react";
import useQuake3 from "components/apps/Quake3/useQuake3";
import AppContainer from "components/system/Apps/AppContainer";
import { type ComponentProcessProps } from "components/system/Apps/RenderComponent";
import DesktopOnly from "components/system/Apps/DesktopOnly";

const Quake3: FC<ComponentProcessProps> = ({ id }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.matchMedia("(pointer: coarse)").matches);
  }, []);

  if (isMobile) return <DesktopOnly />;

  return <AppContainer id={id} useHook={useQuake3} />;
};

export default memo(Quake3);
