import { useEffect, useState } from "react";

export default function useCameraCoverageWarning(videoRef, active) {
  const [cameraCovered, setCameraCovered] = useState(false);

  useEffect(() => {
    if (!active) {
      setCameraCovered(false);
      return undefined;
    }

    const canvas = document.createElement("canvas");
    canvas.width = 160;
    canvas.height = 90;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    let darkSamples = 0;
    let timer;

    const inspectFrame = () => {
      const video = videoRef.current;

      if (video?.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && video.videoWidth) {
        try {
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
          let total = 0;
          let squaredTotal = 0;

          for (let index = 0; index < pixels.length; index += 4) {
            const brightness = (pixels[index] + pixels[index + 1] + pixels[index + 2]) / 3;
            total += brightness;
            squaredTotal += brightness * brightness;
          }

          const count = pixels.length / 4;
          const average = total / count;
          const variance = squaredTotal / count - average * average;
          const likelyCovered =
            (average < 35 && variance < 1200) || variance < 35;

          darkSamples = likelyCovered ? darkSamples + 1 : 0;
          setCameraCovered(darkSamples >= 3);
        } catch {
          // Camera frame access can be unavailable briefly while the stream starts.
        }
      }

      timer = window.setTimeout(inspectFrame, 500);
    };

    inspectFrame();
    return () => window.clearTimeout(timer);
  }, [active, videoRef]);

  return cameraCovered;
}
