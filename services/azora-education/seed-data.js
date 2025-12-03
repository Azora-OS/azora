// Database seed script for Azora Education Platform
// Creates realistic course data for testing and demo

const courses = [
    {
        id: 1,
        title: "Introduction to Constitutional AI",
        description: "Learn the fundamentals of building ethical AI systems with constitutional principles. Explore how AI can be designed with built-in values, transparency, and accountability.",
        instructor: "Dr. Sarah Chen",
        level: "beginner",
        duration: "4 weeks",
        price: 0, // Free course
        category: "AI & Ethics",
        enrolled: 1247,
        rating: 4.8,
        lessons: 12,
        image: "/courses/constitutional-ai.jpg"
    },
    {
        id: 2,
        title: "Ubuntu Philosophy in Technology",
        description: "Understanding collaborative development and the African philosophy of Ubuntu applied to modern technology. Learn how 'I can because we can' transforms software development.",
        instructor: "Prof. Thabo Mbeki",
        level: "intermediate",
        duration: "6 weeks",
        price: 0,
        category: "Philosophy & Tech",
        enrolled: 892,
        rating: 4.9,
        lessons: 18,
        image: "/courses/ubuntu-tech.jpg"
    },
    {
        id: 3,
        title: "Full-Stack Web Development with Next.js",
        description: "Master modern web development with Next.js 14, React 18, TypeScript, and Tailwind CSS. Build production-ready applications from scratch.",
        instructor: "Alex Rodriguez",
        level: "intermediate",
        duration: "12 weeks",
        price: 4900, // $49.00
        category: "Web Development",
        enrolled: 3421,
        rating: 4.7,
        lessons: 48,
        image: "/courses/nextjs-fullstack.jpg"
    },
    {
        id: 4,
        title: "Blockchain Fundamentals and Smart Contracts",
        description: "Dive into blockchain technology, cryptocurrency, and smart contract development. Learn Solidity and build decentralized applications.",
        instructor: "Michael Zhang",
        level: "advanced",
        duration: "8 weeks",
        price: 7900,
        category: "Blockchain",
        enrolled: 1653,
        rating: 4.6,
        lessons: 32,
        image: "/courses/blockchain-fundamentals.jpg"
    },
    {
        id: 5,
        title: "Data Science with Python",
        description: "Complete data science bootcamp covering pandas, NumPy, scikit-learn, and TensorFlow. Work on real-world projects and build your portfolio.",
        instructor: "Dr. Emily Watson",
        level: "intermediate",
        duration: "10 weeks",
        price: 5900,
        category: "Data Science",
        enrolled: 2876,
        rating: 4.8,
        lessons: 40,
        image: "/courses/data-science-python.jpg"
    },
    {
        id: 6,
        title: "K-12 Mathematics Mastery",
        description: "Comprehensive mathematics course for K-12 students. Interactive lessons, practice problems, and personalized AI tutoring with KOFI.",
        instructor: "KOFI AI Tutor",
        level: "beginner",
        duration: "Self-paced",
        price: 0,
        category: "K-12 Education",
        enrolled: 5234,
        rating: 4.9,
        lessons: 120,
        image: "/courses/k12-math.jpg"
    },
    {
        id: 7,
        title: "PhD Research Methods and Academic Writing",
        description: "Advanced research methodologies, statistical analysis, and academic writing for doctoral students. Guided by ZURI research assistant.",
        instructor: "Dr. James Morrison & ZURI AI",
        level: "advanced",
        duration: "16 weeks",
        price: 9900,
        category: "Academic Research",
        enrolled: 432,
        rating: 4.9,
        lessons: 24,
        image: "/courses/phd-research.jpg"
    },
    {
        id: 8,
        title: "Mobile App Development with React Native",
        description: "Build cross-platform mobile applications for iOS and Android using React Native. Deploy to app stores and monetize your apps.",
        instructor: "Lisa Park",
        level: "intermediate",
        duration: "8 weeks",
        price: 6900,
        category: "Mobile Development",
        enrolled: 1987,
        rating: 4.7,
        lessons: 36,
        image: "/courses/react-native.jpg"
    },
    {
        id: 9,
        title: "Entrepreneurship and Startup Fundamentals",
        description: "Launch your startup with guidance from successful entrepreneurs. Learn business models, fundraising, product development, and growth strategies.",
        instructor: "Marcus Johnson",
        level: "beginner",
        duration: "6 weeks",
        price: 3900,
        category: "Business",
        enrolled: 2341,
        rating: 4.6,
        lessons: 24,
        image: "/courses/entrepreneurship.jpg"
    },
    {
        id: 10,
        title: "Machine Learning Engineering",
        description: "Production ML systems, MLOps, model deployment, and monitoring. Build scalable machine learning infrastructure.",
        instructor: "Dr. Priya Sharma",
        level: "advanced",
        duration: "12 weeks",
        price: 8900,
        category: "Machine Learning",
        enrolled: 1456,
        rating: 4.8,
        lessons: 44,
        image: "/courses/ml-engineering.jpg"
    }
];

console.log('Azora Education Platform - Sample Courses');
console.log('==========================================\n');
console.log(`Total Courses: ${courses.length}`);
console.log(`Free Courses: ${courses.filter(c => c.price === 0).length}`);
console.log(`Paid Courses: ${courses.filter(c => c.price > 0).length}`);
console.log(`Total Enrolled Students: ${courses.reduce((sum, c) => sum + c.enrolled, 0).toLocaleString()}`);
console.log('\nCourse Catalog:\n');

courses.forEach(course => {
    console.log(`${course.id}. ${course.title}`);
    console.log(`   Level: ${course.level} | Duration: ${course.duration} | Price: ${course.price === 0 ? 'FREE' : '$' + (course.price / 100).toFixed(2)}`);
    console.log(`   Enrolled: ${course.enrolled.toLocaleString()} | Rating: ${course.rating}/5.0 | Lessons: ${course.lessons}`);
    console.log(`   Instructor: ${course.instructor}`);
    console.log('');
});

module.exports = { courses };
