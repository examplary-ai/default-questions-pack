import { useEffect, useRef, useState } from "react";
import { Button, FrontendAssessmentComponent } from "@examplary/ui";
import { Loader2Icon, MicIcon, SquareIcon } from "lucide-react";

type AudioAnswerValue = [string, string, string?, string?];
type RecorderStatus = "idle" | "recording" | "uploading";

const MIME_TYPES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/mp4",
  "audio/ogg;codecs=opus",
  "audio/ogg",
];

const getMimeType = () =>
  MIME_TYPES.find((type) => MediaRecorder.isTypeSupported(type)) || "";

const getExtension = (mimeType: string) => {
  if (mimeType.includes("mp4")) return "m4a";
  if (mimeType.includes("ogg")) return "ogg";
  return "webm";
};

const formatDuration = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
};

const stopStream = (stream: MediaStream | null) => {
  stream?.getTracks().forEach((track) => track.stop());
};

const AssessmentComponent: FrontendAssessmentComponent = ({
  question,
  answer,
  saveAnswer,
  api,
  t,
  reviewMode,
}) => {
  const value = Array.isArray(answer?.value)
    ? (answer.value as AudioAnswerValue)
    : null;
  const maxDurationSeconds = Number(
    question.settings?.maxDurationSeconds || 300,
  );

  const [status, setStatus] = useState<RecorderStatus>("idle");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [error, setError] = useState("");

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const intervalRef = useRef<number | null>(null);
  const startedAtRef = useRef(0);

  const clearTimer = () => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const stopRecording = () => {
    clearTimer();
    const recorder = recorderRef.current;
    if (recorder?.state === "recording") {
      recorder.stop();
    }
  };

  useEffect(
    () => () => {
      clearTimer();
      if (recorderRef.current?.state === "recording") {
        recorderRef.current.stop();
      }
      stopStream(streamRef.current);
    },
    [],
  );

  const startRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      setError(t("microphone-unavailable"));
      return;
    }

    setError("");
    chunksRef.current = [];
    setElapsedSeconds(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = getMimeType();
      const recorder = new MediaRecorder(
        stream,
        mimeType ? { mimeType } : undefined,
      );

      streamRef.current = stream;
      recorderRef.current = recorder;
      startedAtRef.current = Date.now();

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        clearTimer();
        setStatus("uploading");

        try {
          const duration = Math.max(
            1,
            Math.round((Date.now() - startedAtRef.current) / 1000),
          );
          const type = recorder.mimeType || mimeType || "audio/webm";
          const blob = new Blob(chunksRef.current, { type });
          const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
          const file = new File(
            [blob],
            `Voice recording ${timestamp}.${getExtension(type)}`,
            { type },
          );
          const uploadPickedFile = (
            api as typeof api & {
              uploadPickedFile?: (file: File) => Promise<{
                url: string;
                name: string;
              }>;
            }
          ).uploadPickedFile;

          if (!uploadPickedFile) {
            throw new Error("upload-unavailable");
          }

          const uploadedFile = await uploadPickedFile(file);
          saveAnswer({
            value: [
              uploadedFile.url,
              uploadedFile.name || file.name,
              type,
              String(duration),
            ],
            completed: true,
          });
        } catch (e) {
          console.error(e);
          setError(
            e instanceof Error && e.message === "upload-unavailable"
              ? t("upload-unavailable")
              : t("upload-failed"),
          );
        } finally {
          stopStream(streamRef.current);
          streamRef.current = null;
          recorderRef.current = null;
          chunksRef.current = [];
          setStatus("idle");
        }
      };

      recorder.start();
      setStatus("recording");

      intervalRef.current = window.setInterval(() => {
        const nextElapsed = Math.round(
          (Date.now() - startedAtRef.current) / 1000,
        );
        setElapsedSeconds(nextElapsed);

        if (nextElapsed >= maxDurationSeconds) {
          stopRecording();
        }
      }, 250);
    } catch (e) {
      console.error(e);
      stopStream(streamRef.current);
      streamRef.current = null;
      setStatus("idle");
      setError(t("microphone-denied"));
    }
  };

  if (status === "uploading") {
    return (
      <div className="text-zinc-500 flex items-center gap-2">
        <Loader2Icon className="size-5 animate-spin" />
        {t("uploading")}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {value && status !== "recording" ? (
        <div className="min-w-64 flex-1">
          <div className="text-sm font-medium text-zinc-700">
            {t("recorded-answer")}
            {value[3] ? ` - ${formatDuration(Number(value[3]))}` : ""}
          </div>
          <audio controls src={value[0]} className="mt-2 w-full max-w-128" />
        </div>
      ) : null}

      {!reviewMode ? (
        <div className="flex flex-wrap items-center gap-2">
          {status === "recording" ? (
            <Button variant="destructive" onClick={stopRecording}>
              <SquareIcon />
              {t("stop-recording")}
            </Button>
          ) : (
            <Button onClick={startRecording}>
              <MicIcon />
              {value ? t("replace-recording") : t("start-recording")}
            </Button>
          )}

          {status === "recording" ? (
            <div className="text-sm text-zinc-600">
              {t("recording")} {formatDuration(elapsedSeconds)} /{" "}
              {formatDuration(maxDurationSeconds)}
            </div>
          ) : null}
        </div>
      ) : null}

      {error ? <div className="text-sm text-red-600">{error}</div> : null}
    </div>
  );
};

export default AssessmentComponent;
