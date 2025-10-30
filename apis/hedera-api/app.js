import express from 'express';
import bodyParser from "body-parser";
import axios from 'axios';
import 'dotenv/config';
import {
    Client,
    // TopicCreateTransaction,
    TopicMessageSubmitTransaction
} from "@hashgraph/sdk";

const app = express();
app.use(bodyParser.json());
app.use(express.json());

const operatorId  = process.env.OPERATOR_ID;
const operatorKey = process.env.OPERATOR_KEY_PRIVATE;
const topicId = process.env.TOPIC_ID;

const urlApiHedera = `https://testnet.mirrornode.hedera.com/api/v1/topics/${topicId}/messages?order=desc`;

if (!operatorId || !operatorKey || !topicId) {
    throw new Error("Operator ID, Private Key or Topic ID not found in environment variables.");
}

const client = Client.forTestnet()
    .setOperator(process.env.OPERATOR_ID, process.env.OPERATOR_KEY_PRIVATE);

async function fetchTopicMessages() {
  try {
    const response = await axios.get(urlApiHedera);
    const messages = response.data.messages || [];

    const parsedMessages = messages.map(msg => {
      if (!msg.message) return null;
      try {
        const messageText = JSON.parse(Buffer.from(msg.message, "base64").toString("utf-8"));
        return { positionId: messageText.positionId, voterId: messageText.voterId, candidateId: messageText.candidateId };
      } catch (err) {
        console.error("Failed to parse message:", err.message);
        return null;
      }
    }).filter(msg => msg !== null); 

    return parsedMessages;
  } catch (err) {
    console.error("Error fetching topic messages:", err.message);
    return []; 
  }
}


app.post('/api/receive-vote', async (req, res) => {
    const { candidateId, voterId, positionId } = req.body;

    const data = await fetchTopicMessages();

    const alreadyVoted = data.some(msg => msg.positionId === positionId && msg.voterId === voterId)

    if (alreadyVoted) {
        res.json({
            status: "alreadyVoted",
            message: "already_voted_for_the_position"
        });
    } else {
        try {
            const txResponse = await new TopicMessageSubmitTransaction({
                topicId: topicId,
                message: JSON.stringify({ candidateId, voterId, positionId })
            }).execute(client);

            const receipt = await txResponse.getReceipt(client);

            if(receipt.status.toString() === 'SUCCESS') {
                res.json({ status: 'success'});
            } else {
                res.json({
                    status: "retry",
                    message: receipt.status.toString()
                });
            }
        } catch (error) {
            res.status(500).json({ status: 'error', message: error.message.toString() });
        }
    }
});

app.post('/api/get-votes', async (req, res) => {
    const data = await fetchTopicMessages();
    res.json({data: data});
})

const port = 3000;
app.listen(port, () => console.log(`Node.js API runnimg on port ${port}`));
