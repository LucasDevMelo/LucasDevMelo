import { ImageResponse } from "next/og";
import { productConfig } from "@/config/product";

export const alt = `${productConfig.productName} — ${productConfig.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "radial-gradient(circle at 50% 30%, #23427c 0%, #0d1f3f 60%)",
          color: "#f7f3ea",
          fontFamily: "serif",
        }}
      >
        <div style={{ fontSize: 28, letterSpacing: 8, color: "#d9b86c", textTransform: "uppercase" }}>
          {productConfig.eventDateLabel}
        </div>
        <div style={{ fontSize: 96, fontWeight: 700, marginTop: 24 }}>{productConfig.productName}</div>
        <div style={{ fontSize: 36, marginTop: 20, color: "#c7cfe0", maxWidth: 900, textAlign: "center" }}>
          {productConfig.tagline}
        </div>
      </div>
    ),
    size,
  );
}
