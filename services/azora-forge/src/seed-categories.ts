/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { Category } from './models/Listing';

/**
 * Seed skill categories for the Azora Forge marketplace
 * This includes traditional skills like plumbing, welding, electrical work, etc.
 */

export const SKILL_CATEGORIES = [
  // Trades & Construction
  {
    name: 'Plumbing',
    description: 'Professional plumbing services including installation, repair, and maintenance of water systems, pipes, and fixtures',
    icon: '🔧',
    subcategories: [
      'Residential Plumbing',
      'Commercial Plumbing',
      'Emergency Repairs',
      'Pipe Installation',
      'Drain Cleaning',
      'Water Heater Services'
    ]
  },
  {
    name: 'Welding',
    description: 'Expert welding services for metal fabrication, repair, and construction projects',
    icon: '⚒️',
    subcategories: [
      'MIG Welding',
      'TIG Welding',
      'Arc Welding',
      'Metal Fabrication',
      'Structural Welding',
      'Artistic Metalwork'
    ]
  },
  {
    name: 'Electrical Services',
    description: 'Licensed electrical work including installation, repair, and maintenance of electrical systems',
    icon: '⚡',
    subcategories: [
      'Residential Electrical',
      'Commercial Electrical',
      'Wiring & Rewiring',
      'Circuit Breaker Installation',
      'Lighting Installation',
      'Solar Panel Installation',
      'Emergency Electrical Repairs'
    ]
  },
  {
    name: 'Carpentry',
    description: 'Skilled carpentry services for construction, repair, and custom woodwork',
    icon: '🪚',
    subcategories: [
      'Rough Carpentry',
      'Finish Carpentry',
      'Custom Furniture',
      'Cabinet Making',
      'Deck Construction',
      'Home Renovations',
      'Wooden Flooring'
    ]
  },
  {
    name: 'HVAC',
    description: 'Heating, ventilation, and air conditioning installation, repair, and maintenance',
    icon: '❄️',
    subcategories: [
      'AC Installation',
      'Heating Systems',
      'Ventilation Services',
      'HVAC Maintenance',
      'Emergency HVAC Repairs',
      'Energy Efficiency Audits'
    ]
  },
  {
    name: 'Masonry',
    description: 'Professional masonry services including brickwork, stonework, and concrete',
    icon: '🧱',
    subcategories: [
      'Bricklaying',
      'Stonework',
      'Concrete Work',
      'Foundation Repair',
      'Chimney Services',
      'Retaining Walls'
    ]
  },
  {
    name: 'Roofing',
    description: 'Complete roofing services including installation, repair, and maintenance',
    icon: '🏠',
    subcategories: [
      'Roof Installation',
      'Roof Repair',
      'Roof Inspection',
      'Gutter Installation',
      'Waterproofing',
      'Emergency Roof Repairs'
    ]
  },
  {
    name: 'Painting & Decorating',
    description: 'Professional painting and decorating services for residential and commercial properties',
    icon: '🎨',
    subcategories: [
      'Interior Painting',
      'Exterior Painting',
      'Wallpapering',
      'Commercial Painting',
      'Decorative Finishes',
      'Spray Painting'
    ]
  },
  
  // Education & Learning
  {
    name: 'Tutoring & Teaching',
    description: 'One-on-one and group tutoring services across various subjects and levels',
    icon: '📚',
    subcategories: [
      'Math Tutoring',
      'Science Tutoring',
      'Language Lessons',
      'Test Preparation',
      'Music Lessons',
      'Art Classes',
      'Computer Programming',
      'Adult Education'
    ]
  },
  {
    name: 'Skills Training',
    description: 'Professional skills training and certification programs',
    icon: '🎓',
    subcategories: [
      'Trade Skills Training',
      'Software Training',
      'Business Skills',
      'Leadership Development',
      'Technical Certification',
      'Safety Training'
    ]
  },
  
  // Automotive
  {
    name: 'Automotive Services',
    description: 'Vehicle maintenance, repair, and customization services',
    icon: '🚗',
    subcategories: [
      'General Mechanic',
      'Auto Electrical',
      'Body Work & Painting',
      'Tire Services',
      'Oil Changes & Maintenance',
      'Engine Repair',
      'Transmission Services'
    ]
  },
  
  // Home Services
  {
    name: 'Cleaning Services',
    description: 'Professional cleaning services for homes and businesses',
    icon: '🧹',
    subcategories: [
      'House Cleaning',
      'Office Cleaning',
      'Deep Cleaning',
      'Carpet Cleaning',
      'Window Cleaning',
      'Post-Construction Cleaning'
    ]
  },
  {
    name: 'Landscaping & Gardening',
    description: 'Landscape design, maintenance, and gardening services',
    icon: '🌱',
    subcategories: [
      'Lawn Maintenance',
      'Garden Design',
      'Tree Services',
      'Irrigation Systems',
      'Hardscaping',
      'Seasonal Cleanup'
    ]
  },
  {
    name: 'Pest Control',
    description: 'Professional pest control and extermination services',
    icon: '🐜',
    subcategories: [
      'General Pest Control',
      'Termite Control',
      'Rodent Control',
      'Bed Bug Treatment',
      'Wildlife Removal',
      'Preventive Services'
    ]
  },
  
  // Technology Services
  {
    name: 'IT Support',
    description: 'Computer and network support services',
    icon: '💻',
    subcategories: [
      'Computer Repair',
      'Network Setup',
      'Software Installation',
      'Data Recovery',
      'Cybersecurity',
      'Tech Support'
    ]
  },
  {
    name: 'Web Development',
    description: 'Website design, development, and maintenance services',
    icon: '🌐',
    subcategories: [
      'Website Design',
      'E-commerce Development',
      'Web Applications',
      'WordPress Sites',
      'SEO Services',
      'Website Maintenance'
    ]
  },
  
  // Creative Services
  {
    name: 'Graphic Design',
    description: 'Professional graphic design services for digital and print media',
    icon: '🎨',
    subcategories: [
      'Logo Design',
      'Branding',
      'Print Design',
      'Digital Graphics',
      'Marketing Materials',
      'UI/UX Design'
    ]
  },
  {
    name: 'Photography & Videography',
    description: 'Professional photography and videography services',
    icon: '📸',
    subcategories: [
      'Event Photography',
      'Portrait Photography',
      'Commercial Photography',
      'Video Production',
      'Photo Editing',
      'Drone Photography'
    ]
  },
  
  // Professional Services
  {
    name: 'Legal Services',
    description: 'Legal consultation and services',
    icon: '⚖️',
    subcategories: [
      'Legal Consultation',
      'Document Preparation',
      'Contract Review',
      'Business Law',
      'Family Law',
      'Real Estate Law'
    ]
  },
  {
    name: 'Accounting & Bookkeeping',
    description: 'Financial services including accounting, bookkeeping, and tax preparation',
    icon: '📊',
    subcategories: [
      'Bookkeeping',
      'Tax Preparation',
      'Financial Planning',
      'Payroll Services',
      'Business Accounting',
      'Auditing'
    ]
  },
  
  // Health & Wellness
  {
    name: 'Fitness & Personal Training',
    description: 'Personal training and fitness coaching services',
    icon: '💪',
    subcategories: [
      'Personal Training',
      'Yoga Instruction',
      'Nutrition Coaching',
      'Group Fitness Classes',
      'Sports Coaching',
      'Online Fitness Training'
    ]
  },
  {
    name: 'Beauty & Wellness',
    description: 'Beauty services and wellness treatments',
    icon: '💆',
    subcategories: [
      'Hair Styling',
      'Makeup Services',
      'Nail Services',
      'Massage Therapy',
      'Skincare',
      'Barbering'
    ]
  },
  
  // Events & Entertainment
  {
    name: 'Event Planning',
    description: 'Professional event planning and coordination services',
    icon: '🎉',
    subcategories: [
      'Wedding Planning',
      'Corporate Events',
      'Party Planning',
      'Event Coordination',
      'Catering Services',
      'Venue Management'
    ]
  },
  {
    name: 'Entertainment Services',
    description: 'Entertainment services for events and occasions',
    icon: '🎭',
    subcategories: [
      'DJ Services',
      'Live Music',
      'Photography',
      'Videography',
      'MC/Host Services',
      'Entertainment Equipment Rental'
    ]
  }
];

/**
 * Seed the database with skill categories
 */
export async function seedSkillCategories() {
  console.log('🌱 Seeding skill categories...');
  
  try {
    for (const categoryData of SKILL_CATEGORIES) {
      // Create parent category
      const parentCategory = await Category.create({
        name: categoryData.name,
        description: categoryData.description,
        icon: categoryData.icon,
        isActive: true,
      });
      
      console.log(`✅ Created category: ${categoryData.name}`);
      
      // Create subcategories if they exist
      if (categoryData.subcategories && categoryData.subcategories.length > 0) {
        const subcategoryIds = [];
        
        for (const subName of categoryData.subcategories) {
          const subcategory = await Category.create({
            name: `${categoryData.name} - ${subName}`,
            description: `${subName} services under ${categoryData.name}`,
            parentCategory: parentCategory._id,
            isActive: true,
          });
          
          subcategoryIds.push(subcategory._id);
        }
        
        // Update parent with subcategory references
        parentCategory.subcategories = subcategoryIds;
        await parentCategory.save();
        
        console.log(`   ✅ Created ${subcategoryIds.length} subcategories`);
      }
    }
    
    console.log('\n✅ Successfully seeded all skill categories!');
    console.log(`📊 Total categories created: ${SKILL_CATEGORIES.length}`);
    
  } catch (error) {
    console.error('❌ Error seeding categories:', error);
    throw error;
  }
}

/**
 * Get all categories with their subcategories
 */
export async function getAllSkillCategories() {
  try {
    const categories = await Category.find({ isActive: true, parentCategory: null })
      .populate('subcategories')
      .sort({ name: 1 });
    
    return categories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
}

/**
 * Search categories by name or description
 */
export async function searchCategories(query: string) {
  try {
    const categories = await Category.find({
      isActive: true,
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ]
    }).populate('subcategories');
    
    return categories;
  } catch (error) {
    console.error('Error searching categories:', error);
    throw error;
  }
}

// Export for direct execution
if (require.main === module) {
  seedSkillCategories()
    .then(() => {
      console.log('✅ Seeding complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}
