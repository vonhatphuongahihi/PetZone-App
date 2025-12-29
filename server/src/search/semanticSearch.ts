import { pipeline } from "@xenova/transformers";
import fs from "fs";

const vectors = JSON.parse(
  fs.readFileSync("product.vectors.json", "utf-8")
);

let embedder: any;

function cosine(a: number[], b: number[]) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

export async function semanticSearchIds(query: string, k = 20) {
  if (!embedder) {
    embedder = await pipeline(
      "feature-extraction",
      "Xenova/paraphrase-multilingual-MiniLM-L12-v2"
    );
  }

  const qEmb = await embedder(query, {
    pooling: "mean",
    normalize: true,
  });

  return vectors
    .map((v: any) => ({
      id: v.id,
      score: cosine(qEmb.data, v.vector),
    }))
    .sort((a: { score: number; }, b: { score: number; }) => b.score - a.score)
    .slice(0, k)
    .map((v: { id: any; }) => v.id);
}
