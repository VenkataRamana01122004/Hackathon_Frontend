
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

    const context = canvas.getContext("2d", {
      willReadFrequently: true,
    });

    if (!context) return undefined;

    let coveredSamples = 0;
    let intervalId = null;

    const inspectFrame = () => {
      const video = videoRef.current;

      if (
        !video ||
        video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA ||
        !video.videoWidth ||
        !video.videoHeight
      ) {
        return;
      }

      try {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        const pixels = context.getImageData(
          0,
          0,
          canvas.width,
          canvas.height
        ).data;

        let total = 0;
        let squaredTotal = 0;

        for (let index = 0; index < pixels.length; index += 4) {
          const brightness =
            (pixels[index] + pixels[index + 1] + pixels[index + 2]) / 3;

          total += brightness;
          squaredTotal += brightness * brightness;
        }

        const count = pixels.length / 4;
        const average = total / count;
        const variance = squaredTotal / count - average * average;

        // Detect a very dark and nearly uniform camera frame.
        const likelyCovered = average < 20 && variance < 500;

        if (likelyCovered) {
          coveredSamples += 1;
        } else {
          coveredSamples = 0;
        }

        // 2 consecutive samples at 300 ms = approximately 600 ms.
        setCameraCovered(coveredSamples >= 2);
      } catch (error) {
        // Ignore temporary frame-access errors.
        console.debug("Camera coverage inspection skipped:", error);
      }
    };

    // Check immediately, then every 300 ms.
    inspectFrame();
    intervalId = window.setInterval(inspectFrame, 300);

    return () => {
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [active, videoRef]);

  return cameraCovered;
}
