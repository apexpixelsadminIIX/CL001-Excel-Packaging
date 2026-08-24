import { Helmet } from "react-helmet-async";

const SITE_NAME = "Excel Packaging and Taste Foods";
const OG_IMAGE = "/assets/759ad57b24c38f65.jpeg";

const origin = typeof window !== "undefined" ? window.location.origin : "";

export default function Seo({ title, description, keywords, path = "/", image = OG_IMAGE, type = "website", jsonLd }) {
  const url = `${origin}${path}`;
  const absImage = image && image.startsWith("http") ? image : `${origin}${image}`;
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;

  return (
    <Helmet prioritizeSeoTags>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={url} />

      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={absImage} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={absImage} />

      {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
    </Helmet>
  );
}
