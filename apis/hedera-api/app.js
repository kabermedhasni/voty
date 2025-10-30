/**
 * Voty - Hedera Consensus Service Integration
 *
 * This Node.js/Express server handles all interactions with Hedera Hashgraph,
 * specifically using HCS (Hedera Consensus Service) for immutable vote storage.
 *
 * Key Features:
 * - Submits votes as consensus messages to HCS Topic
 * - Prevents duplicate voting by querying Mirror Node history
 * - Provides public API for vote retrieval and verification
 *
 * @module hedera-api
 * @version 1.0.0
 */

import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import "dotenv/config";
import { Client, TopicMessageSubmitTransaction } from "@hashgraph/sdk";

const app = express();

// CORS middleware - must be before other middleware
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // Allow all origins (or specify 'http://localhost')
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  next();
});

app.use(bodyParser.json());
app.use(express.json());

// Load Hedera credentials from environment variables
const operatorId = process.env.OPERATOR_ID; // Format: 0.0.XXXXXX
const operatorKey = process.env.OPERATOR_KEY_PRIVATE; // DER-encoded private key (hex)
const topicId = process.env.TOPIC_ID; // Format: 0.0.XXXXXX

// Mirror Node API endpoint for vote retrieval
// Using 'order=desc' to get most recent votes first for faster duplicate detection
const urlApiHedera = `https://testnet.mirrornode.hedera.com/api/v1/topics/${topicId}/messages?order=desc`;

// Validate required environment variables on startup
if (!operatorId || !operatorKey || !topicId) {
  throw new Error(
    "Operator ID, Private Key or Topic ID not found in environment variables."
  );
}

// Initialize Hedera client for Testnet
// This client will sign and submit all HCS transactions
const client = Client.forTestnet().setOperator(
  process.env.OPERATOR_ID,
  process.env.OPERATOR_KEY_PRIVATE
);

/**
 * Fetch and parse all vote messages from Hedera Mirror Node
 *
 * This function queries the public Mirror Node API to retrieve all consensus
 * messages submitted to our HCS Topic. Messages are returned in descending order
 * (newest first) for efficient duplicate vote detection.
 *
 * @async
 * @returns {Promise<Array<{positionId: number, voterId: string, candidateId: number}>>}
 *          Array of parsed vote objects
 *
 * @example
 * const votes = await fetchTopicMessages();
 * // Returns: [{positionId: 1, voterId: "abc123", candidateId: 5}, ...]
 */
async function fetchTopicMessages() {
  try {
    // Query Mirror Node API (free, no HBAR cost)
    const response = await axios.get(urlApiHedera);
    const messages = response.data.messages || [];

    // Parse base64-encoded consensus messages
    const parsedMessages = messages
      .map((msg) => {
        if (!msg.message) return null;
        try {
          // Decode: base64 → UTF-8 → JSON
          const messageText = JSON.parse(
            Buffer.from(msg.message, "base64").toString("utf-8")
          );
          return {
            positionId: messageText.positionId,
            voterId: messageText.voterId,
            candidateId: messageText.candidateId,
          };
        } catch (err) {
          console.error("Failed to parse message:", err.message);
          return null;
        }
      })
      .filter((msg) => msg !== null); // Remove any malformed messages

    return parsedMessages;
  } catch (err) {
    console.error("Error fetching topic messages:", err.message);
    return []; // Return empty array on failure
  }
}

/**
 * POST /api/receive-vote - Submit a vote to Hedera Consensus Service
 *
 * This endpoint receives a vote from the frontend, validates it against existing
 * votes (prevents duplicates), and submits it to HCS as an immutable consensus message.
 *
 * Cost: $0.0001 USD per successful vote submission
 * Finality: ~3 seconds (ABFT consensus)
 *
 * @route POST /api/receive-vote
 * @param {number} req.body.candidateId - ID of the candidate being voted for
 * @param {string} req.body.voterId - HMAC-hashed voter identifier (privacy-preserving)
 * @param {number} req.body.positionId - ID of the position being voted for
 * @returns {object} 200 - Vote status (success/alreadyVoted/retry/error)
 */
app.post("/api/receive-vote", async (req, res) => {
  const { candidateId, voterId, positionId } = req.body;

  // Step 1: Fetch all existing votes from Mirror Node (free query)
  const data = await fetchTopicMessages();

  // Step 2: Check for duplicate vote (same voter + position)
  // This prevents double-voting while maintaining voter privacy (HMAC IDs)
  const alreadyVoted = data.some(
    (msg) => msg.positionId === positionId && msg.voterId === voterId
  );

  if (alreadyVoted) {
    // Return early if voter already voted for this position
    res.json({
      status: "alreadyVoted",
      message: "already_voted_for_the_position",
    });
  } else {
    try {
      // Step 3: Submit vote to Hedera Consensus Service
      // Transaction: TopicMessageSubmitTransaction (costs $0.0001)
      const txResponse = await new TopicMessageSubmitTransaction({
        topicId: topicId,
        message: JSON.stringify({ candidateId, voterId, positionId }),
      }).execute(client);

      // Step 4: Wait for consensus receipt (proof of immutability)
      const receipt = await txResponse.getReceipt(client);

      if (receipt.status.toString() === "SUCCESS") {
        // Vote successfully recorded on Hedera ledger
        res.json({ status: "success" });
      } else {
        // Unexpected status (network issue, insufficient HBAR, etc.)
        res.json({
          status: "retry",
          message: receipt.status.toString(),
        });
      }
    } catch (error) {
      // Network error, invalid transaction, or client-side issue
      console.error("Vote submission error:", error);
      res
        .status(500)
        .json({ status: "error", message: error.message.toString() });
    }
  }
});

/**
 * POST /api/get-votes - Retrieve all votes from Mirror Node
 *
 * This endpoint fetches and returns all votes stored on the HCS Topic.
 * Used by admin dashboards for real-time results and by voters for verification.
 *
 * Cost: Free (Mirror Node queries are always free)
 * Latency: ~1-5 seconds (depending on topic message count)
 *
 * @route POST /api/get-votes
 * @returns {object} 200 - Array of all votes: {data: [{positionId, voterId, candidateId}, ...]}
 */
app.post("/api/get-votes", async (req, res) => {
  const data = await fetchTopicMessages();
  res.json({ data: data });
});

// Start Express server
const port = 3000;
app.listen(port, () => {
  console.log(`✅ Voty Hedera API running on http://localhost:${port}`);
  console.log(`📋 Topic ID: ${topicId}`);
  console.log(
    `🔗 Mirror Node: https://testnet.mirrornode.hedera.com/api/v1/topics/${topicId}/messages`
  );
});
