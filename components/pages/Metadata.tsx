import { memo, useMemo } from "react";
import Head from "next/head";
import { useFaviconAndTitle } from "components/pages/hooks/useFaviconAndTitle";
import { useCursor } from "components/pages/hooks/useCursor";
import desktopIcons from "public/.index/desktopIcons.json";
import { HIGH_PRIORITY_ELEMENT, PACKAGE_DATA } from "utils/constants";
import {
  getExtension,
  getMimeType,
  imageSrcs,
  isDynamicIcon,
} from "utils/functions";

const { author } = PACKAGE_DATA;

const SITE_TITLE = "Jayden Dancer | Software Engineer";
const SITE_DESCRIPTION =
  "Software Engineer crafting refined digital experiences — from full-stack web apps to browser-based operating systems. You dream it, I build it.";
const SITE_URL = author.url;
const OG_IMAGE = `${SITE_URL}/og-image.png`;

const Metadata: FC = () => {
  const { title, Favicon } = useFaviconAndTitle();
  const CustomCursor = useCursor();
  const PreloadIcons = useMemo(
    () =>
      desktopIcons.map((icon) => {
        const isSubIcon = icon.includes("/16x16/");
        const dynamicIcon = !isSubIcon && isDynamicIcon(icon);
        const extension = getExtension(icon);

        return (
          <link
            key={icon}
            as="image"
            href={dynamicIcon || isSubIcon ? undefined : icon}
            imageSrcSet={
              dynamicIcon
                ? imageSrcs(icon, 48, extension)
                : isSubIcon
                  ? imageSrcs(icon.replace("16x16/", ""), 16, extension)
                  : undefined
            }
            rel="preload"
            type={getMimeType(extension)}
            {...HIGH_PRIORITY_ELEMENT}
          />
        );
      }),
    []
  );

  return (
    <Head>
      <title>{title}</title>
      <link href="/favicon.png" rel="icon" type="image/png" />
      {Favicon}
      <meta
        content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, interactive-widget=resizes-content"
        name="viewport"
      />
      <meta content={SITE_DESCRIPTION} name="description" />
      <meta content={SITE_TITLE} property="og:title" />
      <meta content="website" property="og:type" />
      <meta content={SITE_URL} property="og:url" />
      <meta content={SITE_DESCRIPTION} property="og:description" />
      <meta content={OG_IMAGE} property="og:image" />
      <meta content={OG_IMAGE} property="og:image:secure_url" />
      <meta content="image/png" property="og:image:type" />
      <meta content="1950" property="og:image:width" />
      <meta content="598" property="og:image:height" />
      <meta content="Jayden Dancer | Software Engineer portfolio preview" property="og:image:alt" />
      <meta content={SITE_TITLE} property="og:site_name" />
      <meta content="summary_large_image" name="twitter:card" />
      <meta content={SITE_TITLE} name="twitter:title" />
      <meta content={SITE_DESCRIPTION} name="twitter:description" />
      <meta content={OG_IMAGE} name="twitter:image" />
      <meta content="Jayden Dancer | Software Engineer portfolio preview" name="twitter:image:alt" />
      <link href="/favicon.png" rel="apple-touch-icon" type="image/png" />
      {PreloadIcons}
      {CustomCursor}
    </Head>
  );
};

export default memo(Metadata);
