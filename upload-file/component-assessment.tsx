import { useState } from "react";
import { Button, FrontendAssessmentComponent } from "@examplary/ui";
import {
  FileIcon,
  Loader2Icon,
  TrashIcon,
  UploadCloudIcon,
} from "lucide-react";

const AssessmentComponent: FrontendAssessmentComponent = ({
  question,
  answer,
  saveAnswer,
  api,
  t,
}) => {
  const value = (answer?.value as string[]) || null;
  const [uploading, setUploading] = useState(false);

  const upload = async () => {
    setUploading(true);
    try {
      // TODO: make sure uploadFile is actually available in the student-facing API
      const file = await api.uploadFile(question.settings?.acceptFileTypes);
      if (file) {
        saveAnswer({ value: [file.url, file.name], completed: true });
      } else {
        setUploading(false);
      }
    } catch (e) {
      alert(e.message);
    }
    setUploading(false);
  };

  if (uploading) {
    return (
      <div className="text-zinc-500 flex items-center gap-2">
        <Loader2Icon className="animate-spin" />
        {t("uploading")}
      </div>
    );
  }

  if (!value) {
    return (
      <Button onClick={upload}>
        <UploadCloudIcon />
        {t("select-file")}
      </Button>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-5">
      <div className="flex gap-2 items-center">
        <FileIcon className="size-6 text-zinc-500" />
        <a
          href={value[0]}
          target="_blank"
          className="text-blue-500 font-medium"
        >
          {value[1]}
        </a>
      </div>
      <Button
        variant="secondary"
        size="sm"
        className="mt-4"
        onClick={() => saveAnswer({ value: "", completed: false })}
      >
        <TrashIcon />
        {t("remove-file")}
      </Button>
    </div>
  );
};

export default AssessmentComponent;
