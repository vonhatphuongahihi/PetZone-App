import { pipeline } from "@xenova/transformers";
import fs from "fs";
import products from "../data/products.json";

// Vietnamese stop words
const STOP_WORDS = new Set([
  'của', 'cho', 'và', 'với', 'từ', 'đến', 'về', 'để', 'được', 'sẽ', 'đã', 'một', 'các', 'những', 'nào', 'gì', 'không', 'rất', 'nhiều', 'ít', 'hơn', 'bằng',
  'là', 'có', 'trong', 'trên', 'dưới', 'sau', 'trước', 'khi', 'nếu', 'thì', 'mà', 'nên', 'vì', 'do', 'bởi', 'theo', 'như', 'với', 'về'
]);

// Normalize text: lowercase, remove special chars, remove stop words
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\sàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 1 && !STOP_WORDS.has(word))
    .join(' ');
}

// Build enhanced text representation with weighted fields
function buildProductText(product: any, categoryName?: string): string {
  const parts: string[] = [];

  // Title (most important - repeat 2x for weight)
  if (product.title) {
    const normalizedTitle = normalizeText(product.title);
    parts.push(normalizedTitle);
    parts.push(normalizedTitle); // Weight title 2x
  }

  // Description
  if (product.description) {
    parts.push(normalizeText(product.description));
  }

  // Category name (if available)
  if (categoryName) {
    parts.push(normalizeText(categoryName));
  }

  // Tag (bestseller, hot, new, sale)
  if (product.tag && product.tag !== 'normal') {
    const tagMap: { [key: string]: string } = {
      'bestseller': 'bán chạy nhất sản phẩm nổi bật',
      'hot': 'sản phẩm hot nổi bật',
      'new': 'sản phẩm mới nhất',
      'sale': 'sản phẩm giảm giá khuyến mãi'
    };
    parts.push(tagMap[product.tag] || product.tag);
  }

  // Price context (normalized)
  if (product.price) {
    const price = parseFloat(product.price);
    if (price < 50000) parts.push('giá rẻ giá thấp');
    else if (price < 200000) parts.push('giá trung bình');
    else if (price < 500000) parts.push('giá cao cấp');
    else parts.push('giá cao cao cấp');
  }

  // Rating context
  if (product.avgRating && parseFloat(product.avgRating) >= 4.5) {
    parts.push('đánh giá tốt chất lượng cao');
  }

  // Sold count context
  if (product.soldCount && product.soldCount > 10) {
    parts.push('bán chạy nhiều người mua');
  }

  return parts.join(' ');
}

async function buildIndex() {
  console.log("🚀 Starting to build enhanced semantic search index...");

  const embedder = await pipeline(
    "feature-extraction",
    "Xenova/paraphrase-multilingual-MiniLM-L12-v2"
  );

  // Load category names if available (you might need to fetch from database)
  // For now, we'll use a simple mapping or fetch from Prisma if needed
  const categoryMap: { [key: number]: string } = {};

  // Try to load category names from database if Prisma is available
  try {
    const { prisma } = await import('../db');
    const categories = await prisma.category.findMany({
      select: { id: true, name: true }
    });
    categories.forEach(cat => {
      categoryMap[cat.id] = cat.name;
    });
    console.log(`📂 Loaded ${categories.length} category names`);
  } catch (error) {
    console.log("⚠️ Could not load categories, using product data only");
    console.log("⚠️ Error:", (error as Error).message);
  }

  const data = [];
  let processed = 0;

  for (const p of products) {
    const categoryName = categoryMap[p.category_id];
    const enhancedText = buildProductText(p, categoryName);

    const emb = await embedder(enhancedText, {
      pooling: "mean",
      normalize: true
    });

    data.push({
      id: p.id,
      vector: emb.data,
      // Store metadata for hybrid search
      metadata: {
        title: p.title?.toLowerCase() || '',
        description: p.description?.toLowerCase() || '',
        tag: p.tag || 'normal',
        avgRating: typeof p.avgRating === 'string' ? parseFloat(p.avgRating) : (p.avgRating || 0),
        totalReviews: typeof p.totalReviews === 'string' ? parseInt(p.totalReviews) : (p.totalReviews || 0),
        soldCount: typeof p.soldCount === 'number' ? p.soldCount : parseInt(String(p.soldCount || '0')),
        price: typeof p.price === 'string' ? parseFloat(p.price) : (p.price || 0)
      }
    });

    processed++;
    if (processed % 10 === 0) {
      console.log(`⏳ Processed ${processed}/${products.length} products...`);
    }
  }

  fs.writeFileSync("product.vectors.json", JSON.stringify(data));
  fs.writeFileSync("product.meta.json", JSON.stringify(products));

  console.log(`✅ Built enhanced vector index for ${products.length} products`);
  console.log("📊 Index includes: weighted title, description, category, tag, price context, rating, sold count");
}

buildIndex()
  .then(() => {
    console.log("✅ Index build completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error building index:", error);
    process.exit(1);
  });
