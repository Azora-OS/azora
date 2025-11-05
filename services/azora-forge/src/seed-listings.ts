/*
AZORA PROPRIETARY LICENSE

Copyright © 2025 Azora ES (Pty) Ltd. All Rights Reserved.

See LICENSE file for details.
*/

import { Listing } from './models/Listing';

/**
 * Sample listings for various skill categories
 */

export const SAMPLE_LISTINGS = [
  // Plumbing Services
  {
    sellerId: 'user_plumber_001',
    title: 'Emergency Plumbing Repairs - Available 24/7',
    description: 'Experienced plumber offering emergency repairs, pipe installations, and leak fixes. Licensed and insured with 10+ years of experience. Quick response time guaranteed.',
    category: 'Plumbing',
    price: 150,
    tags: ['emergency', 'licensed', 'insured', '24/7'],
    status: 'active',
    deliveryMethod: 'service',
    estimatedDelivery: 'Same day or next day',
    requirements: 'Address and description of plumbing issue'
  },
  {
    sellerId: 'user_plumber_002',
    title: 'Water Heater Installation & Repair',
    description: 'Professional water heater installation and repair services. Both traditional and tankless systems. Free estimates provided.',
    category: 'Plumbing',
    price: 200,
    tags: ['water heater', 'installation', 'repair'],
    status: 'active',
    deliveryMethod: 'service',
    estimatedDelivery: '1-2 days',
    requirements: 'Type and brand of water heater'
  },

  // Welding Services
  {
    sellerId: 'user_welder_001',
    title: 'Professional MIG & TIG Welding Services',
    description: 'Certified welder specializing in MIG and TIG welding for industrial and residential projects. Custom metal fabrication available.',
    category: 'Welding',
    price: 180,
    tags: ['MIG', 'TIG', 'certified', 'fabrication'],
    status: 'active',
    deliveryMethod: 'service',
    estimatedDelivery: '2-5 days depending on project',
    requirements: 'Project details, materials, and specifications'
  },
  {
    sellerId: 'user_welder_002',
    title: 'Custom Metal Art & Sculpture',
    description: 'Create beautiful custom metal artwork, gates, railings, and sculptures. Portfolio available upon request.',
    category: 'Welding',
    price: 350,
    tags: ['artistic', 'custom', 'metalwork', 'sculpture'],
    status: 'active',
    deliveryMethod: 'service',
    estimatedDelivery: '1-3 weeks',
    requirements: 'Design concept or reference images'
  },

  // Electrical Services
  {
    sellerId: 'user_electrician_001',
    title: 'Licensed Electrician - Residential & Commercial',
    description: 'Fully licensed electrician offering wiring, rewiring, circuit installation, and electrical repairs. Code compliant work guaranteed.',
    category: 'Electrical Services',
    price: 175,
    tags: ['licensed', 'residential', 'commercial', 'code-compliant'],
    status: 'active',
    deliveryMethod: 'service',
    estimatedDelivery: '1-3 days',
    requirements: 'Description of electrical work needed'
  },
  {
    sellerId: 'user_electrician_002',
    title: 'Solar Panel Installation & Maintenance',
    description: 'Expert solar panel installation for homes and businesses. Energy efficiency audits included. Reduce your electricity bills by up to 80%.',
    category: 'Electrical Services',
    price: 500,
    tags: ['solar', 'renewable energy', 'installation', 'green'],
    status: 'active',
    deliveryMethod: 'service',
    estimatedDelivery: '1-2 weeks',
    requirements: 'Property size and current electricity usage'
  },

  // Carpentry
  {
    sellerId: 'user_carpenter_001',
    title: 'Custom Furniture & Cabinetry',
    description: 'Skilled carpenter creating custom furniture, cabinets, and built-ins. Quality hardwood construction with attention to detail.',
    category: 'Carpentry',
    price: 400,
    tags: ['custom', 'furniture', 'cabinets', 'hardwood'],
    status: 'active',
    deliveryMethod: 'service',
    estimatedDelivery: '2-4 weeks',
    requirements: 'Measurements and design preferences'
  },
  {
    sellerId: 'user_carpenter_002',
    title: 'Deck Building & Outdoor Structures',
    description: 'Professional deck construction, pergolas, and outdoor structures. Weather-resistant materials and expert craftsmanship.',
    category: 'Carpentry',
    price: 600,
    tags: ['decks', 'outdoor', 'construction', 'pergolas'],
    status: 'active',
    deliveryMethod: 'service',
    estimatedDelivery: '1-3 weeks',
    requirements: 'Outdoor space dimensions and photos'
  },

  // Tutoring & Teaching
  {
    sellerId: 'user_tutor_001',
    title: 'Mathematics Tutoring - Grade 1-12',
    description: 'Certified math teacher offering personalized tutoring for students Grade 1-12. Improve grades and build confidence in mathematics.',
    category: 'Tutoring & Teaching',
    price: 50,
    tags: ['math', 'tutoring', 'certified', 'grades 1-12'],
    status: 'active',
    deliveryMethod: 'service',
    estimatedDelivery: 'Flexible scheduling',
    requirements: 'Student grade level and areas of difficulty'
  },
  {
    sellerId: 'user_tutor_002',
    title: 'Python Programming Lessons - Beginner to Advanced',
    description: 'Learn Python programming from scratch or advance your skills. Individual and group lessons available. Real-world projects included.',
    category: 'Tutoring & Teaching',
    price: 75,
    tags: ['programming', 'python', 'coding', 'computer science'],
    status: 'active',
    deliveryMethod: 'digital',
    estimatedDelivery: 'Online sessions via Zoom',
    requirements: 'Computer with internet access'
  },

  // Web Development
  {
    sellerId: 'user_webdev_001',
    title: 'Professional Business Website Development',
    description: 'Full-stack developer creating modern, responsive websites for businesses. SEO optimization and mobile-friendly design included.',
    category: 'Web Development',
    price: 800,
    tags: ['website', 'responsive', 'SEO', 'business'],
    status: 'active',
    deliveryMethod: 'digital',
    estimatedDelivery: '2-4 weeks',
    requirements: 'Business information, design preferences, content'
  },
  {
    sellerId: 'user_webdev_002',
    title: 'E-commerce Store Development',
    description: 'Build a complete e-commerce store with payment integration, inventory management, and admin panel. Shopify, WooCommerce, or custom solutions.',
    category: 'Web Development',
    price: 1500,
    tags: ['e-commerce', 'online store', 'payment integration', 'shopify'],
    status: 'active',
    deliveryMethod: 'digital',
    estimatedDelivery: '3-6 weeks',
    requirements: 'Product catalog, payment gateway preferences'
  },

  // Graphic Design
  {
    sellerId: 'user_designer_001',
    title: 'Professional Logo Design',
    description: 'Create a unique, memorable logo for your brand. Includes 3 concepts, unlimited revisions, and all file formats.',
    category: 'Graphic Design',
    price: 250,
    tags: ['logo', 'branding', 'design', 'professional'],
    status: 'active',
    deliveryMethod: 'digital',
    estimatedDelivery: '5-7 days',
    requirements: 'Business name, industry, style preferences'
  },
  {
    sellerId: 'user_designer_002',
    title: 'Social Media Graphics Package',
    description: 'Complete social media graphics package including posts, stories, banners, and profile images. Consistent branding across all platforms.',
    category: 'Graphic Design',
    price: 350,
    tags: ['social media', 'graphics', 'branding', 'package'],
    status: 'active',
    deliveryMethod: 'digital',
    estimatedDelivery: '7-10 days',
    requirements: 'Brand guidelines, platform requirements'
  },

  // HVAC
  {
    sellerId: 'user_hvac_001',
    title: 'Air Conditioning Installation & Repair',
    description: 'Licensed HVAC technician providing AC installation, repair, and maintenance. Energy-efficient systems available.',
    category: 'HVAC',
    price: 200,
    tags: ['AC', 'air conditioning', 'licensed', 'repair'],
    status: 'active',
    deliveryMethod: 'service',
    estimatedDelivery: '1-3 days',
    requirements: 'Property size and current AC system details'
  },
  {
    sellerId: 'user_hvac_002',
    title: 'Home Energy Efficiency Audit',
    description: 'Comprehensive home energy audit to identify heating and cooling inefficiencies. Recommendations provided to reduce energy costs.',
    category: 'HVAC',
    price: 150,
    tags: ['energy audit', 'efficiency', 'savings', 'consultation'],
    status: 'active',
    deliveryMethod: 'service',
    estimatedDelivery: 'Same day',
    requirements: 'Property address and approximate age of home'
  },

  // Cleaning Services
  {
    sellerId: 'user_cleaner_001',
    title: 'Deep House Cleaning Service',
    description: 'Thorough deep cleaning of your entire home. Kitchen, bathrooms, bedrooms, living areas. Eco-friendly products used.',
    category: 'Cleaning Services',
    price: 120,
    tags: ['deep cleaning', 'house', 'eco-friendly', 'thorough'],
    status: 'active',
    deliveryMethod: 'service',
    estimatedDelivery: 'Same day or next day',
    requirements: 'Home size (sq ft) and special instructions'
  },
  {
    sellerId: 'user_cleaner_002',
    title: 'Office & Commercial Cleaning',
    description: 'Professional office cleaning services for businesses. Daily, weekly, or monthly schedules available. After-hours service possible.',
    category: 'Cleaning Services',
    price: 200,
    tags: ['office', 'commercial', 'business', 'professional'],
    status: 'active',
    deliveryMethod: 'service',
    estimatedDelivery: 'Flexible scheduling',
    requirements: 'Office size and preferred cleaning schedule'
  },

  // Automotive Services
  {
    sellerId: 'user_mechanic_001',
    title: 'General Auto Repair & Maintenance',
    description: 'Experienced mechanic offering general repairs, oil changes, brake services, and diagnostics. Honest pricing and reliable service.',
    category: 'Automotive Services',
    price: 100,
    tags: ['auto repair', 'mechanic', 'maintenance', 'diagnostics'],
    status: 'active',
    deliveryMethod: 'service',
    estimatedDelivery: 'Same day or next day',
    requirements: 'Vehicle make, model, year, and issue description'
  },
  {
    sellerId: 'user_mechanic_002',
    title: 'Mobile Mechanic - We Come To You',
    description: 'Mobile mechanic service bringing repairs to your location. Oil changes, battery replacement, brake repair, and more at your home or office.',
    category: 'Automotive Services',
    price: 125,
    tags: ['mobile', 'convenient', 'on-site', 'auto repair'],
    status: 'active',
    deliveryMethod: 'service',
    estimatedDelivery: 'Same day service available',
    requirements: 'Vehicle location and service needed'
  },

  // Photography & Videography
  {
    sellerId: 'user_photographer_001',
    title: 'Event Photography - Weddings & Special Occasions',
    description: 'Professional event photographer capturing your special moments. Full day coverage with edited photos delivered digitally.',
    category: 'Photography & Videography',
    price: 600,
    tags: ['wedding', 'event', 'photography', 'professional'],
    status: 'active',
    deliveryMethod: 'service',
    estimatedDelivery: '2-3 weeks for edited photos',
    requirements: 'Event date, location, and coverage hours'
  },
  {
    sellerId: 'user_photographer_002',
    title: 'Product Photography for E-commerce',
    description: 'High-quality product photography for online stores. White background, lifestyle shots, and 360-degree views available.',
    category: 'Photography & Videography',
    price: 150,
    tags: ['product', 'e-commerce', 'photography', 'professional'],
    status: 'active',
    deliveryMethod: 'digital',
    estimatedDelivery: '3-5 days',
    requirements: 'Products to be photographed and usage requirements'
  }
];

/**
 * Seed the database with sample listings
 */
export async function seedListings() {
  console.log('🌱 Seeding sample listings...');
  
  try {
    let successCount = 0;
    let errorCount = 0;

    for (const listingData of SAMPLE_LISTINGS) {
      try {
        await Listing.create(listingData);
        successCount++;
        console.log(`✅ Created listing: ${listingData.title}`);
      } catch (error) {
        errorCount++;
        console.error(`❌ Error creating listing "${listingData.title}":`, error);
      }
    }
    
    console.log(`\n📊 Seeding Summary:`);
    console.log(`   ✅ Successfully created: ${successCount} listings`);
    console.log(`   ❌ Errors: ${errorCount} listings`);
    console.log(`\n✅ Sample listings seeded successfully!`);
    
  } catch (error) {
    console.error('❌ Error seeding listings:', error);
    throw error;
  }
}

/**
 * Clear all existing listings (use with caution!)
 */
export async function clearListings() {
  console.log('🗑️  Clearing all listings...');
  try {
    const result = await Listing.deleteMany({});
    console.log(`✅ Deleted ${result.deletedCount} listings`);
  } catch (error) {
    console.error('❌ Error clearing listings:', error);
    throw error;
  }
}

// Export for direct execution
if (require.main === module) {
  seedListings()
    .then(() => {
      console.log('✅ Seeding complete!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Seeding failed:', error);
      process.exit(1);
    });
}
