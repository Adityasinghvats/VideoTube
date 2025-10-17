import { getVideoDurationInSeconds } from "get-video-duration";

export const getVideoDuration = (videoPath) => getVideoDurationInSeconds(videoPath)
    .then((duration) => {
        return duration;
    })
    .catch((error) => {
        throw new Error("Error extracting video duration");
    })