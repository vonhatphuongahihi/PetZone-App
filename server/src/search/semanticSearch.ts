import { pipeline } from "@xenova/transformers";
import fs from "fs";
import path from "path";

// Load vectors with metadata
let vectors: any[] = [];
let vectorsLoaded = false;

function loadVectors() {
  if (vectorsLoaded) return;

  try {
    const vectorsPath = path.join(process.cwd(), "product.vectors.json");
    const data = JSON.parse(fs.readFileSync(vectorsPath, "utf-8"));
    vectors = data;
    vectorsLoaded = true;
    console.log(`[SemanticSearch] Loaded ${vectors.length} product vectors`);
  } catch (error) {
    console.error("[SemanticSearch] Error loading vectors:", error);
    vectors = [];
  }
}

let embedder: any;
let embedderLoading = false;

async function getEmbedder() {
  if (embedder) return embedder;
  if (embedderLoading) {
    // Wait for existing load
    while (!embedder) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return embedder;
  }

  embedderLoading = true;
  try {
    embedder = await pipeline(
      "feature-extraction",
      "Xenova/paraphrase-multilingual-MiniLM-L12-v2"
    );
    console.log("[SemanticSearch] Embedder model loaded");
  } catch (error) {
    console.error("[SemanticSearch] Error loading embedder:", error);
    throw error;
  } finally {
    embedderLoading = false;
  }
  return embedder;
}

function cosine(a: number[], b: number[]) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  return denom > 0 ? dot / denom : 0;
}

// Vietnamese stop words for query preprocessing
const STOP_WORDS = new Set([
  'của', 'cho', 'và', 'với', 'từ', 'đến', 'về', 'để', 'được', 'sẽ', 'đã', 'một', 'các', 'những', 'nào', 'gì', 'không', 'rất', 'nhiều', 'ít', 'hơn', 'bằng',
  'là', 'có', 'trong', 'trên', 'dưới', 'sau', 'trước', 'khi', 'nếu', 'thì', 'mà', 'nên', 'vì', 'do', 'bởi', 'theo', 'như'
]);

// Preprocess query: normalize and expand
function preprocessQuery(query: string): string {
  const normalized = query
    .toLowerCase()
    .replace(/[^\w\sàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 1 && !STOP_WORDS.has(word))
    .join(' ');

  // Expand common pet-related queries
  const expansions: { [key: string]: string } = {
    'chó': 'chó cún cưng',
    'mèo': 'mèo mèo con',
    'thức ăn': 'thức ăn hạt pate',
    'đồ chơi': 'đồ chơi giải trí',
    'phụ kiện': 'phụ kiện thú cưng'
  };

  let expanded = normalized;
  Object.entries(expansions).forEach(([key, value]) => {
    if (expanded.includes(key)) {
      expanded += ' ' + value;
    }
  });

  return expanded || query.toLowerCase();
}

// Hybrid search: combine semantic similarity with keyword matching
function hybridScore(
  semanticScore: number,
  metadata: any,
  query: string
): number {
  let score = semanticScore;

  // Keyword matching boost (title match is most important)
  const queryLower = query.toLowerCase();
  const titleLower = metadata.title || '';
  const descLower = metadata.description || '';

  // Exact title match gets big boost
  if (titleLower.includes(queryLower)) {
    score += 0.3;
  }

  // Partial title match
  const queryWords = queryLower.split(/\s+/).filter(w => w.length > 2);
  const titleWords = titleLower.split(/\s+/);
  const matchingWords = queryWords.filter((qw: string) =>
    titleWords.some((tw: string) => tw.includes(qw) || qw.includes(tw))
  );
  if (matchingWords.length > 0) {
    score += (matchingWords.length / queryWords.length) * 0.2;
  }

  // Description match (smaller boost)
  if (descLower.includes(queryLower)) {
    score += 0.1;
  }

  // Quality boost: high rating products get slight boost
  if (metadata.avgRating >= 4.5 && metadata.totalReviews >= 3) {
    score += 0.05;
  }

  // Popularity boost: bestsellers get slight boost
  if (metadata.tag === 'bestseller' || metadata.soldCount > 10) {
    score += 0.05;
  }

  return Math.min(score, 1.0); // Cap at 1.0
}

export interface SearchResult {
  id: number;
  score: number;
  semanticScore: number;
}

export async function semanticSearchIds(query: string, k?: number): Promise<number[]>;
export async function semanticSearchIds(query: string, k: number, returnScores: false): Promise<number[]>;
export async function semanticSearchIds(query: string, k: number, returnScores: true): Promise<SearchResult[]>;
export async function semanticSearchIds(query: string, k: number = 20, returnScores: boolean = false): Promise<number[] | SearchResult[]> {
  // Lazy load vectors
  loadVectors();

  if (vectors.length === 0) {
    console.warn("[SemanticSearch] No vectors loaded, returning empty results");
    return returnScores ? [] : [];
  }

  // Get or load embedder
  const embedder = await getEmbedder();

  // Preprocess query
  const processedQuery = preprocessQuery(query);

  // Generate query embedding
  const qEmb = await embedder(processedQuery, {
    pooling: "mean",
    normalize: true,
  });

  // Calculate semantic similarity and apply hybrid scoring
  const results = vectors
    .map((v: any) => {
      const semanticScore = cosine(qEmb.data, v.vector);
      const hybridScoreValue = hybridScore(
        semanticScore,
        v.metadata || {},
        query
      );

      return {
        id: v.id,
        score: hybridScoreValue,
        semanticScore: semanticScore
      };
    })
    .filter((r: SearchResult) => r.score > 0.1) // Filter out very low scores
    .sort((a: SearchResult, b: SearchResult) => b.score - a.score)
    .slice(0, k);

  if (returnScores) {
    return results;
  }

  return results.map((r: SearchResult) => r.id);
}
