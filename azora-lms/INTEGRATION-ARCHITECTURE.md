# 🏗️ Azora LMS Integration Architecture

## Executive Summary

Azora LMS transforms Moodle into a world-class, AI-powered learning platform by integrating:
- Constitutional Learning Agent (CLA)
- PIVC Gamification Engine
- GraphQL Unified Gateway
- Decentralized Identity (DID)
- Fluent Fusion Theme

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     Azora LMS Frontend                           │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Fluent Fusion Theme (Material 3 + Fluent Design)          │ │
│  │  - Adaptive Layouts                                         │ │
│  │  - Flower of Life Navigation                               │ │
│  │  - WCAG 2.1 AAA Accessibility                              │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              GraphQL Unified Gateway (Port 4000)                 │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  - Course Management API                                    │ │
│  │  - PIVC Metrics API                                        │ │
│  │  - Constitutional Ranking API                              │ │
│  │  - DID Integration API                                     │ │
│  │  - Real-time Subscriptions                                │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    Azora LMS Core Services                       │
│  ┌──────────────────┐  ┌──────────────────┐  ┌───────────────┐ │
│  │ Constitutional   │  │ PIVC Gamification│  │ Elara AI      │ │
│  │ Learning Agent   │  │ Engine           │  │ Integration   │ │
│  │ (CLA)            │  │                  │  │               │ │
│  └──────────────────┘  └──────────────────┘  └───────────────┘ │
│  ┌──────────────────┐  ┌──────────────────┐  ┌───────────────┐ │
│  │ Content Vetting  │  │ Adaptive Path    │  │ DID Manager   │ │
│  │ Engine           │  │ Generator        │  │               │ │
│  └──────────────────┘  └──────────────────┘  └───────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    Moodle 5.0.1 Core (GPL-3.0)                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  - Course Management                                        │ │
│  │  - User Management                                          │ │
│  │  - Assessment Engine                                        │ │
│  │  - Plugin System                                           │ │
│  │  - Database Layer (PostgreSQL/MySQL)                       │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    Sapiens Platform Integration                  │
│  - Constitutional Ranking Engine (CRE)                           │
│  - PIVC Calculation Service                                      │
│  - Decentralized Identity (DID) Registry                        │
│  - Azora Supreme Organism                                        │
└─────────────────────────────────────────────────────────────────┘
```

## Component Details

### 1. Fluent Fusion Theme

**Location**: `azora-lms/theme/fluent-fusion/`

**Features**:
- Material 3 color system with Fluent Design blur effects
- Adaptive widget-based dashboard
- Flower of Life sacred geometry navigation
- Dark/Light mode with smooth transitions
- WCAG 2.1 AAA compliance

**Implementation**:
```php
// Moodle theme structure
theme/fluent-fusion/
├── config.php              # Theme configuration
├── version.php             # Version info
├── lang/
│   └── en/
│       └── theme_fluentfusion.php
├── layout/
│   ├── columns2.php        # 2-column layout
│   ├── dashboard.php       # Dashboard layout
│   └── course.php          # Course layout
├── scss/
│   ├── _variables.scss     # Material 3 + Fluent variables
│   ├── _components.scss    # Component styles
│   └── main.scss           # Main stylesheet
└── templates/
    ├── header.mustache
    ├── footer.mustache
    └── navigation.mustache
```

### 2. Constitutional Learning Agent Plugin

**Location**: `azora-lms/plugins/local/constitutional_agent/`

**Database Tables**:
```sql
-- Learner profiles
CREATE TABLE mdl_azora_learner_profiles (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    userid BIGINT NOT NULL,
    pivc_score INT DEFAULT 0,
    constitutional_alignment DECIMAL(5,2) DEFAULT 100.00,
    learning_style VARCHAR(20),
    strengths TEXT,
    weaknesses TEXT,
    completed_modules TEXT,
    current_path_id BIGINT,
    created_at BIGINT NOT NULL,
    updated_at BIGINT NOT NULL,
    FOREIGN KEY (userid) REFERENCES mdl_user(id)
);

-- Learning paths
CREATE TABLE mdl_azora_learning_paths (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    difficulty VARCHAR(20),
    estimated_duration INT,
    pivc_target INT,
    adaptive_rules TEXT,
    created_at BIGINT NOT NULL
);

-- Adaptive rules
CREATE TABLE mdl_azora_adaptive_rules (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    path_id BIGINT NOT NULL,
    condition_type VARCHAR(50),
    condition_value DECIMAL(10,2),
    action_type VARCHAR(50),
    target_modules TEXT,
    FOREIGN KEY (path_id) REFERENCES mdl_azora_learning_paths(id)
);

-- Content vetting results
CREATE TABLE mdl_azora_content_vetting (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    content_id VARCHAR(255) NOT NULL,
    content_type VARCHAR(50),
    constitutional_score DECIMAL(5,2),
    alignment VARCHAR(20),
    issues TEXT,
    recommendations TEXT,
    approved TINYINT(1) DEFAULT 0,
    vetted_at BIGINT NOT NULL,
    UNIQUE KEY (content_id)
);
```

**Moodle Integration Points**:
```php
// Event observers
$observers = array(
    array(
        'eventname' => '\core\event\course_module_completion_updated',
        'callback' => '\local_constitutional_agent\observer::module_completed',
    ),
    array(
        'eventname' => '\mod_quiz\event\attempt_submitted',
        'callback' => '\local_constitutional_agent\observer::assessment_submitted',
    ),
    array(
        'eventname' => '\core\event\course_viewed',
        'callback' => '\local_constitutional_agent\observer::analyze_and_adapt',
    ),
);
```

### 3. PIVC Gamification Plugin

**Location**: `azora-lms/plugins/local/pivc_gamification/`

**Database Tables**:
```sql
-- Sovereign Stars
CREATE TABLE mdl_azora_sovereign_stars (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    userid BIGINT NOT NULL,
    star_type VARCHAR(20) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    pivc_value INT NOT NULL,
    contribution_id BIGINT,
    did_credential TEXT,
    earned_at BIGINT NOT NULL,
    FOREIGN KEY (userid) REFERENCES mdl_user(id)
);

-- Verifiable Contributions
CREATE TABLE mdl_azora_contributions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    userid BIGINT NOT NULL,
    contribution_type VARCHAR(50) NOT NULL,
    description TEXT,
    impact_reach INT,
    impact_quality DECIMAL(5,2),
    impact_innovation DECIMAL(5,2),
    constitutional_alignment DECIMAL(5,2),
    pivc_score INT,
    verified TINYINT(1) DEFAULT 0,
    verified_by BIGINT,
    verified_at BIGINT,
    evidence TEXT,
    created_at BIGINT NOT NULL,
    FOREIGN KEY (userid) REFERENCES mdl_user(id)
);

-- Badges
CREATE TABLE mdl_azora_badges (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    badge_key VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(10),
    rarity VARCHAR(20),
    requirements TEXT,
    pivc_value INT,
    created_at BIGINT NOT NULL
);

-- User badges
CREATE TABLE mdl_azora_user_badges (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    userid BIGINT NOT NULL,
    badge_id BIGINT NOT NULL,
    earned_at BIGINT NOT NULL,
    FOREIGN KEY (userid) REFERENCES mdl_user(id),
    FOREIGN KEY (badge_id) REFERENCES mdl_azora_badges(id),
    UNIQUE KEY (userid, badge_id)
);

-- Learning streaks
CREATE TABLE mdl_azora_streaks (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    userid BIGINT NOT NULL UNIQUE,
    current_streak INT DEFAULT 0,
    longest_streak INT DEFAULT 0,
    last_activity_date BIGINT,
    streak_multiplier DECIMAL(5,2) DEFAULT 1.00,
    FOREIGN KEY (userid) REFERENCES mdl_user(id)
);

-- Peer reviews
CREATE TABLE mdl_azora_peer_reviews (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    reviewer_id BIGINT NOT NULL,
    target_user_id BIGINT NOT NULL,
    target_content_id VARCHAR(255),
    rating INT NOT NULL,
    feedback TEXT,
    pivc_awarded INT,
    constitutional_alignment DECIMAL(5,2),
    verified TINYINT(1) DEFAULT 0,
    submitted_at BIGINT NOT NULL,
    FOREIGN KEY (reviewer_id) REFERENCES mdl_user(id),
    FOREIGN KEY (target_user_id) REFERENCES mdl_user(id)
);

-- Leaderboards (materialized view, updated periodically)
CREATE TABLE mdl_azora_leaderboard (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    leaderboard_type VARCHAR(50) NOT NULL,
    timeframe VARCHAR(20) NOT NULL,
    userid BIGINT NOT NULL,
    rank INT NOT NULL,
    score INT NOT NULL,
    stars INT DEFAULT 0,
    badges INT DEFAULT 0,
    updated_at BIGINT NOT NULL,
    FOREIGN KEY (userid) REFERENCES mdl_user(id),
    UNIQUE KEY (leaderboard_type, timeframe, userid)
);
```

**Moodle Integration**:
```php
// Add gamification block to course pages
$block = block_instance('azora_gamification');
$block->config->show_stars = true;
$block->config->show_leaderboard = true;
$block->config->show_streak = true;

// Hook into grade submission
function local_pivc_gamification_grade_updated($event) {
    $grade = $event->get_grade();
    $userid = $grade->userid;
    
    // Calculate PIVC based on grade and constitutional alignment
    $pivc = calculate_pivc($grade);
    
    // Award Sovereign Star if threshold met
    if ($pivc >= 10) {
        award_sovereign_star($userid, $pivc);
    }
    
    // Update streak
    update_learning_streak($userid);
    
    // Check badge unlocks
    check_badge_unlocks($userid);
}
```

### 4. GraphQL Gateway Plugin

**Location**: `azora-lms/plugins/webservice/graphql/`

**Implementation**:
```php
// GraphQL endpoint
// URL: /webservice/graphql/index.php

require_once(__DIR__ . '/../../../config.php');
require_once($CFG->dirroot . '/lib/externallib.php');

// Initialize GraphQL server
$schema = build_azora_schema();
$server = new \GraphQL\Server\StandardServer([
    'schema' => $schema,
    'context' => get_graphql_context(),
    'debug' => debugging(),
]);

// Handle request
$server->handleRequest();

function build_azora_schema() {
    return \GraphQL\Type\Schema::make(
        \GraphQL\Utils\BuildSchema::build(file_get_contents('schema.graphql'))
    );
}

function get_graphql_context() {
    global $USER, $DB;
    
    return [
        'user' => $USER,
        'db' => $DB,
        'cla' => get_constitutional_learning_agent(),
        'pivc' => get_pivc_gamification_engine(),
    ];
}
```

### 5. DID Integration

**Location**: `azora-lms/plugins/local/did_credentials/`

**Features**:
- Issue verifiable credentials for achievements
- Store credentials on decentralized ledger
- Verify credentials cryptographically
- Export credentials to wallet

**Database Tables**:
```sql
CREATE TABLE mdl_azora_did_credentials (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    userid BIGINT NOT NULL,
    credential_type VARCHAR(50) NOT NULL,
    credential_data TEXT NOT NULL,
    did VARCHAR(255) NOT NULL,
    signature TEXT NOT NULL,
    issued_at BIGINT NOT NULL,
    expires_at BIGINT,
    revoked TINYINT(1) DEFAULT 0,
    FOREIGN KEY (userid) REFERENCES mdl_user(id)
);
```

## Deployment Strategy

### Phase 1: Foundation (Week 1-2)
1. Set up Moodle 5.0.1 instance
2. Configure PostgreSQL database
3. Install base plugins
4. Deploy Fluent Fusion theme

### Phase 2: Core Integration (Week 3-4)
1. Deploy Constitutional Learning Agent
2. Integrate PIVC Gamification Engine
3. Set up GraphQL Gateway
4. Connect to Sapiens platform

### Phase 3: Advanced Features (Week 5-6)
1. Implement DID credentials
2. Deploy Elara AI integration
3. Set up real-time subscriptions
4. Configure OpenTelemetry monitoring

### Phase 4: Testing & Launch (Week 7-8)
1. Comprehensive testing with Playwright
2. Performance optimization
3. Security audit
4. Production deployment

## CI/CD Pipeline

```yaml
# .github/workflows/azora-lms-ci.yml
name: Azora LMS CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.1'
      - name: Install Moodle
        run: |
          git clone -b MOODLE_501_STABLE https://github.com/moodle/moodle.git
          cd moodle
          php admin/cli/install_database.php
      - name: Install Azora plugins
        run: |
          cp -r plugins/* moodle/
      - name: Run PHPUnit tests
        run: |
          cd moodle
          php admin/tool/phpunit/cli/init.php
          vendor/bin/phpunit
      - name: Run Playwright tests
        run: |
          npm install
          npx playwright test

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to production
        run: |
          # Deploy script
```

## Performance Targets

- **Page Load**: < 2 seconds
- **API Response**: < 200ms (p95)
- **GraphQL Query**: < 100ms (p95)
- **Real-time Updates**: < 50ms latency
- **Concurrent Users**: 10,000+
- **Uptime**: 99.9%

## Security Measures

1. **Authentication**: OAuth 2.0 + JWT
2. **Authorization**: Role-based access control (RBAC)
3. **Encryption**: TLS 1.3, AES-256
4. **Input Validation**: Parameterized queries, sanitization
5. **Rate Limiting**: 100 req/min per user
6. **Audit Logging**: All actions logged with OpenTelemetry

## Monitoring & Observability

```typescript
// OpenTelemetry setup
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';

const sdk = new NodeSDK({
  serviceName: 'azora-lms',
  instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();
```

## Success Metrics

- **Learner Engagement**: 80%+ completion rate
- **PIVC Growth**: 50+ average per learner
- **Constitutional Alignment**: 90%+ average
- **Peer Reviews**: 10+ per learner
- **Learning Streaks**: 30+ days average
- **Satisfaction**: 4.5/5.0+ rating

---

**Next Steps**: See `DEPLOYMENT-GUIDE.md` for detailed deployment instructions.
