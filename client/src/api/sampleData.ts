import type { BootstrapResponse, DropdownItem, Task } from '../lib/types';

const id = (n: number) => `seed-${n.toString().padStart(4, '0')}`;
const iso = (d: string) => new Date(d).toISOString();

const projects: DropdownItem[] = [
  { id: id(1), name: 'Website Revamp' },
  { id: id(2), name: 'General Operations' },
  { id: id(3), name: 'Sales Dashboard' },
  { id: id(4), name: 'Payments' },
  { id: id(5), name: 'Marketing' },
  { id: id(6), name: 'HR' },
  { id: id(7), name: 'Funding' },
  { id: id(8), name: 'App Development' },
  { id: id(9), name: 'Operations' },
  { id: id(10), name: 'Business Strategy' },
  { id: id(11), name: 'Backend' },
  { id: id(12), name: 'Product Development' },
  { id: id(13), name: 'Finance' },
  { id: id(14), name: 'IT' },
  { id: id(15), name: 'Mobile app redesign' },
];

const labelNames = [
  'Design', 'UI/UX', 'Communication', 'Analytics', 'Bugfix', 'Backend',
  'Content', 'SEO', 'Recruitment', 'Pitch', 'Testing', 'QA',
  'Customer Support', 'Code Review', 'Legal', 'CRM', 'Integration',
  'Research', 'Documentation', 'Customer Feedback', 'Social Media',
];
const labels: DropdownItem[] = labelNames.map((name, i) => ({ id: id(100 + i), name }));

const users: DropdownItem[] = [
  { id: id(200), name: 'Alex Morgan' },
  { id: id(201), name: 'Priya Patel' },
  { id: id(202), name: 'Sam Chen' },
  { id: id(203), name: 'Maya Rodriguez' },
  { id: id(204), name: 'Jordan Lee' },
  { id: id(205), name: 'Nadia Khan' },
];

const tasks: Task[] = [
  {
    id: id(300),
    title: 'Design Landing Page',
    description: 'Create an engaging landing page',
    link: 'https://figma.com/project/12345',
    priority: 'High',
    status: 'In Progress',
    dueDate: iso('2024-12-29'),
    labels: ['Design', 'UI/UX'],
    project: 'Website Revamp',
    reminderDate: iso('2024-12-28T00:30:00'),

    assignedTo: 'Alex Morgan',

    assignedBy: 'Sam Chen',
    createdAt: iso('2024-12-20'),
    updatedAt: iso('2024-12-22'),
  },
  {
    id: id(301),
    title: 'Team Standup Meeting',
    description: 'Daily team sync-up call',
    link: '',
    priority: 'Medium',
    status: 'Archived',
    dueDate: iso('2024-12-26'),
    labels: ['Communication'],
    project: 'General Operations',
    reminderDate: iso('2024-12-25T14:00:00'),

    assignedTo: 'Priya Patel',

    assignedBy: 'Maya Rodriguez',
    createdAt: iso('2024-12-20'),
    updatedAt: iso('2024-12-21'),
  },
  {
    id: id(302),
    title: 'Update Sales Report',
    description: 'Add the latest sales metrics',
    link: 'https://sheets.google.com/report',
    priority: 'Medium',
    status: 'Archived',
    dueDate: iso('2024-12-30'),
    labels: ['Analytics', 'Bugfix'],
    project: 'Sales Dashboard',
    reminderDate: iso('2024-12-29T23:30:00'),

    assignedTo: 'Sam Chen',

    assignedBy: 'Alex Morgan',
    createdAt: iso('2024-12-19'),
    updatedAt: iso('2024-12-22'),
  },
  {
    id: id(303),
    title: 'Fix Backend Bug #452',
    description: 'Resolve API failure in payment module',
    link: 'https://jira.com/task/452',
    priority: 'High',
    status: 'Done',
    dueDate: iso('2024-12-31'),
    labels: ['Bugfix', 'Backend'],
    project: 'Payments',
    reminderDate: iso('2024-12-29T18:00:00'),

    assignedTo: 'Maya Rodriguez',

    assignedBy: 'Priya Patel',
    createdAt: iso('2024-12-21'),
    updatedAt: iso('2024-12-23'),
  },
  {
    id: id(304),
    title: 'Publish Blog Post',
    description: 'Post December product updates on blog',
    link: 'https://blog.company.com/drafts/123',
    priority: 'Medium',
    status: 'To Do',
    dueDate: iso('2024-12-29'),
    labels: ['Content', 'SEO'],
    project: 'Marketing',
    reminderDate: iso('2024-12-27T18:30:00'),

    assignedTo: 'Jordan Lee',

    assignedBy: 'Sam Chen',
    createdAt: iso('2024-12-20'),
    updatedAt: iso('2024-12-20'),
  },
  {
    id: id(305),
    title: 'Review Resume Submissions',
    description: 'Screen resumes for new developers',
    link: 'https://hrportal.com/jobs/',
    priority: 'Medium',
    status: 'Done',
    dueDate: iso('2024-12-28'),
    labels: ['Recruitment'],
    project: 'HR',
    reminderDate: iso('2024-12-26T16:30:00'),

    assignedTo: 'Nadia Khan',

    assignedBy: 'Maya Rodriguez',
    createdAt: iso('2024-12-18'),
    updatedAt: iso('2024-12-23'),
  },
  {
    id: id(306),
    title: 'Prepare Investor Presentation',
    description: 'Finalize slides for the quarterly review',
    link: 'https://slides.com/presentation/1',
    priority: 'High',
    status: 'To Do',
    dueDate: iso('2025-01-01'),
    labels: ['Pitch'],
    project: 'Funding',
    reminderDate: iso('2024-12-30T21:30:00'),

    assignedTo: 'Alex Morgan',

    assignedBy: 'Alex Morgan',
    createdAt: iso('2024-12-22'),
    updatedAt: iso('2024-12-22'),
  },
  {
    id: id(307),
    title: 'Launch Social Media Campaign',
    description: 'Plan and schedule posts for January',
    link: '',
    priority: 'Medium',
    status: 'In Progress',
    dueDate: iso('2024-12-29'),
    labels: ['Social Media'],
    project: 'Marketing',
    reminderDate: iso('2024-12-27T10:00:00'),

    assignedTo: 'Priya Patel',

    assignedBy: 'Priya Patel',
    createdAt: iso('2024-12-19'),
    updatedAt: iso('2024-12-22'),
  },
  {
    id: id(308),
    title: 'Test New Feature Deployment',
    description: 'Conduct UAT for customer dashboard changes',
    link: '',
    priority: 'Medium',
    status: 'To Do',
    dueDate: iso('2024-12-30'),
    labels: ['Testing', 'QA'],
    project: 'App Development',
    reminderDate: iso('2024-12-28T09:00:00'),

    assignedTo: 'Sam Chen',

    assignedBy: 'Sam Chen',
    createdAt: iso('2024-12-21'),
    updatedAt: iso('2024-12-21'),
  },
  {
    id: id(309),
    title: 'Send Holiday Greetings Email',
    description: 'Email customers with New Year offers',
    link: '',
    priority: 'Medium',
    status: 'In Progress',
    dueDate: iso('2024-12-26'),
    labels: ['Customer Support'],
    project: 'Marketing',
    reminderDate: iso('2024-12-24T10:00:00'),

    assignedTo: 'Maya Rodriguez',

    assignedBy: 'Maya Rodriguez',
    createdAt: iso('2024-12-20'),
    updatedAt: iso('2024-12-22'),
  },
  {
    id: id(310),
    title: 'Code Review for Feature #123',
    description: 'Review code and provide feedback',
    link: '',
    priority: 'Medium',
    status: 'Done',
    dueDate: iso('2024-12-27'),
    labels: ['Code Review'],
    project: 'App Development',
    reminderDate: iso('2024-12-25T14:00:00'),

    assignedTo: 'Jordan Lee',

    assignedBy: 'Alex Morgan',
    createdAt: iso('2024-12-22'),
    updatedAt: iso('2024-12-23'),
  },
  {
    id: id(311),
    title: 'Update App Terms of Service',
    description: 'Review and modify terms for new features',
    link: '',
    priority: 'Medium',
    status: 'Archived',
    dueDate: iso('2025-01-01'),
    labels: ['Legal'],
    project: 'General Operations',
    reminderDate: iso('2024-12-30T10:00:00'),

    assignedTo: 'Nadia Khan',

    assignedBy: 'Priya Patel',
    createdAt: iso('2024-12-20'),
    updatedAt: iso('2024-12-22'),
  },
  {
    id: id(312),
    title: 'Set Up CRM Integration',
    description: 'Connect CRM tool with internal systems',
    link: '',
    priority: 'Medium',
    status: 'To Do',
    dueDate: iso('2025-01-01'),
    labels: ['CRM', 'Integration'],
    project: 'Operations',
    reminderDate: iso('2024-12-30T10:00:00'),

    assignedTo: 'Alex Morgan',

    assignedBy: 'Sam Chen',
    createdAt: iso('2024-12-22'),
    updatedAt: iso('2024-12-22'),
  },
  {
    id: id(313),
    title: 'Research Competitor Pricing',
    description: 'Collect and analyze pricing models',
    link: '',
    priority: 'Medium',
    status: 'In Progress',
    dueDate: iso('2024-12-28'),
    labels: ['Research'],
    project: 'Business Strategy',
    reminderDate: iso('2024-12-26T10:00:00'),

    assignedTo: 'Priya Patel',

    assignedBy: 'Maya Rodriguez',
    createdAt: iso('2024-12-21'),
    updatedAt: iso('2024-12-22'),
  },
  {
    id: id(314),
    title: 'Update Company Wiki',
    description: 'Add latest policies and team guides',
    link: '',
    priority: 'Medium',
    status: 'Done',
    dueDate: iso('2024-12-30'),
    labels: ['Documentation'],
    project: 'General Operations',
    reminderDate: iso('2024-12-28T10:00:00'),

    assignedTo: 'Sam Chen',

    assignedBy: 'Alex Morgan',
    createdAt: iso('2024-12-22'),
    updatedAt: iso('2024-12-23'),
  },
  {
    id: id(315),
    title: 'Conduct Customer Survey',
    description: 'Prepare and distribute feedback forms',
    link: '',
    priority: 'Medium',
    status: 'Archived',
    dueDate: iso('2024-12-29'),
    labels: ['Customer Feedback'],
    project: 'Product Development',
    reminderDate: iso('2024-12-27T10:00:00'),

    assignedTo: 'Maya Rodriguez',

    assignedBy: 'Priya Patel',
    createdAt: iso('2024-12-19'),
    updatedAt: iso('2024-12-22'),
  },
];

export const SAMPLE_DATA: BootstrapResponse = {
  tasks,
  projects,
  labels,
  users,
  statuses: ['To Do', 'In Progress', 'Done', 'Archived'],
  priorities: ['High', 'Medium', 'Low'],
};
