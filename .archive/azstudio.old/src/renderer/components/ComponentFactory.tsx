import React, { useState, useEffect } from 'react';

// Dummy definition to satisfy parser if it gets confused by template strings
const analytics: any = {};

interface ComponentTemplate {
  id: string;
  name: string;
  category: 'ui' | 'api' | 'database' | 'auth' | 'payment';
  description: string;
  icon: string;
  code: string;
  dependencies: string[];
}

interface GeneratedComponent {
  name: string;
  code: string;
  type: string;
  path: string;
}

const ComponentFactory: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<ComponentTemplate | null>(null);
  const [generatedComponents, setGeneratedComponents] = useState<GeneratedComponent[]>([]);
  const [projectName, setProjectName] = useState('my-azora-app');
  const [isGenerating, setIsGenerating] = useState(false);

  const templates: ComponentTemplate[] = [
    {
      id: 'education-platform',
      name: 'Education Platform',
      category: 'ui',
      description: 'Complete learning management system with courses, lessons, and progress tracking',
      icon: '🎓',
      code: `// Education Platform Component
import React, { useState, useEffect } from 'react';
import { AzoraDatabase } from '@azora/database';

interface Course {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  progress: number;
}

interface Lesson {
  id: string;
  title: string;
  content: string;
  videoUrl?: string;
  duration: number;
  completed: boolean;
}

const EducationPlatform: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);

  useEffect(() => {
    // Load courses from Azora database
    AzoraDatabase.getCourses().then(setCourses);
  }, []);

  const enrollInCourse = async (courseId: string) => {
    await AzoraDatabase.enrollInCourse(courseId);
    // Refresh courses
    const updatedCourses = await AzoraDatabase.getCourses();
    setCourses(updatedCourses);
  };

  const markLessonComplete = async (lessonId: string) => {
    await AzoraDatabase.markLessonComplete(lessonId);
    // Update progress
    if (activeCourse) {
      const updatedCourse = await AzoraDatabase.getCourse(activeCourse.id);
      setActiveCourse(updatedCourse);
    }
  };

  return (
    <div className="education-platform">
      <header className="platform-header">
        <h1>🎓 Azora Education Platform</h1>
        <nav className="platform-nav">
          <button className="nav-btn active">My Courses</button>
          <button className="nav-btn">Discover</button>
          <button className="nav-btn">Progress</button>
        </nav>
      </header>

      <main className="platform-main">
        <aside className="course-sidebar">
          <h2>My Courses</h2>
          {courses.map(course => (
            <div
              key={course.id}
              className={\`course-card \${activeCourse?.id === course.id ? 'active' : ''}\`}
              onClick={() => setActiveCourse(course)}
            >
              <h3>{course.title}</h3>
              <p>{course.description}</p>
              <div className="course-progress">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: \`\${course.progress}%\` }} />
                </div>
                <span>{course.progress}% Complete</span>
              </div>
            </div>
          ))}
        </aside>

        <section className="lesson-content">
          {activeCourse ? (
            <>
              <div className="course-header">
                <h2>{activeCourse.title}</h2>
                <p>{activeCourse.description}</p>
              </div>

              <div className="lessons-list">
                <h3>Lessons</h3>
                {activeCourse.lessons.map(lesson => (
                  <div
                    key={lesson.id}
                    className={\`lesson-item \${lesson.completed ? 'completed' : ''}\`}
                    onClick={() => setActiveLesson(lesson)}
                  >
                    <div className="lesson-info">
                      <h4>{lesson.title}</h4>
                      <span className="lesson-duration">{lesson.duration} min</span>
                    </div>
                    {lesson.completed && <span className="completion-badge">✓</span>}
                  </div>
                ))}
              </div>

              {activeLesson && (
                <div className="lesson-viewer">
                  <h3>{activeLesson.title}</h3>
                  <div className="lesson-content">
                    {activeLesson.videoUrl && (
                      <video controls className="lesson-video">
                        <source src={activeLesson.videoUrl} type="video/mp4" />
                      </video>
                    )}
                    <div className="lesson-text">{activeLesson.content}</div>
                  </div>
                  <button
                    className="complete-btn"
                    onClick={() => markLessonComplete(activeLesson.id)}
                    disabled={activeLesson.completed}
                  >
                    {activeLesson.completed ? 'Completed ✓' : 'Mark as Complete'}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              <h2>Select a course to begin learning</h2>
              <p>Choose from your enrolled courses on the left</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default EducationPlatform;`,
      dependencies: ['@azora/database', '@azora/ui-components', 'react', 'react-router-dom']
    },
    {
      id: 'marketplace-storefront',
      name: 'Marketplace Storefront',
      category: 'ui',
      description: 'E-commerce marketplace with product listings, cart, and checkout',
      icon: '🛍️',
      code: `// Marketplace Storefront Component
import React, { useState, useEffect } from 'react';
import { AzoraMarketplace, AzoraPayments } from '@azora/marketplace';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  images: string[];
  category: string;
  seller: {
    id: string;
    name: string;
    rating: number;
  };
  inStock: boolean;
}

interface CartItem extends Product {
  quantity: number;
}

const MarketplaceStorefront: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Load products from Azora marketplace
    AzoraMarketplace.getProducts().then(setProducts);
  }, []);

  const addToCart = async (product: Product) => {
    await AzoraMarketplace.addToCart(product.id, 1);
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity === 0) {
      removeFromCart(productId);
    } else {
      setCart(prev =>
        prev.map(item =>
          item.id === productId
            ? { ...item, quantity }
            : item
        )
      );
    }
  };

  const checkout = async () => {
    try {
      const order = await AzoraPayments.createOrder(cart);
      // Redirect to payment or show payment modal
      window.location.href = order.paymentUrl;
    } catch (error) {
      console.error('Checkout failed:', error);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="marketplace-storefront">
      <header className="storefront-header">
        <h1>🛍️ Azora Marketplace</h1>
        <div className="header-actions">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="cart-button">
            🛒 Cart ({cartCount})
          </button>
        </div>
      </header>

      <nav className="category-nav">
        <button
          className={\`category-btn \${selectedCategory === 'all' ? 'active' : ''}\`}
          onClick={() => setSelectedCategory('all')}
        >
          All Products
        </button>
        <button
          className={\`category-btn \${selectedCategory === 'electronics' ? 'active' : ''}\`}
          onClick={() => setSelectedCategory('electronics')}
        >
          Electronics
        </button>
        <button
          className={\`category-btn \${selectedCategory === 'clothing' ? 'active' : ''}\`}
          onClick={() => setSelectedCategory('clothing')}
        >
          Clothing
        </button>
        <button
          className={\`category-btn \${selectedCategory === 'books' ? 'active' : ''}\`}
          onClick={() => setSelectedCategory('books')}
        >
          Books
        </button>
      </nav>

      <main className="storefront-main">
        <section className="products-grid">
          {filteredProducts.map(product => (
            <div key={product.id} className="product-card">
              <div className="product-images">
                <img src={product.images[0]} alt={product.name} />
              </div>
              <div className="product-info">
                <h3>{product.name}</h3>
                <p className="product-description">{product.description}</p>
                <div className="product-meta">
                  <span className="price">{product.currency} {product.price}</span>
                  <span className="seller">{product.seller.name}</span>
                  <span className="rating">⭐ {product.seller.rating}</span>
                </div>
                <button
                  className="add-to-cart-btn"
                  onClick={() => addToCart(product)}
                  disabled={!product.inStock}
                >
                  {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                </button>
              </div>
            </div>
          ))}
        </section>

        <aside className="cart-sidebar">
          <h2>Shopping Cart</h2>
          {cart.length === 0 ? (
            <p>Your cart is empty</p>
          ) : (
            <>
              {cart.map(item => (
                <div key={item.id} className="cart-item">
                  <h4>{item.name}</h4>
                  <div className="cart-item-controls">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                  <span className="item-total">{item.currency} {item.price * item.quantity}</span>
                  <button
                    className="remove-btn"
                    onClick={() => removeFromCart(item.id)}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <div className="cart-summary">
                <div className="cart-total">
                  <strong>Total: {cart[0]?.currency || 'USD'} {cartTotal}</strong>
                </div>
                <button className="checkout-btn" onClick={checkout}>
                  Proceed to Checkout
                </button>
              </div>
            </>
          )}
        </aside>
      </main>
    </div>
  );
};

export default MarketplaceStorefront;`,
      dependencies: ['@azora/marketplace', '@azora/payments', '@azora/ui-components', 'react']
    },
    {
      id: 'saas-dashboard',
      name: 'SaaS Dashboard',
      category: 'ui',
      description: 'Complete SaaS application with user management, analytics, and billing',
      icon: '📊',
      code: `// SaaS Dashboard Component
import React, { useState, useEffect } from 'react';
import { AzoraAuth, AzoraAnalytics, AzoraBilling } from '@azora/saas';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'viewer';
  subscription: 'free' | 'pro' | 'enterprise';
  lastActive: Date;
}

interface Analytics {
  totalUsers: number;
  activeUsers: number;
  revenue: number;
  growth: number;
}

const SaasDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'billing' | 'settings'>('overview');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    // Load dashboard data
    Promise.all([
      AzoraAuth.getUsers(),
      AzoraAnalytics.getOverview(),
      AzoraAuth.getCurrentUser()
    ]).then(([usersData, analyticsData, userData]) => {
      setUsers(usersData);
      setAnalytics(analyticsData);
      setCurrentUser(userData);
    });
  }, []);

  const updateUserRole = async (userId: string, role: User['role']) => {
    await AzoraAuth.updateUserRole(userId, role);
    setUsers(prev =>
      prev.map(user =>
        user.id === userId ? { ...user, role } : user
      )
    );
  };

  const exportUsers = async () => {
    const csv = AzoraAuth.exportUsersToCSV(users);
    // Download CSV file
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users.csv';
    a.click();
  };

  return (
    <div className="saas-dashboard">
      <header className="dashboard-header">
        <h1>🚀 Azora SaaS Dashboard</h1>
        <div className="header-actions">
          <span className="user-info">
            Welcome, {currentUser?.name} ({currentUser?.role})
          </span>
          <button className="logout-btn" onClick={() => AzoraAuth.logout()}>
            Logout
          </button>
        </div>
      </header>

      <nav className="dashboard-nav">
        <button
          className={\`nav-tab \${activeTab === 'overview' ? 'active' : ''}\`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button
          className={\`nav-tab \${activeTab === 'users' ? 'active' : ''}\`}
          onClick={() => setActiveTab('users')}
        >
          👥 Users
        </button>
        <button
          className={\`nav-tab \${activeTab === 'billing' ? 'active' : ''}\`}
          onClick={() => setActiveTab('billing')}
        >
          💳 Billing
        </button>
        <button
          className={\`nav-tab \${activeTab === 'settings' ? 'active' : ''}\`}
          onClick={() => setActiveTab('settings')}
        >
          ⚙️ Settings
        </button>
      </nav>

      <main className="dashboard-main">
        {activeTab === 'overview' && analytics && (
          <div className="overview-content">
            <div className="metrics-grid">
              <div className="metric-card">
                <h3>Total Users</h3>
                <div className="metric-value">{analytics.totalUsers}</div>
                <div className="metric-change positive">+{analytics.growth}%</div>
              </div>
              <div className="metric-card">
                <h3>Active Users</h3>
                <div className="metric-value">{analytics.activeUsers}</div>
                <div className="metric-change positive">+12%</div>
              </div>
              <div className="metric-card">
                <h3>Revenue</h3>
                <div className="metric-value">${analytics.revenue}</div>
                <div className="metric-change positive">+8%</div>
              </div>
              <div className="metric-card">
                <h3>Growth Rate</h3>
                <div className="metric-value">{analytics.growth}%</div>
                <div className="metric-change negative">-2%</div>
              </div>
            </div>

            <div className="charts-section">
              <div className="chart-container">
                <h3>User Growth</h3>
                <div className="chart-placeholder">
                  📈 User growth chart would go here
                </div>
              </div>
              <div className="chart-container">
                <h3>Revenue Trends</h3>
                <div className="chart-placeholder">
                  💰 Revenue chart would go here
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="users-content">
            <div className="users-header">
              <h2>User Management</h2>
              <button className="export-btn" onClick={exportUsers}>
                📥 Export CSV
              </button>
            </div>

            <div className="users-table">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Subscription</th>
                    <th>Last Active</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id}>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td>
                        <select
                          value={user.role}
                          onChange={(e) => updateUserRole(user.id, e.target.value as User['role'])}
                        >
                          <option value="viewer">Viewer</option>
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td>
                        <span className={\`subscription-badge \${user.subscription}\`}>
                          {user.subscription}
                        </span>
                      </td>
                      <td>{new Date(user.lastActive).toLocaleDateString()}</td>
                      <td>
                        <button className="action-btn">Edit</button>
                        <button className="action-btn danger">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'billing' && (
          <div className="billing-content">
            <h2>Billing Overview</h2>
            <div className="billing-placeholder">
              💳 Billing management interface would go here
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="settings-content">
            <h2>Application Settings</h2>
            <div className="settings-placeholder">
              ⚙️ Settings configuration would go here
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default SaasDashboard;`,
      dependencies: ['@azora/auth', '@azora/analytics', '@azora/billing', '@azora/ui-components', 'react']
    },
    {
      id: 'api-endpoint-generator',
      name: 'API Endpoint Generator',
      category: 'api',
      description: 'Generate REST API endpoints with authentication and validation',
      icon: '🔌',
      code: `// API Endpoint Generator
// Generated by AzStudio - REST API with authentication

import { AzoraAuth, AzoraValidation, AzoraDatabase } from '@azora/api-framework';
import express from 'express';
import cors from 'cors';

const app = express();
const router = express.Router();

// Middleware
app.use(cors());
app.use(express.json());
app.use(AzoraAuth.middleware); // Authentication middleware

// Validation schemas
const userValidation = {
  create: AzoraValidation.object({
    name: AzoraValidation.string().required(),
    email: AzoraValidation.string().email().required(),
    role: AzoraValidation.string().enum(['admin', 'user', 'viewer']).default('user')
  }),
  update: AzoraValidation.object({
    name: AzoraValidation.string(),
    role: AzoraValidation.string().enum(['admin', 'user', 'viewer'])
  })
};

// Routes

// GET /api/users - List all users
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    
    const users = await AzoraDatabase.getUsers({
      page: parseInt(page),
      limit: parseInt(limit),
      search
    });
    
    res.json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: users.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/users/:id - Get user by ID
router.get('/users/:id', async (req, res) => {
  try {
    const user = await AzoraDatabase.getUserById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/users - Create new user
router.post('/users', AzoraValidation.validate(userValidation.create), async (req, res) => {
  try {
    const user = await AzoraDatabase.createUser(req.body);
    
    res.status(201).json({
      success: true,
      data: user,
      message: 'User created successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// PUT /api/users/:id - Update user
router.put('/users/:id', AzoraValidation.validate(userValidation.update), async (req, res) => {
  try {
    const user = await AzoraDatabase.updateUser(req.params.id, req.body);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: user,
      message: 'User updated successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// DELETE /api/users/:id - Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    const success = await AzoraDatabase.deleteUser(req.params.id);
    
    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Error handling middleware
router.use((error, req, res, next) => {
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: error.details
    });
  }
  
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

export default router;`,
      dependencies: ['@azora/api-framework', 'express', 'cors', 'joi', 'jsonwebtoken']
    }
  ];

  const generateComponent = async () => {
    if (!selectedTemplate) return;

    setIsGenerating(true);

    const component: GeneratedComponent = {
      name: selectedTemplate.name,
      code: selectedTemplate.code,
      type: selectedTemplate.category,
      path: `src/components/${selectedTemplate.name.toLowerCase().replace(/\s+/g, '-')}.tsx`
    };

    setGeneratedComponents([...generatedComponents, component]);

    // Save to file system
    if (window.electronAPI?.fs?.writeFile) {
      await window.electronAPI.fs.writeFile(component.path, component.code);
    }

    // Show in AI assistant
    const aiPanel = document.querySelector('.ai-messages');
    if (aiPanel) {
      const message = document.createElement('div');
      message.className = 'ai-message assistant';
      message.innerHTML = `
        <strong>🚀 Component Generated!</strong><br>
        <strong>${selectedTemplate.icon} ${selectedTemplate.name}</strong><br>
        <br>
        ✅ Saved to <code>${component.path}</code><br>
        📦 Dependencies: ${selectedTemplate.dependencies.join(', ')}<br>
        <br>
        <div style="background: #2d2d2d; padding: 12px; border-radius: 4px; overflow-x: auto; font-size: 11px; max-height: 200px; overflow-y: auto;">
          <pre>${component.code.substring(0, 500)}${component.code.length > 500 ? '...' : ''}</pre>
        </div>
      `;
      aiPanel.appendChild(message);
    }

    setIsGenerating(false);
  };

  const installDependencies = async () => {
    const allDependencies = new Set<string>();
    generatedComponents.forEach(comp => {
      // Extract dependencies from template
      const template = templates.find(t => t.name === comp.name);
      if (template) {
        template.dependencies.forEach(dep => allDependencies.add(dep));
      }
    });

    // Show in AI assistant
    const aiPanel = document.querySelector('.ai-messages');
    if (aiPanel) {
      const message = document.createElement('div');
      message.className = 'ai-message assistant';
      message.innerHTML = `
        <strong>📦 Installing Dependencies...</strong><br>
        <br>
        Run this command in your terminal:<br>
        <code style="background: #2d2d2d; padding: 8px; border-radius: 4px;">
          npm install ${Array.from(allDependencies).join(' ')}
        </code>
      `;
      aiPanel.appendChild(message);
    }
  };

  return (
    <div style={{ padding: '16px', height: '100%', overflow: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, color: '#007acc' }}>🏭 Component Factory</h3>
        <div>
          <button
            onClick={generateComponent}
            disabled={!selectedTemplate || isGenerating}
            style={{
              padding: '8px 16px',
              background: isGenerating ? '#666' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isGenerating ? 'not-allowed' : 'pointer',
              marginRight: '8px'
            }}
          >
            {isGenerating ? '⚡ Generating...' : '🚀 Generate Component'}
          </button>
          <button
            onClick={installDependencies}
            disabled={generatedComponents.length === 0}
            style={{
              padding: '8px 16px',
              background: generatedComponents.length === 0 ? '#666' : '#007acc',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: generatedComponents.length === 0 ? 'not-allowed' : 'pointer'
            }}
          >
            📦 Install Dependencies
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '16px' }}>
        {/* Templates Panel */}
        <div style={{ flex: 1, background: '#252526', borderRadius: '8px', padding: '16px' }}>
          <h4 style={{ margin: '0 0 16px 0', color: '#cccccc' }}>Choose Template</h4>
          
          <div style={{ marginBottom: '16px' }}>
            <input
              type="text"
              placeholder="Project name..."
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                background: '#2d2d2d',
                border: '1px solid #3e3e3e',
                color: '#cccccc',
                borderRadius: '4px'
              }}
            />
          </div>

          <div style={{ display: 'grid', gap: '12px' }}>
            {templates.map(template => (
              <div
                key={template.id}
                className={`template-card ${selectedTemplate?.id === template.id ? 'selected' : ''}`}
                onClick={() => setSelectedTemplate(template)}
                style={{
                  padding: '12px',
                  background: selectedTemplate?.id === template.id ? '#007acc20' : '#2d2d2d',
                  border: `1px solid ${selectedTemplate?.id === template.id ? '#007acc' : '#3e3e3e'}`,
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '20px', marginRight: '8px' }}>{template.icon}</span>
                  <h5 style={{ margin: 0, color: '#cccccc' }}>{template.name}</h5>
                </div>
                <p style={{ margin: '0 0 8px 0', color: '#8c8c8c', fontSize: '12px' }}>
                  {template.description}
                </p>
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                  <span style={{ 
                    background: '#007acc', 
                    color: 'white', 
                    padding: '2px 6px', 
                    borderRadius: '3px', 
                    fontSize: '10px' 
                  }}>
                    {template.category}
                  </span>
                  <span style={{ 
                    background: '#666', 
                    color: 'white', 
                    padding: '2px 6px', 
                    borderRadius: '3px', 
                    fontSize: '10px' 
                  }}>
                    {template.dependencies.length} deps
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Preview Panel */}
        <div style={{ width: '400px', background: '#252526', borderRadius: '8px', padding: '16px' }}>
          <h4 style={{ margin: '0 0 16px 0', color: '#cccccc' }}>Preview</h4>
          
          {selectedTemplate ? (
            <div>
              <div style={{ marginBottom: '16px' }}>
                <h5 style={{ margin: '0 0 8px 0', color: '#007acc' }}>
                  {selectedTemplate.icon} {selectedTemplate.name}
                </h5>
                <p style={{ margin: '0 0 12px 0', color: '#8c8c8c', fontSize: '12px' }}>
                  {selectedTemplate.description}
                </p>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <h6 style={{ margin: '0 0 8px 0', color: '#cccccc', fontSize: '12px' }}>Dependencies:</h6>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {selectedTemplate.dependencies.map(dep => (
                    <span
                      key={dep}
                      style={{
                        background: '#3e3e3e',
                        color: '#cccccc',
                        padding: '2px 6px',
                        borderRadius: '3px',
                        fontSize: '10px',
                        fontFamily: 'monospace'
                      }}
                    >
                      {dep}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h6 style={{ margin: '0 0 8px 0', color: '#cccccc', fontSize: '12px' }}>Code Preview:</h6>
                <div style={{
                  background: '#1e1e1e',
                  padding: '12px',
                  borderRadius: '4px',
                  overflow: 'auto',
                  maxHeight: '300px',
                  fontSize: '11px',
                  fontFamily: 'Consolas, Monaco, monospace'
                }}>
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                    {selectedTemplate.code.substring(0, 1000)}
                    {selectedTemplate.code.length > 1000 && '\n...'}
                  </pre>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: '#8c8c8c', padding: '40px 0' }}>
              <h4>Select a template to preview</h4>
              <p style={{ fontSize: '12px' }}>Choose from the available templates on the left</p>
            </div>
          )}
        </div>
      </div>

      {/* Generated Components List */}
      {generatedComponents.length > 0 && (
        <div style={{ marginTop: '24px', background: '#252526', borderRadius: '8px', padding: '16px' }}>
          <h4 style={{ margin: '0 0 16px 0', color: '#cccccc' }}>Generated Components</h4>
          <div style={{ display: 'grid', gap: '8px' }}>
            {generatedComponents.map((comp, index) => (
              <div
                key={index}
                style={{
                  padding: '8px 12px',
                  background: '#2d2d2d',
                  borderRadius: '4px',
                  fontSize: '12px',
                  color: '#cccccc'
                }}
              >
                <span style={{ color: '#007acc' }}>✓</span> {comp.name} - {comp.path}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ComponentFactory;
