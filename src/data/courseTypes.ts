export type CourseStage = 'HTML' | 'CSS' | 'JavaScript';

export interface FrontendLesson {
  id: string;
  number: number;
  stage: CourseStage;
  title: string;
  duration: string;
  goal: string;
  analogy: string;
  content: string;
  practice: string;
}

export interface CourseCatalog {
  slug: string;
  title: string;
  description: string;
  totalHours: number;
  lessons: FrontendLesson[];
}
