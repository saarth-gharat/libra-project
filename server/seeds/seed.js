require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { sequelize, User, Category, Book, Borrow, Notification } = require('../models');

const seed = async () => {
  try {
    await sequelize.authenticate();
    console.log('Connected to database');

    // Force sync to recreate tables
    await sequelize.sync({ force: true });
    console.log('Tables created');

    // Create categories
    const categories = await Category.bulkCreate([
      { name: 'Computer Science', color: '#6366f1', description: 'Programming, algorithms, and computing' },
      { name: 'Mathematics', color: '#8b5cf6', description: 'Pure and applied mathematics' },
      { name: 'Science', color: '#06b6d4', description: 'Physics, chemistry, and biology' },
      { name: 'Literature', color: '#f59e0b', description: 'Fiction and classic literature' },
      { name: 'History', color: '#ef4444', description: 'World and regional history' },
      { name: 'Philosophy', color: '#10b981', description: 'Ethics, logic, and metaphysics' },
      { name: 'Engineering', color: '#f97316', description: 'Mechanical, electrical, and civil engineering' },
      { name: 'Business', color: '#ec4899', description: 'Management, finance, and economics' },
    ]);
    console.log('Categories seeded');

    // Create admin user
    const admin = await User.create({
      name: 'Admin Librarian',
      email: 'admin@libra.one',
      password: 'admin123',
      role: 'admin',
      department: 'Library Administration',
      is_active: true,
    });

    // Create teacher user
    const teacher = await User.create({
      name: 'Prof. John Anderson',
      email: 'teacher@libra.one',
      password: 'teacher123',
      role: 'teacher',
      department: 'Computer Science',
      is_active: true,
    });

    // Create student users
    const students = await Promise.all([
      User.create({
        name: 'Alice Johnson',
        email: 'alice@student.edu',
        password: 'student123',
        role: 'student',
        student_id: 'STU-2024-001',
        department: 'Computer Science',
      }),
      User.create({
        name: 'Bob Smith',
        email: 'bob@student.edu',
        password: 'student123',
        role: 'student',
        student_id: 'STU-2024-002',
        department: 'Mathematics',
      }),
      User.create({
        name: 'Carol Davis',
        email: 'carol@student.edu',
        password: 'student123',
        role: 'student',
        student_id: 'STU-2024-003',
        department: 'Physics',
      }),
      User.create({
        name: 'David Wilson',
        email: 'david@student.edu',
        password: 'student123',
        role: 'student',
        student_id: 'STU-2024-004',
        department: 'Engineering',
      }),
      User.create({
        name: 'Eva Martinez',
        email: 'eva@student.edu',
        password: 'student123',
        role: 'student',
        student_id: 'STU-2024-005',
        department: 'Literature',
      }),
    ]);
    console.log('Users seeded');

    // Create books
    const books = await Book.bulkCreate([
      {
        title: 'Introduction to Algorithms',
        author: 'Thomas H. Cormen',
        isbn: '978-0262033848',
        description: 'A comprehensive guide to algorithms and data structures used in computer science.',
        publisher: 'MIT Press',
        published_year: 2009,
        total_copies: 5,
        available_copies: 3,
        category_id: categories[0].id,
        location: 'Shelf A-1',
      },
      {
        title: 'Clean Code',
        author: 'Robert C. Martin',
        isbn: '978-0132350884',
        description: 'A handbook of agile software craftsmanship for writing better code.',
        publisher: 'Prentice Hall',
        published_year: 2008,
        total_copies: 4,
        available_copies: 2,
        category_id: categories[0].id,
        location: 'Shelf A-2',
      },
      {
        title: 'Design Patterns',
        author: 'Erich Gamma',
        isbn: '978-0201633610',
        description: 'Elements of reusable object-oriented software.',
        publisher: 'Addison-Wesley',
        published_year: 1994,
        total_copies: 3,
        available_copies: 3,
        category_id: categories[0].id,
        location: 'Shelf A-3',
      },
      {
        title: 'The Pragmatic Programmer',
        author: 'David Thomas & Andrew Hunt',
        isbn: '978-0135957059',
        description: 'Your journey to mastery in software development.',
        publisher: 'Addison-Wesley',
        published_year: 2019,
        total_copies: 3,
        available_copies: 2,
        category_id: categories[0].id,
        location: 'Shelf A-4',
      },
      {
        title: 'Calculus: Early Transcendentals',
        author: 'James Stewart',
        isbn: '978-1285741550',
        description: 'Comprehensive guide to calculus concepts and applications.',
        publisher: 'Cengage Learning',
        published_year: 2015,
        total_copies: 6,
        available_copies: 5,
        category_id: categories[1].id,
        location: 'Shelf B-1',
      },
      {
        title: 'Linear Algebra Done Right',
        author: 'Sheldon Axler',
        isbn: '978-3319110790',
        description: 'A unique approach to linear algebra that emphasizes the conceptual.',
        publisher: 'Springer',
        published_year: 2014,
        total_copies: 3,
        available_copies: 3,
        category_id: categories[1].id,
        location: 'Shelf B-2',
      },
      {
        title: 'A Brief History of Time',
        author: 'Stephen Hawking',
        isbn: '978-0553380163',
        description: 'Landmark volume in science writing exploring the origins of the universe.',
        publisher: 'Bantam',
        published_year: 1998,
        total_copies: 4,
        available_copies: 4,
        category_id: categories[2].id,
        location: 'Shelf C-1',
      },
      {
        title: 'The Feynman Lectures on Physics',
        author: 'Richard Feynman',
        isbn: '978-0465024933',
        description: 'The definitive edition of the famous lectures on physics.',
        publisher: 'Basic Books',
        published_year: 2011,
        total_copies: 3,
        available_copies: 2,
        category_id: categories[2].id,
        location: 'Shelf C-2',
      },
      {
        title: 'To Kill a Mockingbird',
        author: 'Harper Lee',
        isbn: '978-0061120084',
        description: 'A novel about racial injustice and moral growth in the American South.',
        publisher: 'Harper Perennial',
        published_year: 2006,
        total_copies: 5,
        available_copies: 4,
        category_id: categories[3].id,
        location: 'Shelf D-1',
      },
      {
        title: '1984',
        author: 'George Orwell',
        isbn: '978-0451524935',
        description: 'A dystopian novel about totalitarianism and surveillance.',
        publisher: 'Signet Classic',
        published_year: 1961,
        total_copies: 4,
        available_copies: 3,
        category_id: categories[3].id,
        location: 'Shelf D-2',
      },
      {
        title: 'Sapiens: A Brief History of Humankind',
        author: 'Yuval Noah Harari',
        isbn: '978-0062316097',
        description: 'A narrative of humanity\'s creation and evolution.',
        publisher: 'Harper',
        published_year: 2015,
        total_copies: 3,
        available_copies: 2,
        category_id: categories[4].id,
        location: 'Shelf E-1',
      },
      {
        title: 'Meditations',
        author: 'Marcus Aurelius',
        isbn: '978-0140449334',
        description: 'Personal writings of the Roman Emperor on Stoic philosophy.',
        publisher: 'Penguin Classics',
        published_year: 2006,
        total_copies: 3,
        available_copies: 3,
        category_id: categories[5].id,
        location: 'Shelf F-1',
      },
      {
        title: 'Structures: Or Why Things Don\'t Fall Down',
        author: 'J.E. Gordon',
        isbn: '978-0306812835',
        description: 'An entertaining and informative account of structural engineering.',
        publisher: 'Da Capo Press',
        published_year: 2003,
        total_copies: 2,
        available_copies: 2,
        category_id: categories[6].id,
        location: 'Shelf G-1',
      },
      {
        title: 'The Lean Startup',
        author: 'Eric Ries',
        isbn: '978-0307887894',
        description: 'How today\'s entrepreneurs use continuous innovation.',
        publisher: 'Currency',
        published_year: 2011,
        total_copies: 4,
        available_copies: 3,
        category_id: categories[7].id,
        location: 'Shelf H-1',
      },
      {
        title: 'Thinking, Fast and Slow',
        author: 'Daniel Kahneman',
        isbn: '978-0374533557',
        description: 'A tour of the mind explaining the two systems that drive the way we think.',
        publisher: 'Farrar, Straus and Giroux',
        published_year: 2011,
        total_copies: 3,
        available_copies: 2,
        category_id: categories[7].id,
        location: 'Shelf H-2',
      },
    ]);
    console.log('Books seeded');

    // Create some borrows
    const today = new Date();
    const dueDate1 = new Date(today);
    dueDate1.setDate(dueDate1.getDate() + 10);

    const dueDate2 = new Date(today);
    dueDate2.setDate(dueDate2.getDate() + 5);

    const overduePast = new Date(today);
    overduePast.setDate(overduePast.getDate() - 3);

    await Borrow.bulkCreate([
      {
        user_id: students[0].id,
        book_id: books[0].id,
        borrow_date: new Date(today.getTime() - 4 * 86400000),
        due_date: dueDate1,
        status: 'active',
        issued_by: admin.id,
      },
      {
        user_id: students[0].id,
        book_id: books[1].id,
        borrow_date: new Date(today.getTime() - 9 * 86400000),
        due_date: dueDate2,
        status: 'active',
        issued_by: admin.id,
      },
      {
        user_id: students[1].id,
        book_id: books[3].id,
        borrow_date: new Date(today.getTime() - 18 * 86400000),
        due_date: overduePast,
        status: 'active',
        issued_by: admin.id,
      },
      {
        user_id: students[2].id,
        book_id: books[7].id,
        borrow_date: new Date(today.getTime() - 10 * 86400000),
        due_date: dueDate1,
        status: 'active',
        issued_by: admin.id,
      },
      {
        user_id: students[3].id,
        book_id: books[10].id,
        borrow_date: new Date(today.getTime() - 25 * 86400000),
        due_date: new Date(today.getTime() - 11 * 86400000),
        return_date: new Date(today.getTime() - 7 * 86400000),
        status: 'returned',
        issued_by: admin.id,
      },
    ]);
    console.log('Borrows seeded');

    // Create notifications
    await Notification.bulkCreate([
      {
        user_id: students[0].id,
        title: 'Welcome to LIBRA.ONE',
        message: 'Welcome to the digital library! Start exploring our collection.',
        type: 'info',
      },
      {
        user_id: students[1].id,
        title: 'Book Overdue',
        message: 'Your borrowed book "The Pragmatic Programmer" is overdue. Please return it.',
        type: 'warning',
      },
      {
        user_id: students[0].id,
        title: 'Book Issued',
        message: '"Introduction to Algorithms" has been issued to you.',
        type: 'success',
      },
    ]);
    console.log('Notifications seeded');

    console.log('\n--- Seed complete! ---');
    console.log('Admin login:  admin@libra.one / admin123');
    console.log('Student login: alice@student.edu / student123');

    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
};

seed();
