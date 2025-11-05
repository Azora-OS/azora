# ⚡ ATTENTION MECHANISMS & TRANSFORMER EVOLUTION

**Date**: November 2, 2025  
**Priority**: CRITICAL - Foundation of Modern AI  
**Status**: Active Research  
**Goal**: Master and evolve beyond current transformer architectures

---

## 🎯 WHY ATTENTION CHANGED EVERYTHING

### Before Attention (2017)

**RNNs/LSTMs Problems**:
- Sequential processing (slow)
- Vanishing gradients (long-range dependencies fail)
- No parallelization
- Limited context window

### After Attention (2017+)

**"Attention Is All You Need"** (Vaswani et al., 2017)

**Transformers Benefits**:
- Parallel processing (100x faster training)
- No gradient vanishing
- Arbitrary context length
- State-of-the-art on everything

**Impact**: GPT, BERT, T5, PaLM, GPT-4, Claude, Llama - all transformers

---

## 🧠 ATTENTION FUNDAMENTALS

### Self-Attention Mechanism

**Core Idea**: Each token attends to all other tokens

**Mathematics**:
```
Q = XW_Q  (Query)
K = XW_K  (Key)
V = XW_V  (Value)

Attention(Q,K,V) = softmax(QK^T / √d_k) V
```

**Intuition**:
```
Query: "What am I looking for?"
Key: "What do I contain?"
Value: "What information do I have?"

Similarity = Query · Key
Attention weights = softmax(similarities)
Output = weighted sum of Values
```

**Implementation**:
```typescript
class SelfAttention {
  private W_Q: Matrix;
  private W_K: Matrix;
  private W_V: Matrix;
  private d_k: number;
  
  async forward(X: Tensor): Promise<Tensor> {
    // 1. Project to Q, K, V
    const Q = X.matmul(this.W_Q); // [batch, seq_len, d_k]
    const K = X.matmul(this.W_K);
    const V = X.matmul(this.W_V);
    
    // 2. Compute attention scores
    const scores = Q.matmul(K.transpose(-2, -1)); // [batch, seq_len, seq_len]
    const scaled = scores.divide(Math.sqrt(this.d_k)); // Scale for stability
    
    // 3. Softmax to get attention weights
    const weights = softmax(scaled, dim=-1);
    
    // 4. Apply attention to values
    const output = weights.matmul(V); // [batch, seq_len, d_v]
    
    return output;
  }
}
```

**Visualization**:
```
Input: "The cat sat on the mat"

Attention weights for "sat":
The  : 0.05
cat  : 0.40  ← High attention (subject)
sat  : 0.15
on   : 0.10
the  : 0.05
mat  : 0.25  ← High attention (object)
```

---

### Multi-Head Attention

**Problem**: Single attention focuses on one aspect

**Solution**: Multiple attention heads in parallel

```typescript
class MultiHeadAttention {
  private heads: SelfAttention[];
  private num_heads: number;
  private W_O: Matrix; // Output projection
  
  async forward(X: Tensor): Promise<Tensor> {
    // 1. Apply each attention head in parallel
    const head_outputs = await Promise.all(
      this.heads.map(head => head.forward(X))
    );
    
    // 2. Concatenate heads
    const concat = cat(head_outputs, dim=-1);
    
    // 3. Output projection
    const output = concat.matmul(this.W_O);
    
    return output;
  }
}
```

**Why It Works**:
- Head 1: Focuses on syntax
- Head 2: Focuses on semantics
- Head 3: Focuses on long-range dependencies
- etc.

**Different heads learn different patterns!**

**Research Papers**:
- Vaswani et al. - "Attention Is All You Need" (2017)

---

## 🚀 EFFICIENT ATTENTION VARIANTS

### Problem: Vanilla Attention is O(n²)

**Example**:
- Sequence length n = 1000
- Memory: 1000² = 1,000,000 elements
- Sequence length n = 10,000
- Memory: 10,000² = 100,000,000 elements (100x more!)

**Can't scale to very long sequences**

---

### 1. Sparse Attention

**Idea**: Don't attend to ALL tokens, only a subset

**Patterns**:
1. **Local attention**: Attend to nearby tokens only
2. **Strided attention**: Skip every k tokens
3. **Fixed attention**: Pre-defined attention pattern

**Implementation**:
```typescript
class SparseAttention {
  async forward(X: Tensor, mask: AttentionMask): Promise<Tensor> {
    const Q = X.matmul(this.W_Q);
    const K = X.matmul(this.W_K);
    const V = X.matmul(this.W_V);
    
    // Attention scores
    const scores = Q.matmul(K.transpose(-2, -1));
    
    // Apply sparsity mask (most entries are -inf)
    const masked_scores = scores + mask.where(
      mask == 0,
      -1e9, // -infinity for masked positions
      0
    );
    
    const weights = softmax(masked_scores);
    return weights.matmul(V);
  }
}

class LocalAttentionMask {
  generate(seq_len: number, window: number): Tensor {
    // Each token attends to ±window tokens
    const mask = zeros(seq_len, seq_len);
    
    for (let i = 0; i < seq_len; i++) {
      for (let j = Math.max(0, i - window); 
           j < Math.min(seq_len, i + window + 1); 
           j++) {
        mask[i][j] = 1;
      }
    }
    
    return mask;
  }
}
```

**Complexity**: O(n * k) where k = sparsity pattern size

**Research Papers**:
- Child et al. - "Generating Long Sequences with Sparse Transformers" (OpenAI, 2019)

---

### 2. Linear Attention

**Idea**: Rewrite attention to avoid explicit n×n matrix

**Standard Attention**:
```
Attention(Q,K,V) = softmax(QK^T)V
                 = D^(-1) exp(QK^T)V
```

**Linear Attention** (approximation):
```
Attention(Q,K,V) ≈ φ(Q) (φ(K)^T V)
```

Where φ is a feature map (e.g., ReLU, ELU)

**Key Insight**: Rearrange to compute (K^T V) first!
- (K^T V) = [d × d] (small!)
- Then φ(Q) × (K^T V) = [n × d]
- **No n×n matrix!**

**Implementation**:
```typescript
class LinearAttention {
  private feature_map: FeatureMap;
  
  async forward(Q: Tensor, K: Tensor, V: Tensor): Promise<Tensor> {
    // Apply feature map
    const Q_prime = this.feature_map(Q); // [n, d]
    const K_prime = this.feature_map(K); // [n, d]
    
    // Key trick: Compute K^T V first (d × d matrix)
    const KV = K_prime.transpose(-2, -1).matmul(V); // [d, d]
    
    // Then Q × (KV)
    const output = Q_prime.matmul(KV); // [n, d]
    
    // Normalize
    const normalizer = Q_prime.matmul(K_prime.sum(dim=0));
    
    return output.divide(normalizer);
  }
}
```

**Complexity**: O(n * d²) - **linear in sequence length!**

**Trade-off**: Approximation (not exact attention)

**Research Papers**:
- Katharopoulos et al. - "Transformers are RNNs: Fast Autoregressive Transformers with Linear Attention" (2020)

---

### 3. Flash Attention

**Breakthrough**: Optimize for GPU memory hierarchy

**Problem**: Standard attention is memory-bound, not compute-bound

**Standard Attention Memory Access**:
```
1. Load Q, K from HBM → compute QK^T → write to HBM
2. Load QK^T from HBM → softmax → write to HBM
3. Load softmax, V from HBM → compute attention → write to HBM
```

**3 round-trips to slow HBM!**

**Flash Attention Solution**:
- Tile matrices
- Keep tiles in fast SRAM
- Fused kernel (all operations in SRAM)

**Implementation (conceptual)**:
```typescript
class FlashAttention {
  async forward(Q: Tensor, K: Tensor, V: Tensor): Promise<Tensor> {
    // Tiling for SRAM
    const TILE_SIZE = 256;
    
    const output = zeros_like(Q);
    
    // Process in tiles (stays in SRAM)
    for (let i = 0; i < Q.shape[1]; i += TILE_SIZE) {
      const Q_tile = Q[:, i:i+TILE_SIZE];
      
      for (let j = 0; j < K.shape[1]; j += TILE_SIZE) {
        const K_tile = K[:, j:j+TILE_SIZE];
        const V_tile = V[:, j:j+TILE_SIZE];
        
        // Compute attention for this tile (all in SRAM)
        const scores = Q_tile.matmul(K_tile.T);
        const weights = softmax(scores);
        const tile_output = weights.matmul(V_tile);
        
        // Accumulate
        output[:, i:i+TILE_SIZE] += tile_output;
      }
    }
    
    return output;
  }
}
```

**Results**:
- **3-4x faster** than standard attention
- **Same output** (no approximation!)
- **10x less memory**

**Research Papers**:
- Dao et al. - "FlashAttention: Fast and Memory-Efficient Exact Attention" (2022)
- Dao et al. - "FlashAttention-2: Faster Attention with Better Parallelism" (2023)

---

### 4. Multi-Query Attention (MQA)

**Problem**: K and V are replicated across heads (memory wasteful)

**Standard Multi-Head Attention**:
```
Head 1: Q₁, K₁, V₁
Head 2: Q₂, K₂, V₂
...
Head h: Qₕ, Kₕ, Vₕ
```

**Multi-Query Attention**:
```
Head 1: Q₁ ┐
Head 2: Q₂ ├→ shared K, V
...        │
Head h: Qₕ ┘
```

**Implementation**:
```typescript
class MultiQueryAttention {
  private Q_projections: Matrix[]; // One per head
  private K_projection: Matrix; // Shared!
  private V_projection: Matrix; // Shared!
  
  async forward(X: Tensor): Promise<Tensor> {
    // Shared K and V
    const K = X.matmul(this.K_projection);
    const V = X.matmul(this.V_projection);
    
    // Separate Q for each head
    const outputs = await Promise.all(
      this.Q_projections.map(async W_Q => {
        const Q = X.matmul(W_Q);
        return this.attention(Q, K, V);
      })
    );
    
    return cat(outputs, dim=-1);
  }
}
```

**Benefits**:
- **10x less memory** for K, V cache (critical for inference!)
- Faster inference
- Minimal quality loss

**Used in**: PaLM, Llama 2, Falcon

**Research Papers**:
- Shazeer - "Fast Transformer Decoding: One Write-Head is All You Need" (2019)

---

### 5. Grouped-Query Attention (GQA)

**Middle ground**: Between multi-head and multi-query

**Idea**: Group heads, share K/V within group

```
Group 1: Q₁, Q₂, Q₃ → K₁, V₁
Group 2: Q₄, Q₅, Q₆ → K₂, V₂
```

**Benefits**: Better than MQA quality, almost as fast

**Used in**: Llama 3, Mistral

**Research Papers**:
- Ainslie et al. - "GQA: Training Generalized Multi-Query Transformer Models" (2023)

---

## 🔧 POSITION ENCODINGS

### Problem: Attention has no position information!

"cat sat" and "sat cat" look the same to attention

### Sinusoidal Position Encoding (Original)

```
PE(pos, 2i)   = sin(pos / 10000^(2i/d))
PE(pos, 2i+1) = cos(pos / 10000^(2i/d))
```

**Properties**:
- Smooth interpolation
- Relative positions encoded
- Deterministic

**Implementation**:
```typescript
class SinusoidalPositionEncoding {
  generate(max_len: number, d_model: number): Tensor {
    const pe = zeros(max_len, d_model);
    const position = arange(0, max_len).unsqueeze(1);
    
    const div_term = exp(
      arange(0, d_model, 2) * (-Math.log(10000.0) / d_model)
    );
    
    pe[:, 0::2] = sin(position * div_term);
    pe[:, 1::2] = cos(position * div_term);
    
    return pe;
  }
}
```

---

### Rotary Position Embedding (RoPE)

**Breakthrough**: Encode positions via rotation in complex space

**Key Idea**: Rotate query and key vectors based on position

```
q_m = R_m q  (rotate query at position m)
k_n = R_n k  (rotate key at position n)

q_m · k_n depends on (m - n)  ← Relative position!
```

**Implementation**:
```typescript
class RotaryPositionEmbedding {
  private freqs: Tensor;
  
  constructor(d_model: number, max_len: number = 2048) {
    // Precompute rotation frequencies
    this.freqs = this.computeFreqs(d_model, max_len);
  }
  
  private computeFreqs(d: number, max_len: number): Tensor {
    const theta = 10000.0 ** (-arange(0, d, 2) / d);
    const positions = arange(0, max_len);
    const freqs = outer(positions, theta);
    return freqs;
  }
  
  async apply(x: Tensor, positions: Tensor): Promise<Tensor> {
    // x: [batch, seq, heads, dim]
    
    // Get frequencies for these positions
    const freqs = this.freqs[positions];
    
    // Split into real and imaginary parts
    const x1 = x[..., 0::2]; // Even indices
    const x2 = x[..., 1::2]; // Odd indices
    
    // Rotate
    const cos_freqs = cos(freqs);
    const sin_freqs = sin(freqs);
    
    const rotated_1 = x1 * cos_freqs - x2 * sin_freqs;
    const rotated_2 = x1 * sin_freqs + x2 * cos_freqs;
    
    // Interleave back
    return stack([rotated_1, rotated_2], dim=-1).flatten(-2);
  }
}
```

**Benefits**:
- Relative position information
- Extrapolates to longer sequences
- More efficient than absolute encodings

**Used in**: GPT-Neo, GPT-J, LLaMA, PaLM

**Research Papers**:
- Su et al. - "RoFormer: Enhanced Transformer with Rotary Position Embedding" (2021)

---

### ALiBi (Attention with Linear Biases)

**Even Simpler**: Just add bias based on distance

```
score(i,j) = q_i · k_j - m * |i - j|

Where m is a learned slope
```

**Implementation**:
```typescript
class ALiBi {
  private slopes: number[];
  
  constructor(num_heads: number) {
    // Different slope for each head
    this.slopes = this.computeSlopes(num_heads);
  }
  
  async addBias(attention_scores: Tensor): Promise<Tensor> {
    // attention_scores: [batch, heads, seq, seq]
    const seq_len = attention_scores.shape[-1];
    
    // Distance matrix: |i - j|
    const distances = abs(
      arange(seq_len).unsqueeze(1) - arange(seq_len).unsqueeze(0)
    );
    
    // Apply slope for each head
    const bias = stack(
      this.slopes.map(m => -m * distances)
    );
    
    return attention_scores + bias;
  }
}
```

**Benefits**:
- Zero parameters!
- Excellent extrapolation
- Fast

**Used in**: BLOOM, MPT

**Research Papers**:
- Press et al. - "Train Short, Test Long: Attention with Linear Biases" (2022)

---

## 🌟 AZORA OS TRANSFORMER SYSTEM

### Adaptive Attention System

```typescript
class AzoraAdaptiveTransformer {
  // Multiple attention variants
  private standardAttention: MultiHeadAttention;
  private flashAttention: FlashAttention;
  private linearAttention: LinearAttention;
  private sparseAttention: SparseAttention;
  
  // Position encodings
  private rope: RotaryPositionEmbedding;
  private alibi: ALiBi;
  
  // Dynamic selection
  private attentionSelector: AttentionSelector;
  
  async forward(X: Tensor, context: Context): Promise<Tensor> {
    // 1. Select optimal attention mechanism
    const mechanism = this.attentionSelector.select({
      sequence_length: X.shape[1],
      available_memory: context.memory,
      quality_requirement: context.quality,
      speed_requirement: context.speed
    });
    
    // 2. Apply selected attention
    let output: Tensor;
    
    switch (mechanism) {
      case 'Flash':
        // Best for training, exact, fast
        output = await this.flashAttention.forward(X);
        break;
        
      case 'Linear':
        // Best for very long sequences
        output = await this.linearAttention.forward(X);
        break;
        
      case 'Sparse':
        // Best for extremely long sequences
        output = await this.sparseAttention.forward(X);
        break;
        
      case 'Standard':
        // Fallback, always works
        output = await this.standardAttention.forward(X);
        break;
    }
    
    return output;
  }
}

class AttentionSelector {
  select(context: Context): AttentionMechanism {
    const seqLen = context.sequence_length;
    
    if (seqLen < 2048) {
      return 'Flash'; // Fast and exact
    } else if (seqLen < 16384) {
      return 'Sparse'; // Reasonable approximation
    } else {
      return 'Linear'; // Only option for very long
    }
  }
}
```

---

## 📈 IMPLEMENTATION ROADMAP

### Phase 1: Foundation (Month 1)
- [ ] Implement standard multi-head attention
- [ ] Add RoPE position encoding
- [ ] Build basic transformer blocks
- [ ] Test on language modeling

**Metrics**: Match PyTorch transformer performance

### Phase 2: Efficient Attention (Month 2)
- [ ] Implement Flash Attention
- [ ] Add Multi-Query Attention
- [ ] Deploy Grouped-Query Attention
- [ ] Optimize memory usage

**Metrics**: 3x faster training, 10x less memory

### Phase 3: Long Context (Month 3)
- [ ] Implement sparse attention patterns
- [ ] Add linear attention
- [ ] Deploy ALiBi position bias
- [ ] Test on 100K+ token sequences

**Metrics**: Handle 100K token contexts

### Phase 4: Adaptive System (Month 4+)
- [ ] Build attention selection system
- [ ] Implement dynamic switching
- [ ] Optimize for various hardware
- [ ] Deploy production-ready transformers

**Metrics**: Optimal performance for any context

---

## 📚 ESSENTIAL RESEARCH PAPERS

### Foundation:
1. Vaswani et al. - "Attention Is All You Need" (2017) ⭐ Must Read
2. Dosovitskiy et al. - "An Image is Worth 16x16 Words" (ViT, 2020)

### Efficient Attention:
3. Child et al. - "Generating Long Sequences with Sparse Transformers"
4. Katharopoulos et al. - "Transformers are RNNs: Fast Autoregressive Transformers"
5. Dao et al. - "FlashAttention" (2022)
6. Dao et al. - "FlashAttention-2" (2023)

### Variants:
7. Shazeer - "Fast Transformer Decoding: One Write-Head is All You Need" (MQA)
8. Ainslie et al. - "GQA: Training Generalized Multi-Query Transformer Models"

### Position Encodings:
9. Su et al. - "RoFormer: Enhanced Transformer with Rotary Position Embedding"
10. Press et al. - "Train Short, Test Long: ALiBi"

---

## 🎯 SUCCESS METRICS

| Metric | Standard | Target | Status |
|--------|----------|--------|--------|
| **Training Speed** | 1x | 3-4x | Flash Attention |
| **Memory Usage** | 1x | 0.1x | MQA + Flash |
| **Max Context** | 2K | 100K+ | Linear/Sparse |
| **Quality** | 100% | 98%+ | Minimal loss |
| **Inference Speed** | 1x | 10x | MQA + optimizations |

---

## 🌟 CONCLUSION

Attention mechanisms are the foundation of modern AI. Through:

- **Multi-head attention**: Learn multiple patterns
- **Flash Attention**: 3-4x faster, 10x less memory
- **Linear/Sparse Attention**: Scale to 100K+ tokens
- **MQA/GQA**: 10x faster inference
- **RoPE/ALiBi**: Better position encoding

Azora OS will have **adaptive attention** that automatically selects optimal mechanisms for any scenario.

**"Attention is all you need. But efficient attention is all you really need."**

---

**© 2025 Azora ES (Pty) Ltd. All Rights Reserved.**

⚡ **ATTENTION MASTERY. TRANSFORMER EVOLUTION.** ⚡
