export const USER_ROLES = [
  { id: '1', label: 'Student', description: 'Current students of JnU' },
  { id: '2', label: 'Teacher', description: 'Faculty members of JnU' },
  { id: '3', label: 'Staff', description: 'Administrative and support staff' },
  { id: '4', label: 'Nearby Resident', description: 'People living around the campus area' },
];

export const SERVICE_CATEGORIES = [
  { id: '1', title: 'Home Tutor', icon: 'book', color: '#4b83f2', description: 'Find reliable tutors for all subjects.', route: '/home-tutor' },
  { id: '2', title: 'Tuition Jobs', icon: 'briefcase', color: '#22c55e', description: 'Find tuition opportunities near you.', route: '/tuition-jobs' },
  { id: '3', title: 'Printing & Copy', icon: 'print', color: '#10b981', description: 'Quick document printing and delivery.', route: '/printing' },
  { id: '4', title: 'Cleaning', icon: 'trash', color: '#f59e0b', description: 'Room, flat, and laundry cleaning.', route: '/cleaning' },
  { id: '5', title: 'Photography', icon: 'camera', color: '#ef4444', description: 'Event and personal photography.', route: '/photography' },
  { id: '6', title: 'Student Panel', icon: 'user', color: '#8b5cf6', description: 'Academic info, CGPA, and results.', route: '/student-panel' },

  { id: '7', title: 'Campus Ride', icon: 'bus', color: '#ec4899', description: 'Bus schedule and seat booking.', route: '/campus-ride' },
  { id: '8', title: 'Food Delivery', icon: 'coffee', color: '#f97316', description: 'Order snacks and meals on campus.', route: '/food' },
  { id: '9', title: 'Roommate Finder', icon: 'users', color: '#06b6d4', description: 'Find roommates near campus.', route: '/roommate' },
  { id: '10', title: 'Notes & Resources', icon: 'file-text', color: '#84cc16', description: 'Get class notes and PDFs.', route: '/notes' },
];

// Demo Data for Home Tutor Management
export const TUTORS = [
  { id: 't1', name: 'Rahim Uddin', department: 'Computer Science & Engineering (CSE)', subject: 'Programming, Data Structures', rating: 4.8, rate: '৳4000/mo', availableDays: '3 Days/Week', avatar: 'RU' },
  { id: 't2', name: 'Fatema Akter', department: 'Mathematics', subject: 'Higher Math, Algebra', rating: 4.9, rate: '৳5000/mo', availableDays: '4 Days/Week', avatar: 'FA' },
  { id: 't3', name: 'Sajid Hasan', department: 'English', subject: 'English Grammar, Writing', rating: 4.5, rate: '৳3500/mo', availableDays: '3 Days/Week', avatar: 'SH' },
  { id: 't4', name: 'Nusrat Jahan', department: 'Physics', subject: 'Physics, Mechanics', rating: 4.7, rate: '৳4500/mo', availableDays: '3 Days/Week', avatar: 'NJ' },

  { id: 't5', name: 'Mahmudul Hasan', department: 'Computer Science & Engineering (CSE)', subject: 'Database, Algorithms', rating: 4.6, rate: '৳4200/mo', availableDays: '4 Days/Week', avatar: 'MH' },
  { id: 't6', name: 'Tasnim Jahan', department: 'Chemistry', subject: 'Organic Chemistry, Inorganic', rating: 4.7, rate: '৳4300/mo', availableDays: '3 Days/Week', avatar: 'TJ' },
  { id: 't7', name: 'Rakibul Islam', department: 'Physics', subject: 'Electromagnetism', rating: 4.4, rate: '৳3800/mo', availableDays: '3 Days/Week', avatar: 'RI' },
  { id: 't8', name: 'Sharmin Sultana', department: 'Biochemistry & Molecular Biology', subject: 'Biology, Biochemistry', rating: 4.8, rate: '৳4700/mo', availableDays: '4 Days/Week', avatar: 'SS' },
  { id: 't9', name: 'Ariful Haque', department: 'Statistics', subject: 'Statistics, Probability', rating: 4.5, rate: '৳3900/mo', availableDays: '3 Days/Week', avatar: 'AH' },
  { id: 't10', name: 'Jannatul Ferdous', department: 'English', subject: 'Literature, Writing', rating: 4.9, rate: '৳5000/mo', availableDays: '4 Days/Week', avatar: 'JF' },

  { id: 't11', name: 'Imran Hossain', department: 'Computer Science & Engineering (CSE)', subject: 'Web Development, ICT', rating: 4.6, rate: '৳4200/mo', availableDays: '3 Days/Week', avatar: 'IH' },
  { id: 't12', name: 'Nabila Noor', department: 'Mathematics', subject: 'Calculus, Linear Algebra', rating: 4.8, rate: '৳4600/mo', availableDays: '5 Days/Week', avatar: 'NN' },
  { id: 't13', name: 'Shuvo Roy', department: 'Management Studies', subject: 'Accounting, Finance', rating: 4.4, rate: '৳3700/mo', availableDays: '3 Days/Week', avatar: 'SR' },
  { id: 't14', name: 'Farhan Ahmed', department: 'Physics', subject: 'Quantum Physics', rating: 4.6, rate: '৳4100/mo', availableDays: '4 Days/Week', avatar: 'FA' },
  { id: 't15', name: 'Rima Sultana', department: 'Chemistry', subject: 'Analytical Chemistry', rating: 4.7, rate: '৳4400/mo', availableDays: '3 Days/Week', avatar: 'RS' },

  { id: 't16', name: 'Omar Faruk', department: 'Economics', subject: 'Microeconomics, Macroeconomics', rating: 4.3, rate: '৳3600/mo', availableDays: '2 Days/Week', avatar: 'OF' },
  { id: 't17', name: 'Lamia Rahman', department: 'English', subject: 'IELTS, Spoken English', rating: 4.9, rate: '৳5200/mo', availableDays: '4 Days/Week', avatar: 'LR' },
  { id: 't18', name: 'Sabbir Khan', department: 'Computer Science & Engineering (CSE)', subject: 'App Development, ICT', rating: 4.5, rate: '৳4000/mo', availableDays: '3 Days/Week', avatar: 'SK' },
  { id: 't19', name: 'Mehedi Hasan', department: 'Pharmacy', subject: 'Pharmacology, Biology', rating: 4.6, rate: '৳4300/mo', availableDays: '4 Days/Week', avatar: 'MH' },
  { id: 't20', name: 'Sadia Islam', department: 'Sociology', subject: 'Social Science, Research', rating: 4.7, rate: '৳4200/mo', availableDays: '3 Days/Week', avatar: 'SI' },
];

export const TUITION_JOBS = [
  { id: 'j1', title: 'Need Math Tutor for Class 9', classLevel: 'Class 9', location: 'Sutrapur', salary: '৳3500', days: '3 Days/Week', postedBy: 'Resident' },
  { id: 'j2', title: 'English & Biology for SSC Candidate', classLevel: 'Class 10 (SSC)', location: 'Tantibazar', salary: '৳5000', days: '4 Days/Week', postedBy: 'Resident' },
  { id: 'j3', title: 'Computer Science Tutor needed', classLevel: 'HSC 1st Year', location: 'Wari', salary: '৳4000', days: '3 Days/Week', postedBy: 'Resident' },
  { id: 'j4', title: 'All Subjects for Class 5 Student', classLevel: 'Class 5', location: 'Luxmibazar', salary: '৳2500', days: '4 Days/Week', postedBy: 'Resident' },

  { id: 'j5', title: 'Physics Tutor for HSC 2nd Year', classLevel: 'HSC 2nd Year', location: 'Gendaria', salary: '৳5500', days: '3 Days/Week', postedBy: 'Guardian' },
  { id: 'j6', title: 'Need Female Tutor for Class 7', classLevel: 'Class 7', location: 'Bangshal', salary: '৳3000', days: '4 Days/Week', postedBy: 'Guardian' },
  { id: 'j7', title: 'ICT Tutor for SSC Student', classLevel: 'Class 10 (SSC)', location: 'Narinda', salary: '৳3800', days: '3 Days/Week', postedBy: 'Resident' },
  { id: 'j8', title: 'English Medium Student (Grade 6)', classLevel: 'Grade 6', location: 'Lalbagh', salary: '৳6000', days: '5 Days/Week', postedBy: 'Guardian' },
  { id: 'j9', title: 'Higher Math Tutor Needed', classLevel: 'HSC 1st Year', location: 'Chawk Bazar', salary: '৳4500', days: '3 Days/Week', postedBy: 'Resident' },
  { id: 'j10', title: 'Primary Student All Subjects', classLevel: 'Class 3', location: 'Islampur', salary: '৳2200', days: '4 Days/Week', postedBy: 'Guardian' },

  { id: 'j11', title: 'Chemistry Tutor for SSC Exam', classLevel: 'Class 10 (SSC)', location: 'Kotwali', salary: '৳4200', days: '3 Days/Week', postedBy: 'Resident' },
  { id: 'j12', title: 'Need CSE Student for Programming Basics', classLevel: 'HSC / Admission', location: 'Jatrabari', salary: '৳5000', days: '3 Days/Week', postedBy: 'Guardian' },
  { id: 'j13', title: 'Female Tutor for Class 4 Student', classLevel: 'Class 4', location: 'Doyaganj', salary: '৳2800', days: '4 Days/Week', postedBy: 'Guardian' },
  { id: 'j14', title: 'Spoken English Tutor Needed', classLevel: 'All Level', location: 'Demra', salary: '৳4500', days: '3 Days/Week', postedBy: 'Resident' },
  { id: 'j15', title: 'Biology Tutor for HSC Candidate', classLevel: 'HSC 2nd Year', location: 'Shyampur', salary: '৳4800', days: '3 Days/Week', postedBy: 'Guardian' },

  { id: 'j16', title: 'Math Tutor for Class 8', classLevel: 'Class 8', location: 'Postogola', salary: '৳3200', days: '4 Days/Week', postedBy: 'Resident' },
  { id: 'j17', title: 'English Tutor for Admission Prep', classLevel: 'University Admission', location: 'Sadarghat', salary: '৳6000', days: '3 Days/Week', postedBy: 'Guardian' },
  { id: 'j18', title: 'Need Tutor for Class 6 (All Subjects)', classLevel: 'Class 6', location: 'Kamrangirchar', salary: '৳3000', days: '4 Days/Week', postedBy: 'Resident' },
  { id: 'j19', title: 'Accounting Tutor for HSC', classLevel: 'HSC 1st Year', location: 'Keraniganj', salary: '৳4500', days: '3 Days/Week', postedBy: 'Guardian' },
  { id: 'j20', title: 'Female Tutor for Playgroup Kid', classLevel: 'Playgroup', location: 'Azimpur', salary: '৳2500', days: '5 Days/Week', postedBy: 'Guardian' },
];