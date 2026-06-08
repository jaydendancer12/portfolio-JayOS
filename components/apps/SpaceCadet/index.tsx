import { memo, useEffect, useState } from "react";
import StyledSpaceCadet from "components/apps/SpaceCadet/StyledSpaceCadet";
import useSpaceCadet from "components/apps/SpaceCadet/useSpaceCadet";
import AppContainer from "components/system/Apps/AppContainer";
import { type ComponentProcessProps } from "components/system/Apps/RenderComponent";
import DesktopOnly from "components/system/Apps/DesktopOnly";

const SpaceCadet: FC<ComponentProcessProps> = ({ id }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.matchMedia("(pointer: coarse)").matches);
  }, []);

  if (isMobile) return <DesktopOnly />;

  return (
    <AppContainer
      StyledComponent={StyledSpaceCadet}
      id={id}
      useHook={useSpaceCadet}
    />
  );
};

export default memo(SpaceCadet);
