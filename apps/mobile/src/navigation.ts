// Navigation param lists for the worker vertical-slice prototype.
// Worker app only: Welcome gate, then four tabs, then stack routes
// for JobDetail / ApplyReview / Report. No auth, no backend.
import { ReportCategory } from './types';

export type MainTabParamList = {
  Jobs: undefined;
  Applications: undefined;
  Passport: undefined;
  Help: undefined;
};

export type RootStackParamList = {
  Welcome: undefined;
  Main: { screen?: keyof MainTabParamList } | undefined;
  JobDetail: { jobId: string };
  ApplyReview: { jobId: string };
  Report: { category?: ReportCategory };
};
