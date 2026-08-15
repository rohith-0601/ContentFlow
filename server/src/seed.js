const mongoose = require('mongoose');
require('dotenv').config();
const ContentAsset = require('./models/ContentAsset');
const Task = require('./models/Task');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/contentflow';

const contentAssets = [
  {
    title: 'Q3 Product Launch Announcement',
    body: 'We are excited to announce the launch of our new enterprise dashboard, featuring real-time analytics, customizable widgets, and team collaboration tools. The product has been in development for six months and addresses key customer feedback around data visibility and workflow automation.',
    status: 'Published',
    owner: 'Sarah Chen',
    history: [
      { status: 'Draft', changedBy: 'Sarah Chen', timestamp: new Date('2026-07-01') },
      { status: 'In Review', changedBy: 'Sarah Chen', timestamp: new Date('2026-07-10') },
      { status: 'Approved', changedBy: 'James Park', timestamp: new Date('2026-07-15') },
      { status: 'Published', changedBy: 'Sarah Chen', timestamp: new Date('2026-07-20') },
    ],
  },
  {
    title: 'API Documentation v2.0',
    body: 'This document covers the updated REST API endpoints for the ContentFlow platform. Key changes include pagination support on all list endpoints, new filtering parameters, and webhook event subscriptions. Authentication now supports both API keys and OAuth 2.0 flows.',
    status: 'Approved',
    owner: 'Marcus Johnson',
    history: [
      { status: 'Draft', changedBy: 'Marcus Johnson', timestamp: new Date('2026-07-20') },
      { status: 'In Review', changedBy: 'Marcus Johnson', timestamp: new Date('2026-08-01') },
      { status: 'Approved', changedBy: 'Lisa Wang', timestamp: new Date('2026-08-10') },
    ],
  },
  {
    title: 'Customer Onboarding Guide',
    body: 'A step-by-step guide for new enterprise customers. Covers account setup, team invitations, workspace configuration, and integration with existing tools. Includes troubleshooting section for common setup issues and a glossary of platform-specific terminology.',
    status: 'In Review',
    owner: 'Emily Rodriguez',
    history: [
      { status: 'Draft', changedBy: 'Emily Rodriguez', timestamp: new Date('2026-08-01') },
      { status: 'In Review', changedBy: 'Emily Rodriguez', timestamp: new Date('2026-08-10') },
    ],
  },
  {
    title: 'Internal Security Policy Update',
    body: 'Updated security policies reflecting the new SOC 2 Type II compliance requirements. All team members must review and acknowledge the changes by end of quarter. Key updates include mandatory two-factor authentication, revised data retention periods, and updated incident response procedures.',
    status: 'In Review',
    owner: 'David Kim',
    history: [
      { status: 'Draft', changedBy: 'David Kim', timestamp: new Date('2026-08-05') },
      { status: 'In Review', changedBy: 'David Kim', timestamp: new Date('2026-08-12') },
    ],
  },
  {
    title: 'Blog Post: Engineering Culture',
    body: 'An exploration of our engineering team culture and how we approach problem-solving at scale. Topics include our code review process, architecture decision records, and how we balance technical debt with feature development. Aimed at both recruiting and thought leadership.',
    status: 'Draft',
    owner: 'Sarah Chen',
    history: [
      { status: 'Draft', changedBy: 'Sarah Chen', timestamp: new Date('2026-08-12') },
    ],
  },
  {
    title: 'Q4 Marketing Strategy',
    body: 'Comprehensive marketing strategy for Q4 2026, focusing on enterprise segment growth. Channels include targeted LinkedIn campaigns, industry conference sponsorships, and a webinar series on workflow automation. Budget allocation and KPI targets are outlined in the appendix.',
    status: 'Draft',
    owner: 'Lisa Wang',
    history: [
      { status: 'Draft', changedBy: 'Lisa Wang', timestamp: new Date('2026-08-14') },
    ],
  },
  {
    title: 'Release Notes v3.2',
    body: 'Release notes for version 3.2 including bug fixes, performance improvements, and three new features: bulk task operations, advanced search filters, and a redesigned notification center. All changes have been verified in staging.',
    status: 'Published',
    owner: 'Marcus Johnson',
    history: [
      { status: 'Draft', changedBy: 'Marcus Johnson', timestamp: new Date('2026-06-15') },
      { status: 'In Review', changedBy: 'Marcus Johnson', timestamp: new Date('2026-06-20') },
      { status: 'Approved', changedBy: 'James Park', timestamp: new Date('2026-06-25') },
      { status: 'Published', changedBy: 'Marcus Johnson', timestamp: new Date('2026-07-01') },
    ],
  },
  {
    title: 'Partner Integration Playbook',
    body: 'Technical and business playbook for onboarding new integration partners. Covers API access provisioning, sandbox environment setup, co-marketing opportunities, and SLA expectations. Includes template agreements and escalation procedures.',
    status: 'Approved',
    owner: 'Emily Rodriguez',
    history: [
      { status: 'Draft', changedBy: 'Emily Rodriguez', timestamp: new Date('2026-07-25') },
      { status: 'In Review', changedBy: 'Emily Rodriguez', timestamp: new Date('2026-08-02') },
      { status: 'Approved', changedBy: 'David Kim', timestamp: new Date('2026-08-08') },
    ],
  },
];

const tasks = [
  {
    title: 'Implement user authentication flow',
    description: 'Set up JWT-based authentication with login, signup, and password reset endpoints.',
    assignee: 'Marcus Johnson',
    dueDate: new Date('2026-08-10'),
    priority: 'High',
    column: 'Done',
  },
  {
    title: 'Design dashboard wireframes',
    description: 'Create high-fidelity wireframes for the main dashboard view including stat cards and activity feed.',
    assignee: 'Lisa Wang',
    dueDate: new Date('2026-08-08'),
    priority: 'Medium',
    column: 'Done',
  },
  {
    title: 'Build content editor component',
    description: 'Implement rich text editor with formatting toolbar, autosave, and version history support.',
    assignee: 'Sarah Chen',
    dueDate: new Date('2026-08-18'),
    priority: 'High',
    column: 'In Progress',
  },
  {
    title: 'Set up CI/CD pipeline',
    description: 'Configure GitHub Actions for automated testing, linting, and deployment to staging environment.',
    assignee: 'David Kim',
    dueDate: new Date('2026-08-12'),
    priority: 'High',
    column: 'QA',
  },
  {
    title: 'Write API integration tests',
    description: 'Create comprehensive test suite for all REST API endpoints using Jest and Supertest.',
    assignee: 'Marcus Johnson',
    dueDate: new Date('2026-08-20'),
    priority: 'Medium',
    column: 'In Progress',
  },
  {
    title: 'Optimize database queries',
    description: 'Profile and optimize slow MongoDB queries. Add indexes for frequently filtered fields.',
    assignee: 'David Kim',
    dueDate: new Date('2026-08-14'),
    priority: 'Medium',
    column: 'Backlog',
  },
  {
    title: 'Implement notification system',
    description: 'Build real-time notification system for content status changes and task assignments.',
    assignee: 'Sarah Chen',
    dueDate: new Date('2026-08-25'),
    priority: 'Low',
    column: 'Backlog',
  },
  {
    title: 'Create user settings page',
    description: 'Design and implement user preferences page with profile editing and notification settings.',
    assignee: 'Emily Rodriguez',
    dueDate: new Date('2026-08-22'),
    priority: 'Low',
    column: 'Backlog',
  },
  {
    title: 'Mobile responsive layouts',
    description: 'Ensure all views are fully responsive on tablet and mobile breakpoints.',
    assignee: 'Lisa Wang',
    dueDate: new Date('2026-08-13'),
    priority: 'High',
    column: 'In Progress',
  },
  {
    title: 'Data export functionality',
    description: 'Add CSV and PDF export options for content assets and task reports.',
    assignee: 'Marcus Johnson',
    dueDate: new Date('2026-08-28'),
    priority: 'Low',
    column: 'Backlog',
  },
  {
    title: 'Performance audit',
    description: 'Run Lighthouse audit and address performance bottlenecks. Target score above 90.',
    assignee: 'David Kim',
    dueDate: new Date('2026-08-11'),
    priority: 'Medium',
    column: 'QA',
  },
  {
    title: 'Chatbot context improvements',
    description: 'Enhance chatbot system prompts with better task and content context injection.',
    assignee: 'Sarah Chen',
    dueDate: new Date('2026-08-19'),
    priority: 'Medium',
    column: 'In Progress',
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await ContentAsset.deleteMany({});
    await Task.deleteMany({});
    console.log('Cleared existing data');

    // Generate lots of data based on existing templates
    const manyContentAssets = [];
    const manyTasks = [];
    const owners = ['Sarah Chen', 'Marcus Johnson', 'Emily Rodriguez', 'David Kim', 'Lisa Wang', 'James Park'];
    const statuses = ['Draft', 'In Review', 'Approved', 'Published'];
    
    for (let i = 0; i < 200; i++) {
        const baseAsset = contentAssets[i % contentAssets.length];
        const randomOwner = owners[Math.floor(Math.random() * owners.length)];
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        manyContentAssets.push({
            ...baseAsset,
            title: `${baseAsset.title} - Variation ${i + 1}`,
            owner: randomOwner,
            status: randomStatus
        });
    }

    const priorities = ['High', 'Medium', 'Low'];
    const columns = ['Backlog', 'In Progress', 'QA', 'Done'];
    for (let i = 0; i < 300; i++) {
        const baseTask = tasks[i % tasks.length];
        const randomAssignee = owners[Math.floor(Math.random() * owners.length)];
        const randomPriority = priorities[Math.floor(Math.random() * priorities.length)];
        const randomColumn = columns[Math.floor(Math.random() * columns.length)];
        
        let dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + (Math.floor(Math.random() * 60) - 30)); // +/- 30 days

        manyTasks.push({
            ...baseTask,
            title: `${baseTask.title} (Task ${i + 1})`,
            assignee: randomAssignee,
            priority: randomPriority,
            column: randomColumn,
            dueDate: dueDate
        });
    }

    // Insert seed data
    await ContentAsset.insertMany(manyContentAssets);
    console.log(`Inserted ${manyContentAssets.length} content assets`);

    await Task.insertMany(manyTasks);
    console.log(`Inserted ${manyTasks.length} tasks`);

    console.log('Seed completed successfully');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
