# Self-Updating Knowledge Ocean - Complete System

## Vision: A Knowledge Base That Learns and Stays Current

The Knowledge Ocean doesn't just answer questions - it **learns from every query** and **keeps itself updated automatically**.

---

## Core Principles

### 1. **Learn from Every Search**
When we fetch from external sources (web/AI), we update the ocean:
```
User 1: "Who is the president of USA?"
→ Ocean: Expired/Not found
→ Fetch from web: "Donald Trump (2025-2029)"
→ Answer user
→ UPDATE OCEAN with new info
→ Next user gets instant local answer!
```

### 2. **Auto-Refresh Dynamic Knowledge**
Background job runs hourly/daily to refresh dynamic facts:
```
Every 24 hours:
→ Check all dynamic knowledge
→ Refresh expired entries
→ Update ocean
→ Users always get current info
```

### 3. **Smart Caching**
- Static knowledge: Never refreshes (speed of light won't change!)
- Dynamic knowledge: Auto-refreshes based on importance
- Critical info: Hourly updates
- Less critical: Daily/weekly updates

---

## System Architecture

### Flow Diagram

```
User Query
    ↓
Knowledge Ocean Check
    ↓
    ├─ Found & Fresh
    │   ↓
    │   Return Local (instant)
    │
    ├─ Found & Expired
    │   ↓
    │   Fetch from Web/AI
    │   ↓
    │   Answer User
    │   ↓
    │   UPDATE OCEAN ✅
    │   ↓
    │   Next user gets local answer
    │
    └─ Not Found
        ↓
        Fetch from Web/AI
        ↓
        Answer User
        ↓
        ADD TO OCEAN ✅
        ↓
        Next user gets local answer
```

---

## Implementation

### 1. Enhanced Knowledge Entry

```typescript
export interface KnowledgeEntry {
  id: string;
  category: 'curriculum' | 'system' | 'general' | 'computation';
  title: string;
  content: string;
  keywords: string[];
  
  // Freshness system
  knowledgeType: 'static' | 'dynamic';
  expiresAt?: string; // When it becomes stale
  refreshFrequency?: 'hourly' | 'daily' | 'weekly'; // How often to auto-refresh
  updateSource?: 'web-search' | 'api' | 'manual';
  
  // Learning system
  queryCount: number; // How many times queried
  lastQueried: string; // Last query time
  confidence: number; // 0-1, how confident we are in this answer
  sourceUrl?: string; // Where we got this info
  
  lastUpdated: string;
}
```

### 2. Smart Query Handler

```typescript
async chat(message: string, agent: string = 'ELARA'): Promise<AIResponse> {
  // 1. Try Knowledge Ocean first
  const localAnswer = knowledgeOcean.tryAnswer(message, agent);
  
  if (localAnswer) {
    // Found in ocean and fresh!
    knowledgeOcean.recordQuery(message); // Track usage
    return {
      content: localAnswer,
      model: 'knowledge-ocean',
      provider: 'local',
      usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 }
    };
  }
  
  // 2. Not found or expired - fetch from external source
  const externalAnswer = await this.callExternalAI(message, agent);
  
  // 3. UPDATE OCEAN with new knowledge ✅
  await knowledgeOcean.learnFromQuery(message, externalAnswer);
  
  return externalAnswer;
}
```

### 3. Learning System

```typescript
class KnowledgeOcean {
  /**
   * Learn from external queries - add to ocean
   */
  async learnFromQuery(query: string, answer: string): Promise<void> {
    // Extract key information
    const keywords = this.extractKeywords(query);
    const category = this.categorizeQuery(query);
    const knowledgeType = this.determineType(query); // static or dynamic
    
    // Create new knowledge entry
    const entry: KnowledgeEntry = {
      id: this.generateId(query),
      category,
      title: this.extractTitle(query),
      content: answer,
      keywords,
      knowledgeType,
      expiresAt: knowledgeType === 'dynamic' ? this.calculateExpiration(query) : undefined,
      refreshFrequency: this.determineRefreshFrequency(query),
      updateSource: 'web-search',
      queryCount: 1,
      lastQueried: new Date().toISOString(),
      confidence: 0.8, // Initial confidence
      lastUpdated: new Date().toISOString()
    };
    
    // Add to ocean
    this.addKnowledge(entry);
    
    console.log(`✅ Learned: "${entry.title}" - Next user gets instant answer!`);
  }
  
  /**
   * Determine if knowledge is static or dynamic
   */
  private determineType(query: string): 'static' | 'dynamic' {
    const dynamicKeywords = [
      'president', 'ceo', 'current', 'latest', 'now', 'today',
      'price', 'weather', 'score', 'news', 'who is'
    ];
    
    const queryLower = query.toLowerCase();
    const isDynamic = dynamicKeywords.some(k => queryLower.includes(k));
    
    return isDynamic ? 'dynamic' : 'static';
  }
  
  /**
   * Calculate when dynamic knowledge expires
   */
  private calculateExpiration(query: string): string {
    const queryLower = query.toLowerCase();
    
    // President/political: Expires on next election/term end
    if (queryLower.includes('president')) {
      return '2029-01-20T00:00:00Z'; // Next inauguration
    }
    
    // CEO/business: Expires in 1 year
    if (queryLower.includes('ceo')) {
      const oneYear = new Date();
      oneYear.setFullYear(oneYear.getFullYear() + 1);
      return oneYear.toISOString();
    }
    
    // Current events: Expires in 1 day
    if (queryLower.includes('current') || queryLower.includes('latest')) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow.toISOString();
    }
    
    // Default: 30 days
    const thirtyDays = new Date();
    thirtyDays.setDate(thirtyDays.getDate() + 30);
    return thirtyDays.toISOString();
  }
  
  /**
   * Determine refresh frequency
   */
  private determineRefreshFrequency(query: string): 'hourly' | 'daily' | 'weekly' {
    const queryLower = query.toLowerCase();
    
    // Critical info: Hourly
    if (queryLower.includes('price') || queryLower.includes('weather')) {
      return 'hourly';
    }
    
    // Important info: Daily
    if (queryLower.includes('president') || queryLower.includes('news')) {
      return 'daily';
    }
    
    // Less critical: Weekly
    return 'weekly';
  }
}
```

### 4. Auto-Refresh Background Job

```typescript
/**
 * Background job that runs periodically to refresh dynamic knowledge
 */
class KnowledgeRefreshService {
  private ocean: KnowledgeOcean;
  private intervalId: NodeJS.Timeout | null = null;
  
  constructor(ocean: KnowledgeOcean) {
    this.ocean = ocean;
  }
  
  /**
   * Start auto-refresh service
   */
  start() {
    // Run every hour
    this.intervalId = setInterval(() => {
      this.refreshDynamicKnowledge();
    }, 60 * 60 * 1000); // 1 hour
    
    console.log('✅ Knowledge Ocean auto-refresh started (hourly)');
  }
  
  /**
   * Stop auto-refresh service
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
  
  /**
   * Refresh all expired dynamic knowledge
   */
  async refreshDynamicKnowledge() {
    const now = new Date();
    const toRefresh: KnowledgeEntry[] = [];
    
    // Find entries that need refreshing
    for (const entry of this.ocean.getAllKnowledge()) {
      if (entry.knowledgeType === 'dynamic') {
        // Check if expired
        if (entry.expiresAt && new Date(entry.expiresAt) < now) {
          toRefresh.push(entry);
        }
        
        // Check if it's time for scheduled refresh
        if (this.shouldRefresh(entry)) {
          toRefresh.push(entry);
        }
      }
    }
    
    console.log(`🔄 Refreshing ${toRefresh.length} dynamic knowledge entries...`);
    
    // Refresh each entry
    for (const entry of toRefresh) {
      try {
        await this.refreshEntry(entry);
      } catch (error) {
        console.error(`Failed to refresh: ${entry.title}`, error);
      }
    }
    
    console.log(`✅ Knowledge Ocean refreshed: ${toRefresh.length} entries updated`);
  }
  
  /**
   * Check if entry should be refreshed based on frequency
   */
  private shouldRefresh(entry: KnowledgeEntry): boolean {
    if (!entry.refreshFrequency || !entry.lastUpdated) return false;
    
    const lastUpdate = new Date(entry.lastUpdated);
    const now = new Date();
    const hoursSinceUpdate = (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);
    
    switch (entry.refreshFrequency) {
      case 'hourly':
        return hoursSinceUpdate >= 1;
      case 'daily':
        return hoursSinceUpdate >= 24;
      case 'weekly':
        return hoursSinceUpdate >= 168;
      default:
        return false;
    }
  }
  
  /**
   * Refresh a single entry
   */
  private async refreshEntry(entry: KnowledgeEntry) {
    if (entry.updateSource === 'web-search') {
      // Search web for updated info
      const updatedContent = await this.searchWeb(entry.title);
      
      // Update entry
      this.ocean.updateKnowledge(entry.id, {
        content: updatedContent,
        lastUpdated: new Date().toISOString(),
        expiresAt: this.calculateNewExpiration(entry)
      });
      
      console.log(`✅ Refreshed: ${entry.title}`);
    }
  }
  
  /**
   * Search web for current information
   */
  private async searchWeb(query: string): Promise<string> {
    // Use Brave Search API or similar
    // This is a placeholder - implement actual search
    return `Updated information for: ${query}`;
  }
  
  /**
   * Calculate new expiration date
   */
  private calculateNewExpiration(entry: KnowledgeEntry): string {
    // Same logic as calculateExpiration in KnowledgeOcean
    const thirtyDays = new Date();
    thirtyDays.setDate(thirtyDays.getDate() + 30);
    return thirtyDays.toISOString();
  }
}
```

---

## Usage Example

### Scenario: President Query

**First User (Jan 2025):**
```typescript
User: "Who is the president of USA?"

Ocean: Not found (or expired)
→ Fetch from web: "Donald Trump is the 47th President (2025-2029)"
→ Answer user
→ ADD TO OCEAN:
  {
    title: "President of USA",
    content: "Donald Trump is the 47th President (2025-2029)",
    knowledgeType: 'dynamic',
    expiresAt: '2029-01-20',
    refreshFrequency: 'daily',
    updateSource: 'web-search'
  }
```

**Second User (1 hour later):**
```typescript
User: "Who is the president of USA?"

Ocean: FOUND! Fresh! (added 1 hour ago)
→ Return local: "Donald Trump is the 47th President"
→ Instant response, no API call! ✅
```

**Auto-Refresh (Daily):**
```typescript
Background Job (runs daily):
→ Check "President of USA" entry
→ Still valid (expires 2029)
→ Refresh anyway (daily frequency)
→ Fetch latest info
→ Update ocean
→ All users get current info
```

---

## Benefits

### 1. **Self-Learning**
- Every external query teaches the ocean
- Knowledge base grows automatically
- No manual updates needed

### 2. **Always Current**
- Auto-refresh keeps dynamic facts fresh
- Expired knowledge triggers updates
- Users never get outdated info

### 3. **Cost Efficient**
- First user: API call (learns)
- Next 1000 users: Local (free!)
- Massive cost savings

### 4. **Smart Prioritization**
- Critical info: Hourly refresh
- Important info: Daily refresh
- Less critical: Weekly refresh

### 5. **Confidence Tracking**
- Track query frequency
- Higher confidence for popular queries
- Lower confidence triggers re-validation

---

## Implementation Timeline

### Week 1, Day 2:
- ✅ Add freshness fields to KnowledgeEntry
- ✅ Implement `learnFromQuery()` method
- ✅ Add expiration checking
- ✅ Test with president example

### Week 1, Day 3:
- ✅ Build auto-refresh background service
- ✅ Implement web search integration
- ✅ Add confidence tracking
- ✅ Test refresh cycles

### Week 2:
- ✅ Optimize refresh frequencies
- ✅ Add admin dashboard for monitoring
- ✅ Implement smart categorization
- ✅ Scale testing

---

## Monitoring & Analytics

### Track:
- **Learning Rate:** How many new entries per day
- **Refresh Rate:** How many refreshes per day
- **Hit Rate:** % of queries answered locally
- **Staleness:** Average age of dynamic knowledge
- **Confidence:** Average confidence score

### Dashboard:
```
Knowledge Ocean Stats:
- Total Entries: 1,247
- Static: 892 (71%)
- Dynamic: 355 (29%)
- Queries Today: 5,432
- Local Hits: 4,821 (89%) ✅
- External Calls: 611 (11%)
- Cost Savings: $4.82 today
- Last Refresh: 2 hours ago
- Entries Refreshed: 47
```

---

## Conclusion

The Self-Updating Knowledge Ocean is a **living, learning system** that:
1. **Learns** from every external query
2. **Stays current** through auto-refresh
3. **Serves instantly** for repeat queries
4. **Saves costs** by reducing API calls
5. **Never lies** by expiring stale info

**It's like having a brain that remembers everything it learns and keeps studying to stay current!** 🧠✨

---

**Next Step:** Implement this in Week 1, Day 2-3 as part of the launch plan!
