export type CourseStage = string;

export interface FrontendLesson {
  id: string;
  number: number;
  stage: CourseStage;
  section?: string;
  title: string;
  duration: string;
  hours?: number;
  goal: string;
  analogy: string;
  content: string;
  practice: string;
  outcomes?: string[];
  syntax?: string;
  example?: string;
  lineByLine?: string[];
  extraExamples?: string[];
  mistakes?: string[];
  correctIncorrect?: { correct: string; incorrect: string };
  application?: string;
  selfCheck?: string[];
  successCriteria?: string[];
}

export interface CourseStageSummary {
  name: string;
  hours: number;
  lessons: string;
  description: string;
  assignment?: string;
}

export interface CourseCatalog {
  slug: string;
  title: string;
  description: string;
  totalHours: number;
  lessons: FrontendLesson[];
}

export interface DetailedCourseCatalog extends CourseCatalog {
  stages: CourseStageSummary[];
  finalProject: string;
}
