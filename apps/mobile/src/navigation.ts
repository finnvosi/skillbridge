// Navigation param lists for the worker vertical-slice prototype.
// Worker app only: Welcome gate, then four tabs, then stack routes
// for JobDetail / ApplyReview / Report. No auth, no backend.
import { ReportCategory } from './types';
import { DemoPassport } from './types';

export type MainTabParamList = {
  Jobs: undefined;
  Applications: undefined;
  Passport: undefined;
  Help: undefined;
};

export type RootStackParamList = {
  Welcome: undefined;
  Consent: undefined;
  Onboarding: undefined;
  PhoneSignIn: undefined;
  OtpVerify: { phone: string; demoCode?: string };
  Login: undefined;
  Register: undefined;
  WrongAccount: undefined;
  Main: { screen?: keyof MainTabParamList } | undefined;
  JobDetail: { jobId: string };
  ApplyReview: { jobId: string };
  Report: { category?: ReportCategory };
  NotificationCenter: undefined;
  SafetyCenter: undefined;
  AddWorkRecord: undefined;
  ProfileEdit: { passport: DemoPassport } | undefined;
};
