import { ImageIcon } from "lucide-react";

import { PictureChoiceOptionsArea } from "./component-area";
import { PictureChoiceQuestionComponent } from "./component-assessment";
import { PrintComponent } from "./component-print";
import { ResultsComponent } from "@/components/question-types/picture-choice/component-results";
import { translationKey } from "@/lib/i18n";
import { FrontendQuestionType } from "@/types/FrontendQuestionType";

export default {
  id: "picture-choice",
  name: translationKey("question-type.picture-choice.title"),
  description: translationKey("question-type.picture-choice.description"),
  icon: ImageIcon,

  hasSimpleScoring: true,
  timeEstimateMinutes: 1,

  settings: [],
  areas: [
    {
      id: "options",
      name: translationKey("question-type.picture-choice.options"),
      component: PictureChoiceOptionsArea,
    },
  ],

  component: PictureChoiceQuestionComponent,
  printComponent: PrintComponent,
  resultsComponent: ResultsComponent,
} as FrontendQuestionType;
