import { memo } from "react";

const StartButtonIcon = memo(() => (
  // eslint-disable-next-line @next/next/no-img-element
  <img
    alt="JayOS"
    src="/favicon.png"
    style={{ height: "64%", objectFit: "contain", width: "64%" }}
  />
));

export default StartButtonIcon;
