# Knowledge Freshness System - Design Document

## Problem
The current Knowledge Ocean treats all knowledge as static. However, some facts change over time:
- **Static Facts:** Speed of light, mathematical formulas, historical events → Never change
- **Dynamic Facts:** Current president, latest technology, current events → Change frequently

**Example Issue:** "Who is the president of USA?" would return "Joe Biden" even after his term ends.

## Solution: Knowledge Freshness System

### 1. Knowledge Classification

Every knowledge entry is classified as either:
- `static`: Never expires (e.g., "Speed of light = 299,792,458 m/s")
- `dynamic`: Has expiration date (e.g., "Joe Biden is president until Jan 2025")

### 2. Expiration Tracking

Dynamic knowledge includes:
```typescript
{
  knowledgeType: 'dynamic',
  expiresAt: '2025-01-20T00:00:00Z', // When this knowledge becomes stale
  updateSource: 'web-search' // How to refresh it
}
```

### 3. Automatic Fallback

When querying:
1. Check if knowledge exists
2. If dynamic, check if expired
3. If expired → Return `null` → Falls back to web search/external AI
4. If not expired → Return local answer

### 4. Update Sources

Three ways to update expired knowledge:
- `manual`: Admin manually updates
- `web-search`: Automatically search web for current info
- `api`: Call specific API for updates

## Implementation Strategy

### Phase 1: Add Freshness Fields (Week 1, Day 2)
```typescript
export interface KnowledgeEntry {
  // ... existing fields ...
  knowledgeType: 'static' | 'dynamic';
  expiresAt?: string; // ISO date
  updateSource?: 'manual' | 'web-search' | 'api';
}
```

### Phase 2: Expiration Check (Week 1, Day 2)
```typescript
tryAnswer(query: string): string | null {
  const results = this.search(query, 1);
  
  if (results.length > 0) {
    const entry = results[0].entry;
    
    // Check if expired
    if (entry.knowledgeType === 'dynamic' && entry.expiresAt) {
      const now = new Date();
      const expires = new Date(entry.expiresAt);
      
      if (now > expires) {
        // Knowledge is stale - fall back to external source
        return null;
      }
    }
    
    // Knowledge is fresh - return it
    return entry.content;
  }
  
  return null;
}
```

### Phase 3: Auto-Update (Week 2)
```typescript
async refreshExpiredKnowledge() {
  for (const entry of this.knowledge.values()) {
    if (entry.knowledgeType === 'dynamic' && this.isExpired(entry)) {
      if (entry.updateSource === 'web-search') {
        // Search web for updated info
        const updated = await this.searchWeb(entry.title);
        this.updateKnowledge(entry.id, updated);
      }
    }
  }
}
```

## Examples

### Static Knowledge (Never Expires)
```typescript
{
  id: 'general-speed-of-light',
  category: 'general',
  title: 'Speed of Light',
  content: 'The speed of light is 299,792,458 m/s',
  knowledgeType: 'static', // Never expires
  lastUpdated: '2025-11-25'
}
```

### Dynamic Knowledge (Expires)
```typescript
{
  id: 'general-us-president-2024',
  category: 'general',
  title: 'President of USA (2024)',
  content: 'Joe Biden is the 46th President (term: 2021-2025)',
  knowledgeType: 'dynamic', // Will expire
  expiresAt: '2025-01-20T00:00:00Z', // Inauguration day
  updateSource: 'web-search', // Auto-update via search
  lastUpdated: '2024-01-20'
}
```

### Query Flow

**Before Expiration:**
```
User: "Who is the president of USA?"
→ Knowledge Ocean finds entry
→ Checks expiration: Not expired
→ Returns: "Joe Biden is the 46th President"
→ No API call needed
```

**After Expiration:**
```
User: "Who is the president of USA?"
→ Knowledge Ocean finds entry
→ Checks expiration: EXPIRED
→ Returns: null
→ Falls back to web search/external AI
→ Gets current information
→ (Optional) Updates knowledge ocean with new info
```

## Benefits

1. **Always Current:** Dynamic facts automatically become stale
2. **No False Info:** Expired knowledge triggers fresh lookup
3. **Cost Efficient:** Static facts never need updates
4. **Automatic:** System handles expiration checking
5. **Flexible:** Different update strategies per knowledge type

## Migration Plan

### Week 1, Day 2:
1. Add freshness fields to interface
2. Update existing knowledge with types
3. Implement expiration checking
4. Test with president example

### Week 2:
1. Add web search integration
2. Implement auto-refresh
3. Add admin UI for manual updates
4. Monitor and tune expiration dates

## Knowledge Categories by Freshness

### Always Static:
- Mathematical formulas
- Physical constants
- Historical events (past)
- Scientific laws
- Grammar rules
- Programming syntax

### Usually Dynamic:
- Current leaders/officials
- Latest technology versions
- Current events
- Stock prices
- Weather
- Sports scores
- Population statistics

### Hybrid (Depends on Context):
- Company information (static: founding, dynamic: CEO)
- Software versions (static: old versions, dynamic: latest)
- Geographic data (static: capitals, dynamic: populations)

## Conclusion

The Knowledge Freshness System ensures the Knowledge Ocean provides accurate, up-to-date information while maintaining the benefits of local, instant responses for static knowledge. It's a smart balance between speed and accuracy.

**Next Step:** Implement this system in Week 1, Day 2 after completing the foundation scripts.
