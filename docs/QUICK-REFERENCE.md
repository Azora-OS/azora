# Azora Development Quick Reference

**Common Patterns & Code Snippets**

---

## 🎨 Page Templates

### Basic Page
```typescript
'use client';
import { AppLayout, GradientText } from '@azora/shared-design';

export default function Page() {
  return (
    <AppLayout appName="App Name">
      <div className="max-w-7xl mx-auto py-8 px-4">
        <h1 className="text-5xl font-bold mb-4">
          <GradientText>Title</GradientText>
        </h1>
      </div>
    </AppLayout>
  );
}
```

### Dashboard Page
```typescript
'use client';
import { AppLayout, AccessibleCard, Button } from '@azora/shared-design';

export default function Dashboard() {
  return (
    <AppLayout appName="App">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8">
        <AccessibleCard title="Card 1" className="p-6">
          <p className="text-gray-400 mb-4">Content</p>
          <Button variant="primary">Action</Button>
        </AccessibleCard>
      </div>
    </AppLayout>
  );
}
```

---

## 🔌 API Integration

### Fetch Data
```typescript
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  fetch('http://localhost:4008/api/endpoint')
    .then(res => res.json())
    .then(data => setData(data))
    .finally(() => setLoading(false));
}, []);
```

### Post Data
```typescript
const handleSubmit = async (formData) => {
  const response = await fetch('http://localhost:4008/api/endpoint', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
  });
  return response.json();
};
```

---

## 🎯 Common Components

### Search Input
```typescript
<div className="relative">
  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
  <input
    type="text"
    placeholder="Search..."
    value={query}
    onChange={(e) => setQuery(e.target.value)}
    className="w-full pl-12 pr-6 py-4 rounded-xl bg-card/50 border border-border"
  />
</div>
```

### Filter Buttons
```typescript
<div className="flex gap-2">
  {categories.map(cat => (
    <button
      key={cat}
      onClick={() => setSelected(cat)}
      className={`px-4 py-2 rounded-full ${
        selected === cat 
          ? 'bg-primary text-white' 
          : 'bg-card/50 text-gray-400'
      }`}
    >
      {cat}
    </button>
  ))}
</div>
```

### Card Grid
```typescript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map(item => (
    <AccessibleCard key={item.id} className="p-6">
      <h3 className="text-xl font-bold">{item.title}</h3>
      <p className="text-gray-400">{item.description}</p>
    </AccessibleCard>
  ))}
</div>
```

---

## ✨ Animations

### Fade In
```typescript
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
>
  Content
</motion.div>
```

### Stagger Children
```typescript
{items.map((item, i) => (
  <motion.div
    key={item.id}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: i * 0.05 }}
  >
    {item.content}
  </motion.div>
))}
```

---

## 🎨 Styling

### Glassmorphism Card
```typescript
className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6"
```

### Gradient Text
```typescript
className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
```

### Hover Effect
```typescript
className="transition-all hover:border-primary/50 hover:scale-105"
```

---

## 📊 Service Ports

```
azora-mint:            4008
azora-classroom:       4009
azora-library:         4010
azora-oracle:          4011
azora-research-center: 4012
azora-master:          4013
```

---

## 🚀 Quick Commands

```bash
# Start app
cd apps/azora-mint && npm run dev

# Start service
cd services/azora-mint && npm run dev

# Install deps
npm install

# Build
npm run build
```
