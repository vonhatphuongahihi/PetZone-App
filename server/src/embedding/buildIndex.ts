import { pipeline } from "@xenova/transformers";
import fs from "fs";
import products from "../data/products.json";

async function buildIndex() {
  const embedder = await pipeline(
    "feature-extraction",
    "Xenova/paraphrase-multilingual-MiniLM-L12-v2"
  );

  const data = [];

  for (const p of products) {
    const text = `${p.title}. ${p.description}. Giá ${p.price}`;
    const emb = await embedder(text, {
      pooling: "mean",
      normalize: true
    });

    data.push({
      id: p.id,
      vector: emb.data
    });
  }

  fs.writeFileSync("product.vectors.json", JSON.stringify(data));
  fs.writeFileSync("product.meta.json", JSON.stringify(products));

  console.log("✅ Built vector data");
}

buildIndex();
