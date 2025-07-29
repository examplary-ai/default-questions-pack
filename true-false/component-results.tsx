import { FrontendResultsComponent } from "@examplary/ui";

const ResultsComponent: FrontendResultsComponent = ({ answer, t }) => {
  if (!answer.value) return null;

  if (answer.value === "true") {
    return t("true");
  }
  if (answer.value === "false") {
    return t("false");
  }
};

export default ResultsComponent;
