import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

function getDynamodbClient() {
    return new DynamoDBClient({
        region: "us-east-1",
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID_PROD,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_PROD
        }
    });
}

export default getDynamodbClient;