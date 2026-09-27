import { Config } from "@remotion/cli/config";

// PNG frame capture avoids a lossy JPEG pass on every frame before the
// final video encode — on flat cartoon art with sharp black outlines,
// JPEG's per-frame compression shows up as visible ringing/banding along
// those edges. PNG frames cost more render time but the content here
// renders in seconds either way, and every deliverable has enormous size
// headroom under the platform limits.
Config.setVideoImageFormat("png");
Config.setOverwriteOutput(true);
Config.setBrowserExecutable(
  "/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell"
);
