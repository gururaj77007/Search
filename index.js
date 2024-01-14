const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const { mongoose_connect } = require("./mongodb/connect");
mongoose_connect();
const Product = require("./mongodb/Products-schema");

const app = express();
app.use(bodyParser.json());

const hfToken = "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";
const embeddingUrl =
  "https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2";

app.post("/Search", async (req, res) => {
  try {
    const { text, page, perPage } = req.body;
    console.log(text, page, perPage); // Assuming you want to pass page and perPage in the request body

    const response = await axios.post(
      embeddingUrl,
      { inputs: text },
      {
        headers: {
          Authorization: `Bearer ${hfToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.status === 200) {
      const embedding = response.data;

      // Calculate skip and limit based on page and perPage
      const skip = (page - 1) * perPage;
      const limit = perPage;

      const result = await Product.aggregate([
        {
          $search: {
            index: "product1", // Name of Vector Search Index
            knnBeta: {
              vector: embedding,
              path: "nameEmbedding", // Name of the 'embedding' field
              k: 150,
            },
          },
        },
        {
          $project: {
            nameEmbedding: 0,
            // Exclude the 'nameEmbedding' field
          },
        },
        {
          $project: {
            _id: 1,
            productName: 1,
            price: 1,
            discount: 1,
            Description: 1,
          },
        },
        {
          $skip: skip,
        },
        {
          $limit: limit,
        },
      ]);
      console.log(result);

      const hasNextPage = result.length === perPage;

      res.status(200).json({ result, hasNextPage });
    } else {
      throw new Error(
        `Request failed with status code ${response.status}: ${response.data}`
      );
    }
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message });
  }
});
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

const PORT = process.env.PORT || 3023; // You can change the port as needed
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
