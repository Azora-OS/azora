# 🏆 PIVC Gamification Plugin - Technical Specification

## Vision
A modular, XBlock-inspired plugin that transforms any LMS into a constitutional, PIVC-powered learning platform with Sovereign Stars, Verifiable Credentials, and real-time collaboration.

## Architecture Philosophy

### Inspired by Open edX XBlocks
**Modular Components**: Each PIVC feature is a self-contained "block" that can be inserted anywhere in Moodle, Canvas, or any LMS without deep core modification.

### Inspired by Canvas UX
**Mobile-First Design**: Every component works flawlessly on mobile with offline support and instant notifications.

### Inspired by Sakai Collaboration
**CRDT-Based Real-Time**: True decentralized collaboration with conflict-free replicated data types.

## Core Components

### 1. PIVC XBlock Architecture
```typescript
// Base XBlock interface (Open edX-inspired)
interface PIVCBlock {
  id: string;
  type: 'sovereign-star' | 'peer-review' | 'portfolio' | 'leaderboard' | 'streak';
  config: BlockConfig;
  render(): HTMLElement;
  onEvent(event: BlockEvent): void;
  calculatePIVC(): number;
}

// Example: Sovereign Star Block
class SovereignStarBlock implements PIVCBlock {
  id: string;
  type = 'sovereign-star' as const;
  config: StarBlockConfig;
  
  render(): HTMLElement {
    // Fluent Fusion UI rendering
    return createFluentCard({
      title: 'Sovereign Stars',
      content: this.getStarDisplay(),
      actions: this.getActions(),
    });
  }
  
  calculatePIVC(): number {
    // Constitutional PIVC calculation
    return this.config.baseValue * this.config.multiplier;
  }
}
```

### 2. Sovereign Stars System
```typescript
interface SovereignStar {
  id: string;
  userId: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  pivcValue: number;
  contribution: VerifiableContribution;
  credential: VerifiableCredential; // W3C VC
  issuedAt: number;
  expiresAt?: number;
}

interface VerifiableContribution {
  type: 'peer-review' | 'project' | 'mentoring' | 'content' | 'real-world';
  description: string;
  evidence: Evidence[];
  impact: ImpactMetrics;
  constitutionalScore: number;
  verified: boolean;
  verifiedBy: string;
}

interface ImpactMetrics {
  reach: number;           // How many people affected
  quality: number;         // Quality score (0-100)
  innovation: number;      // Innovation score (0-100)
  alignment: number;       // Constitutional alignment (0-100)
  pivcScore: number;       // Final PIVC calculation
}
```

### 3. Verifiable Credential Integration
```typescript
// W3C Verifiable Credential for Sovereign Stars
interface AzoraSovereignStarCredential {
  '@context': [
    'https://www.w3.org/2018/credentials/v1',
    'https://azora.org/credentials/v1'
  ];
  type: ['VerifiableCredential', 'SovereignStarCredential'];
  issuer: {
    id: string; // Azora DID
    name: 'Azora LMS';
  };
  issuanceDate: string;
  expirationDate?: string;
  credentialSubject: {
    id: string; // Student DID
    starTier: string;
    pivcValue: number;
    contribution: {
      type: string;
      description: string;
      constitutionalScore: number;
    };
  };
  proof: {
    type: 'Ed25519Signature2020';
    created: string;
    verificationMethod: string;
    proofPurpose: 'assertionMethod';
    proofValue: string;
  };
}

// Issue credential using Polygon ID
async function issueSovereignStarCredential(
  star: SovereignStar
): Promise<VerifiableCredential> {
  const credential = await PolygonID.issueCredential({
    type: 'SovereignStarCredential',
    subject: star.userId,
    claims: {
      starTier: star.tier,
      pivcValue: star.pivcValue,
      contributionType: star.contribution.type,
      constitutionalScore: star.contribution.constitutionalScore,
    },
    expirationDate: star.expiresAt,
  });
  
  // Store on Sovrin/Hyperledger Indy
  await SovrinRegistry.anchor(credential);
  
  return credential;
}
```

### 4. CRDT-Based Collaboration (Sakai-Inspired)
```typescript
// Conflict-Free Replicated Data Type for real-time collaboration
import { Doc, Text } from 'yjs';
import { WebrtcProvider } from 'y-webrtc';

class PIVCCollaborationSpace {
  private doc: Doc;
  private provider: WebrtcProvider;
  private sharedContent: Text;
  
  constructor(roomId: string) {
    this.doc = new Doc();
    this.sharedContent = this.doc.getText('content');
    
    // Decentralized P2P sync (no central server)
    this.provider = new WebrtcProvider(roomId, this.doc, {
      signaling: ['wss://azora-signaling.org'],
    });
  }
  
  // Real-time peer review
  async submitPeerReview(review: PeerReview): Promise<void> {
    const reviewData = {
      id: generateId(),
      reviewer: review.reviewerId,
      rating: review.rating,
      feedback: review.feedback,
      timestamp: Date.now(),
      pivcAwarded: await this.calculateReviewPIVC(review),
    };
    
    // CRDT ensures conflict-free merge
    this.sharedContent.insert(0, JSON.stringify(reviewData));
    
    // Emit event for real-time UI update
    this.emit('review-submitted', reviewData);
  }
  
  private async calculateReviewPIVC(review: PeerReview): Promise<number> {
    // Constitutional vetting of review
    const vetting = await ConstitutionalRankingEngine.vet(review.feedback);
    
    if (!vetting.approved) return 0;
    
    // PIVC formula: Quality × Length × Constitutional Alignment
    const basePIVC = 10;
    const qualityMultiplier = review.rating / 5;
    const lengthMultiplier = Math.min(review.feedback.length / 100, 2);
    const alignmentMultiplier = vetting.score / 100;
    
    return Math.floor(
      basePIVC * qualityMultiplier * lengthMultiplier * alignmentMultiplier
    );
  }
}
```

### 5. E-Portfolio with Verifiable Credentials
```typescript
// Sakai-inspired portfolio, but with blockchain verification
interface AzoraPortfolio {
  id: string;
  userId: string;
  did: string; // Decentralized ID
  sections: PortfolioSection[];
  credentials: VerifiableCredential[];
  pivcScore: number;
  constitutionalAlignment: number;
  publicUrl: string;
  privateUrl: string;
}

interface PortfolioSection {
  id: string;
  title: string;
  type: 'project' | 'achievement' | 'skill' | 'experience';
  content: string;
  artifacts: Artifact[];
  credentials: VerifiableCredential[];
  pivcValue: number;
}

interface Artifact {
  id: string;
  type: 'document' | 'code' | 'video' | 'link';
  url: string;
  ipfsHash?: string; // Decentralized storage
  verified: boolean;
}

// Generate portfolio as Verifiable Presentation
async function generatePortfolioPresentation(
  portfolio: AzoraPortfolio
): Promise<VerifiablePresentation> {
  const presentation = {
    '@context': ['https://www.w3.org/2018/credentials/v1'],
    type: 'VerifiablePresentation',
    holder: portfolio.did,
    verifiableCredential: portfolio.credentials,
    proof: await signPresentation(portfolio),
  };
  
  return presentation;
}
```

### 6. OpenTelemetry Integration
```typescript
// Open edX-inspired analytics, but with OTel
import { trace, context, SpanStatusCode } from '@opentelemetry/api';

const tracer = trace.getTracer('azora-pivc-plugin');

async function awardSovereignStar(
  userId: string,
  contribution: VerifiableContribution
): Promise<SovereignStar> {
  const span = tracer.startSpan('award_sovereign_star');
  
  try {
    span.setAttributes({
      'user.id': userId,
      'contribution.type': contribution.type,
      'contribution.pivc': contribution.impact.pivcScore,
      'contribution.constitutional_score': contribution.constitutionalScore,
    });
    
    // Calculate star tier
    const tier = calculateStarTier(contribution.impact.pivcScore);
    
    // Issue VC
    const credential = await issueSovereignStarCredential({
      userId,
      tier,
      pivcValue: contribution.impact.pivcScore,
      contribution,
    } as SovereignStar);
    
    // Record to Constitutional Ranking Engine
    await CRE.recordPIVC({
      userId,
      pivcValue: contribution.impact.pivcScore,
      source: 'sovereign-star',
      timestamp: Date.now(),
    });
    
    span.setStatus({ code: SpanStatusCode.OK });
    span.addEvent('star_awarded', {
      tier,
      pivcValue: contribution.impact.pivcScore,
    });
    
    return {
      id: generateId(),
      userId,
      tier,
      pivcValue: contribution.impact.pivcScore,
      contribution,
      credential,
      issuedAt: Date.now(),
    };
  } catch (error) {
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: error.message,
    });
    throw error;
  } finally {
    span.end();
  }
}
```

### 7. WebAssembly for Massive Scale
```rust
// WASM module for client-side PIVC calculation (Open edX scale)
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct PIVCCalculator {
    base_value: f64,
    multipliers: Vec<f64>,
}

#[wasm_bindgen]
impl PIVCCalculator {
    #[wasm_bindgen(constructor)]
    pub fn new() -> PIVCCalculator {
        PIVCCalculator {
            base_value: 10.0,
            multipliers: vec![1.0, 1.5, 2.0, 3.0, 5.0], // Tier multipliers
        }
    }
    
    pub fn calculate_pivc(
        &self,
        quality: f64,
        reach: f64,
        innovation: f64,
        constitutional_score: f64,
    ) -> f64 {
        let base = self.base_value;
        let quality_factor = quality / 100.0;
        let reach_factor = (reach as f64).log10() / 3.0; // Log scale
        let innovation_factor = innovation / 100.0;
        let constitutional_factor = constitutional_score / 100.0;
        
        base * quality_factor * reach_factor * innovation_factor * constitutional_factor
    }
    
    pub fn calculate_star_tier(&self, pivc_score: f64) -> u8 {
        if pivc_score >= 100.0 { 4 } // Diamond
        else if pivc_score >= 50.0 { 3 } // Platinum
        else if pivc_score >= 25.0 { 2 } // Gold
        else if pivc_score >= 10.0 { 1 } // Silver
        else { 0 } // Bronze
    }
}
```

### 8. Mobile-First UI (Canvas-Inspired)
```typescript
// React Native components for mobile app
import { View, Text, TouchableOpacity } from 'react-native';
import { FluentCard } from '@azora/fluent-fusion';

export const SovereignStarCard: React.FC<{ star: SovereignStar }> = ({ star }) => {
  return (
    <FluentCard
      blur={20}
      depth={3}
      motion="hover"
      style={styles.card}
    >
      <View style={styles.header}>
        <StarIcon tier={star.tier} size={48} />
        <Text style={styles.title}>{star.tier.toUpperCase()} STAR</Text>
      </View>
      
      <View style={styles.content}>
        <PIVCBadge value={star.pivcValue} />
        <Text style={styles.description}>{star.contribution.description}</Text>
        
        <TouchableOpacity
          style={styles.verifyButton}
          onPress={() => verifyCredential(star.credential)}
        >
          <Text style={styles.buttonText}>Verify on Blockchain</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.footer}>
        <ConstitutionalScore score={star.contribution.constitutionalScore} />
        <ShareButton credential={star.credential} />
      </View>
    </FluentCard>
  );
};

// Offline support with IndexedDB
class OfflinePIVCSync {
  private db: IDBDatabase;
  
  async syncWhenOnline(): Promise<void> {
    const pendingActions = await this.getPendingActions();
    
    for (const action of pendingActions) {
      try {
        await this.executeAction(action);
        await this.markAsSync(action.id);
      } catch (error) {
        console.error('Sync failed:', error);
      }
    }
  }
  
  async awardStarOffline(star: SovereignStar): Promise<void> {
    await this.db.transaction(['pending'], 'readwrite')
      .objectStore('pending')
      .add({
        type: 'award-star',
        data: star,
        timestamp: Date.now(),
      });
    
    // Show optimistic UI
    this.emit('star-awarded-offline', star);
  }
}
```

## Moodle Integration

### Plugin Structure
```
local/azora_pivc/
├── version.php
├── db/
│   ├── install.xml          # Database schema
│   ├── upgrade.php          # Upgrade scripts
│   └── events.php           # Event observers
├── classes/
│   ├── pivc_calculator.php
│   ├── sovereign_star.php
│   ├── verifiable_credential.php
│   └── crdt_collaboration.php
├── blocks/
│   ├── sovereign_stars/
│   ├── leaderboard/
│   └── peer_review/
├── lang/
│   └── en/
│       └── local_azora_pivc.php
├── templates/
│   ├── star_card.mustache
│   ├── leaderboard.mustache
│   └── portfolio.mustache
└── amd/
    └── src/
        ├── pivc_calculator.js    # WASM wrapper
        ├── crdt_sync.js          # Yjs integration
        └── fluent_components.js  # UI components
```

### Database Schema
```sql
-- Sovereign Stars
CREATE TABLE mdl_azora_sovereign_stars (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    userid BIGINT NOT NULL,
    tier VARCHAR(20) NOT NULL,
    pivc_value INT NOT NULL,
    contribution_type VARCHAR(50),
    contribution_data TEXT,
    credential_id VARCHAR(255),
    credential_data TEXT,
    issued_at BIGINT NOT NULL,
    expires_at BIGINT,
    FOREIGN KEY (userid) REFERENCES mdl_user(id),
    INDEX idx_user_tier (userid, tier),
    INDEX idx_pivc (pivc_value DESC)
);

-- Verifiable Credentials
CREATE TABLE mdl_azora_credentials (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    credential_id VARCHAR(255) UNIQUE NOT NULL,
    userid BIGINT NOT NULL,
    credential_type VARCHAR(100),
    credential_json TEXT NOT NULL,
    proof_json TEXT NOT NULL,
    issued_at BIGINT NOT NULL,
    expires_at BIGINT,
    revoked BOOLEAN DEFAULT FALSE,
    blockchain_tx VARCHAR(255),
    FOREIGN KEY (userid) REFERENCES mdl_user(id)
);

-- CRDT Collaboration Spaces
CREATE TABLE mdl_azora_collab_spaces (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    room_id VARCHAR(255) UNIQUE NOT NULL,
    course_id BIGINT,
    activity_id BIGINT,
    crdt_state LONGTEXT,
    last_updated BIGINT NOT NULL,
    FOREIGN KEY (course_id) REFERENCES mdl_course(id)
);

-- E-Portfolios
CREATE TABLE mdl_azora_portfolios (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    userid BIGINT NOT NULL UNIQUE,
    did VARCHAR(255),
    pivc_score INT DEFAULT 0,
    constitutional_alignment DECIMAL(5,2),
    public_url VARCHAR(255),
    portfolio_data TEXT,
    created_at BIGINT NOT NULL,
    updated_at BIGINT NOT NULL,
    FOREIGN KEY (userid) REFERENCES mdl_user(id)
);
```

## Deployment

### Installation
```bash
# 1. Install plugin
cd /path/to/moodle
git clone https://github.com/azora-os/moodle-local_azora_pivc.git local/azora_pivc

# 2. Install dependencies
cd local/azora_pivc
npm install
composer install

# 3. Build WASM module
cd wasm
cargo build --target wasm32-unknown-unknown --release
wasm-bindgen target/wasm32-unknown-unknown/release/pivc_calculator.wasm --out-dir ../amd/build

# 4. Run Moodle upgrade
php admin/cli/upgrade.php

# 5. Configure Sovereign Identity
# Set DID issuer, Polygon ID credentials, Sovrin node URL
```

## Success Metrics

- **PIVC Calculation**: <10ms (WASM)
- **Credential Issuance**: <2 seconds
- **Real-time Collaboration**: <50ms latency
- **Offline Support**: 100% feature parity
- **Mobile Performance**: 60 FPS
- **Constitutional Alignment**: 95%+ average
- **Blockchain Verification**: <1 second

## Status: SPECIFICATION COMPLETE ✅

Ready for implementation with XBlock modularity, Canvas UX, Sakai collaboration, and full VC/DID integration!
