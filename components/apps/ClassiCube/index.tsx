import { memo, useEffect, useState } from "react";
import StyledClassiCube from "components/apps/ClassiCube/StyledClassiCube";
import useClassiCube from "components/apps/ClassiCube/useClassiCube";
import AppContainer from "components/system/Apps/AppContainer";
import { type ComponentProcessProps } from "components/system/Apps/RenderComponent";
import DesktopOnly from "components/system/Apps/DesktopOnly";

const ClassiCube: FC<ComponentProcessProps> = ({ id }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.matchMedia("(pointer: coarse)").matches);
  }, []);

  if (isMobile) return <DesktopOnly />;

  return (
    <AppContainer
      StyledComponent={StyledClassiCube}
      id={id}
      useHook={useClassiCube}
    />
  );
};

export default memo(ClassiCube);
