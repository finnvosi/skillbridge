// Minimal local i18n for the worker vertical slice.
// Khmer-first. No external deps (i18next not installed in this slice).
// Strings are respectful adult copy; no glassmorphism / marketing fluff.
import { Locale } from './types';

type Dict = Record<string, string>;

// Khmer first, then English. Keys are stable English identifiers.
const km: Dict = {
  'app.name': 'SkillBridge',
  'app.uvp': 'រកការងារដែលអាចជឿទុកចិត្តបាន។ ផ្ទៀងផ្ទាត់ជំនាញរបស់អ្នក។ បង្កើតកំណត់ត្រាអាជីពដែលអ្នកជាម្ចាស់ផ្ទះ។',
  'welcome.title': 'ស្វាគមន៍មកកាន់ SkillBridge',
  'welcome.subtitle': 'រកការងារដែលបានផ្ទៀងផ្ទាត់ នៅកម្ពុជា',
  'welcome.chooseLanguage': 'ជ្រើសរើសភាសា',
  'welcome.khmer': 'ខ្មែរ',
  'welcome.english': 'English',
  'welcome.continue': 'ចាប់ផ្តើម',
  'welcome.demoNote': 'នេះគឺជាកម្មវិធីសាកល្បង។ គ្មានការភ្ជាប់ជាមួយម៉ាស៊ីនមេផលិតកម្មទេ។',

  'tab.jobs': 'ការងារ',
  'tab.applications': 'ពាក្យសុំ',
  'tab.passport': 'លិខិតឆ្លង',
  'tab.help': 'ជំនួយ',

  'jobs.title': 'ការងារដែលបានផ្ទៀងផ្ទាត់',
  'jobs.subtitle': 'ការងាររោងចក្រដែលបានពិនិត្យរួច',
  'jobs.search': 'ស្វែងរកការងារ ឬជំនាញ',
  'jobs.filterNear': 'ក្បែរខ្ញុំ',
  'jobs.filterDay': 'វេនថ្ងៃ',
  'jobs.filterSalary': 'ប្រាក់ខែ',
  'jobs.jobChecked': 'ការងារបានផ្ទៀងផ្ទាត់',
  'jobs.companyChecked': 'ក្រុមហ៊ុនបានផ្ទៀងផ្ទាត់',
  'jobs.identityChecked': 'អត្តសញ្ញាណបានផ្ទៀងផ្ទាត់',
  'jobs.youMatch': 'អ្នកផ្គូផ្គង {n}/{m} ជំនាញ',
  'jobs.km': 'គម',
  'jobs.viewJob': 'មើលការងារ',
  'jobs.results': 'ការងារ {n} បានផ្ទៀងផ្ទាត់',
  'jobs.loading': 'កំពុងផ្ទុកការងារ...',
  'jobs.empty': 'មិនមានការងារដែលត្រូវនឹងតម្រងទេ។',
  'jobs.emptySub': 'សាកល្បងលុបតម្រង ឬជ្រើស "ក្បែរខ្ញុំ"។',
  'jobs.error': 'មិនអាចផ្ទុកការងារបានទេ។',
  'jobs.retry': 'ព្យាយាមម្តងទៀត',

  'job.pay': 'ប្រាក់ខែ',
  'job.shift': 'វេន',
  'job.distance': 'ចម្ងាយ',
  'job.day': 'វេនថ្ងៃ',
  'job.night': 'វេនយប់',
  'job.rotating': 'វេនស្លែង',
  'job.flexible': 'បត់បែន',
  'job.fullTime': 'ពេញម៉ោង',
  'job.type': 'ប្រភេទការងារ',
  'job.contract': 'កិច្ចសន្យា',
  'job.seasonal': 'រដូវកាល',
  'job.lastChecked': 'បានពិនិត្យ {date}',
  'job.seeWhatChecked': 'មើលអ្វីដែលបានផ្ទៀងផ្ទាត់',
  'job.whyMatches': 'ហេតុអ្វីវាផ្គូផ្គងអ្នក',
  'job.matchingSkills': 'ជំនាញដែលផ្គូផ្គង',
  'job.missingRequirements': 'តម្រូវការខ្វះខាត',
  'job.conditions': 'លក្ខខណ្ឌការងារ',
  'job.accommodation': 'កន្លែងស្នាក់នៅ',
  'job.transport': 'ឡានដឹកជញ្ជូន',
  'job.overtime': 'បន្ថែមម៉ោង',
  'job.leave': 'ច្បាប់',
  'job.weChecked': 'យើងបានពិនិត្យក្រុមហ៊ុន និងការបើកតួនេះ',
  'job.whatChecked': 'អ្វីដែលបានផ្ទៀងផ្ទាត់',
  'job.cannotGuarantee': 'អ្វីដែល SkillBridge មិនអាចធានាបាន',
  'job.applyWithPassport': 'ដាក់ពាក្យជាមួយលិខិតឆ្លង',
  'job.reportConcern': 'រាយការណ៍កង្វល់',
  'job.back': 'ត្រឡប់',
  'job.details': 'ព័ត៌មានការងារ',

  'apply.review': 'ពិនិត្យពាក្យសុំ',
  'apply.companyReceives': 'ក្រុមហ៊ុននឹងទទួលបាន៖',
  'apply.nameContact': 'ឈ្មោះ និងទំនាក់ទំនក',
  'apply.matchingSkills': 'ជំនាញដែលផ្គូផ្គង',
  'apply.workRecords': 'កំណត់ត្រាការងារដែលផ្ទៀងផ្ទាត់',
  'apply.hideCertificate': 'លាក់ព័ត៌មានវិញ្ញាបនបត្រ',
  'apply.certHidden': 'ព័ត៌មានជំនាញ និងកំណត់ត្រាការងារត្រូវបានលាក់ពីក្រុមហ៊ុន។',
  'apply.noPayment': 'មិនតម្រូវឱ្យបង់ប្រាក់ដើម្បីដាក់ពាក្យទេ។',
  'apply.demoNote': 'នេះគឺជាសាកល្បង។ ពាក្យសុំមិនត្រូវបានផ្ញើទៅក្រុមហ៊ុនពិតទេ។',
  'apply.submit': 'ដាក់ពាក្យសុំ',
  'apply.submitting': 'កំពុងដាក់ពាក្យ...',
  'apply.done': 'ពាក្យសុំបានដាក់',
  'apply.doneSub': 'អ្នកអាចតាមដានស្ថានភាពនៅផ្ទាំង "ពាក្យសុំ"។',
  'apply.viewApplications': 'មើលពាក្យសុំរបស់ខ្ញុំ',

  'applications.title': 'ពាក្យសុំរបស់ខ្ញុំ',
  'applications.empty': 'អ្នកមិនទាន់ដាក់ពាក្យសុំទេ។',
  'applications.emptySub': 'ស្វែងរកការងារ ហើយដាក់ពាក្យជាមួយលិខិតឆ្លងរបស់អ្នក។',
  'applications.submitted': 'បានដាក់ពាក្យ',
  'applications.underReview': 'កំពុងពិនិត្យ',
  'applications.interview': 'សម្ភាសន៍',
  'applications.accepted': 'បានទទួលយក',
  'applications.declined': 'បានបដិសេធ',
  'applications.withdrawn': 'បានដកពាក្យ',
  'applications.submittedAt': 'បានដាក់ {date}',
  'applications.viewJob': 'មើលការងារ',
  'applications.demo': 'សាកល្បង',

  'passport.title': 'លិខិតឆ្លងអាជីព',
  'passport.share': 'ចែករំលែក',
  'passport.identity': 'អត្តសញ្ញាណ',
  'passport.identityVerified': 'អត្តសញ្ញាណបានផ្ទៀងផ្ទាត់',
  'passport.verifiedWork': 'ការងារដែលផ្ទៀងផ្ទាត់',
  'passport.skills': 'ជំនាញ',
  'passport.verified': 'បានផ្ទៀងផ្ទាត់',
  'passport.selfDeclared': 'ប្រកាសដោយខ្លួនឯង',
  'passport.languages': 'ភាសា',
  'passport.safety': 'វិញ្ញាបនបត្រសុវត្ថិភាព',
  'passport.shareOn': 'ការចែករំលែកបើក',
  'passport.shareOff': 'ការចែករំលែកបិទ',
  'passport.shareDemo': 'សាកល្បង៖ ការចែករំលែកត្រូវបានក្លែងបន្លំ។ លិខិតឆ្លងរបស់អ្នកមិនត្រូវបានផ្ញើទៅទីណាទេ។',
  'passport.requestVerification': 'ស្នើការផ្ទៀងផ្ទាត់ការងារ',
  'passport.demoState': 'ស្ថានភាពសាកល្បង',
  'passport.demoNote': 'លិខិតឆ្លងនេះស្ថិតនៅក្នុងឧបករណ៍របស់អ្នក។ វាមិនត្រូវបានផ្ញើទៅម៉ាស៊ីនមេទេ។',
  'passport.readiness': 'រួចរាល់ {n}% សម្រាប់ពាក្យសុំ',

  'help.title': 'សុវត្ថិភាព និងជំនួយ',
  'help.subtitle': 'ការពារខ្លួនពីការក្លែងបន្លំ',
  'help.scamTitle': 'សញ្ញាប្រុងប្រយ័ត្នក្លែងបន្លំ',
  'help.cat.payment': 'គេសុំឱ្យអ្នកបង់ប្រាក់',
  'help.cat.false': 'ព័ត៌មានការងារមិនពិត',
  'help.cat.identity': 'ការសង្ស័យអត្តសញ្ញាណអ្នកជ្រើសរើស',
  'help.cat.unsafe': 'ការទំនាក់ទំនងមិនមានសុវត្ថិភាព',
  'help.cat.other': 'រឿងផ្សេងទៀត',
  'help.report': 'រាយការណ៍កង្វល់',
  'help.noApplyNeeded': 'អ្នកអាចរាយការណ៍ដោយមិនចាំបាច់ដាក់ពាក្យ។',
  'help.promise': 'SkillBridge មិនដែលនិយាយថា "សុវត្ថិភាព ១០០%"។ យើងផ្ទៀងផ្ទាត់ ប៉ុន្តែមិនអាចធានាអត្តិបត្តិរបស់ថៅកែបានទេ។',

  'report.title': 'រាយការណ៍កង្វល់',
  'report.whatHappened': 'តើមានរឿងអ្វីកើតឡើង?',
  'report.whatPlaceholder': 'ឧ. គេសុំឱ្យខ្ញុំបង់ប្រាក់ ២០ដុល្លារមុនពេលសម្ភាសន៍។',
  'report.addEvidence': 'បន្ថែមភ័ស្តុតាង (ស្រេចចិត្ត)',
  'report.evidencePlaceholder': 'តំណភ្ជាប់ ឬព័ត៌មានបន្ថែម...',
  'report.send': 'ផ្ញើរដាក់រាយការណ៍',
  'report.notShown': 'របាយការណ៍មិនត្រូវបង្ហាញទៅអ្នកជ្រើសរើសទេ។',
  'report.demo': 'នេះគឺជាសាកល្បង។ របាយការណ៍មិនត្រូវបានផ្ញើទៅទីណាទេ។',
  'report.confirmTitle': 'បានកត់ត្រារបាយការណ៍សាកល្បង',
  'report.confirmSub': 'អ្នកជ្រើសរើសមិនឃើញរបាយការណ៍នេះទេ។ នេះគឺជាកម្មវិធីសាកល្បង — របាយការណ៍មិនត្រូវបានផ្ញើទៅម៉ាស៊ីនមេទេ។',
  'report.done': 'រួចរាល់',

  'common.demo': 'សាកល្បង',
  'common.yes': 'មាន',
  'common.no': 'គ្មាន',
  'common.close': 'បិទ',
  'common.back': 'ត្រឡប់',
  'common.cancel': 'បោះបង់',
  'common.km': 'ខ្មែរ',
  'common.en': 'EN',
  'common.loading': 'កំពុងផ្ទុក...',
};

const en: Dict = {
  'app.name': 'SkillBridge',
  'app.uvp': 'Find trusted work. Prove your skills. Build a career record you own.',
  'welcome.title': 'Welcome to SkillBridge',
  'welcome.subtitle': 'Verified work, in Cambodia',
  'welcome.chooseLanguage': 'Choose your language',
  'welcome.khmer': 'ខ្មែរ',
  'welcome.english': 'English',
  'welcome.continue': 'Get started',
  'welcome.demoNote': 'This is a demo prototype. It is not connected to a live server.',

  'tab.jobs': 'Jobs',
  'tab.applications': 'Applications',
  'tab.passport': 'Passport',
  'tab.help': 'Help',

  'jobs.title': 'Verified jobs',
  'jobs.subtitle': 'Reviewed factory jobs only',
  'jobs.search': 'Search job or skill',
  'jobs.filterNear': 'Near me',
  'jobs.filterDay': 'Day shift',
  'jobs.filterSalary': 'Salary',
  'jobs.jobChecked': 'Job checked',
  'jobs.companyChecked': 'Company checked',
  'jobs.identityChecked': 'Identity checked',
  'jobs.youMatch': 'You match {n} of {m} skills',
  'jobs.km': 'km',
  'jobs.viewJob': 'View job',
  'jobs.results': '{n} verified jobs',
  'jobs.loading': 'Loading jobs...',
  'jobs.empty': 'No jobs match your filters.',
  'jobs.emptySub': 'Try clearing filters or selecting "Near me".',
  'jobs.error': 'Could not load jobs.',
  'jobs.retry': 'Retry',

  'job.pay': 'Pay',
  'job.shift': 'Shift',
  'job.distance': 'Distance',
  'job.day': 'Day',
  'job.night': 'Night',
  'job.rotating': 'Rotating',
  'job.flexible': 'Flexible',
  'job.fullTime': 'Full-time',
  'job.type': 'Job type',
  'job.contract': 'Contract',
  'job.seasonal': 'Seasonal',
  'job.lastChecked': 'Checked {date}',
  'job.seeWhatChecked': 'See what was checked',
  'job.whyMatches': 'Why it matches you',
  'job.matchingSkills': 'Matching skills',
  'job.missingRequirements': 'Missing requirements',
  'job.conditions': 'Work conditions',
  'job.accommodation': 'Accommodation',
  'job.transport': 'Transport',
  'job.overtime': 'Overtime',
  'job.leave': 'Leave',
  'job.weChecked': 'We checked the company and this vacancy',
  'job.whatChecked': 'What was checked',
  'job.cannotGuarantee': "What SkillBridge cannot guarantee",
  'job.applyWithPassport': 'Apply with Passport',
  'job.reportConcern': 'Report a concern',
  'job.back': 'Back',
  'job.details': 'Job details',

  'apply.review': 'Review application',
  'apply.companyReceives': 'The company will receive:',
  'apply.nameContact': 'Name and contact',
  'apply.matchingSkills': 'Matching skills',
  'apply.workRecords': 'Verified work records',
  'apply.hideCertificate': 'Hide certificate details',
  'apply.certHidden': 'Your skills and work records are hidden from the company.',
  'apply.noPayment': 'No payment is required to apply.',
  'apply.demoNote': 'This is a demo. Your application is not sent to a real company.',
  'apply.submit': 'Submit application',
  'apply.submitting': 'Submitting...',
  'apply.done': 'Application submitted',
  'apply.doneSub': 'Track status in the Applications tab.',
  'apply.viewApplications': 'View my applications',

  'applications.title': 'My applications',
  'applications.empty': 'You have not applied yet.',
  'applications.emptySub': 'Browse jobs and apply with your Passport.',
  'applications.submitted': 'Submitted',
  'applications.underReview': 'Under review',
  'applications.interview': 'Interview',
  'applications.accepted': 'Accepted',
  'applications.declined': 'Declined',
  'applications.withdrawn': 'Withdrawn',
  'applications.submittedAt': 'Submitted {date}',
  'applications.viewJob': 'View job',
  'applications.demo': 'Demo',

  'passport.title': 'Career Passport',
  'passport.share': 'Share',
  'passport.identity': 'Identity',
  'passport.identityVerified': 'Identity verified',
  'passport.verifiedWork': 'Verified work',
  'passport.skills': 'Skills',
  'passport.verified': 'Verified',
  'passport.selfDeclared': 'Self-declared',
  'passport.languages': 'Languages',
  'passport.safety': 'Safety qualifications',
  'passport.shareOn': 'Sharing on',
  'passport.shareOff': 'Sharing off',
  'passport.shareDemo': 'Demo: sharing is simulated. Your Passport is not sent anywhere.',
  'passport.requestVerification': 'Request work verification',
  'passport.demoState': 'Demo state',
  'passport.demoNote': 'This Passport stays on your device. It is not sent to a server.',
  'passport.readiness': 'Ready for applications: {n}%',

  'help.title': 'Safety & help',
  'help.subtitle': 'Protect yourself from scams',
  'help.scamTitle': 'Scam warning signs',
  'help.cat.payment': 'Asked me to pay money',
  'help.cat.false': 'Job information is false',
  'help.cat.identity': 'Recruiter identity concern',
  'help.cat.unsafe': 'Unsafe or abusive contact',
  'help.cat.other': 'Something else',
  'help.report': 'Report a concern',
  'help.noApplyNeeded': 'You can report without applying.',
  'help.promise': 'SkillBridge never says "100% safe". We verify, but cannot guarantee employer conduct.',

  'report.title': 'Report a concern',
  'report.whatHappened': 'What happened?',
  'report.whatPlaceholder': 'e.g. They asked me to pay $20 before the interview.',
  'report.addEvidence': 'Add optional evidence',
  'report.evidencePlaceholder': 'A link or extra details...',
  'report.send': 'Send report',
  'report.notShown': 'Reports are not shown to the recruiter.',
  'report.demo': 'This is a demo. Your report is not sent anywhere.',
  'report.confirmTitle': 'Demo report recorded',
  'report.confirmSub': 'The recruiter does not see this report. This is a local prototype — the report is not sent to a server.',
  'report.done': 'Done',

  'common.demo': 'Demo',
  'common.yes': 'Yes',
  'common.no': 'No',
  'common.close': 'Close',
  'common.back': 'Back',
  'common.cancel': 'Cancel',
  'common.km': 'ខ្មែរ',
  'common.en': 'EN',
  'common.loading': 'Loading...',
};

const TABLES: Record<Locale, Dict> = { km, en };

let current: Locale = 'km';

export function getLocale(): Locale {
  return current;
}

export function setLocale(locale: Locale): void {
  current = locale;
}

export function t(
  key: string,
  vars?: Record<string, string | number>,
  localeOverride?: Locale
): string {
  const locale = localeOverride ?? current;
  const table = TABLES[locale] ?? en;
  let str = table[key] ?? en[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    }
  }
  return str;
}

export function formatDate(iso: string, locale: Locale = current): string {
  // Demo date formatting. Khmer uses Khmer month names + Khmer numerals;
  // English uses short Latin month names. No external locale dependency.
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const day = d.getDate();
  const month = d.getMonth();
  const year = d.getFullYear();

  if (locale === 'km') {
    const KM_MONTHS = [
      'មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា',
      'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ',
    ];
    const KM_DIGITS = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
    const toKmNum = (n: number) => String(n).split('').map((c) => KM_DIGITS[Number(c)]).join('');
    return `${toKmNum(day)} ${KM_MONTHS[month]} ${toKmNum(year)}`;
  }

  const enMonth = d.toLocaleString('en-US', { month: 'short' });
  return `${day} ${enMonth} ${year}`;
}
