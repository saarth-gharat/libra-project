require('dotenv').config();
const { User } = require('../models');

const addTeachers = async () => {
  try {
    console.log('Adding additional teachers...\n');

    const teachers = [
      {
        name: 'Prof. Sarah Mitchell',
        email: 'sarah.mitchell@school.edu',
        password: 'teacher123',
        role: 'teacher',
        department: 'English Literature',
        student_id: 'TCH-001',
        is_active: true,
      },
      {
        name: 'Dr. James Chen',
        email: 'james.chen@school.edu',
        password: 'teacher123',
        role: 'teacher',
        department: 'Mathematics',
        student_id: 'TCH-002',
        is_active: true,
      },
      {
        name: 'Prof. Maria Garcia',
        email: 'maria.garcia@school.edu',
        password: 'teacher123',
        role: 'teacher',
        department: 'Physics',
        student_id: 'TCH-003',
        is_active: true,
      },
      {
        name: 'Dr. Robert Taylor',
        email: 'robert.taylor@school.edu',
        password: 'teacher123',
        role: 'teacher',
        department: 'Computer Science',
        student_id: 'TCH-004',
        is_active: true,
      },
      {
        name: 'Prof. Emily Brown',
        email: 'emily.brown@school.edu',
        password: 'teacher123',
        role: 'teacher',
        department: 'History',
        student_id: 'TCH-005',
        is_active: true,
      },
    ];

    for (const teacherData of teachers) {
      try {
        await User.create(teacherData);
        console.log(`✓ Created teacher: ${teacherData.name} (${teacherData.email})`);
      } catch (error) {
        console.error(`✗ Failed to create ${teacherData.name}:`, error.message);
      }
    }

    console.log('\n✅ Teachers added successfully!');
    console.log('\nYou can now login with any of these credentials:');
    teachers.forEach(t => {
      console.log(`  ${t.name}: ${t.email} / teacher123`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error adding teachers:', error);
    process.exit(1);
  }
};

addTeachers();
