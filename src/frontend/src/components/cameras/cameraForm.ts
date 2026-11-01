import { VideoSourceKind } from "@/backend";

export interface CameraFormValues {
  name: string;
  roadName: string;
  area: string;
  latitude: string;
  longitude: string;
  rtspUrl: string;
}

export type CameraFormErrors = Partial<Record<keyof CameraFormValues, string>>;

export const EMPTY_CAMERA_FORM: CameraFormValues = {
  name: "",
  roadName: "",
  area: "",
  latitude: "",
  longitude: "",
  rtspUrl: "",
};

const URL_PATTERN = /^(rtsp|rtsps|http|https):\/\/[^\s/$.?#].[^\s]*$/i;

export function isValidStreamUrl(value: string): boolean {
  return URL_PATTERN.test(value.trim());
}

function parseCoordinate(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed === "") return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * Validates the add-camera form. The backend owns the camera code, so it is
 * not part of the form. Returns a map of field errors; empty means valid.
 */
export function validateCameraForm(values: CameraFormValues): CameraFormErrors {
  const errors: CameraFormErrors = {};

  if (values.name.trim() === "") {
    errors.name = "Camera name is required.";
  }
  if (values.roadName.trim() === "") {
    errors.roadName = "Road name is required.";
  }
  if (values.area.trim() === "") {
    errors.area = "Area is required.";
  }

  const latitude = parseCoordinate(values.latitude);
  if (values.latitude.trim() === "") {
    errors.latitude = "Latitude is required.";
  } else if (latitude === null) {
    errors.latitude = "Latitude must be a number.";
  } else if (latitude < -90 || latitude > 90) {
    errors.latitude = "Latitude must be between -90 and 90.";
  }

  const longitude = parseCoordinate(values.longitude);
  if (values.longitude.trim() === "") {
    errors.longitude = "Longitude is required.";
  } else if (longitude === null) {
    errors.longitude = "Longitude must be a number.";
  } else if (longitude < -180 || longitude > 180) {
    errors.longitude = "Longitude must be between -180 and 180.";
  }

  if (values.rtspUrl.trim() === "") {
    errors.rtspUrl = "RTSP stream URL is required.";
  } else if (!isValidStreamUrl(values.rtspUrl)) {
    errors.rtspUrl =
      "Enter a valid URL (rtsp://, rtsps://, http:// or https://).";
  }

  return errors;
}

export function hasErrors(errors: CameraFormErrors): boolean {
  return Object.keys(errors).length > 0;
}

export function toNumber(value: string): number {
  return Number(value.trim());
}

export const SOURCE_KIND_OPTIONS: Array<{
  value: VideoSourceKind;
  label: string;
  description: string;
}> = [
  {
    value: VideoSourceKind.rtspStream,
    label: "RTSP stream",
    description: "Connect a live camera feed over the network.",
  },
  {
    value: VideoSourceKind.uploadedFile,
    label: "Uploaded file",
    description: "Use a recorded MP4 or AVI clip stored with the camera.",
  },
  {
    value: VideoSourceKind.sample,
    label: "Sample video",
    description: "Use the built-in sample clip for testing the pipeline.",
  },
];

export const ACCEPTED_VIDEO_TYPES = ".mp4,.avi,video/mp4,video/x-msvideo";
